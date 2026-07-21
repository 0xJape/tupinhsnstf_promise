import { cleanAssistantText, FALLBACK_MESSAGE, SYSTEM_PROMPT } from "./prompt";

export type ChatTurn = { role: "user" | "assistant" | "system"; content: string };

export type GroqResult = {
  content: string;
  model: string;
  usedFallback: boolean;
};

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export async function completeWithGroq(opts: {
  messages: ChatTurn[];
  contextBlock: string;
  timeoutMs?: number;
}): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? Number(process.env.AI_TIMEOUT_MS ?? 12000);

  if (!apiKey) {
    return {
      content: FALLBACK_MESSAGE,
      model: "template",
      usedFallback: true,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

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
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: opts.contextBlock },
          ...opts.messages.map((m) => ({
            role: m.role === "system" ? "user" : m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Groq error", res.status, errText.slice(0, 300));
      return {
        content: FALLBACK_MESSAGE,
        model: "template",
        usedFallback: true,
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      model?: string;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return {
        content: FALLBACK_MESSAGE,
        model: "template",
        usedFallback: true,
      };
    }

    return {
      content: cleanAssistantText(content),
      model: `promi:${data.model ?? model}`,
      usedFallback: false,
    };
  } catch (e) {
    console.error("Groq request failed", e);
    return {
      content: FALLBACK_MESSAGE,
      model: "template",
      usedFallback: true,
    };
  } finally {
    clearTimeout(timer);
  }
}