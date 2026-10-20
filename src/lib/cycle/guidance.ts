import type { CyclePhase } from "@/lib/cycle/insights";

export type PhaseGuidance = {
  title: string;
  body: string;
  tips: readonly string[];
};

export const PHASE_GUIDANCE: Record<Exclude<CyclePhase, "unknown">, PhaseGuidance> = {
  menstrual: {
    title: "Go gently today",
    body: "Rest or lighter movement can be a good fit while bleeding. Follow what feels manageable.",
    tips: ["Hydrate regularly", "Choose iron-containing foods you enjoy", "Use warmth or rest if it helps"],
  },
  follicular: {
    title: "Build a steady rhythm",
    body: "After bleeding, some people notice more energy. Keep meals, sleep, and movement consistent.",
    tips: ["Plan regular meals", "Try movement you enjoy", "Keep logging cycle changes"],
  },
  ovulation: {
    title: "Notice your patterns",
    body: "This is an estimate based on logged dates. Check in with sleep, energy, and any symptoms.",
    tips: ["Carry water", "Choose comfortable movement", "Log new or unusual symptoms"],
  },
  luteal: {
    title: "Make room for recovery",
    body: "PMS symptoms can happen in this phase. Small routines for food, sleep, and stress may help.",
    tips: ["Keep meals regular", "Prioritize sleep", "Use a calm reset that works for you"],
  },
};

export function guidanceForPhase(phase: CyclePhase): PhaseGuidance | null {
  return phase === "unknown" ? null : PHASE_GUIDANCE[phase];
}
