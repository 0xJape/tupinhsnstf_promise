"use client";

import { cn } from "@/lib/utils";
import { promiSrc, type PromiEmotion } from "@/lib/promi";

/** Display sizes for 1000×1000 transparent PNGs. */
type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { px: number; className: string; pull: string }> = {
  sm: { px: 96, className: "size-24", pull: "-ml-4" },
  md: { px: 140, className: "size-[8.75rem]", pull: "-ml-6" },
  lg: { px: 200, className: "size-[12.5rem]", pull: "-ml-8" },
  xl: { px: 400, className: "size-[15rem]", pull: "-ml-10" },
};

type Props = {
  emotion?: PromiEmotion;
  size?: Size;
  /** Speech / guide line — shown in bubble when set */
  line?: string;
  className?: string;
  /** Hide “Promi” name in bubble */
  hideName?: boolean;
  /**
   * bubble (default): character + chat bubble, mid-body aligned
   * bare: image only
   */
  variant?: "bubble" | "bare";
};

/**
 * Promi guide. Transparent 1000×1000 art — bubble centers on body and tucks into PNG.
 */
export function Promi({
  emotion = "wave",
  size = "md",
  line,
  className,
  hideName,
  variant = "bubble",
}: Props) {
  const { px, className: sizeClass, pull } = sizeMap[size];
  const src = promiSrc(emotion);

  const face = (
    <div className={cn("relative shrink-0", sizeClass)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={px}
        height={px}
        className="pointer-events-none size-full select-none object-contain drop-shadow-md"
        decoding="async"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fallback = e.currentTarget.nextElementSibling;
          if (fallback instanceof HTMLElement) fallback.hidden = false;
        }}
      />
      <div
        hidden
        className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-border bg-muted p-1"
        aria-hidden
      >
        <span className="text-2xl leading-none">🐾</span>
        <span className="max-w-full truncate px-1 text-[9px] font-semibold tracking-wide text-primary uppercase">
          {emotion}
        </span>
      </div>
    </div>
  );

  if (variant === "bare" || !line) {
    return (
      <figure
        className={cn("flex flex-col items-center gap-1", className)}
        aria-label="Promi"
      >
        {face}
        {!hideName ? (
          <figcaption className="text-xs font-semibold tracking-tight text-foreground">
            Promi
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure
      className={cn("flex w-full items-center", className)}
      aria-label="Promi"
    >
      {/* Face sits above bubble in paint order so transparent edges cover bubble rim */}
      <div className="relative z-20 shrink-0">{face}</div>

      <figcaption
        className={cn(
          "relative z-10 min-w-0 flex-1",
          pull,
          // optical: art has empty padding — nudge bubble up toward face
          size === "xl" || size === "lg" ? "-mt-2" : "mt-0",
        )}
      >
        <div className="glass relative rounded-2xl border-primary/20 px-3.5 py-2.5 text-left">
          {/* left tail, vertically centered on bubble */}
          <span
            className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rotate-45 border-b border-l border-primary/20 bg-card"
            aria-hidden
          />
          {!hideName ? (
            <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">
              Promi
            </p>
          ) : null}
          <p
            className={cn(
              "text-sm leading-snug text-foreground",
              !hideName && "mt-0.5",
            )}
          >
            {line}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
