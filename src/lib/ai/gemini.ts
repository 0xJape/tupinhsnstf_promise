import { cleanAssistantText, FALLBACK_MESSAGE, SYSTEM_PROMPT } from "./prompt";
import type { ChatTurn } from "./groq";

export type GeminiResult = {
  content: string;
  model: string;
  usedFallback: boolean;
};

export type ImagePart = {
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  /** Raw base64 without data: prefix */
  base64: string;
};

const DEFAULT_MODEL = "gemini-3.5-flash";

const VISION_EXTRA = `
Image rules (extra):
- The user may share a photo for educational discussion only.
- Describe only what is reasonably visible in general terms.
- Never diagnose PCOS, acne type, hirsutism grade, or any disease from a photo.
- Never say "this confirms PCOS" or "you have PCOS".
- Prefer: "photos alone cannot diagnose", "a clinician may examine in person", "lighting/angle can mislead".
- If the image is not health-related, answer briefly and redirect.
- If the image shows possible emergency (severe injury, heavy bleeding), urge urgent care.
- Keep the spoken-friendly reply under ~180 words when possible.
`;

export async function completeWithGemini(opts: {
  messages: ChatTurn[];
  contextBlock: string;
  image?: ImagePart | null;
  timeoutMs?: number;
}): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  // Vision needs longer than text; 12s AI_TIMEOUT_MS aborts mid-image.
  const baseTimeout = Number(process.env.AI_TIMEOUT_MS ?? 20000);
  const visionTimeout = Number(process.env.AI_VISION_TIMEOUT_MS ?? 45000);
  const timeoutMs =
    opts.timeoutMs ??
    (opts.image ? Math.max(baseTimeout, visionTimeout) : baseTimeout);

  if (!apiKey) {
    return {
      content: opts.image
        ? "I'm Promi — I can't review photos right now. Photos alone cannot diagnose PCOS. Try the screening quiz, and talk with a healthcare professional if you're worried."
        : FALLBACK_MESSAGE,
      model: "template",
      usedFallback: true,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Gemini contents: history as user/model turns; last user may include image
  const contents: {
    role: "user" | "model";
    parts: (
      | { text: string }
      | { inline_data: { mime_type: string; data: string } }
    )[];
  }[] = [];

  for (let i = 0; i < opts.messages.length; i++) {
    const m = opts.messages[i]!;
    const isLast = i === opts.messages.length - 1;
    const role = m.role === "assistant" ? "model" : "user";
    if (role === "user" && isLast && opts.image) {
      contents.push({
        role: "user",
        parts: [
          {
            inline_data: {
              mime_type: opts.image.mimeType,
              data: opts.image.base64,
            },
          },
          { text: m.content || "Please review this photo for educational discussion only." },
        ],
      });
    } else {
      contents.push({
        role,
        parts: [{ text: m.content }],
      });
    }
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            { text: SYSTEM_PROMPT },
            { text: opts.contextBlock },
            { text: VISION_EXTRA },
          ],
        },
        contents,
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 700,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Gemini error", res.status, errText.slice(0, 400));
      const quota =
        res.status === 429 ||
        /RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(errText);
      return {
        content: quota
          ? "I'm Promi — photo review is temporarily limited on my side. Try again in a bit, or use a smaller photo. Photos still cannot diagnose PCOS; screening + a clinician if you're worried."
          : FALLBACK_MESSAGE,
        model: "template",
        usedFallback: true,
      };
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const content = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();

    if (!content) {
      return {
        content: FALLBACK_MESSAGE,
        model: "template",
        usedFallback: true,
      };
    }

    return {
      content: cleanAssistantText(content),
      model: `promi:${model}`,
      usedFallback: false,
    };
  } catch (e) {
    console.error("Gemini request failed", e);
    const aborted =
      (e instanceof Error && e.name === "AbortError") ||
      (typeof e === "object" &&
        e !== null &&
        "name" in e &&
        (e as { name?: string }).name === "AbortError");
    return {
      content: aborted
        ? "I'm Promi — that photo took too long to review. Try a smaller/clearer photo, or send again in a moment. Photos alone still cannot diagnose PCOS."
        : FALLBACK_MESSAGE,
      model: "template",
      usedFallback: true,
    };
  } finally {
    clearTimeout(timer);
  }
}