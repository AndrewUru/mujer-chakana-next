"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function MoonboardScene({ week, paused }: { week: number; paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = useRef({ week, paused });
  const wake = useRef<(() => void) | null>(null);
  useEffect(() => { settings.current = { week, paused }; wake.current?.(); }, [week, paused]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" }); }
    catch { canvas.hidden = true; return; }
    canvas.hidden = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, .1, 40);
    camera.position.z = 8;
    const field = new THREE.Group(); scene.add(field);
    const geometry = new THREE.BufferGeometry();
    const count = window.innerWidth < 700 ? 260 : 600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963;
      const radius = .9 + Math.sqrt(i / count) * 3.8;
      positions.set([Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(i * 17.7) * 1.5], i * 3);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: "#c1cddb", size: .018, transparent: true, opacity: .6, depthWrite: false });
    field.add(new THREE.Points(geometry, material));
    const rings = Array.from({ length: 3 }, (_, index) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 160 }, (_, i) => {
        const angle = i / 160 * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * (1.7 + index * .3), Math.sin(angle) * (1.7 + index * .3), 0);
      }));
      const material = new THREE.LineBasicMaterial({ color: "#c5b8db", transparent: true, opacity: .13, depthWrite: false });
      const line = new THREE.LineLoop(geometry, material); field.add(line);
      return { line, geometry, material };
    });
    let frame = 0, last = 0, time = 0, blendWeek = settings.current.week;
    let visible = true, lost = false;
    const pointer = new THREE.Vector2();
    function render(now: number) {
      frame = 0;
      if (!visible || lost || document.hidden) return;
      const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now;
      const { paused, week } = settings.current;
      if (!paused) time += dt;
      const blend = paused ? 1 : 1 - Math.exp(-dt * 3);
      blendWeek = THREE.MathUtils.lerp(blendWeek, week, blend);
      field.rotation.z = time * .018 + blendWeek * .12;
      field.rotation.y = THREE.MathUtils.lerp(field.rotation.y, paused ? 0 : pointer.x * .1, blend);
      field.rotation.x = THREE.MathUtils.lerp(field.rotation.x, paused ? 0 : pointer.y * .08, blend);
      rings.forEach(({ line }, index) => { line.rotation.x = .45 + index * .45 + Math.sin(time * .15 + blendWeek) * .16; line.rotation.y = blendWeek * .2 + index * .25; });
      renderer.render(scene, camera);
      if (!paused) frame = requestAnimationFrame(render);
    }
    const schedule = () => { if (!frame && visible && !lost && !document.hidden) { last = 0; frame = requestAnimationFrame(render); } };
    wake.current = schedule;
    const resize = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 600 ? 1.25 : 1.5));
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); schedule();
    });
    resize.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; cancelAnimationFrame(frame); frame = 0; if (visible) schedule(); });
    observer.observe(canvas);
    const visibility = () => { cancelAnimationFrame(frame); frame = 0; if (!document.hidden) schedule(); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || settings.current.paused) return;
      const rect = canvas.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1);
    };
    const lostContext = (event: Event) => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); canvas.hidden = true; };
    const surface = canvas.parentElement;
    surface?.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", visibility); canvas.addEventListener("webglcontextlost", lostContext);
    schedule();
    return () => {
      wake.current = null; cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      surface?.removeEventListener("pointermove", move); document.removeEventListener("visibilitychange", visibility); canvas.removeEventListener("webglcontextlost", lostContext);
      geometry.dispose(); material.dispose(); rings.forEach(ring => { ring.geometry.dispose(); ring.material.dispose(); }); renderer.dispose();
    };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}
