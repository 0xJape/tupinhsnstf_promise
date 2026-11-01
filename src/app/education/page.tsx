import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, HeartPulse, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AnatomyViewer } from "@/components/education/AnatomyViewer";

const videos = [
  ["PCOS basics", "Understanding PCOS", "A calm introduction to symptoms, patterns, and when to seek care.", "MihxsdC40zI", "8 min"],
  ["Cycle health", "Understanding your cycle", "Learn what cycle changes can tell you—and what they cannot.", "gmIzqE1mxsU", "Short video"],
  ["Preparing for care", "Questions for your clinician", "Build a useful conversation around your symptoms and history.", "gbNyX76pXxA", "Short video"],
] as const;

export default function EducationPage() {
  return (
    <main className="landing-new min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3"><BrandLogo size={42} priority /><span><strong className="block text-sm tracking-[.16em]">P.R.O.M.I.S.E.</strong><small className="text-xs text-muted-foreground">Health education</small></span></Link>
        <div className="flex items-center gap-1">
          <ThemeToggle className="text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
          <Link href="/" className="landing-new-text-button"><ArrowLeft className="size-4" /> Back home</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 lg:px-10 lg:pt-20">
        <p className="landing-new-kicker">Educational library</p>
        <h1 className="max-w-3xl">Learn about PCOS with <em>more clarity.</em></h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Short, approachable lessons about PCOS, cycle health, and preparing for conversations with a healthcare professional.</p>
      </section>

      <section aria-labelledby="video-library-title" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3 border-b border-border pb-5"><BookOpen className="size-5 text-primary" /><h2 id="video-library-title">Video library</h2></div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {videos.map(([category, title, body, videoId, duration]) => (
            <article key={title} className="landing-new-video-card overflow-hidden p-0">
              <iframe className="aspect-video w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              <div className="p-5"><span className="text-xs font-bold text-primary">{category} · {duration}</span><h3>{title}</h3><p>{body}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="anatomy-section-title" className="py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><p className="landing-new-kicker">Interactive learning</p><h2 id="anatomy-section-title">Explore reproductive anatomy</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Rotate and zoom a cross-section anatomy model. Visual is educational and cannot confirm PCOS.</p></div>
        <div className="mx-auto mt-8 max-w-[90rem] px-3 sm:px-6"><AnatomyViewer /></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6"><HeartPulse className="size-5 text-primary" /><h3 className="mt-4 font-semibold">Need professional care?</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Find nearby Region XII healthcare resources and prepare for a clinical visit.</p><Link href="/help" className="mt-4 inline-flex items-center gap-2 font-semibold text-primary">View resources <ArrowRight className="size-4" /></Link></article>
          <article className="rounded-2xl border border-border bg-card p-6"><MessageCircle className="size-5 text-primary" /><h3 className="mt-4 font-semibold">Have a health question?</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Ask Promi for plain-language educational guidance after signing in.</p><Link href="/login" className="mt-4 inline-flex items-center gap-2 font-semibold text-primary">Log in <ArrowRight className="size-4" /></Link></article>
        </div>
        <DisclaimerBanner />
      </section>

      <footer className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">P.R.O.M.I.S.E. education · Not a diagnosis</footer>
    </main>
  );
}