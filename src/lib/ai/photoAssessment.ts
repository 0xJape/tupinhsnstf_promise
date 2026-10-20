import { z } from "zod";
import type { ImagePart } from "./groqVision";

export const photoObservationSchema = z.object({
  acneLikeSpots: z.enum(["not_observed", "possibly_observed", "unclear"]),
  coarseFacialHair: z.enum(["not_observed", "possibly_observed", "unclear"]),
  imageQuality: z.enum(["adequate", "limited", "unusable"]),
  limitations: z.array(z.string().trim().min(1).max(120)).max(5),
});

export type PhotoObservation = z.infer<typeof photoObservationSchema>;

export async function assessPhoto(image: ImagePart): Promise<{ observation: PhotoObservation; model: string }> {
  const apiKey = process.env.GROQ_VISION_API_KEY;
  const model = process.env.GROQ_VISION_MODEL?.trim() || "qwen/qwen3.6-27b";
  if (!apiKey) throw new Error("Photo assessment is unavailable.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.AI_VISION_TIMEOUT_MS ?? 45000));
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0,
        max_completion_tokens: 350,
        reasoning_effort: "none",
        reasoning_format: "hidden",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Review one participant-provided face photo for educational symptom documentation only. Return JSON only with keys acneLikeSpots, coarseFacialHair, imageQuality, limitations. Observation values must be not_observed, possibly_observed, or unclear. imageQuality must be adequate, limited, or unusable. limitations must contain at most 5 short factual limitations. Never diagnose, grade severity, infer identity, age, ethnicity, attractiveness, disease probability, or PCOS status. If visibility is insufficient, use unclear. Lighting, angle, filters, hair removal, makeup, and image resolution can limit observation.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Record only constrained visible observations. This will not alter screening score." },
              { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.base64}` } },
            ],
          },
        ],
      }),
    });
    if (!response.ok) throw new Error("Photo assessment provider failed.");
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[]; model?: string };
    const raw = data.choices?.[0]?.message?.content?.replace(/<think>[\s\S]*?<\/think>\s*/gi, "").trim();
    if (!raw) throw new Error("Photo assessment returned no result.");
    const parsed = photoObservationSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new Error("Photo assessment returned an invalid result.");
    return { observation: parsed.data, model: `promi:${data.model ?? model}` };
  } finally {
    clearTimeout(timer);
  }
}
