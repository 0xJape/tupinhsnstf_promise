"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, Expand, Minimize2, Minus, RotateCcw, RotateCw, ScanLine, X, ZoomIn } from "lucide-react";
import type { createAnatomyScene } from "./anatomy-scene";
import { anatomyAnnotations, anatomyDefinitions, pcosTourSteps } from "./anatomy-annotations";

export function AnatomyViewer() {
  const viewer = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const definitionDialog = useRef<HTMLDialogElement>(null);
  const controls = useRef<ReturnType<typeof createAnatomyScene> | null>(null);
  const [active, setActive] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  const [pcosStep, setPcosStep] = useState<number | null>(null);
  const [definitionOpen, setDefinitionOpen] = useState(false);
  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === viewer.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);
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
    const timeout = window.setTimeout(fail, 120000);
    import("./anatomy-scene").then(({ createAnatomyScene }) => {
      if (cancelled || failed || !host.current) return;
      controls.current = createAnatomyScene(host.current, () => {
        window.clearTimeout(timeout);
        if (!cancelled) setStatus("ready");
      }, fail, () => {});
    }).catch(fail);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controls.current?.dispose();
      controls.current = null;
    };
  }, [active]);
  useEffect(() => {
    const dialog = definitionDialog.current;
    if (!dialog) return;
    if (definitionOpen && !dialog.open) dialog.showModal();
    else if (!definitionOpen && dialog.open) dialog.close();
  }, [definitionOpen, selectedAnnotation]);
  const button = "anatomy-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40";
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await viewer.current?.requestFullscreen();
  };
  const selectAnnotation = (index: number) => {
    setPcosStep(null);
    setSelectedAnnotation(index);
    setDefinitionOpen(true);
    controls.current?.focusAnnotation(index);
  };
  const selectPcosStep = (index: number) => {
    const step = pcosTourSteps[index];
    setPcosStep(index);
    setSelectedAnnotation(step.annotation);
    setDefinitionOpen(true);
    controls.current?.focusAnnotation(step.annotation);
  };
  return (
    <article ref={viewer} className="anatomy-lab" aria-labelledby="anatomy-title">
      <div className="anatomy-lab-grid" aria-hidden="true" />
      <header className="anatomy-lab-header">
        <div><span className="anatomy-eyebrow"><ScanLine className="size-3.5" /> Anatomy interface · 01</span><h3 id="anatomy-title">Reproductive system <em>visualizer</em></h3><p>Interactive cross-section · educational model</p></div>
        <span className="anatomy-live"><i /> System ready</span>
      </header>
      <div className="anatomy-viewer-layout">
      <div className="anatomy-stage">
        {!active ? <div className="anatomy-launch"><Crosshair className="size-10" /><p>Initialize interactive anatomy scan</p><button className={button} onClick={() => { setStatus("loading"); setActive(true); }}>Load 3D anatomy</button></div> : <>
          <p role="status" className="anatomy-status">{status === "loading" ? "Loading model and textures…" : status === "error" ? "3D unavailable. Use text alternative below, then retry." : "Model online · click anatomy to learn · drag to rotate · scroll to zoom"}</p>
          <div ref={host} className={status === "error" ? "hidden" : "anatomy-canvas"} />
          {selectedAnnotation !== null && <dialog ref={definitionDialog} className="anatomy-definition-modal" aria-labelledby="anatomy-definition-title" onClose={() => setDefinitionOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}><div><button className="anatomy-definition-close" type="button" aria-label="Close definition" onClick={() => definitionDialog.current?.close()}><X className="size-4" /></button><span>{pcosStep === null ? `Anatomy guide · ${selectedAnnotation + 1}/${anatomyAnnotations.length}` : `PCOS reproductive tour · ${pcosStep + 1}/${pcosTourSteps.length}`}</span><h4 id="anatomy-definition-title">{pcosStep === null ? anatomyAnnotations[selectedAnnotation].title : pcosTourSteps[pcosStep].title}</h4><p>{pcosStep === null ? anatomyDefinitions[anatomyAnnotations[selectedAnnotation].title] : pcosTourSteps[pcosStep].text}</p><small>{pcosStep === null ? "Pink shows structure · crosshair marks exact point" : "Functional effect—not structural damage or diagnosis"}</small><nav className="anatomy-definition-nav" aria-label="Model tour navigation"><button type="button" onClick={() => pcosStep === null ? selectAnnotation((selectedAnnotation - 1 + anatomyAnnotations.length) % anatomyAnnotations.length) : selectPcosStep((pcosStep - 1 + pcosTourSteps.length) % pcosTourSteps.length)}>← Previous</button><button className="is-primary" type="button" onClick={() => pcosStep === null ? selectAnnotation((selectedAnnotation + 1) % anatomyAnnotations.length) : selectPcosStep((pcosStep + 1) % pcosTourSteps.length)}>Next →</button></nav></div></dialog>}
          <div className="anatomy-corners" aria-hidden="true" />
        </>}
      </div>
      {status === "ready" && <aside className="anatomy-tour" aria-labelledby="anatomy-tour-title">
        <div><span>Stanford model tour</span><h4 id="anatomy-tour-title">{selectedAnnotation === null ? `${anatomyAnnotations.length} anatomical annotations` : `${selectedAnnotation + 1}. ${anatomyAnnotations[selectedAnnotation].title}`}</h4></div>
        <div className="anatomy-tour-meta" aria-label="Tour status"><span><i /> 3D linked</span><span>{selectedAnnotation === null ? "Select a landmark" : `${selectedAnnotation + 1} / ${anatomyAnnotations.length}`}</span></div>
        <div className="anatomy-tour-progress" aria-hidden="true"><i style={{ width: `${selectedAnnotation === null ? 0 : ((selectedAnnotation + 1) / anatomyAnnotations.length) * 100}%` }} /></div>
        <div className="anatomy-tour-controls">
          <button type="button" disabled={selectedAnnotation === null} onClick={() => selectAnnotation((selectedAnnotation! - 1 + anatomyAnnotations.length) % anatomyAnnotations.length)}>← Previous</button>
          <button className="is-primary" type="button" onClick={() => selectAnnotation(selectedAnnotation === null ? 0 : (selectedAnnotation + 1) % anatomyAnnotations.length)}>{selectedAnnotation === null ? "Start 3D tour" : "Next annotation →"}</button>
          <button className="anatomy-pcos-tour-button" type="button" onClick={() => selectPcosStep(0)}>How PCOS affects reproduction</button>
        </div>
        <details><summary>Browse all annotations</summary><ol>{anatomyAnnotations.map((annotation, index) => <li key={`${annotation.title}-${index}`}><button type="button" aria-current={selectedAnnotation === index ? "true" : undefined} onClick={() => selectAnnotation(index)}>{index + 1}. {annotation.title}</button></li>)}</ol></details>
        <div className="anatomy-tour-footer"><p className="anatomy-safety"><b>Education only.</b> This model cannot diagnose PCOS.</p><p className="anatomy-credit">Model: <a href="https://sketchfab.com/3d-models/female-reproductive-system-c4d5e725198d4a1997c641d548bb20ce">Stanford EdTech</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · <a href="/3d/license.txt">Attribution</a></p></div>
      </aside>}
      </div>
      {active && <div className="anatomy-toolbar" aria-label="3D model controls">
        <div className="anatomy-control-group" role="group" aria-label="Rotate model">
          <button className={button} title="Rotate left" aria-label="Rotate left" disabled={status !== "ready"} onClick={() => controls.current?.rotate(-Math.PI / 8)}><RotateCcw className="size-4" /><span>Left</span></button>
          <button className={button} title="Rotate right" aria-label="Rotate right" disabled={status !== "ready"} onClick={() => controls.current?.rotate(Math.PI / 8)}><RotateCw className="size-4" /><span>Right</span></button>
        </div>
        <div className="anatomy-control-group" role="group" aria-label="Zoom model">
          <button className={button} title="Zoom in" aria-label="Zoom in" disabled={status !== "ready"} onClick={() => controls.current?.zoom(0.8)}><ZoomIn className="size-4" /><span>Zoom in</span></button>
          <button className={button} title="Zoom out" aria-label="Zoom out" disabled={status !== "ready"} onClick={() => controls.current?.zoom(1.25)}><Minus className="size-4" /><span>Zoom out</span></button>
        </div>
        <button className={button} title="Reset view" disabled={status !== "ready"} onClick={() => controls.current?.reset()}><RotateCcw className="size-4" /><span>Reset</span></button>
        <div className="anatomy-toolbar-spacer" />
        <button className={`${button} anatomy-control-primary`} onClick={toggleFullscreen}>{fullscreen ? <Minimize2 className="size-4" /> : <Expand className="size-4" />}<span>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</span></button>
        <button className={`${button} anatomy-control-close`} title="Close 3D viewer" onClick={() => setActive(false)}><X className="size-4" /><span>Close</span></button>
      </div>}
    </article>
  );
}