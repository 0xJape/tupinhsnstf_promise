import { cleanAssistantText, FALLBACK_MESSAGE, SYSTEM_PROMPT } from "./prompt";
import type { ChatTurn, GroqResult } from "./groq";

export type ImagePart = {
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  /** Raw base64 without data: prefix */
  base64: string;
};

const DEFAULT_MODEL = "qwen/qwen3.6-27b";

function finalAnswer(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>\s*/gi, "").trim();
}

const VISION_EXTRA = `
Image rules (extra):
- The user may share a photo for educational discussion only.
- Do not refuse a clear, relevant face photo. Give a useful, compassionate response within these rules.
- Describe only reasonably visible features relevant to PCOS screening: acne-like spots, general skin appearance, and possible coarse facial hair. Say when image quality prevents assessment.
- Clearly separate observation from interpretation: "I can see..." followed by "this can have many causes and may be one PCOS screening factor."
- Every face-photo response must explicitly connect observations to PCOS screening context. If acne-like spots or possible coarse facial hair are visible, explain that they can have many causes but may be associated with androgen-related PCOS symptoms when combined with irregular cycles or other screening factors.
- If no relevant feature is reasonably visible, say: "I don't see obvious acne-like spots or coarse facial hair in this photo." Then explain that this does not rule out PCOS because many important factors, especially menstrual-cycle patterns, are not visible in a face photo.
- Use this short structure: "What I can see", "How it may relate to PCOS", and "Next step". Do not discuss unrelated facial features.
- Invite the user to complete the app's symptom/cycle screening because PCOS assessment requires more than facial appearance.
- Never diagnose PCOS, acne type, hirsutism grade, or any disease from a photo.
- Never call the result a "pre-diagnosis", say "this confirms PCOS", or say "you have PCOS". A face photo cannot determine the user's PCOS situation.
- End relevant photo reviews with a concise next step: use the app screening and contact care help for professional assessment. Mention that the photo review is not a diagnosis once, naturally.
- Prefer: "photos alone cannot diagnose", "a clinician may examine in person", "lighting/angle can mislead".
- If the image is not health-related, answer briefly and redirect.
- If the image shows possible emergency (severe injury, heavy bleeding), urge urgent care.
- Keep the spoken-friendly reply under ~180 words when possible.
`;

export async function completeWithGroqVision(opts: {
  messages: ChatTurn[];
  contextBlock: string;
  image: ImagePart;
  timeoutMs?: number;
}): Promise<GroqResult> {
  const apiKey = process.env.GROQ_VISION_API_KEY;
  const model = process.env.GROQ_VISION_MODEL?.trim() || DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? Number(process.env.AI_VISION_TIMEOUT_MS ?? 45000);

  if (!apiKey) {
    return {
      content: "I'm Promi — I can't review photos right now. Photos alone cannot diagnose PCOS. Try the screening quiz, and talk with a healthcare professional if you're worried.",
      model: "template",
      usedFallback: true,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const lastIndex = opts.messages.length - 1;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_completion_tokens: 700,
        reasoning_effort: "none",
        reasoning_format: "hidden",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n${opts.contextBlock}\n${VISION_EXTRA}` },
          ...opts.messages.map((message, index) => ({
            role: message.role === "system" ? "user" : message.role,
            content:
              index === lastIndex && message.role === "user"
                ? [
                    { type: "text", text: message.content || "Please review this photo for educational discussion only." },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:${opts.image.mimeType};base64,${opts.image.base64}`,
                      },
                    },
                  ]
                : message.content,
          })),
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Groq vision error", res.status, detail.slice(0, 400));
      return { content: FALLBACK_MESSAGE, model: "template", usedFallback: true };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      model?: string;
    };
    const content = finalAnswer(data.choices?.[0]?.message?.content ?? "");
    if (!content) {
      return { content: FALLBACK_MESSAGE, model: "template", usedFallback: true };
    }

    return {
      content: cleanAssistantText(content),
      model: `promi:${data.model ?? model}`,
      usedFallback: false,
    };
  } catch (error) {
    console.error("Groq vision request failed", error);
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      content: aborted
        ? "I'm Promi — that photo took too long to review. Try a smaller or clearer photo, or send it again shortly. Photos alone still cannot diagnose PCOS."
        : FALLBACK_MESSAGE,
      model: "template",
      usedFallback: true,
    };
  } finally {
    clearTimeout(timer);
  }
}
