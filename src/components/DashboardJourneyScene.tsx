"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";

interface Props { scene: number; color: string; paused: boolean; progress: MotionValue<number>; }

// One persistent GPU scene. Chapters morph the field without recreating WebGL.
export default function DashboardJourneyScene({ scene: chapter, color, paused, progress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = useRef({ chapter, color, paused });
  const redraw = useRef<(() => void) | null>(null);
  useEffect(() => {
    settings.current = { chapter, color, paused };
    redraw.current?.();
  }, [chapter, color, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      canvas.hidden = true;
      canvas.dataset.renderer = "fallback";
      return;
    }
    canvas.dataset.renderer = "threejs";
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 720 ? 1.25 : 1.75));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, .1, 50);
    camera.position.z = 8;
    const group = new THREE.Group();
    scene.add(group);
    const mobile = window.innerWidth < 720;
    const count = mobile ? 750 : 1600;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963;
      const radius = Math.sqrt((i + .5) / count) * 5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = Math.sin(i * 12.9898) * 2;
      seeds[i] = ((i * 73) % 997) / 997;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const uniforms = {
      uTime: { value: 0 }, uChapter: { value: chapter }, uProgress: { value: 0 },
      uColor: { value: new THREE.Color(color) }, uPixelRatio: { value: renderer.getPixelRatio() },
    };
    const material = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        uniform float uChapter;
        uniform float uProgress;
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          float t = uTime * .08;
          float angle = atan(p.y, p.x) + t * (.15 + aSeed * .1) + uChapter * .32;
          float r = length(p.xy);
          float wave = sin(r * 2. + t * 3. + uChapter) * .22;
          p.x = cos(angle) * (r + wave);
          p.y = sin(angle) * (r + wave) * (.7 + .17 * sin(uChapter));
          p.z += sin(angle * 3. + t + uChapter) * .7;
          p.y += sin(t + aSeed * 6.28) * .12 - uProgress * .45;
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp((1.1 + aSeed * 2.) * uPixelRatio * 5. / -mv.z, 1., 5.);
          vAlpha = (.22 + .48 * aSeed) * (.65 + .35 * sin(uTime * .5 + aSeed * 12.));
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - .5);
          float glow = smoothstep(.5, .05, d);
          gl_FragColor = vec4(uColor, glow * vAlpha);
        }
      `,
    });
    group.add(new THREE.Points(geometry, material));
    const orbitGroup = new THREE.Group();
    group.add(orbitGroup);
    const orbits: { geometry: THREE.BufferGeometry; material: THREE.LineBasicMaterial; line: THREE.LineLoop }[] = [];
    for (let ring = 0; ring < 4; ring++) {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i < 180; i++) {
        const a = i / 180 * Math.PI * 2;
        const radius = 1.4 + ring * .35 + Math.sin(a * (ring % 2 ? 8 : 4)) * .06;
        points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
      }
      const ringGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const ringMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: .12 - ring * .017, blending: THREE.AdditiveBlending, depthWrite: false });
      const line = new THREE.LineLoop(ringGeometry, ringMaterial);
      line.rotation.x = ring * .35;
      line.rotation.y = ring * .24;
      orbitGroup.add(line);
      orbits.push({ geometry: ringGeometry, material: ringMaterial, line });
    }
    const pointer = new THREE.Vector2();
    const targetColor = new THREE.Color(color);
    let frame = 0;
    let lastTime = 0;
    let lost = false;
    const render = (now: number) => {
      frame = 0;
      if (lost || document.hidden) return;
      const current = settings.current;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
      lastTime = now;
      const blend = current.paused ? 1 : 1 - Math.exp(-dt * 2.5);
      if (!current.paused) uniforms.uTime.value += dt;
      uniforms.uChapter.value = THREE.MathUtils.lerp(uniforms.uChapter.value, current.chapter, blend);
      uniforms.uProgress.value = current.paused ? 0 : progress.get();
      targetColor.set(current.color);
      uniforms.uColor.value.lerp(targetColor, blend);
      const t = uniforms.uTime.value;
      group.position.x = THREE.MathUtils.lerp(group.position.x, mobile ? .5 : current.chapter === 0 ? 2.3 : 1.6, blend);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, current.paused ? 0 : pointer.x * .09, blend);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, current.paused ? 0 : pointer.y * .06, blend);
      orbitGroup.rotation.z = t * .025 + uniforms.uChapter.value * .4;
      orbitGroup.rotation.y = Math.sin(t * .08) * .25;
      for (const orbit of orbits) orbit.material.color.copy(uniforms.uColor.value);
      renderer.render(scene, camera);
      if (!current.paused) frame = requestAnimationFrame(render);
    };
    const schedule = () => { if (!frame && !lost && !document.hidden) { lastTime = 0; frame = requestAnimationFrame(render); } };
    redraw.current = schedule;
    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      schedule();
    };
    const move = (event: PointerEvent) => {
      if (settings.current.paused || event.pointerType !== "mouse") return;
      pointer.set(event.clientX / window.innerWidth * 2 - 1, event.clientY / window.innerHeight * 2 - 1);
    };
    const visibility = () => { cancelAnimationFrame(frame); frame = 0; if (!document.hidden) schedule(); };
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); canvas.hidden = true; canvas.dataset.renderer = "fallback"; };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    canvas.addEventListener("webglcontextlost", contextLost);
    resize();
    return () => {
      redraw.current = null;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      geometry.dispose(); material.dispose();
      for (const orbit of orbits) { orbit.geometry.dispose(); orbit.material.dispose(); }
      renderer.dispose(); renderer.forceContextLoss();
    };
    // The renderer persists; reactive settings are read from the ref above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}
