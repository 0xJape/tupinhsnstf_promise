import { NextResponse } from "next/server";
import { z } from "zod";
import { emitMakeEvent } from "@/lib/make/emit";
import { MAKE_EVENT_TYPES } from "@/lib/make/types";

const bodySchema = z.object({
  eventType: z.enum(MAKE_EVENT_TYPES),
  data: z.record(z.string(), z.unknown()).optional(),
  userId: z.string().uuid(),
});

function authorizedAsCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * POST /api/notifications/emit
 * Internal cron emission only. Patient referral requests use /api/referrals/request.
 */
export async function POST(req: Request) {
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

  if (!authorizedAsCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (parsed.data.eventType === "care_referral") {
    return NextResponse.json(
      { error: "Care referrals must use the verified referral route." },
      { status: 403 },
    );
  }

  const result = await emitMakeEvent({
    userId: parsed.data.userId,
    eventType: parsed.data.eventType,
    data: parsed.data.data,
  });

  return NextResponse.json(result, {
    status: result.ok || result.skipped ? 200 : 502,
  });
}
