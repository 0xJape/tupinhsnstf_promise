import { NextResponse } from "next/server";
import { z } from "zod";
import { buildAiContext, formatContextBlock } from "@/lib/ai/context";
import { completeWithGemini } from "@/lib/ai/gemini";
import { completeWithGroq, type ChatTurn } from "@/lib/ai/groq";
import { createClient } from "@/lib/supabase/server";

const imageSchema = z.object({
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  base64: z.string().min(32).max(6_000_000),
});

const bodySchema = z
  .object({
    conversationId: z.string().uuid().optional(),
    message: z.string().trim().max(2000).optional().default(""),
    relatedAssessmentId: z.string().uuid().optional(),
    image: imageSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.message?.trim() && !val.image) {
      ctx.addIssue({
        code: "custom",
        message: "Message or image required",
        path: ["message"],
      });
    }
  });

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { relatedAssessmentId, image } = parsed.data;
  const message =
    parsed.data.message?.trim() ||
    (image
      ? "[Photo shared for educational review — not a diagnosis]"
      : "");
  let conversationId = parsed.data.conversationId;

  // ~4MB decoded ceiling (base64 ~4/3)
  if (image && image.base64.length > 5_500_000) {
    return NextResponse.json(
      { error: "Image too large (max ~4MB)" },
      { status: 413 },
    );
  }

  if (conversationId) {
    const { data: owned } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!owned) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
  } else {
    const titleBase = image ? "Photo question" : message;
    const title =
      titleBase.length > 48 ? `${titleBase.slice(0, 45).trim()}...` : titleBase;
    const { data: created, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: user.id,
        title,
        related_assessment_id: relatedAssessmentId ?? null,
      })
      .select("id")
      .single();
    if (error || !created) {
      return NextResponse.json(
        { error: error?.message ?? "Could not create conversation" },
        { status: 500 },
      );
    }
    conversationId = created.id;
  }

  // Store text only (no image bytes in DB for privacy/size)
  const storedUserContent = image
    ? `${message}\n\n[User attached a photo for educational discussion]`
    : message;

  const { error: userMsgErr } = await supabase.from("ai_messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: storedUserContent,
  });
  if (userMsgErr) {
    return NextResponse.json({ error: userMsgErr.message }, { status: 500 });
  }

  const { data: history } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(24);

  const turns: ChatTurn[] = (history ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const ctx = await buildAiContext(supabase, user.id, relatedAssessmentId);
  const contextBlock = formatContextBlock(ctx);

  // Images → Gemini vision. Text-only → Groq (fast).
  const result = image
    ? await completeWithGemini({
        messages: turns,
        contextBlock,
        image: {
          mimeType: image.mimeType,
          base64: image.base64,
        },
      })
    : await completeWithGroq({ messages: turns, contextBlock });

  const { data: assistantRow, error: asstErr } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: result.content,
      model: result.model,
    })
    .select("id, content, model, created_at")
    .single();

  if (asstErr || !assistantRow) {
    return NextResponse.json(
      { error: asstErr?.message ?? "Could not save assistant message" },
      { status: 500 },
    );
  }

  await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return NextResponse.json({
    conversationId,
    assistantMessage: assistantRow.content,
    model: assistantRow.model ?? result.model,
    messageId: assistantRow.id,
  });
}