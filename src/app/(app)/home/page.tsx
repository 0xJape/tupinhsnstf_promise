import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Phone,
} from "lucide-react";
import { RiskBadge } from "@/components/screening/RiskBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { PhaseGuidanceCard } from "@/components/cycle/PhaseGuidanceCard";
import { DailyBrief } from "@/components/home/DailyBrief";
import { CycleOrbit } from "@/components/home/CycleOrbit";
import { PromiBay } from "@/components/home/PromiBay";
import { WellnessWeb } from "@/components/home/WellnessWeb";
import { ResourceDirectory } from "@/components/help/ResourceDirectory";
import { AnatomyViewer } from "@/components/education/AnatomyViewer";
import {
  computeCycleInsights,
  type PeriodLog,
} from "@/lib/cycle/insights";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { RiskCategory } from "@/types/screening";

type Props = {
  searchParams: Promise<{ setup?: string }>;
};

function firstName(full: string | null | undefined) {
  const t = full?.trim();
  if (!t) return null;
  return t.split(/\s+/)[0] ?? null;
}

function formatShort(ymd: string | null) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function cycleStatusLine(insights: ReturnType<typeof computeCycleInsights>) {
  if (insights.status === "no_data") return "No periods logged yet";
  if (insights.status === "need_more") return "Log one more period for estimates";
  if (insights.status === "delayed" && insights.delayedDays != null) {
    return `Period may be ~${insights.delayedDays}d late (estimate)`;
  }
  if (insights.status === "period_window") return "In expected period window";
  if (insights.daysUntilExpected != null && insights.daysUntilExpected > 0) {
    return `Next period ~${insights.daysUntilExpected}d · ${formatShort(insights.nextExpectedStart)}`;
  }
  if (insights.phase !== "unknown") return insights.phaseLabel;
  return "Cycle tracking on";
}

function riskBarWidth(score: number | null | undefined) {
  if (score == null) return 0;
  return Math.max(6, Math.min(100, Math.round(score)));
}

/** Mini risk trend: bars + line. Always draws frame so card not empty. */
function TrendSpark({ scores }: { scores: number[] }) {
  const w = 200;
  const h = 72;
  const padL = 6;
  const padR = 6;
  const padT = 8;
  const padB = 14;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const maxScore = 100;
  const bars = scores.length ? scores : [];

  const barGap = 4;
  const barW =
    bars.length > 0
      ? Math.min(22, (plotW - barGap * (bars.length - 1)) / bars.length)
      : 0;

  const linePts =
    bars.length >= 2
      ? bars
          .map((s, i) => {
            const x =
              padL +
              i * (barW + barGap) +
              barW / 2 +
              (plotW - (bars.length * barW + (bars.length - 1) * barGap)) / 2;
            const y = padT + plotH - (Math.min(maxScore, s) / maxScore) * plotH;
            return `${x},${y}`;
          })
          .join(" ")
      : "";

  const offsetX =
    bars.length > 0
      ? (plotW - (bars.length * barW + (bars.length - 1) * barGap)) / 2
      : 0;

  return (
    <div className="mt-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-16 w-full text-primary"
        role="img"
        aria-label={
          bars.length
            ? `Risk scores: ${bars.join(", ")}`
            : "No risk screens yet"
        }
      >
        {/* grid */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padL}
            x2={w - padR}
            y1={padT + plotH * (1 - t)}
            y2={padT + plotH * (1 - t)}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={1}
          />
        ))}
        <line
          x1={padL}
          x2={w - padR}
          y1={padT + plotH}
          y2={padT + plotH}
          stroke="currentColor"
          strokeOpacity={0.22}
          strokeWidth={1.25}
        />

        {bars.length === 0 ? (
          <text
            x={w / 2}
            y={padT + plotH / 2}
            textAnchor="middle"
            className="fill-current"
            fontSize="10"
            opacity={0.45}
          >
            Take a screen to start trend
          </text>
        ) : (
          bars.map((s, i) => {
            const bh = Math.max(3, (Math.min(maxScore, s) / maxScore) * plotH);
            const x = padL + offsetX + i * (barW + barGap);
            const y = padT + plotH - bh;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={bh}
                  rx={4}
                  fill="currentColor"
                  opacity={0.28 + (i / Math.max(1, bars.length - 1)) * 0.35}
                />
                <text
                  x={x + barW / 2}
                  y={h - 2}
                  textAnchor="middle"
                  fontSize="8"
                  className="fill-current"
                  opacity={0.55}
                >
                  {Math.round(s)}
                </text>
              </g>
            );
          })
        )}

        {bars.length >= 2 ? (
          <>
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePts}
              opacity={0.95}
            />
            {bars.map((s, i) => {
              const x =
                padL + offsetX + i * (barW + barGap) + barW / 2;
              const y =
                padT + plotH - (Math.min(maxScore, s) / maxScore) * plotH;
              return (
                <circle
                  key={`d-${i}`}
                  cx={x}
                  cy={y}
                  r={3}
                  fill="currentColor"
                />
              );
            })}
          </>
        ) : bars.length === 1 ? (
          <circle
            cx={padL + offsetX + barW / 2}
            cy={
              padT +
              plotH -
              (Math.min(maxScore, bars[0]) / maxScore) * plotH
            }
            r={3.5}
            fill="currentColor"
          />
        ) : null}
      </svg>
      {bars.length === 1 ? (
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Baseline recorded. Future follow-ups require study protocol access.
        </p>
      ) : null}
    </div>
  );
}

