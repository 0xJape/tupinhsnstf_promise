"use client";

import { useEffect, useRef, useState } from "react";
import type { createAnatomyScene } from "./anatomy-scene";

export function AnatomyViewer() {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<ReturnType<typeof createAnatomyScene> | null>(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let failed = false;
    const fail = () => {
      if (!cancelled) {
      failed = true;
      window.clearTimeout(timeout);
        setStatus("error");
        controls.current?.dispose();
        controls.current = null;
      }
    };
    const timeout = window.setTimeout(fail, 45000);
    import("./anatomy-scene").then(({ createAnatomyScene }) => {
      if (cancelled || failed || !host.current) return;
      controls.current = createAnatomyScene(host.current, () => {
        window.clearTimeout(timeout);
        if (!cancelled) setStatus("ready");
      }, fail);
    }).catch(fail);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controls.current?.dispose();
      controls.current = null;
    };
  }, [active]);
  const button = "min-h-11 rounded-lg border border-rose-200/50 px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50";
  return (
    <article className="my-4 rounded-xl border border-rose-200/30 bg-black/20 p-4 text-white" aria-labelledby="anatomy-title">
      <h3 id="anatomy-title" className="text-lg font-bold">PCOS Visual Learning</h3>
      <p className="mt-1 text-sm">Explore the reproductive system — initial anatomy viewer.</p>
      <p className="mt-2 text-sm">For education only—not for diagnosis or treatment. This model cannot confirm PCOS. Speak with a qualified healthcare professional about concerns.</p>
      <details className="my-3 text-sm" open>
        <summary className="cursor-pointer font-semibold">Text alternative: reproductive anatomy</summary>
        <p className="mt-2">Cross-section model of female reproductive organs, including the uterus and paired ovaries. This is an anatomical illustration, not an ultrasound or a depiction of your body.</p>
        <p className="mt-2">According to Teede et al. (2023), ovarian appearance should not be used to diagnose PCOS in adolescents. <a className="underline" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10505534/">Read the international PCOS guideline</a>.</p>
      </details>
      {!active ? <button className={button} onClick={() => { setStatus("loading"); setActive(true); }}>Load 3D anatomy</button> : <>
        <p role="status" className="my-2 text-sm">{status === "loading" ? "Loading model and textures…" : status === "error" ? "3D unavailable. Use the text alternative above. Close and load again to retry." : "Drag to rotate; pinch or scroll to zoom. Keyboard users: use buttons below."}</p>
        <div ref={host} className={status === "error" ? "hidden" : "h-80 w-full overflow-hidden rounded-lg bg-rose-50 sm:h-96"} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className={button} disabled={status !== "ready"} onClick={() => controls.current?.rotate(-Math.PI / 8)}>Rotate left</button>
          <button className={button} disabled={status !== "ready"} onClick={() => controls.current?.rotate(Math.PI / 8)}>Rotate right</button>
          <button className={button} disabled={status !== "ready"} onClick={() => controls.current?.zoom(0.8)}>Zoom in</button>
          <button className={button} disabled={status !== "ready"} onClick={() => controls.current?.zoom(1.25)}>Zoom out</button>
          <button className={button} disabled={status !== "ready"} onClick={() => controls.current?.reset()}>Reset view</button>
          <button className={button} onClick={() => setActive(false)}>Close 3D</button>
        </div>
      </>}
      <p className="mt-4 text-xs leading-relaxed">This work is based on <a className="underline" href="https://sketchfab.com/3d-models/female-reproductive-organs-x-section-6c89dc45574c40b3981e8de6310d28d4">“Female Reproductive Organs-X Section”</a> by <a className="underline" href="https://sketchfab.com/cvallance01">CVallance</a>, licensed under <a className="underline" href="https://creativecommons.org/licenses/by/4.0/">CC-BY-4.0</a>. Model unchanged. <a className="underline" href="/3d/license.txt">Original attribution</a>.</p>
    </article>
  );
}