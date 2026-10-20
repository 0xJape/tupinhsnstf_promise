"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = { baselineAssessmentId: string };
type Result = {
  acne_like_spots: "not_observed" | "possibly_observed" | "unclear";
  coarse_facial_hair: "not_observed" | "possibly_observed" | "unclear";
  image_quality: "adequate" | "limited" | "unusable";
  limitations: string[];
};
const MAX_BYTES = 4 * 1024 * 1024;
const label = (value: string) => value.replaceAll("_", " ");

export function PhotoSymptomAssessment({ baselineAssessmentId }: Props) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function choose(file?: File) {
    if (!file) return;
    setMessage(null);
    setResult(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_BYTES) {
      setMessage("Use a JPEG, PNG, or WebP photo smaller than 4 MB.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submit() {
    if (!photo || !consent || pending) return;
    setPending(true);
    setMessage(null);
    const form = new FormData();
    form.set("photo", photo);
    form.set("baselineAssessmentId", baselineAssessmentId);
    form.set("consent", "true");
    try {
      const response = await fetch("/api/screening/photo-assessment", { method: "POST", body: form });
      const body = (await response.json()) as { error?: string; assessment?: Result };
      if (!response.ok) throw new Error(body.error || "Photo could not be assessed.");
      if (!body.assessment) throw new Error("Photo assessment returned no result.");
      clear();
      setConsent(false);
      setResult(body.assessment);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Photo could not be assessed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="surface-card space-y-4 p-5" aria-labelledby="photo-check-title">
      <div><p className="section-label text-primary">Optional</p><h2 id="photo-check-title" className="mt-1 text-lg font-semibold">Photo symptom check</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Document possible acne-like spots or coarse facial hair. Photo is sent transiently for review, then discarded. Only limited observations are saved. This never changes your baseline score and cannot diagnose PCOS.</p></div>
      <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => choose(event.target.files?.[0])} />
      {preview ? <div className="relative mx-auto w-fit"><Image src={preview} alt="Selected photo preview" width={512} height={512} unoptimized className="max-h-64 w-auto rounded-2xl border border-border object-contain" /><Button type="button" size="icon" variant="secondary" className="absolute right-2 top-2" onClick={clear} aria-label="Remove selected photo"><X className="size-4" /></Button></div> : <Button type="button" variant="outline" className="min-h-11 w-full" onClick={() => inputRef.current?.click()}><Camera className="size-4" />Choose photo</Button>}
      <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3"><input id="photo-consent" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-primary" /><Label htmlFor="photo-consent" className="text-sm leading-relaxed">I consent to transient third-party AI processing of this photo. I understand the photo is not stored, but limited educational observations and processing details are saved to my account.</Label></div>
      <Button type="button" className="min-h-11 w-full" disabled={!photo || !consent || pending} onClick={submit}>{pending ? <><Loader2 className="size-4 animate-spin" />Assessing securely…</> : "Save photo observations"}</Button>
      {result && <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4" role="status"><div className="flex items-center gap-2 text-primary"><CheckCircle2 className="size-5" aria-hidden /><h3 className="font-semibold">Photo observation saved</h3></div><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-xs text-muted-foreground">Acne-like spots</dt><dd className="font-medium capitalize">{label(result.acne_like_spots)}</dd></div><div><dt className="text-xs text-muted-foreground">Coarse facial hair</dt><dd className="font-medium capitalize">{label(result.coarse_facial_hair)}</dd></div><div><dt className="text-xs text-muted-foreground">Image quality</dt><dd className="font-medium capitalize">{label(result.image_quality)}</dd></div></dl>{result.limitations.length > 0 && <div className="mt-3"><p className="text-xs text-muted-foreground">Limitations</p><ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{result.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>}<p className="mt-3 text-xs leading-relaxed text-muted-foreground">Photo was not stored. Observations do not alter your baseline score and cannot diagnose PCOS.</p><Link href={`/screen/result/${baselineAssessmentId}/summary`} className="mt-3 inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline">Open personal summary</Link></div>}
      {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
    </section>
  );
}
