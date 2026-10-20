import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_TEXT_LENGTH = 4_000;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Voice is unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 });
  if (text.length > MAX_TEXT_LENGTH) return NextResponse.json({ error: "Text too long" }, { status: 413 });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_TTS_MODEL?.trim() || "canopylabs/orpheus-v1-english",
        voice: process.env.GROQ_TTS_VOICE?.trim() || "autumn",
        input: text,
        response_format: "wav",
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Groq TTS error", response.status, detail.slice(0, 300));
      return NextResponse.json({ error: "Voice is unavailable" }, { status: 503 });
    }
    return new Response(response.body, { headers: { "Content-Type": response.headers.get("content-type") || "audio/wav", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Groq TTS request failed", error);
    return NextResponse.json({ error: "Voice is unavailable" }, { status: 503 });
  }
}
