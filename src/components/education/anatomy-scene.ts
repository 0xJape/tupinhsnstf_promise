import { Box3, HemisphereLight, Mesh, PerspectiveCamera, Scene, Sphere, Texture, WebGLRenderer } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function fitDistance(radius: number, aspect: number) {
  if (!(radius > 0) || !(aspect > 0) || !Number.isFinite(radius + aspect)) throw new Error("Invalid model bounds");
  const vertical = Math.PI / 8;
  const horizontal = Math.atan(Math.tan(vertical) * aspect);
  return radius / Math.sin(Math.min(vertical, horizontal)) * 1.15;
}

export function createAnatomyScene(host: HTMLDivElement, ready: () => void, failed: () => void) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-label", "Reproductive anatomy model. Use controls below to rotate and zoom.");
  canvas.setAttribute("role", "img");
  canvas.style.touchAction = "none";
  host.append(canvas);
  const scene = new Scene();
  scene.add(new HemisphereLight(0xffffff, 0x887777, 2));
  const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
  const orbit = new OrbitControls(camera, canvas);
  orbit.enablePan = false;
  let disposed = false;
  let radius = 1;
  let loaded = false;
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const reset = () => {
    const distance = fitDistance(radius, camera.aspect);
    camera.position.set(0, 0, distance);
    camera.near = radius / 100;
    camera.far = distance + radius * 20;
    camera.updateProjectionMatrix();
    orbit.target.set(0, 0, 0);
    orbit.minDistance = radius * 1.2;
    orbit.maxDistance = distance * 3;
    orbit.update();
    render();
  };
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (loaded) reset();
  });
  resize.observe(host);
  orbit.addEventListener("change", render);
  const disposeModel = (root: Scene | import("three").Group) => {
    const textures = new Set<Texture>();
    root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.geometry.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
        material.dispose();
      }
    });
    for (const texture of textures) {
      texture.dispose();
      if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) texture.image.close();
    }
  };
  const contextLost = (event: Event) => { event.preventDefault(); if (!disposed) failed(); };
  canvas.addEventListener("webglcontextlost", contextLost);
  // ponytail: static local glTF only; add animation/hotspots after clinical review.
  new GLTFLoader().loadAsync("/3d/scene.gltf").then((gltf) => {
    if (disposed) { disposeModel(gltf.scene); return; }
    try {
      const bounds = new Box3().setFromObject(gltf.scene).getBoundingSphere(new Sphere());
      radius = bounds.radius;
      fitDistance(radius, camera.aspect);
      gltf.scene.position.sub(bounds.center);
      scene.add(gltf.scene);
      loaded = true;
      reset();
      ready();
    } catch {
      disposeModel(gltf.scene);
      failed();
    }
  }).catch(() => { if (!disposed) failed(); });
  return {
    reset,
    rotate: (angle: number) => {
      camera.position.applyAxisAngle(camera.up, angle);
      orbit.update();
    },
    zoom: (factor: number) => {
      camera.position.multiplyScalar(factor).clampLength(orbit.minDistance, orbit.maxDistance);
      orbit.update();
    },
    dispose: () => {
      disposed = true;
      resize.disconnect();
      orbit.dispose();
      canvas.removeEventListener("webglcontextlost", contextLost);
      disposeModel(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}