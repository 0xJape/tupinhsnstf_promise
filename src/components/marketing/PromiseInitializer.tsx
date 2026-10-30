"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Geometry, Mesh, Program, Renderer } from "ogl";

export function PromiseInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const renderer = new Renderer({ canvas, alpha: true, antialias: true });
    const gl = renderer.gl;
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    });
    const program = new Program(gl, {
      vertex: `attribute vec2 position; void main(){ gl_Position=vec4(position,0.0,1.0); }`,
      fragment: `precision highp float; uniform float uTime; void main(){ vec2 p=gl_FragCoord.xy/vec2(900.0,900.0); float wave=sin(p.x*5.0+uTime)*.08+sin(p.y*4.0-uTime*.7)*.06; vec3 a=vec3(.62,.16,.28); vec3 b=vec3(.98,.78,.82); gl_FragColor=vec4(mix(a,b,p.y+wave),.22); }`,
      uniforms: { uTime: { value: 0 } },
    });
    const mesh = new Mesh(gl, { geometry, program });
    canvas.className = "promise-loader-canvas";
    document.querySelector(".promise-initializer")?.prepend(canvas);
    let frame = 0;
    const draw = (time: number) => { renderer.setSize(window.innerWidth, window.innerHeight); program.uniforms.uTime.value = time * 0.001; renderer.render({ scene: mesh }); frame = requestAnimationFrame(draw); };
    frame = requestAnimationFrame(draw);
    const timer = window.setTimeout(() => setReady(true), 1600);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame); canvas.remove(); };
  }, []);

  if (ready) return <>{children}</>;

  return (
    <main className="promise-initializer" aria-label="Loading P.R.O.M.I.S.E." role="status">
      <div className="promise-loader-grid" aria-hidden="true" />
      <div className="promise-care-core" aria-hidden="true">
        <span className="promise-core-orbit promise-core-orbit-one"><i /></span>
        <span className="promise-core-orbit promise-core-orbit-two"><i /></span>
        <span className="promise-core-orbit promise-core-orbit-three"><i /></span>
        <span className="promise-core-scan" />
        <span className="promise-core-center">
          <BrandLogo className="promise-core-logo" size={64} priority />
        </span>
      </div>
      <div className="promise-loader-readout">
        <span className="promise-loader-index">01</span>
        <div>
          <p className="promise-loader-kicker">P.R.O.M.I.S.E.</p>
          <p className="promise-loader-copy">Personal care space initializing</p>
        </div>
        <span className="promise-loader-live"><i /> SECURE</span>
      </div>
      <div className="promise-loader-progress" aria-hidden="true"><span /></div>
    </main>
  );
}