export default async function HomePage({ searchParams }: Props) {
  const { setup } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let fullName: string | null = null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, full_name, emergency_contact_phone")
    .eq("id", user.id)
    .maybeSingle();
  if (profile && !profile.onboarding_complete) redirect("/onboarding");
  fullName = profile?.full_name ?? null;

  const name = firstName(fullName);

  const [{ data: screenRows }, { data: periodRows }, { data: safetyCheckin }] = await Promise.all([
    user
      ? supabase
          .from("risk_assessments")
          .select("id, total_score, category, referral_recommended, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("menstrual_logs")
          .select("id, start_date, duration_days")
          .eq("user_id", user.id)
          .order("start_date", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: null }),
        user
          ? supabase
            .from("safety_checkins")
            .select("status, checkin_date")
            .eq("user_id", user.id)
            .order("checkin_date", { ascending: false })
            .limit(1)
            .maybeSingle()
          : Promise.resolve({ data: null }),
  ]);

  const latestScreen = screenRows?.[0] ?? null;
  const trendScores = (screenRows ?? [])
    .slice()
    .reverse()
    .map((r) => Number(r.total_score) || 0);

  const logs: PeriodLog[] = (periodRows ?? []).map((r) => ({
    id: r.id,
    start_date: r.start_date,
    duration_days: r.duration_days,
  }));
  const insights = computeCycleInsights(logs);
  const category = (latestScreen?.category as RiskCategory | null) ?? null;
  const referral = Boolean(latestScreen?.referral_recommended);
  const cycleLine = cycleStatusLine(insights);
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const screenWhen = latestScreen
    ? new Date(latestScreen.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  const recommended =
    setup
      ? {
          label: "Setup complete",
          title: "Pick one small step",
          body: "Screening, cycle log, or a calm chat — whenever you are ready.",
          href: "/screen",
          cta: "Open screen hub",
        }
      : referral && latestScreen
        ? {
            label: "Recommended action",
            title: "Talk with a clinician",
            body: "Last screen flagged a clinical chat — not a diagnosis. Prep checklist is on your result.",
            href: `/screen/result/${latestScreen.id}`,
            cta: "View details",
          }
        : !latestScreen
          ? {
              label: "Recommended action",
              title: "Take the risk screen",
              body: "Short Yes/No groups. Transparent score — education only.",
              href: "/screen/quiz",
              cta: "Start screening",
            }
          : {
              label: "Recommended action",
              title: logs.length ? "Log this cycle" : "Log your last period",
              body: logs.length
                ? "Fresh start dates keep phase estimates honest."
                : "One start date begins tracking. Two unlock length estimates.",
              href: "/cycle/new",
              cta: "Log period",
            };

  const quick = [
    {
      href: "/cycle",
      label: "Menstrual",
      icon: CalendarDays,
      tone: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    },
    {
      href: "/screen",
      label: "Screen",
      icon: ClipboardList,
      tone: "bg-primary/15 text-primary",
    },
    {
      href: "/track",
      label: "Track",
      icon: HeartPulse,
      tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    },
    {
      href: "/help",
      label: "Lifestyle",
      icon: Sparkles,
      tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    },
    {
      href: "/help",
      label: "Doctor",
      icon: Stethoscope,
      tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
  ] as const;

  return (
    <div className="dashboard-home mx-auto w-full max-w-7xl">
      <div className="dashboard-main-grid">
        <section className="dashboard-today" data-tour-section="dashboard-hero" aria-label="Today">
          <DailyBrief greeting={greet} name={name} cycleLine={cycleLine} action={recommended} actionKind={referral ? "care" : !latestScreen ? "screen" : "cycle"} />
          <DisclaimerBanner compact />
          <section className={cn("mt-4 rounded-3xl border p-4", safetyCheckin?.status === "need_support" ? "border-rose-300/60 bg-rose-50/80 dark:bg-rose-950/25" : "border-emerald-300/50 bg-emerald-50/70 dark:bg-emerald-950/20")} aria-label="Safety status">
            <div className="flex items-start justify-between gap-3">
              <div><p className="section-label">Safety signal</p><h2 className="mt-1 text-base font-bold">{safetyCheckin?.status === "need_support" ? "Support requested" : safetyCheckin ? "Safe for now" : "No check-in yet"}</h2><p className="mt-1 text-xs text-muted-foreground">{safetyCheckin ? `Last check-in: ${formatShort(safetyCheckin.checkin_date)}` : "A private daily check-in helps you notice what support you need."}</p></div>
              <HeartPulse className={cn("size-5", safetyCheckin?.status === "need_support" ? "text-rose-600" : "text-emerald-600")} aria-hidden />
            </div>
            <div className="mt-3 flex flex-wrap gap-2"><Link href="/track" className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground">Open check-in <ArrowRight className="size-3" /></Link>{safetyCheckin?.status === "need_support" ? <Link href="/help" className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-rose-300 px-3 text-xs font-bold text-rose-800 dark:text-rose-100">Open support</Link> : null}</div>
          </section>
        </section>

        <section className="dashboard-risk" data-tour-section="dashboard-snapshot" aria-label="Risk snapshot">
          <Link
            href={
              latestScreen ? `/screen/result/${latestScreen.id}` : "/screen"
            }
            className="glass group flex flex-col gap-3 rounded-[28px] p-4 transition active:scale-[0.99]"
          >
            <span className="section-label text-primary">
              Current PCOS risk
            </span>
            {category ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge category={category} size="sm" className="w-fit" />
                  <span className="text-xs text-muted-foreground">
                    Score {latestScreen!.total_score}
                    {screenWhen ? ` · ${screenWhen}` : ""}
                  </span>
                </div>
                <div className="glass-bar mt-1">
                  <span
                    className="bg-gradient-to-r from-primary/70 to-primary"
                    style={{
                      width: `${riskBarWidth(latestScreen!.total_score)}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Rule-based score (0–100) — not a diagnosis.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  Not taken yet
                </p>
                <p className="text-xs text-muted-foreground">
                  ~5 min Yes/No quiz
                </p>
              </>
            )}
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold tracking-wide text-primary uppercase">
              {category ? "View details" : "Start screen"}
              <ArrowRight className="size-3" aria-hidden />
            </span>
          </Link>

          <div className="glass flex min-h-[11rem] flex-col rounded-[28px] p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="section-label">Baseline status</span>
              <span className="text-[10px] font-medium text-muted-foreground">
                0–100
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
              {(screenRows?.length ?? 0) === 0
                ? "Not completed"
                : "Baseline completed"}
            </p>
            <TrendSpark scores={trendScores} />
            <Link
              href="/screen"
              className="mt-auto pt-1 text-xs font-medium text-primary"
            >
              Screen hub
              <ArrowRight className="ml-1 inline size-3" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="dashboard-visuals" data-tour-section="dashboard-visuals" aria-label="Visual health overview">
          <Link href="/cycle" className="dashboard-vital-card dashboard-vital-cycle">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="section-label text-primary">Cycle map</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Your cycle today</h2>
              </div>
              <CalendarDays className="size-5 text-primary/70" aria-hidden />
            </div>
            <CycleOrbit insights={insights} />
            <span className="dashboard-card-link">Open cycle <ArrowRight className="size-3.5" aria-hidden /></span>
          </Link>
          <Link href="/track" className="dashboard-vital-card dashboard-vital-wellness">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="section-label text-primary">Wellness web</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">How you are feeling</h2>
              </div>
              <HeartPulse className="size-5 text-primary/70" aria-hidden />
            </div>
            <WellnessWeb />
            <span className="dashboard-card-link">Log how you feel <ArrowRight className="size-3.5" aria-hidden /></span>
          </Link>
          <PromiBay />
        </section>

        <section className="dashboard-actions space-y-3" data-tour-section="dashboard-actions" aria-label="Quick access">
          <h2 className="section-label">Quick access</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {quick.map(({ href, label, icon: Icon, tone }) => (
              <Link
                key={label}
                href={href}
                className="glass flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-center transition active:scale-[0.97]"
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-2xl",
                    tone,
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-[10px] font-bold leading-tight text-foreground">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-education" data-tour-section="dashboard-education" aria-labelledby="dashboard-education-title">
          <div className="dashboard-education-head">
            <div>
              <p className="dashboard-hud-eyebrow">Knowledge module // 03</p>
              <h2 id="dashboard-education-title">Learn something useful</h2>
            </div>
            <Link href="/help" className="dashboard-education-help">View help <ArrowRight className="size-3" aria-hidden /></Link>
          </div>
          <AnatomyViewer />
          <article className="dashboard-education-feature">
            <div className="aspect-[9/16] max-h-[28rem] w-full bg-black sm:aspect-video">
              <iframe
                className="size-full"
                src="https://www.youtube-nocookie.com/embed/MihxsdC40zI"
                title="P.R.O.M.I.S.E. PCOS education video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="dashboard-education-caption">
              <span>Featured lesson</span>
              <h3>Understanding PCOS</h3>
              <p>Educational only. Not a diagnosis or replacement for professional care.</p>
            </div>
          </article>
          <div className="dashboard-education-links">
            {[
              ["Understanding your cycle", "gmIzqE1mxsU"],
              ["Questions for your clinician", "gbNyX76pXxA"],
            ].map(([title, videoId]) => (
              <a key={videoId} href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer" className="dashboard-education-link">
                <div className="dashboard-education-play" aria-hidden><span>▶</span></div>
                <div>
                  <span>Next lesson</span>
                  <p>{title}</p>
                </div>
                <ArrowRight className="ml-auto size-4" aria-hidden />
                {/* Keep previews out of initial page load; link opens full lesson. */}
                <div className="hidden aspect-video bg-black">
                  <iframe className="pointer-events-none size-full" src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
              </a>
            ))}
          </div>
        </section>

        <div className="col-span-full">
        </div>

        <section className="dashboard-phase" aria-label="Phase guidance">
          <PhaseGuidanceCard insights={insights} />
        </section>

        <section className="col-span-full mt-2 border-t border-border/70 pt-6" aria-labelledby="dashboard-support-title">
          <div className="rounded-3xl border border-rose-300/40 bg-rose-50/70 p-5 dark:bg-rose-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-label text-rose-700 dark:text-rose-300">Immediate support // Phase 1</p>
              <h2 id="dashboard-support-title" className="mt-1 text-xl font-semibold text-foreground">Need help right now?</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">If you may be in immediate danger, call emergency services. For emotional crisis support, call NCMH.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <a href="tel:911" className="inline-flex h-11 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-rose-700"><Phone className="size-4" aria-hidden /> 911</a>
              <a href="tel:1553" className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-300/60 bg-background px-4 text-sm font-bold text-foreground hover:bg-rose-100 dark:hover:bg-rose-950/40"><Phone className="size-4" aria-hidden /> 1553</a>
            </div>
          </div>
          </div>
        </section>

        <section className="dashboard-care col-span-full mt-2 w-full border-t border-border/70 pt-6" aria-labelledby="dashboard-care-title">
          <p id="dashboard-care-title" className="mb-3 section-label text-primary">Care finder // Phase 1</p>
          <ResourceDirectory />
        </section>
      </div>
    </div>
  );
}
