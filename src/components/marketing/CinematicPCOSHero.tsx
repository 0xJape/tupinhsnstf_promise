"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CalendarDays, Check, ClipboardList, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";

export function CinematicPCOSHero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-cinema='copy'] > *", { y: 28, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" });
      gsap.from("[data-cinema='phone']", { y: 72, rotate: 5, scale: 0.9, opacity: 0, delay: 0.2, duration: 1, ease: "expo.out" });
      gsap.from("[data-cinema='logo']", { y: -28, rotate: -14, scale: 0.7, opacity: 0, delay: 0.35, duration: 0.8, ease: "back.out(1.6)" });
      gsap.from("[data-cinema='float']", { y: 24, opacity: 0, stagger: 0.12, delay: 0.7, duration: 0.7, ease: "power3.out" });
      gsap.to("[data-cinema='glow']", { x: 18, y: -12, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.to("[data-cinema='logo']", { y: -8, rotate: 3, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }, element);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="cinematic-pcos-hero" aria-labelledby="hero-title">
      <div data-cinema="glow" className="cinematic-pcos-glow" aria-hidden />
      <div className="relative grid gap-8 p-5 sm:p-8 md:grid-cols-[1fr_0.9fr] md:items-center lg:p-12">
        <div data-cinema="copy" className="relative z-10 space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-white/85">
            <ShieldCheck className="size-3.5" aria-hidden /> PCOS education · Philippines
          </p>
          <h1 id="hero-title" className="font-display text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl">
            Understand patterns.<br />Prepare for care.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            P.R.O.M.I.S.E. helps you log cycles, complete transparent PCOS educational screening, and bring clearer context to a clinician.
          </p>
          <p className="text-sm font-semibold text-rose-100">Educational support — not a medical diagnosis.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="cinematic-pcos-primary">Start your journey</Link>
            <Link href="/login" className="cinematic-pcos-secondary">Log in</Link>
          </div>
        </div>

        <div className="cinematic-phone-stage relative mx-auto grid min-h-[420px] w-full max-w-sm place-items-center">
          <div data-cinema="logo" className="cinematic-logo-sculpture" aria-hidden>
            <Image src="/brand/promiselogo.png" alt="" fill sizes="104px" className="object-contain" priority />
          </div>
          <div data-cinema="float" className="cinematic-phone-float left-0 top-16"><CalendarDays className="size-4 text-rose-300" aria-hidden /><span>Cycle log</span></div>
          <div data-cinema="float" className="cinematic-phone-float right-0 bottom-20"><Sparkles className="size-4 text-amber-300" aria-hidden /><span>Learn safely</span></div>
          <div data-cinema="phone" className="cinematic-phone">
            <div className="cinematic-phone-speaker" aria-hidden />
            <div className="cinematic-phone-screen">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700"><span>9:41</span><span>● ● ●</span></div>
              <div className="mt-5 flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-[0.13em] text-rose-600 uppercase">Good morning</p><p className="mt-1 text-lg font-black tracking-tight text-slate-900">Your care home</p></div><span className="grid size-9 place-items-center rounded-2xl bg-rose-100 text-rose-600"><HeartPulse className="size-4" aria-hidden /></span></div>
              <div className="mt-5 rounded-[22px] bg-gradient-to-br from-[#a72849] to-[#63142d] p-4 text-white shadow-lg shadow-rose-900/20"><p className="text-[10px] font-bold tracking-[0.12em] text-rose-100 uppercase">Today&apos;s focus</p><p className="mt-1 text-base font-bold">Notice your pattern</p><p className="mt-1 text-[11px] leading-relaxed text-rose-100">Small check-ins build clearer context over time.</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[58%] rounded-full bg-rose-200" /></div></div>
              <div className="mt-4 grid grid-cols-2 gap-2"><MiniCard icon={CalendarDays} label="Cycle" value="Track" tone="rose" /><MiniCard icon={ClipboardList} label="Screen" value="Learn" tone="amber" /></div>
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5 text-[10px] font-semibold text-emerald-800"><Check className="size-3.5" aria-hidden /> Private by design</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniCard({ icon: Icon, label, value, tone }: { icon: typeof CalendarDays; label: string; value: string; tone: "rose" | "amber" }) {
  return <div className="rounded-2xl bg-slate-50 p-3"><Icon className={`size-4 ${tone === "rose" ? "text-rose-500" : "text-amber-500"}`} aria-hidden /><p className="mt-2 text-[10px] text-slate-500">{label}</p><p className="mt-0.5 text-xs font-bold text-slate-900">{value}</p></div>;
}
