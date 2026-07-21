import { NextResponse } from "next/server";
import { z } from "zod";
import { emitMakeEvent } from "@/lib/make/emit";
import { MAKE_EVENT_TYPES } from "@/lib/make/types";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  eventType: z.enum(MAKE_EVENT_TYPES),
  data: z.record(z.string(), z.unknown()).optional(),
  userId: z.string().uuid().optional(),
});

function authorizedAsCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * POST /api/notifications/emit
 * - Logged-in user: emit for self
 * - Bearer CRON_SECRET: emit for any userId
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

  const cron = authorizedAsCron(req);
  let userId = parsed.data.userId;

  if (cron) {
    if (!userId) {
      return NextResponse.json(
        { error: "userId required for cron emit" },
        { status: 400 },
      );
    }
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }

  const result = await emitMakeEvent({
    userId: userId!,
    eventType: parsed.data.eventType,
    data: parsed.data.data,
  });

  return NextResponse.json(result, {
    status: result.ok || result.skipped ? 200 : 502,
  });
}
