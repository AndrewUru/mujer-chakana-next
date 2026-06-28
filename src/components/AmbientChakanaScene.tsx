"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const RING_SEGMENTS = 180;

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
      powerPreference: "low-power",
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const energyField = new THREE.Group();
    const mandala = new THREE.Group();
    const waves = new THREE.Group();
    energyField.add(mandala, waves);
    scene.add(energyField);

    const ringConfigs = [
      { radius: 0.68, petals: 8, amplitude: 0.1, opacity: 0.34, phase: 0 },
      { radius: 1.1, petals: 8, amplitude: 0.16, opacity: 0.28, phase: 0.45 },
      { radius: 1.55, petals: 12, amplitude: 0.13, opacity: 0.22, phase: 0.9 },
      { radius: 2.02, petals: 16, amplitude: 0.11, opacity: 0.17, phase: 1.4 },
      { radius: 2.48, petals: 24, amplitude: 0.08, opacity: 0.12, phase: 1.9 },
    ];

    const ringStates = ringConfigs.map((config, ringIndex) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(RING_SEGMENTS * 3);
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: ringIndex % 2 === 0 ? 0xc96f95 : 0xd3a05e,
        transparent: true,
        opacity: config.opacity,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const line = new THREE.LineLoop(geometry, material);
      mandala.add(line);

      return { ...config, geometry, material };
    });

    const waveStates = [-1, 0, 1].map((offset, waveIndex) => {
      const pointCount = 140;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(pointCount * 3), 3)
      );
      const material = new THREE.LineBasicMaterial({
        color: waveIndex === 1 ? 0xc96f95 : 0xd3a05e,
        transparent: true,
        opacity: waveIndex === 1 ? 0.16 : 0.11,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(geometry, material);
      waves.add(line);
      return { geometry, material, offset, pointCount };
    });

    const particleCount = window.innerWidth < 768 ? 110 : 180;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const progress = index / particleCount;
      const radius = Math.sqrt(progress) * 3.15;
      const angle = index * GOLDEN_ANGLE;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[index * 3 + 2] = -0.08 + Math.sin(index * 0.7) * 0.08;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xc97c9b,
      transparent: true,
      opacity: 0.28,
      size: 0.035,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mandala.add(particles);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      energyField.scale.setScalar(width < 768 ? 0.78 : 1);
      energyField.position.set(width < 768 ? 0 : 0.65, -0.18, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let animationFrame = 0;
    const reducedMotion = prefersReducedMotion();

    const render = (time = 0) => {
      const t = time * 0.00032;

      ringStates.forEach((ring, ringIndex) => {
        const positions = ring.geometry.attributes.position;
        const breath = Math.sin(t * 1.3 + ring.phase) * 0.035;

        for (let index = 0; index < RING_SEGMENTS; index += 1) {
          const angle = (index / RING_SEGMENTS) * TAU;
          const vibration =
            Math.sin(angle * ring.petals + ring.phase + t * (1.1 + ringIndex * 0.08)) *
            ring.amplitude;
          const radius = ring.radius + vibration + breath;
          positions.setXYZ(
            index,
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            Math.sin(angle * 2 + t + ring.phase) * 0.025
          );
        }
        positions.needsUpdate = true;
      });

      waveStates.forEach((wave, waveIndex) => {
        const positions = wave.geometry.attributes.position;
        for (let index = 0; index < wave.pointCount; index += 1) {
          const progress = index / (wave.pointCount - 1);
          const x = -5.8 + progress * 11.6;
          const envelope = Math.sin(progress * Math.PI);
          const y =
            wave.offset * 1.18 +
            Math.sin(x * (0.72 + waveIndex * 0.08) + t * 1.7 + waveIndex) *
              0.16 *
              envelope;
          positions.setXYZ(index, x, y, -0.22);
        }
        positions.needsUpdate = true;
      });

      if (!reducedMotion) {
        const breathingScale = 1 + Math.sin(t * 0.72) * 0.025;
        mandala.scale.setScalar(breathingScale);
        mandala.rotation.z = t * 0.055;
        particles.rotation.z = -t * 0.09;
        waves.rotation.z = Math.sin(t * 0.35) * 0.025;
      }

      renderer.render(scene, camera);
      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      ringStates.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
      waveStates.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
      particleGeometry.dispose();
      particleMaterial.dispose();
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
