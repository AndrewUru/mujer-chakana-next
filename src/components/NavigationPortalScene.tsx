"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./PageTransition.module.css";

export default function NavigationPortalScene({ accent }: { accent: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      // The illustrated transition remains usable without WebGL.
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#16080d", .035);
    const camera = new THREE.PerspectiveCamera(55, 1, .1, 65);
    camera.position.z = 7;
    const color = new THREE.Color(accent);

    const ringGeometry = new THREE.TorusGeometry(3.7, .012, 5, 96);
    const ringMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false });
    const rings = Array.from({ length: 9 }, (_, index) => {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.z = -index * 4;
      scene.add(ring);
      return ring;
    });

    const count = window.innerWidth < 640 ? 280 : 560;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.7 + Math.random() * 9;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = Math.random() * 45 - 40;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.ShaderMaterial({
      uniforms: { tint: { value: color }, pixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `uniform float pixelRatio;
        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = clamp(42.0 / -viewPosition.z, 1.0, 9.0) * pixelRatio;
        }`,
      fragmentShader: `uniform vec3 tint;
        void main() {
          float glow = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5));
          gl_FragColor = vec4(tint, glow * 0.75);
        }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = host;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    let lastTime = performance.now();
    let elapsed = 0;
    renderer.setAnimationLoop((time) => {
      const delta = Math.min((time - lastTime) / 1000, .05);
      lastTime = time;
      if (document.hidden) return;
      elapsed += delta;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 2] += delta * 10;
        if (positions[i * 3 + 2] > 6) positions[i * 3 + 2] -= 46;
      }
      geometry.attributes.position.needsUpdate = true;
      particles.rotation.z = elapsed * .035;
      rings.forEach((ring, index) => {
        ring.position.z += delta * 5;
        if (ring.position.z > 6) ring.position.z -= 36;
        ring.rotation.x = Math.sin(elapsed * .3 + index * .3) * .12;
        ring.rotation.y = Math.cos(elapsed * .25 + index * .3) * .12;
      });
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [accent]);

  return <div ref={container} className={styles.portal} aria-hidden="true" />;
}
