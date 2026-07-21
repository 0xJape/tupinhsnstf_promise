"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Clay stage: soft candy blobs on lavender canvas.
 * Structure kept; futuristic grid removed.
 */
export function LandingBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.to(".lb-blob", {
        y: "+=22",
        x: "+=10",
        duration: 5.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.9, from: "random" },
      });
      gsap.to(".lb-blob-slow", {
        y: "-=18",
        rotate: 8,
        duration: 9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
    >
      <span className="lb-blob absolute -top-[10%] -left-[10%] h-[60vh] w-[60vh] rounded-full bg-[#9F2947]/10 blur-3xl" />
      <span className="lb-blob-slow absolute -right-[10%] top-[15%] h-[55vh] w-[55vh] rounded-full bg-[#EC4899]/10 blur-3xl" />
      <span className="lb-blob absolute bottom-[-5%] left-[20%] h-[50vh] w-[50vh] rounded-full bg-[#0EA5E9]/10 blur-3xl" />
      <span className="lb-blob absolute top-[40%] right-[25%] h-[35vh] w-[35vh] rounded-full bg-[#10B981]/10 blur-3xl" />
      <span className="lb-blob-slow absolute bottom-[20%] -left-[5%] h-[40vh] w-[40vh] rounded-full bg-[#F59E0B]/10 blur-3xl" />
    </div>
  );
}
