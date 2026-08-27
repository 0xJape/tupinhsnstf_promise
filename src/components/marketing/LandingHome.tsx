"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Check, ClipboardList, HeartPulse, Menu, MessageCircle, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";

const features = [
  [CalendarDays, "Track your cycle", "Notice patterns in your period and symptoms over time.", "/cycle"],
  [ClipboardList, "Understand screening", "See clear, rule-based health education—not a diagnosis.", "/screen"],
  [MessageCircle, "Ask Promi", "Get calm explanations and practical next steps in plain language.", "/assistant"],
] as const;

const educationVideos = [
  ["PCOS basics", "Understanding PCOS", "A calm introduction to symptoms, patterns, and when to seek care.", "MihxsdC40zI", "8 min"],
  ["Cycle health", "Understanding your cycle", "Learn what cycle changes can tell you—and what they cannot.", "MihxsdC40zI", "7 min"],
  ["Preparing for care", "Questions for your clinician", "Build a useful conversation around your symptoms and history.", "MihxsdC40zI", "6 min"],
] as const;

export function LandingHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="landing-new min-h-screen overflow-hidden bg-[#fbf8f9] text-[#3d2029]">
      <header className="landing-new-nav mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3"><BrandLogo size={42} priority /><span><strong className="block text-sm tracking-[.16em]">P.R.O.M.I.S.E.</strong><small className="text-xs text-[#765761]">Health education</small></span></Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#765761] md:flex"><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#safety">Safety</a><Link href="/login">Log in</Link><Link href="/register" className="landing-new-button">Get started <ArrowRight className="size-4" /></Link></nav>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
      </header>
      {menuOpen && <nav className="mx-5 grid gap-3 border-b border-[#eadde1] pb-4 text-sm font-semibold md:hidden"><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#safety">Safety</a><Link href="/login">Log in</Link></nav>}
      <section className="landing-new-hero mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1fr_.8fr] lg:px-10 lg:pb-28 lg:pt-24">
        <div><p className="landing-new-kicker">PCOS education · built for young women</p><h1>Understand your health with <em>more clarity.</em></h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-[#765761]">P.R.O.M.I.S.E. helps you notice cycle patterns, learn about PCOS risk, and prepare better questions for a healthcare professional.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="landing-new-button landing-new-button-lg">Start your health journey <ArrowRight className="size-4" /></Link><a href="#how-it-works" className="landing-new-text-button">Learn how it works</a></div><p className="mt-5 text-xs text-[#765761]">Private by design · Educational support · Not a diagnosis</p></div>
        <div className="landing-new-hero-panel" aria-label="P.R.O.M.I.S.E. health companion preview"><Image src="/brand/promi-holding-phone.png" alt="P.R.O.M.I.S.E. health companion preview" fill priority sizes="(max-width: 1023px) 100vw, 42vw" className="landing-hero-art" /></div>
      </section>
      <section id="how-it-works" className="mx-auto max-w-7xl border-t border-[#eadde1] px-5 py-16 sm:px-8 lg:px-10"><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p className="landing-new-kicker">A calmer way to learn</p><h2>From noticing to next steps.</h2></div><div className="grid gap-4 sm:grid-cols-3">{[["01", "Notice", "Record changes without guessing what they mean."], ["02", "Learn", "Explore clear, evidence-informed education."], ["03", "Prepare", "Bring useful context to a clinical conversation."]].map(([number, title, body]) => <article key={number} className="landing-new-step"><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
      <section id="features" className="bg-[#f3eaed] px-5 py-16 sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl"><p className="landing-new-kicker">Your private toolkit</p><h2>Useful support, without the noise.</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{features.map(([Icon, title, body, href]) => <article className="landing-new-feature" key={title}><Icon className="size-5 text-[#9f2947]" /><h3>{title}</h3><p>{body}</p><Link href={href}>Explore <ArrowRight className="size-4" /></Link></article>)}</div></div></section>
      <section id="education" className="landing-new-education mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10"><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="landing-new-kicker">Learn at your pace</p><h2>Clear education for real questions.</h2><p className="mt-5 max-w-lg leading-relaxed text-[#765761]">Start with short, reviewed content about PCOS, cycles, symptoms, and preparing for care.</p></div><Link href="/help" className="landing-new-button lg:justify-self-end">Explore all education <ArrowRight className="size-4" /></Link></div><article className="landing-new-video-feature mt-10 grid overflow-hidden rounded-2xl bg-[#3d2029] text-white lg:grid-cols-[1.15fr_.85fr]"><div className="aspect-video bg-[#2d111d]"><iframe className="size-full" src="https://www.youtube-nocookie.com/embed/MihxsdC40zI" title="Understanding PCOS" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><div className="flex flex-col justify-center p-6 sm:p-8"><span className="mb-4 w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Featured · PCOS basics</span><h3 className="text-2xl font-semibold">Understanding PCOS</h3><p className="mt-3 text-sm leading-relaxed text-white/70">A calm introduction to symptoms, patterns, and when to seek care.</p><p className="mt-5 text-xs text-white/60">Reviewed educational content · 8 min</p></div></article><div className="mt-8 grid gap-4 md:grid-cols-3">{educationVideos.slice(1).map(([category, title, body, videoId, duration]) => <article key={title} className="landing-new-video-card"><div className="landing-new-video-thumb"><span>{category}</span><b>{duration}</b></div><h3>{title}</h3><p>{body}</p><a href={`https://www.youtube-nocookie.com/embed/${videoId}`} target="_blank" rel="noreferrer">Watch video <ArrowRight className="size-4" /></a></article>)}</div><p className="mt-6 text-xs text-[#765761]">Educational content only—not medical diagnosis. More reviewed videos coming soon.</p></section>
      <section id="safety" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10"><div className="landing-new-safety"><div><p className="landing-new-kicker">Designed with care</p><h2>Your health deserves context, not conclusions.</h2></div><ul><li><Check /> Rule-based screening you can understand</li><li><ShieldCheck /> Privacy and consent at every step</li><li><HeartPulse /> Professional care remains essential</li></ul></div><DisclaimerBanner /></section>
      <footer className="border-t border-[#eadde1] px-5 py-8 text-center text-sm text-[#765761]">P.R.O.M.I.S.E. · PCOS education, screening, and monitoring · Not a diagnosis</footer>
    </main>
  );
}
