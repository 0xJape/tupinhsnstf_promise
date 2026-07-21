/** Browser Web Speech API helpers — no extra deps. */

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking(): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
}

export function speakText(
  text: string,
  opts?: { rate?: number; pitch?: number; onEnd?: () => void },
): void {
  if (!canSpeak() || !text.trim()) {
    opts?.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = opts?.rate ?? 1;
  u.pitch = opts?.pitch ?? 1;
  u.lang = "en-US";
  // Prefer a soft English voice when available
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => /en-US|en-GB/i.test(v.lang) && /female|samantha|google/i.test(v.name)) ??
    voices.find((v) => /en/i.test(v.lang));
  if (preferred) u.voice = preferred;
  u.onend = () => opts?.onEnd?.();
  u.onerror = () => opts?.onEnd?.();
  window.speechSynthesis.speak(u);
}