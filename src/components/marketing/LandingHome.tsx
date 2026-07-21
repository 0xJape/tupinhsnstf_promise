"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Promi } from "@/components/promi/Promi";
import { EducationSceneStrip } from "@/components/assistant/EducationScenes";
import { ImageSlot } from "@/components/marketing/ImageSlot";
import { LandingBackground } from "@/components/marketing/LandingBackground";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const IMAGES = {
  hero: "/brand/hero-pcos.png",
  awareness: "/brand/pcos-reasons.png",
  care: "/brand/care-community.png",
};

const pillars = [
  {
    letter: "P",
    word: "PCOS",
    detail: "Focus on polycystic ovary syndrome risk education.",
  },
  {
    letter: "R",
    word: "Risk",
    detail: "Transparent, rule-based scoring — not a black box.",
  },
  {
    letter: "O",
    word: "Observation",
    detail: "Notice patterns in cycles and symptoms over time.",
  },
  {
    letter: "M",
    word: "Monitoring",
    detail: "Online menstrual logs you can review later.",
  },
  {
    letter: "I",
    word: "Intervention",
    detail: "Referral guidance when risk is Moderate or High.",
  },
  {
    letter: "S",
    word: "Screening",
    detail: "Grouped questionnaire + menarche (pcos-screen-v2).",
  },
  {
    letter: "E",
    word: "Education",
    detail: "Plain-language AI explain + safety disclaimers.",
  },
] as const;

const pillarHues = [
  "from-[#DC7189] to-[#9F2947]",
  "from-[#F472B6] to-[#DB2777]",
  "from-[#38BDF8] to-[#0EA5E9]",
  "from-[#E07A91] to-[#B83255]",
  "from-[#34D399] to-[#10B981]",
  "from-[#FBBF24] to-[#F59E0B]",
  "from-[#C94A68] to-[#9F2947]",
] as const;

const features = [
  {
    icon: CalendarDays,
    title: "Cycle tracking",
    body: "Log periods in a calm, mobile-first flow.",
    tone: "bg-gradient-to-br from-pink-400 to-pink-600 text-white",
  },
  {
    icon: ClipboardList,
    title: "Risk screening",
    body: "Grouped questions. Scores from fixed rules, never invented by AI.",
    tone: "bg-gradient-to-br from-rose-400 to-rose-700 text-white",
  },
  {
    icon: MessageCircle,
    title: "Learning assistant",
    body: "Educational chat to unpack results — not a doctor.",
    tone: "bg-gradient-to-br from-sky-400 to-sky-600 text-white",
  },
] as const;

const LEARN_VIDEOS = [
  {
    id: "what-is-pcos",
    title: "What is PCOS?",
    blurb: "Plain-language overview of polycystic ovary syndrome.",
    youtubeId: "" as string,
  },
  {
    id: "cycles-symptoms",
    title: "Cycles & symptoms",
    blurb: "How irregular periods and other signs can show up.",
    youtubeId: "" as string,
  },
  {
    id: "when-to-seek-care",
    title: "When to seek care",
    blurb: "Educational tips on talking with a clinician.",
    youtubeId: "" as string,
  },
] as const;

