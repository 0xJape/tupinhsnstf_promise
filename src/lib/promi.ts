/**
 * Promi — animal guide mascot for P.R.O.M.I.S.E.
 * Art: public/promi/emotions/*.png (real filenames below)
 */

export const PROMI_EMOTIONS = [
  "wave",
  "happy",
  "think",
  "cheer",
  "care",
  "playing",
  "reading",
  "sad",
  "sleep",
  "sleep2",
  "idle",
] as const;

export type PromiEmotion = (typeof PROMI_EMOTIONS)[number];

/** Disk names under public/promi/emotions/ */
const FILE: Record<PromiEmotion, string> = {
  wave: "wave",
  happy: "happy",
  think: "thinking",
  cheer: "cheerful",
  care: "idle", // soft support pose (no care.png)
  playing: "playing",
  reading: "reading",
  sad: "sad",
  sleep: "sleep",
  sleep2: "sleep2",
  idle: "idle",
};

/** Public URL for a Promi emotion asset. */
export function promiSrc(emotion: PromiEmotion = "wave"): string {
  return `/promi/emotions/${FILE[emotion] ?? FILE.wave}.png`;
}

/** Suggested emotion for common app moments. */
export function promiForContext(
  context:
    | "landing"
    | "home"
    | "logging"
    | "screening"
    | "result-low"
    | "result-moderate"
    | "result-high"
    | "assistant"
    | "loading"
    | "empty"
    | "play",
): PromiEmotion {
  switch (context) {
    case "landing":
    case "home":
      return "wave";
    case "logging":
      return "cheer";
    case "screening":
    case "loading":
      return "think";
    case "result-low":
      return "happy";
    case "result-moderate":
      return "care";
    case "result-high":
      return "sad";
    case "assistant":
      return "reading";
    case "empty":
      return "sleep";
    case "play":
      return "playing";
    default:
      return "wave";
  }
}
