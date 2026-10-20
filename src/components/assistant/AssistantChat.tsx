"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Camera, ImagePlus, Loader2, Mic, Send, Square, Volume2, VolumeX, X } from "lucide-react";
import {
  EducationSceneStrip,
  sceneExplainPrompt,
  type EducationSceneId,
} from "@/components/assistant/EducationScenes";
import { Promi } from "@/components/promi/Promi";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SUGGESTED_PROMPTS } from "@/lib/ai/prompt";
import { canSpeak, speakText, stopSpeaking } from "@/lib/ai/tts";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Local preview only (not reloaded from DB) */
  imagePreviewUrl?: string;
};

type Props = {
  conversationId?: string;
  initialMessages?: ChatMessage[];
  relatedAssessmentId?: string;
};

type PendingImage = {
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  base64: string;
  previewUrl: string;
  name: string;
};

const MAX_BYTES = 4 * 1024 * 1024;

async function fileToPending(file: File): Promise<PendingImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a photo (JPEG, PNG, WebP, or GIF)");
  }
  const mime = file.type as PendingImage["mimeType"];
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime)) {
    throw new Error("Use JPEG, PNG, WebP, or GIF");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Photo max 4MB");
  }
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);
  return {
    mimeType: mime,
    base64,
    previewUrl: URL.createObjectURL(file),
    name: file.name,
  };
}

