"use client";

import { useState } from "react";
import { Flag, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Props = { assessmentId: string };

export function BaselineCorrectionRequest({ assessmentId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setError(null);
    if (reason.trim().length < 10) {
      setError("Explain what needs review in at least 10 characters.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/screening/correction-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, reason: reason.trim() }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not send review request.");
      setOpen(false);
      setReason("");
      toast.success("Review request sent");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send review request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" className="min-h-11 w-full rounded-xl" onClick={() => setOpen(true)}>
        <Flag className="size-4" aria-hidden />
        Report a mistake
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-[2rem] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report a baseline mistake</DialogTitle>
            <DialogDescription>
              Your submitted baseline stays on record. Tell us what needs review; it will not create a second screening.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => { setReason(event.target.value); setError(null); }}
            placeholder="Example: I selected Yes by mistake for a question."
            maxLength={500}
            className="min-h-28 rounded-xl"
            aria-describedby="correction-error"
          />
          <p className="text-right text-xs text-muted-foreground">{reason.length}/500</p>
          {error ? <p id="correction-error" role="alert" className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" disabled={pending} onClick={() => void submit()}>
              {pending ? "Sending…" : "Send for review"}
              <Send className="size-4" aria-hidden />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
