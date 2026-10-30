"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Promi } from "@/components/promi/Promi";
import type { PromiEmotion } from "@/lib/promi";

const reactions: { emotion: PromiEmotion; message: string }[] = [
  { emotion: "wave", message: "Hi! I’m right here." },
  { emotion: "happy", message: "You’re doing great today." },
  { emotion: "cheer", message: "One small step still counts!" },
  { emotion: "think", message: "Want to explore your health patterns?" },
  { emotion: "playing", message: "Tap again — I like this game." },
];

export function PromiBay() {
  const [reaction, setReaction] = useState(0);
  const current = reactions[reaction];

  return (
    <section className="dashboard-promi-bay" aria-label="Promi assistant">
      <span className="dashboard-promi-grid" aria-hidden />
      <span className="dashboard-promi-orbit dashboard-promi-orbit-one" aria-hidden />
      <span className="dashboard-promi-orbit dashboard-promi-orbit-two" aria-hidden />
      <span className="dashboard-promi-scan" aria-hidden />
      <button
        type="button"
        className="dashboard-promi-button"
        onClick={() => setReaction((reaction + 1) % reactions.length)}
        aria-label="Talk to Promi"
      >
        <Promi emotion={current.emotion} size="xl" variant="bare" hideName className="dashboard-promi-avatar" />
      </button>
      <p key={reaction} className="dashboard-promi-message" role="status" aria-live="polite">{current.message}</p>
      <span className="dashboard-promi-status"><i /> PROMI // ONLINE</span>
      <Link href="/assistant" className="dashboard-promi-open" aria-label="Open Promi assistant"><MessageCircle className="size-4" aria-hidden /><ArrowRight className="size-4" aria-hidden /></Link>
    </section>
  );
}