export function LandingHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoTrackRef = useRef<HTMLDivElement>(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [promiGreeting, setPromiGreeting] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(root.querySelectorAll("[data-reveal], [data-hero]"), {
        clearProps: "all",
        opacity: 1,
        y: 0,
        scale: 1,
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(
        "[data-hero='nav'], [data-hero='chip'], [data-hero='title'] span, [data-hero='sub'], [data-hero='body'], [data-hero='cta'], [data-hero='orb'], [data-hero='stats'] > *",
        { opacity: 0 },
      );

      const hero = gsap.timeline({ defaults: { ease: "back.out(1.4)" } });
      hero
        .fromTo(
          "[data-hero='nav']",
          { y: -24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
          0,
        )
        .fromTo(
          "[data-hero='chip']",
          { y: 18, scale: 0.88, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.5 },
          "-=0.2",
        )
        .fromTo(
          "[data-hero='title'] span",
          { y: 40, opacity: 0, scale: 0.8 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.05,
            duration: 0.55,
          },
          "-=0.15",
        )
        .fromTo(
          "[data-hero='sub']",
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
          "-=0.25",
        )
        .fromTo(
          "[data-hero='body']",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
          "-=0.25",
        )
        .fromTo(
          "[data-hero='cta']",
          { y: 20, opacity: 0, scale: 0.94 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.45 },
          "-=0.2",
        )
        .fromTo(
          "[data-hero='orb']",
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7 },
          "-=0.45",
        )
        .fromTo(
          "[data-hero='stats'] > *",
          { y: 16, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.4 },
          "-=0.35",
        );

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          y: 28,
          opacity: 0,
          duration: 0.65,
          ease: "power3.out",
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-pillar]").forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          x: i % 2 === 0 ? -24 : 24,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(1.2)",
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const titleParts = ["P.", "R.", "O.", "M.", "I.", "S.", "E."];

  const goVideo = (next: number) => {
    const i = Math.max(0, Math.min(LEARN_VIDEOS.length - 1, next));
    setVideoIndex(i);
    const track = videoTrackRef.current;
    const slide = track?.children[i] as HTMLElement | undefined;
    slide?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <div ref={rootRef} className="landing-clay relative min-h-full">
      <LandingBackground />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-lg flex-col px-4 sm:px-5">
        <header data-hero="nav" className="sticky top-3 z-30 pt-2">
          <div className="clay-nav flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <BrandLogo size={40} className="shrink-0" priority />
              <div className="min-w-0 leading-tight">
                <p className="font-display truncate text-sm font-extrabold tracking-tight text-foreground">
                  P.R.O.M.I.S.E.
                </p>
                <p className="truncate text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
                  Project home
                </p>
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <ThemeToggle className="text-foreground hover:bg-primary/10" />
              <Link
                href="/login"
                className="clay-btn clay-btn-ghost min-h-11 rounded-[20px] px-3 text-sm font-bold"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="clay-btn clay-btn-primary min-h-11 px-4 text-sm"
              >
                Sign up
              </Link>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-14 py-8 pb-16">
          <section
            className="relative space-y-7 pt-2"
            aria-labelledby="hero-title"
          >
            <button
              type="button"
              className="landing-promi absolute -top-9 right-0 z-10 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              aria-label="Greet Promi"
              aria-pressed={promiGreeting}
              onClick={() => setPromiGreeting((visible) => !visible)}
            >
              <Promi
                emotion={promiGreeting ? "happy" : "wave"}
                size="md"
                variant="bare"
                hideName
              />
              {promiGreeting ? (
                <span className="absolute top-full right-0 w-40 rounded-2xl border border-primary/20 bg-card px-3 py-2 text-left text-xs font-semibold text-foreground shadow-md">
                  Hi! I&apos;m Promi. Let&apos;s learn together.
                </span>
              ) : null}
            </button>

            <div
              data-hero="chip"
              className="clay-chip inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold"
            >
              <Sparkles className="size-3.5" aria-hidden />
              PCOS education · Philippines
            </div>

            <div className="space-y-4">
              <p className="landing-kicker text-[11px]">Educational platform</p>
              <h1
                id="hero-title"
                data-hero="title"
                className="landing-hero-title flex flex-wrap gap-x-0.5 text-5xl sm:text-6xl"
              >
                {titleParts.map((part, i) => (
                  <span
                    key={part}
                    className={`landing-letter landing-letter-${i}`}
                  >
                    {part}
                  </span>
                ))}
              </h1>
              <p
                data-hero="sub"
                className="font-display text-lg font-extrabold leading-snug tracking-tight text-foreground"
              >
                PCOS Risk Observation, Monitoring, Intervention, Screening, and
                Education
              </p>
              <p
                data-hero="body"
                className="text-base font-medium leading-relaxed text-muted-foreground"
              >
                Web platform for young people to learn PCOS risk, track cycles,
                and complete educational screening — with clear limits:{" "}
                <strong className="font-bold text-foreground">
                  not a medical diagnosis
                </strong>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                data-hero="cta"
                href="/register"
                className="clay-btn clay-btn-primary min-h-14 w-full text-base"
              >
                Get started
              </Link>
              <Link
                data-hero="cta"
                href="/login"
                className="clay-btn clay-btn-secondary min-h-14 w-full text-base"
              >
                Log in
              </Link>
            </div>

            <div data-hero="stats" className="grid grid-cols-3 gap-3">
              {[
                { k: "Track", v: "Cycles", tone: "landing-stat-track" },
                { k: "Screen", v: "Risk", tone: "landing-stat-screen" },
                { k: "Learn", v: "Safely", tone: "landing-stat-learn" },
              ].map((s) => (
                <div key={s.k} className="clay-stat px-2.5 py-4 text-center">
                  <p
                    className={cn(
                      "font-display text-[10px] font-extrabold tracking-[0.16em] uppercase",
                      s.tone,
                    )}
                  >
                    {s.k}
                  </p>
                  <p className="font-display mt-0.5 text-sm font-black tracking-tight text-foreground">
                    {s.v}
                  </p>
                </div>
              ))}
            </div>

            {/* Same SVG journey cards as assistant — display only on landing */}
            <div data-reveal className="clay-card p-4">
              <EducationSceneStrip />
            </div>

            <div data-reveal>
              <ImageSlot
                src={IMAGES.hero}
                alt="Educational visual about PCOS awareness"
                aspect="hero"
                priority
                placeholderHint="Hero image unavailable."
                caption="Hero visual — awareness, care, or calm lifestyle photo."
              />
            </div>
          </section>

          <section
            data-reveal
            className="space-y-4"
            aria-labelledby="about-title"
          >
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="size-5" aria-hidden />
              <h2
                id="about-title"
                className="landing-section-title text-2xl tracking-tight"
              >
                About the project
              </h2>
            </div>
            <div className="clay-card space-y-3 p-6 text-base font-medium leading-relaxed text-muted-foreground">
              <p>
                <strong className="font-extrabold text-foreground">
                  P.R.O.M.I.S.E.
                </strong>{" "}
                is a mobile-first platform for{" "}
                <strong className="font-extrabold text-foreground">
                  early education and self-observation
                </strong>{" "}
                around PCOS risk for adolescents and young adults in the
                Philippines.
              </p>
              <p>
                Structured screening, cycle logging, and AI-assisted
                explanations. Clinical decisions stay with licensed
                professionals — this tool educates and flags when seeking care
                may help.
              </p>
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="name-title">
            <div data-reveal className="flex items-center gap-2 text-primary">
              <GraduationCap className="size-5" aria-hidden />
              <h2
                id="name-title"
                className="landing-section-title text-2xl tracking-tight"
              >
                What the name means
              </h2>
            </div>
            <ol className="grid gap-3">
              {pillars.map(({ letter, word, detail }, i) => (
                <li
                  key={letter}
                  data-pillar
                  className="clay-panel flex gap-3 px-4 py-3.5"
                >
                  <span
                    className={cn(
                      "landing-pillar-letter clay-icon-orb flex size-11 shrink-0 items-center justify-center bg-gradient-to-br text-base text-white",
                      pillarHues[i],
                    )}
                  >
                    {letter}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-extrabold tracking-tight text-foreground">
                      {word}
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            data-reveal
            className="space-y-4"
            aria-labelledby="pcos-title"
          >
            <div className="flex items-center gap-2 text-primary">
              <HeartPulse className="size-5" aria-hidden />
              <h2
                id="pcos-title"
                className="landing-section-title text-2xl tracking-tight"
              >
                Why PCOS education matters
              </h2>
            </div>
            <ImageSlot
              src={IMAGES.awareness}
              alt="Illustration or photo supporting PCOS education"
              placeholderHint="Education image unavailable."
              caption="PCOS education and awareness."
            />
            <div className="space-y-3 text-base font-medium leading-relaxed text-muted-foreground">
              <p>
                PCOS is a common hormonal condition. Signs can include irregular
                cycles, acne, excess hair growth, and metabolic concerns — only
                a clinician can diagnose.
              </p>
              <p>
                Many young people delay asking for help. P.R.O.M.I.S.E. lowers
                that barrier with private, structured education.
              </p>
            </div>
          </section>

          <section
            data-reveal
            className="space-y-4"
            aria-labelledby="who-title"
          >
            <div className="flex items-center gap-2 text-primary">
              <Users className="size-5" aria-hidden />
              <h2
                id="who-title"
                className="landing-section-title text-2xl tracking-tight"
              >
                Who it&apos;s for
              </h2>
            </div>
            <ImageSlot
              src={IMAGES.care}
              alt="Community and care visual for young users"
              placeholderHint="Care image unavailable."
              caption="Supportive care and informed conversations."
            />
            <ul className="grid gap-3 text-base font-medium text-muted-foreground">
              <li className="clay-panel px-5 py-4">
                <strong className="font-extrabold text-foreground">
                  Ages 12–24
                </strong>{" "}
                (female) — guardian consent flow planned for 12–17.
              </li>
              <li className="clay-panel px-5 py-4">
                Learners who want{" "}
                <strong className="font-extrabold text-foreground">
                  clear, non-scary
                </strong>{" "}
                language about risk and next steps.
              </li>
              <li className="clay-panel px-5 py-4">
                Anyone who wants private, structured PCOS education online.
              </li>
            </ul>
          </section>

          <section
            data-reveal
            className="space-y-4"
            aria-labelledby="features-title"
          >
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" aria-hidden />
              <h2
                id="features-title"
                className="landing-section-title text-2xl tracking-tight"
              >
                Inside the app
              </h2>
            </div>
            <div className="grid gap-3">
              {features.map(({ icon: Icon, title, body, tone }) => (
                <div
                  key={title}
                  className="clay-card clay-card-hover flex gap-3.5 p-5"
                >
                  <span
                    className={cn(
                      "clay-icon-orb flex size-12 shrink-0 items-center justify-center",
                      tone,
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-extrabold tracking-tight text-foreground">
                      {title}
                    </h3>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            data-reveal
            className="space-y-4"
            aria-labelledby="learn-videos-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Play className="size-5 shrink-0" aria-hidden />
                <div>
                  <h2
                    id="learn-videos-title"
                    className="landing-section-title text-2xl tracking-tight"
                  >
                    Learn about PCOS
                  </h2>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Short educational videos — not medical advice.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  aria-label="Previous video"
                  disabled={videoIndex === 0}
                  onClick={() => goVideo(videoIndex - 1)}
                  className="clay-btn clay-btn-secondary size-11 disabled:opacity-40"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next video"
                  disabled={videoIndex >= LEARN_VIDEOS.length - 1}
                  onClick={() => goVideo(videoIndex + 1)}
                  className="clay-btn clay-btn-secondary size-11 disabled:opacity-40"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </div>
            </div>

            <div
              ref={videoTrackRef}
              className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={(e) => {
                const el = e.currentTarget;
                const slide = el.children[0] as HTMLElement | undefined;
                if (!slide) return;
                const i = Math.round(el.scrollLeft / (slide.offsetWidth + 12));
                setVideoIndex(
                  Math.max(0, Math.min(LEARN_VIDEOS.length - 1, i)),
                );
              }}
            >
              {LEARN_VIDEOS.map((v) => (
                <article
                  key={v.id}
                  className="clay-card w-[min(100%,20.5rem)] shrink-0 snap-center overflow-hidden p-3"
                >
                  <div className="relative aspect-video overflow-hidden rounded-[20px] bg-[#f7e7eb] shadow-clayPressed dark:bg-[#1c0c12]">
                    {v.youtubeId ? (
                      <iframe
                        title={v.title}
                        src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0`}
                        className="absolute inset-0 h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                        <span className="clay-icon-orb flex size-12 items-center justify-center bg-gradient-to-br from-[#C94A68] to-[#9F2947] text-white">
                          <Play className="size-5" aria-hidden />
                        </span>
                        <p className="font-display text-sm font-extrabold text-foreground">
                          Video placeholder
                        </p>
                        <p className="text-xs font-medium leading-snug text-muted-foreground">
                          Set youtubeId in LEARN_VIDEOS
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 px-1 pt-3 pb-1">
                    <h3 className="font-display text-base font-extrabold tracking-tight text-foreground">
                      {v.title}
                    </h3>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                      {v.blurb}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div
              className="flex justify-center gap-2"
              role="tablist"
              aria-label="Video slides"
            >
              {LEARN_VIDEOS.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={i === videoIndex}
                  aria-label={`Show video ${i + 1}: ${v.title}`}
                  onClick={() => goVideo(i)}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    i === videoIndex
                      ? "w-7 bg-primary"
                      : "w-2.5 bg-primary/25 hover:bg-primary/45",
                  )}
                />
              ))}
            </div>
          </section>

          <div data-reveal>
            <DisclaimerBanner />
          </div>

          <section
            data-reveal
            className="clay-card relative space-y-4 overflow-hidden p-6"
          >
            <div
              aria-hidden
              className="absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br from-[#C94A68]/25 to-[#9F2947]/20 blur-xl"
            />
            <h2 className="landing-section-title relative text-2xl tracking-tight">
              Ready to explore?
            </h2>
            <p className="relative text-base font-medium leading-relaxed text-muted-foreground">
              Create an account to save logs and screening history, or open the
              app to explore features.
            </p>
            <div className="relative flex flex-col gap-3">
              <Link
                href="/register"
                className="clay-btn clay-btn-primary min-h-14 w-full text-base"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="clay-btn clay-btn-secondary min-h-14 w-full text-base"
              >
                I already have an account
              </Link>
            </div>
          </section>

          <footer className="space-y-1 pb-4 text-center text-sm font-medium text-muted-foreground">
            <p className="font-display font-extrabold text-foreground/80">
              P.R.O.M.I.S.E.
            </p>
            <p>Educational screening · Not a diagnosis</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
