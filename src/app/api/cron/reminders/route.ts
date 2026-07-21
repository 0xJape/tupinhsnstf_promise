import { NextResponse } from "next/server";
import { runReminderScan } from "@/lib/make/reminders";

/**
 * POST|GET /api/cron/reminders
 * Header: Authorization: Bearer $CRON_SECRET
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runReminderScan();
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    console.error("reminders cron", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "cron failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
