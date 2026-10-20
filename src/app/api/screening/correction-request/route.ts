import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  assessmentId: z.string().uuid(),
  reason: z.string().trim().min(10).max(500),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Explain what needs review in 10 to 500 characters." },
      { status: 400 },
    );
  }

  const { data: assessment } = await supabase
    .from("risk_assessments")
    .select("id")
    .eq("id", parsed.data.assessmentId)
    .eq("user_id", user.id)
    .eq("assessment_type", "baseline")
    .eq("record_status", "valid")
    .maybeSingle();
  if (!assessment) {
    return NextResponse.json({ error: "Active baseline not found." }, { status: 404 });
  }

  const { error } = await supabase.from("assessment_correction_requests").insert({
    user_id: user.id,
    assessment_id: assessment.id,
    reason: parsed.data.reason,
  });

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: "A review request for this baseline is already open." },
      { status: 409 },
    );
  }
  if (error) {
    return NextResponse.json({ error: "Could not send review request." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
