"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function AmbientChakanaScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const group = new THREE.Group();
    scene.add(group);

    const ribbonGeometry = new THREE.PlaneGeometry(12, 6.5, 90, 42);
    const ribbonMaterial = new THREE.MeshBasicMaterial({
      color: 0xf7a8c5,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbon.rotation.set(-0.18, 0, -0.06);
    group.add(ribbon);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
    });

    const lines: THREE.Line[] = [];
    for (let index = 0; index < 7; index += 1) {
      const points = Array.from({ length: 90 }, (_, pointIndex) => {
        const x = -5.8 + pointIndex * 0.13;
        const y = -2.8 + index * 0.92;
        return new THREE.Vector3(x, y, 0);
      });
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      line.rotation.z = -0.08;
      group.add(line);
      lines.push(line);
    }

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      group.scale.setScalar(width < 768 ? 0.82 : 1);
    };

    resize();
    window.addEventListener("resize", resize);

    let animationFrame = 0;
    const reducedMotion = prefersReducedMotion();
    const positions = ribbonGeometry.attributes.position;

    const render = (time = 0) => {
      const t = time * 0.00032;

      if (!reducedMotion) {
        for (let index = 0; index < positions.count; index += 1) {
          const x = positions.getX(index);
          const y = positions.getY(index);
          const z =
            Math.sin(x * 0.9 + t * 2.1) * 0.13 +
            Math.cos(y * 1.35 + t * 1.6) * 0.08;
          positions.setZ(index, z);
        }
        positions.needsUpdate = true;

        ribbon.rotation.z = -0.06 + Math.sin(t * 0.8) * 0.018;
        lines.forEach((line, index) => {
          line.position.x = Math.sin(t * 1.2 + index) * 0.08;
          line.position.y = Math.cos(t + index * 0.7) * 0.04;
        });
      }

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      ribbonGeometry.dispose();
      ribbonMaterial.dispose();
      lineMaterial.dispose();
      lines.forEach((line) => line.geometry.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[11] h-screen w-screen opacity-70"
      aria-hidden="true"
      data-ambient-chakana-scene
    />
  );
}
