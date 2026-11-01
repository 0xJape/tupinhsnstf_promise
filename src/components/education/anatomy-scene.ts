import { ACESFilmicToneMapping, Box3, Color, DirectionalLight, Float32BufferAttribute, Group, HemisphereLight, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, Raycaster, RingGeometry, Scene, Sphere, SphereGeometry, SRGBColorSpace, Texture, Vector2, Vector3, WebGLRenderer } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { anatomyAnnotations } from "./anatomy-annotations";

export function fitDistance(radius: number, aspect: number) {
  if (!(radius > 0) || !(aspect > 0) || !Number.isFinite(radius + aspect)) throw new Error("Invalid model bounds");
  const vertical = Math.PI / 8;
  const horizontal = Math.atan(Math.tan(vertical) * aspect);
  return radius / Math.sin(Math.min(vertical, horizontal)) * 1.15;
}

type AnatomyView = "ovaries" | "uterus" | "tubes" | "cervix" | "endometrium";

export function createAnatomyScene(host: HTMLDivElement, ready: () => void, failed: () => void, select: (topic: AnatomyView) => void) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 3));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-label", "Interactive reproductive anatomy model. Click an ovary or the uterus to open its lesson. Use controls below to rotate and zoom.");
  canvas.setAttribute("role", "img");
  canvas.style.touchAction = "none";
  host.append(canvas);
  const scene = new Scene();
  scene.add(new HemisphereLight(0xffe8ef, 0x241222, 2.4));
  const keyLight = new DirectionalLight(0xfff3f6, 3.2);
  keyLight.position.set(4, 5, 6);
  const rimLight = new DirectionalLight(0xff4f91, 2.2);
  rimLight.position.set(-5, 2, -4);
  scene.add(keyLight, rimLight);
  const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
  const orbit = new OrbitControls(camera, canvas);
  orbit.enablePan = false;
  let disposed = false;
  let radius = 1;
  let loaded = false;
  let model: import("three").Group | null = null;
  const modelCenter = new Vector3();
  const annotationTransform = new Matrix4();
  const topicViews = new Map<AnatomyView, Sphere>();
  const topicMeshes = new Map<AnatomyView, Mesh[]>();
  const modelMeshes: Mesh[] = [];
  const annotationMarker = new Group();
  const markerRing = new Mesh(new RingGeometry(0.72, 1, 48), new MeshBasicMaterial({ color: 0xff4f91, depthTest: false, transparent: true, opacity: 0.95, side: 2 }));
  const markerPoint = new Mesh(new SphereGeometry(0.12, 16, 12), new MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
  markerRing.renderOrder = markerPoint.renderOrder = 20;
  annotationMarker.add(markerRing, markerPoint);
  annotationMarker.visible = false;
  scene.add(annotationMarker);
  const originalTextures = new WeakMap<MeshStandardMaterial, { map: Texture | null; emissiveMap: Texture | null }>();
  let focusFrame = 0;
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const hoverPosition = new Vector3();
  let pointerStart: { x: number; y: number } | null = null;
  const highlight = (topic?: AnatomyView) => {
    const selectedMeshes = topic ? new Set(topicMeshes.get(topic) ?? []) : new Set<Mesh>();
    for (const mesh of modelMeshes) {
      const selected = selectedMeshes.has(mesh);
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        if (!(material instanceof MeshStandardMaterial)) continue;
        const original = originalTextures.get(material);
        material.map = topic ? null : original?.map ?? null;
        material.emissiveMap = topic ? null : original?.emissiveMap ?? null;
        material.color.set(!topic ? 0xffffff : selected ? 0xff2674 : 0x383838);
        material.emissive.set(selected ? 0x9b1248 : 0x000000);
        material.emissiveIntensity = selected ? 1.1 : 0;
        material.vertexColors = false;
        material.needsUpdate = true;
      }
    }
  };
  const stopFocus = () => cancelAnimationFrame(focusFrame);
  const focus = (target: Vector3, targetRadius: number) => {
    stopFocus();
    const startPosition = camera.position.clone();
    const startTarget = orbit.target.clone();
    const distance = Math.max(fitDistance(targetRadius, camera.aspect), radius * 0.14);
    const endPosition = target.clone().add(new Vector3(0, 0, distance));
    const started = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - started) / 500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(startPosition, endPosition, eased);
      orbit.target.lerpVectors(startTarget, target, eased);
      orbit.update();
      if (progress < 1 && !disposed) focusFrame = requestAnimationFrame(animate);
      else if (!disposed) {
        const offset = endPosition.clone().sub(target);
        const hoverStarted = now;
        const hover = (time: number) => {
          camera.position.copy(target).add(hoverPosition.copy(offset).applyAxisAngle(camera.up, Math.sin((time - hoverStarted) / 1800) * 0.055));
          orbit.target.copy(target);
          orbit.update();
          if (!disposed) focusFrame = requestAnimationFrame(hover);
        };
        focusFrame = requestAnimationFrame(hover);
      }
    };
    focusFrame = requestAnimationFrame(animate);
  };
  const focusAnnotation = (index: number) => {
    const annotation = anatomyAnnotations[index];
    if (!annotation) return;
    stopFocus();
    highlight();
    const startPosition = camera.position.clone();
    const startTarget = orbit.target.clone();
    const fromSketchfab = ([x, y, z]: readonly [number, number, number]) => new Vector3(x, y, z).applyMatrix4(annotationTransform);
    const endPosition = fromSketchfab(annotation.eye).sub(modelCenter);
    const endTarget = fromSketchfab(annotation.target).sub(modelCenter);
    const annotationPosition = fromSketchfab(annotation.position).sub(modelCenter);
    annotationMarker.position.copy(annotationPosition);
    annotationMarker.scale.setScalar(radius * 0.03);
    annotationMarker.visible = true;
    const aliases: Record<string, string[]> = {
      "Bulbospongiosus m.": ["bulbospongiosus"],
      Anus: ["anus"],
    };
    const words = aliases[annotation.title] ?? annotation.title.toLowerCase().replace(/—.*|\bm\.$/g, "").split(/[\s-]+/).filter((word) => word.length >= 4);
    const exactMeshes = modelMeshes.filter((mesh) => {
      const name = `${mesh.name} ${mesh.parent?.name ?? ""}`.toLowerCase().replaceAll("_", " ");
      return words.some((word) => name.includes(word)) || (annotation.title === "Ovary" && name.includes("ovaries edit"));
    });
    const selected = new Set(exactMeshes);
    const vertex = new Vector3();
    for (const mesh of modelMeshes) {
      const positions = mesh.geometry.attributes.position;
      const colors = new Float32Array(positions.count * 3);
      for (let index = 0; index < positions.count; index++) {
        vertex.fromBufferAttribute(positions, index).applyMatrix4(mesh.matrixWorld);
        const pink = selected.has(mesh) || (!exactMeshes.length && vertex.distanceTo(annotationPosition) < radius * 0.16);
        const color = pink ? new Color(0xff2674) : new Color(0x383838);
        color.toArray(colors, index * 3);
      }
      mesh.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        if (!(material instanceof MeshStandardMaterial)) continue;
        material.map = null;
        material.emissiveMap = null;
        material.color.set(0xffffff);
        material.emissive.set(0x000000);
        material.emissiveIntensity = 0;
        material.vertexColors = true;
        material.needsUpdate = true;
      }
    }
    const started = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - started) / 700, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(startPosition, endPosition, eased);
      orbit.target.lerpVectors(startTarget, endTarget, eased);
      orbit.update();
      annotationMarker.lookAt(camera.position);
      annotationMarker.scale.setScalar(radius * (0.03 + Math.sin(now / 130) * 0.003));
      render();
      if (progress < 1 && !disposed) focusFrame = requestAnimationFrame(animate);
    };
    focusFrame = requestAnimationFrame(animate);
  };
  const pointerDown = (event: PointerEvent) => { stopFocus(); pointerStart = { x: event.clientX, y: event.clientY }; };
  const pointerUp = (event: PointerEvent) => {
    if (!model || !pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
    const bounds = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(model, true).find(({ object }) => object instanceof Mesh);
    if (!(hit?.object instanceof Mesh)) return;
    const name = `${hit.object.name} ${hit.object.parent?.name ?? ""}`.toLowerCase();
    const topic = name.includes("ovari") ? "ovaries" : name.includes("fallopian") ? "tubes" : name.includes("uterus") ? "uterus" : null;
    if (!topic) return;
    select(topic);
    const view = topicViews.get(topic);
    if (view) { highlight(topic); focus(view.center, view.radius); }
  };
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const reset = () => {
    stopFocus();
    annotationMarker.visible = false;
    highlight();
    const distance = fitDistance(radius, camera.aspect);
    camera.position.set(0, 0, distance);
    camera.near = radius / 100;
    camera.far = distance + radius * 20;
    camera.updateProjectionMatrix();
    orbit.target.set(0, 0, 0);
    orbit.minDistance = radius * 0.3;
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
    if (loaded) render();
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
  // ponytail: cervix/endometrium share uterus mesh; split them in source GLB for exact highlighting.
  new GLTFLoader().loadAsync("/3d/New%20MOdel/female_reproductive_system_1k.glb").then((gltf) => {
    if (disposed) { disposeModel(gltf.scene); return; }
    try {
      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      annotationTransform.copy(gltf.scene.children[0]?.matrix ?? new Matrix4());
      gltf.scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          for (const value of Object.values(material)) {
            if (!(value instanceof Texture)) continue;
            value.anisotropy = maxAnisotropy;
            value.needsUpdate = true;
          }
          if (material.map) material.map.colorSpace = SRGBColorSpace;
          if (material.emissiveMap) material.emissiveMap.colorSpace = SRGBColorSpace;
        }
        const clones = materials.map((material) => material.clone());
        object.material = Array.isArray(object.material) ? clones : clones[0];
        for (const material of clones) if (material instanceof MeshStandardMaterial) originalTextures.set(material, { map: material.map, emissiveMap: material.emissiveMap });
        modelMeshes.push(object);
        const name = `${object.name} ${object.parent?.name ?? ""}`.toLowerCase();
        const topic: AnatomyView | null = name.includes("ovari") && !name.includes("uterusvagina") ? "ovaries" : name.includes("fallopian") ? "tubes" : name.includes("uterus") ? "uterus" : null;
        if (topic) topicMeshes.set(topic, [...(topicMeshes.get(topic) ?? []), object]);
      });
      const bounds = new Box3().setFromObject(gltf.scene).getBoundingSphere(new Sphere());
      modelCenter.copy(bounds.center);
      radius = bounds.radius;
      fitDistance(radius, camera.aspect);
      gltf.scene.position.sub(bounds.center);
      model = gltf.scene;
      scene.add(gltf.scene);
      gltf.scene.updateMatrixWorld(true);
      for (const topic of ["ovaries", "uterus", "tubes"] as const) {
        const topicBounds = new Box3();
        for (const mesh of topicMeshes.get(topic) ?? []) topicBounds.expandByObject(mesh);
        if (!topicBounds.isEmpty()) topicViews.set(topic, topicBounds.getBoundingSphere(new Sphere()));
      }
      const uterusBounds = new Box3();
      for (const mesh of topicMeshes.get("uterus") ?? []) uterusBounds.expandByObject(mesh);
      if (!uterusBounds.isEmpty()) {
        const center = uterusBounds.getCenter(new Vector3());
        const size = uterusBounds.getSize(new Vector3());
        const partRadius = Math.min(size.x, size.y) * 0.22;
        topicViews.set("cervix", new Sphere(center.clone().setY(uterusBounds.min.y + size.y * 0.3), partRadius));
        topicViews.set("endometrium", new Sphere(center.clone().setY(center.y - size.y * 0.04), partRadius * 0.8));
        topicMeshes.set("cervix", topicMeshes.get("uterus") ?? []);
        topicMeshes.set("endometrium", topicMeshes.get("uterus") ?? []);
      }
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
      stopFocus();
      camera.position.sub(orbit.target).applyAxisAngle(camera.up, angle).add(orbit.target);
      orbit.update();
    },
    zoom: (factor: number) => {
      stopFocus();
      camera.position.sub(orbit.target).multiplyScalar(factor).clampLength(orbit.minDistance, orbit.maxDistance).add(orbit.target);
      orbit.update();
    },
    focusTopic: (topic: AnatomyView) => {
      const view = topicViews.get(topic);
      if (view) { highlight(topic); focus(view.center, view.radius); }
    },
    focusAnnotation,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(focusFrame);
      resize.disconnect();
      orbit.dispose();
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
      disposeModel(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}