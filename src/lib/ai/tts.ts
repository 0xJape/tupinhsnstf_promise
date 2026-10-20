/** Groq TTS first; browser feminine English voice fallback. */

let audio: HTMLAudioElement | null = null;
let request: AbortController | null = null;

export function canSpeak(): boolean {
  return typeof window !== "undefined" && (typeof Audio !== "undefined" || "speechSynthesis" in window);
}

export function stopSpeaking(): void {
  request?.abort();
  request = null;
  if (audio) {
    audio.pause();
    URL.revokeObjectURL(audio.src);
    audio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export async function speakText(
  text: string,
  opts?: { rate?: number; pitch?: number; onEnd?: () => void },
): Promise<void> {
  if (!canSpeak() || !text.trim()) { opts?.onEnd?.(); return; }
  stopSpeaking();
  request = new AbortController();
  try {
    const response = await fetch("/api/ai/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: request.signal,
    });
    if (!response.ok) throw new Error("Groq TTS unavailable");
    const url = URL.createObjectURL(await response.blob());
    audio = new Audio(url);
    audio.playbackRate = opts?.rate ?? 1;
    audio.onended = () => finish(opts?.onEnd);
    audio.onerror = () => finish(opts?.onEnd);
    await audio.play();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    speakWithBrowser(text, opts);
  } finally {
    request = null;
  }
}

function finish(onEnd?: () => void) {
  if (audio) URL.revokeObjectURL(audio.src);
  audio = null;
  onEnd?.();
}

function speakWithBrowser(text: string, opts?: { rate?: number; pitch?: number; onEnd?: () => void }) {
  if (!("speechSynthesis" in window)) { opts?.onEnd?.(); return; }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = opts?.rate ?? 1;
  utterance.pitch = opts?.pitch ?? 1.05;
  utterance.lang = "en-US";
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => /en(-US|-GB)?/i.test(voice.lang) && /female|samantha|zira|aria|jenny|susan|victoria|karen|moira|google uk english female/i.test(voice.name))
    ?? voices.find((voice) => /en/i.test(voice.lang))
    ?? null;
  utterance.onend = () => opts?.onEnd?.();
  utterance.onerror = () => opts?.onEnd?.();
  window.speechSynthesis.speak(utterance);
}
