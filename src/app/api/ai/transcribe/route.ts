import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Voice input is unavailable" }, { status: 503 });
  }

  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File) || !audio.size) {
    return NextResponse.json({ error: "Audio recording required" }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Recording too large (max 10MB)" }, { status: 413 });
  }

  const upstream = new FormData();
  upstream.append("file", audio, audio.name || "voice.webm");
  upstream.append("model", "whisper-large-v3-turbo");
  upstream.append("response_format", "json");

  try {
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Groq transcription error", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "Could not transcribe voice right now" }, { status: 503 });
    }

    const data = (await res.json()) as { text?: string };
    const text = data.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "No speech detected. Try again." }, { status: 422 });
    }
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Groq transcription request failed", error);
    return NextResponse.json({ error: "Could not transcribe voice right now" }, { status: 503 });
  }
}