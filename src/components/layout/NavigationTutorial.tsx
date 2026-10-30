"use client";

import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Compass, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const tours = {
  "/home": { name: "Dashboard", steps: [["[data-tour-section=dashboard-hero]", "Your next step", "This hero shows your greeting, cycle context, and one recommended action."], ["[data-tour-section=dashboard-snapshot]", "Snapshot", "These cards summarize screening status and care signals. They are guidance, not a diagnosis."], ["[data-tour-section=dashboard-visuals]", "Visual overview", "Cycle map shows your cycle picture. Wellness lets you log how you feel. Promi is your supportive guide."], ["[data-tour-section=dashboard-actions]", "Quick access", "Use shortcuts to log a period, track wellness, open screening, and find support."], ["[data-tour-section=dashboard-education]", "Education", "Open short PCOS learning lessons. Education does not replace clinical care."]] },
  "/cycle": { name: "Cycle", steps: [["[data-tour-section=cycle-page]", "Cycle overview", "Review today’s cycle context, estimates, phases, patterns, and history. Estimates do not diagnose conditions."]] },
  "/screen": { name: "Screening", steps: [["[data-tour-section=screen-page]", "Screening overview", "Complete educational PCOS screening, review contributing factors, and follow suggested next steps. Results are not a diagnosis."]] },
  "/assistant": { name: "Assistant", steps: [["[data-tour-section=assistant-page]", "Promi Assistant", "Ask Promi for educational explanations, app help, or help preparing questions for a clinician. Promi does not replace professional care."]] },
  "/profile": { name: "Profile", steps: [["[data-tour-section=profile-page]", "Your profile", "Review your information, preferences, setup status, privacy choices, and account controls."]] },
} as const;

type Box = { top: number; left: number; width: number; height: number };

export function NavigationTutorial() {
  const pathname = usePathname();
  const tourConfig = tours[pathname as keyof typeof tours] ?? tours["/home"];
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [panelSide, setPanelSide] = useState<"top" | "bottom">("bottom");
  const steps = tourConfig.steps;
  const current = steps[Math.min(step, steps.length - 1)];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const update = () => {
      const target = document.querySelector<HTMLElement>(current[0]);
      if (!target) return setBox(null);
      target.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
      window.requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        setPanelSide(rect.top < window.innerHeight / 2 ? "bottom" : "top");
      });
    };
    const timer = window.setTimeout(update, 0);
    window.addEventListener("resize", update);
    return () => { document.body.style.overflow = previousOverflow; window.clearTimeout(timer); window.removeEventListener("resize", update); };
  }, [current, open, pathname]);

  function close() { window.speechSynthesis?.cancel(); setOpen(false); setStep(0); }
  function move(next: number) { setStep(next); }
  function narrate() { window.speechSynthesis?.cancel(); window.speechSynthesis?.speak(new SpeechSynthesisUtterance(`${current[1]}. ${current[2]}`)); }

  const tour = open ? <div className="navigation-tour" role="dialog" aria-modal="true" aria-labelledby="navigation-tour-title">
    {box ? <span className="navigation-tour-spotlight" style={box} aria-hidden /> : <span className="navigation-tour-backdrop" aria-hidden />}
    <section className="navigation-tour-panel" style={panelSide === "top" ? { top: "1rem", bottom: "auto" } : { top: "auto", bottom: "1rem" }}>
      <div className="navigation-tour-topline"><span>{tourConfig.name} tour · {step + 1}/{steps.length}</span><button type="button" onClick={close} aria-label="Close app tour"><X className="size-4" /></button></div>
      <div className="navigation-tour-progress" aria-hidden>{steps.map((item, index) => <i key={item[0]} className={index <= step ? "is-active" : ""} />)}</div>
      <p className="navigation-tour-instruction">Look here</p><h2 id="navigation-tour-title">{current[1]}</h2><p>{current[2]}</p>
      <button type="button" className="navigation-tour-audio" onClick={narrate}><Volume2 className="size-4" aria-hidden />Play explanation</button>
      <div className="navigation-tour-actions"><Button type="button" variant="ghost" disabled={!step} onClick={() => move(step - 1)}><ArrowLeft className="size-4" aria-hidden />Back</Button><Button type="button" onClick={() => step === steps.length - 1 ? close() : move(step + 1)}>{step === steps.length - 1 ? "Finish tour" : "Next area"}<ArrowRight className="size-4" aria-hidden /></Button></div>
    </section>
  </div> : null;

  return <><Button type="button" variant="outline" className="min-h-10 gap-2 rounded-xl" onClick={() => { setStep(0); setOpen(true); }}><Compass className="size-4" aria-hidden />{tourConfig.name} tour</Button>{tour ? createPortal(tour, document.body) : null}</>;
}