export function AssistantChat({
  conversationId: initialConversationId,
  initialMessages = [],
  relatedAssessmentId,
}: Props) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsOn, setTtsOn] = useState(true);
  const ttsSupported = useSyncExternalStore(
    () => () => undefined,
    canSpeak,
    () => false,
  );
  const [image, setImage] = useState<PendingImage | null>(null);
  const [talkOpen, setTalkOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onPickFile = useCallback((file: File | undefined) => {
    if (!file) return;
    void fileToPending(file)
      .then((p) => {
        setImage((prev) => {
          if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
          return p;
        });
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Bad image");
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup on unmount only
  }, []);

  const clearImage = useCallback(() => {
    setImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }, []);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const send = useCallback(
    async (raw: string, img?: PendingImage | null) => {
      const text = raw.trim();
      const attach = img ?? image;
      if ((!text && !attach) || pending) return;

      setError(null);
      setPending(true);
      setInput("");
      stopSpeaking();

      const display =
        text ||
        (attach
          ? "Please review this photo for educational discussion only (not a diagnosis)."
          : "");
      const tempUserId = `local-user-${Date.now()}`;
      setMessages((m) => [
        ...m,
        {
          id: tempUserId,
          role: "user",
          content: display,
          imagePreviewUrl: attach?.previewUrl,
        },
      ]);
      // keep preview URL on message; clear composer image state without revoke
      setImage(null);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            conversationId,
            relatedAssessmentId,
            image: attach
              ? { mimeType: attach.mimeType, base64: attach.base64 }
              : undefined,
          }),
        });
        const data = (await res.json()) as {
          conversationId?: string;
          assistantMessage?: string;
          messageId?: string;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error ?? "Chat failed");
        }

        const nextId = data.conversationId!;
        if (!conversationId && nextId) {
          setConversationId(nextId);
          window.history.replaceState(null, "", `/assistant/${nextId}`);
        }

        const reply = data.assistantMessage ?? "";
        setMessages((m) => [
          ...m,
          {
            id: data.messageId ?? `local-asst-${Date.now()}`,
            role: "assistant",
            content: reply,
          },
        ]);

        // TTS reads the text reply only — never the image bytes
        if (ttsOn && ttsSupported && reply && !abortRef.current) {
          void speakText(reply);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Chat failed");
        setMessages((m) => m.filter((x) => x.id !== tempUserId));
        setInput(text);
        if (attach) setImage(attach);
      } finally {
        setPending(false);
      }
    },
    [
      conversationId,
      image,
      pending,
      relatedAssessmentId,
      ttsOn,
      ttsSupported,
    ],
  );

  const transcribeAndSend = useCallback(
    async (audio: Blob) => {
      setTranscribing(true);
      try {
        const form = new FormData();
        form.append("audio", audio, "voice.webm");
        const res = await fetch("/api/ai/transcribe", { method: "POST", body: form });
        const data = (await res.json()) as { text?: string; error?: string };
        if (!res.ok || !data.text) throw new Error(data.error ?? "Could not transcribe voice");
        setTalkOpen(false);
        await send(data.text);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not transcribe voice");
      } finally {
        setTranscribing(false);
      }
    },
    [send],
  );

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Voice recording is not supported in this browser");
      return;
    }
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        recorderRef.current = null;
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
        const audio = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (audio.size) void transcribeAndSend(audio);
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone permission is needed for voice input");
      setTalkOpen(false);
    }
  }, [transcribeAndSend]);

  const promiLine = pending
    ? image || messages.some((m) => m.imagePreviewUrl)
      ? "Looking at your photo carefully… education only, never a diagnosis."
      : "Thinking with you… education only, never a diagnosis."
    : error
      ? "Hmm, that reply didn’t go through. Try again when you’re ready."
      : messages.length === 0
        ? "Hi — I’m Promi. Ask a question or attach a photo for educational review."
        : "Still here. Text or photo — I’ll answer in words you can hear.";

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-4">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Promi</h1>
            <p className="text-sm text-muted-foreground">
              Your education guide · not a doctor
            </p>
          </div>
          {ttsSupported ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={ttsOn ? "Mute voice" : "Enable voice"}
              aria-pressed={ttsOn}
              onClick={() => {
                if (ttsOn) stopSpeaking();
                setTtsOn((v) => !v);
              }}
            >
              {ttsOn ? <Volume2 /> : <VolumeX />}
            </Button>
          ) : null}
        </div>
        <Promi
          emotion={
            pending
              ? "think"
              : error
                ? "sad"
                : messages.length === 0
                  ? "reading"
                  : "happy"
          }
          size="md"
          line={promiLine}
        />
      </header>

      <DisclaimerBanner compact />

      {messages.length === 0 ? (
        <div className="space-y-4">
          <EducationSceneStrip
            onSelect={(id: EducationSceneId) =>
              void send(sceneExplainPrompt(id))
            }
          />
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={pending}
                onClick={() => void send(p)}
                className="surface-panel rounded-full px-3 py-2 text-left text-xs font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-accent disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="surface-card flex min-h-0 flex-1 flex-col rounded-3xl p-3 sm:p-4">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              Ask about screening, or attach a photo for educational discussion
              only.
            </p>
          ) : null}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground shadow-[8px_8px_16px_rgba(159,41,71,0.25)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.28)]"
                  : "surface-panel mr-auto text-foreground",
              )}
            >
              {m.imagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.imagePreviewUrl}
                  alt="Attached photo"
                  className="mb-2 max-h-48 w-full rounded-xl object-cover"
                />
              ) : null}
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.role === "assistant" && ttsSupported ? (
                <button
                  type="button"
                  onClick={() => void speakText(m.content)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  aria-label="Read this reply aloud"
                >
                  <Volume2 className="size-3.5" aria-hidden />
                  Read aloud
                </button>
              ) : null}
            </div>
          ))}
          {pending ? (
            <div className="surface-panel mr-auto flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Thinking…
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <p className="mt-2 text-sm font-medium text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

        {image ? (
          <div className="surface-muted mt-2 flex items-center gap-2 rounded-2xl p-2 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.previewUrl}
              alt=""
              className="size-14 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{image.name}</p>
              <p className="text-[10px] text-muted-foreground">
                Promi will review for education only · voice can read the reply
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Remove photo"
              onClick={clearImage}
            >
              <X />
            </Button>
          </div>
        ) : null}

        <form
          className="mt-3 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input, image);
          }}
        >
          {/* Gallery / files */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              onPickFile(f);
            }}
          />
          {/* Camera — capture=environment opens rear camera on phones */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              onPickFile(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={pending}
            aria-label="Take photo with camera"
            onClick={() => cameraRef.current?.click()}
          >
            <Camera />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={pending}
            aria-label="Attach photo from gallery"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus />
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              image ? "Add a note about this photo (optional)…" : "Type a question…"
            }
            rows={2}
            disabled={pending}
            className="min-h-[52px] flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input, image);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={pending}
            aria-label="Talk to Promi"
            onClick={() => {
              setTalkOpen(true);
              void startRecording();
            }}
          >
            <Mic />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={pending || (!input.trim() && !image)}
            aria-label="Send message"
          >
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </div>

      <Dialog
        open={talkOpen}
        onOpenChange={(open) => {
          if (!open && recording) stopRecording();
          setTalkOpen(open);
        }}
      >
        <DialogContent showCloseButton={!recording && !transcribing} className="surface-card max-w-md rounded-3xl p-6 sm:p-8">
          <DialogHeader className="items-center text-center">
            <div className={cn("grid size-20 place-items-center rounded-full bg-primary text-primary-foreground", recording && "animate-pulse")}>
              {transcribing ? <Loader2 className="size-8 animate-spin" /> : <Mic className="size-8" />}
            </div>
            <DialogTitle>{transcribing ? "Turning speech into text…" : recording ? "Listening…" : "Talk to Promi"}</DialogTitle>
            <DialogDescription>
              {transcribing ? "Your message will send when ready." : recording ? "Tap stop when finished. Your words will send to Promi." : "Tap record to start."}
            </DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            size="lg"
            className="w-full rounded-2xl"
            disabled={transcribing}
            onClick={() => (recording ? stopRecording() : void startRecording())}
          >
            {recording ? <><Square /> Stop and send</> : <><Mic /> Start talking</>}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}