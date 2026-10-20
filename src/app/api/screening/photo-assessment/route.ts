import { NextResponse } from "next/server";
import { z } from "zod";
import { assessPhoto } from "@/lib/ai/photoAssessment";
import type { ImagePart } from "@/lib/ai/groqVision";
import { createClient } from "@/lib/supabase/server";

const metadataSchema = z.object({
  baselineAssessmentId: z.string().uuid(),
  consent: z.literal("true"),
});
const allowedTypes = new Set<ImagePart["mimeType"]>(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "Invalid upload." }, { status: 400 }); }
  const parsed = metadataSchema.safeParse({ baselineAssessmentId: form.get("baselineAssessmentId"), consent: form.get("consent") });
  const photo = form.get("photo");
  if (!parsed.success || !(photo instanceof File)) return NextResponse.json({ error: "Photo and consent are required." }, { status: 400 });
  if (!allowedTypes.has(photo.type as ImagePart["mimeType"])) return NextResponse.json({ error: "Use JPEG, PNG, or WebP." }, { status: 400 });
  if (!photo.size || photo.size > MAX_BYTES) return NextResponse.json({ error: "Photo must be smaller than 4 MB." }, { status: 400 });

  const { data: baseline } = await supabase.from("risk_assessments").select("id").eq("id", parsed.data.baselineAssessmentId).eq("user_id", user.id).eq("assessment_type", "baseline").eq("record_status", "valid").maybeSingle();
  if (!baseline) return NextResponse.json({ error: "Valid baseline screening required." }, { status: 403 });

  try {
    const base64 = Buffer.from(await photo.arrayBuffer()).toString("base64");
    const { observation, model } = await assessPhoto({ mimeType: photo.type as ImagePart["mimeType"], base64 });
    const consentedAt = new Date().toISOString();
    const { data, error } = await supabase.from("photo_symptom_assessments").insert({
      user_id: user.id,
      baseline_assessment_id: baseline.id,
      acne_like_spots: observation.acneLikeSpots,
      coarse_facial_hair: observation.coarseFacialHair,
      image_quality: observation.imageQuality,
      limitations: observation.limitations,
      provider_model: model,
      consented_at: consentedAt,
    }).select("id, acne_like_spots, coarse_facial_hair, image_quality, limitations, created_at").single();
    if (error) throw error;
    return NextResponse.json({ assessment: data });
  } catch (error) {
    console.error("Photo symptom assessment failed", error);
    return NextResponse.json({ error: "Photo could not be assessed. Nothing from the photo was stored." }, { status: 502 });
  }
}
