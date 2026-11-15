"use client";

import { useEffect, useRef } from "react";

export type Mood = "agua" | "tierra" | "fuego" | "aire";

// Cómo se mueve el ambiente de cada elemento. flow: dirección y velocidad;
// warp: cuánto se retuerce; liquid: vetas brillantes de líquido; ground: cuánto
// se concentra en la parte baja de la pantalla.
const STYLES: Record<Mood, { color: [number, number, number]; flow: [number, number]; scale: number; warp: number; alpha: number; liquid: number; ground: number }> = {
  agua: { color: [0.45, 0.86, 0.94], flow: [0.012, -0.018], scale: 2.1, warp: 3.4, alpha: 0.3, liquid: 1, ground: 0 },
  fuego: { color: [1.0, 0.56, 0.3], flow: [0.01, 0.11], scale: 2.6, warp: 2.6, alpha: 0.5, liquid: 0, ground: 0.75 },
  tierra: { color: [0.9, 0.74, 0.46], flow: [0.022, 0.008], scale: 1.9, warp: 2.0, alpha: 0.36, liquid: 0.18, ground: 0.9 },
  aire: { color: [0.78, 0.76, 0.93], flow: [0.05, 0.004], scale: 1.7, warp: 2.3, alpha: 0.36, liquid: 0, ground: 0 },
};

const VERTEX = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

// Ruido fractal deformado sobre sí mismo (domain warping): da volutas de humo
// y, afinando las crestas, vetas de líquido.
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes; uniform float uTime; uniform vec3 uColor; uniform vec2 uFlow;
uniform float uScale; uniform float uWarp; uniform float uAlpha; uniform float uLiquid; uniform float uGround;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.02 + vec2(17.3, 9.1); a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  vec2 p = uv * uScale - uFlow * uTime;
  vec2 q = vec2(fbm(p + uTime * 0.05), fbm(p + vec2(5.2, 1.3) - uTime * 0.04));
  vec2 r = vec2(fbm(p + uWarp * q + vec2(1.7, 9.2) + uTime * 0.03), fbm(p + uWarp * q + vec2(8.3, 2.8)));
  float n = fbm(p + uWarp * r);
  float smoke = smoothstep(0.32, 0.86, n);
  smoke *= smoke;
  float veins = pow(1.0 - abs(sin((n + q.x) * 9.42)), 9.0) * smoothstep(0.25, 0.7, n);
  float height = gl_FragCoord.y / uRes.y;
  float mask = mix(1.0, 1.0 - smoothstep(0.0, 1.05, height), uGround);
  float alpha = clamp((smoke * uAlpha + veins * 0.3 * uLiquid) * mask, 0.0, 1.0);
  vec3 color = mix(uColor, vec3(1.0), smoke * 0.25 + veins * 0.35 * uLiquid);
  gl_FragColor = vec4(color * alpha, alpha);
}`;

/** Humo y líquido ambiental según el elemento. Sin WebGL no se dibuja nada. */
export default function ElementAtmosphere({ mood, still, className }: { mood: Mood; still: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!canvas || !gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const initialize = () => {
      if (gl.isContextLost()) return;
      const vertex = compile(gl.VERTEX_SHADER, VERTEX);
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
      const program = gl.createProgram();
      if (!vertex || !fragment || !program) {
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        gl.deleteProgram(program);
        return;
      }
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      // El programa enlazado conserva el código; los shaders ya no hacen falta.
      gl.detachShader(program, vertex);
      gl.detachShader(program, fragment);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return;
      }
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      if (!buffer) {
        gl.deleteProgram(program);
        return;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const uniform = (name: string) => gl.getUniformLocation(program, name);
      const style = STYLES[mood];
      gl.uniform3fv(uniform("uColor"), style.color);
      gl.uniform2fv(uniform("uFlow"), style.flow);
      gl.uniform1f(uniform("uScale"), style.scale);
      gl.uniform1f(uniform("uWarp"), style.warp);
      gl.uniform1f(uniform("uAlpha"), style.alpha);
      gl.uniform1f(uniform("uLiquid"), style.liquid);
      gl.uniform1f(uniform("uGround"), style.ground);
      const uRes = uniform("uRes");
      const uTime = uniform("uTime");

      let frame = 0;
      let elapsed = 0;
      let previous: number | null = null;
      // Media resolución, con un límite para no saturar la GPU en pantallas grandes.
      const resize = () => {
        const scale = Math.min(0.5, 960 / Math.max(1, canvas.clientWidth, canvas.clientHeight));
        const width = Math.max(1, Math.round(canvas.clientWidth * scale));
        const height = Math.max(1, Math.round(canvas.clientHeight * scale));
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
      };
      const draw = (now: number) => {
        frame = 0;
        if (document.hidden || gl.isContextLost()) return;
        if (!still && previous !== null) elapsed += (now - previous) / 1000;
        previous = now;
        // Un desfase fijo evita que el primer fotograma (o el único, sin movimiento) salga vacío.
        gl.uniform1f(uTime, 40 + elapsed);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!still) frame = requestAnimationFrame(draw);
      };
      const schedule = () => {
        if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
      };
      const onVisibility = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = null;
        schedule();
      };
      resize();
      schedule();
      const observer = new ResizeObserver(() => { resize(); schedule(); });
      observer.observe(canvas);
      document.addEventListener("visibilitychange", onVisibility);
      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.useProgram(null);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      };
    };

    let dispose = initialize();
    const onLost = (event: Event) => {
      event.preventDefault(); // Permite al navegador restaurar el contexto.
      dispose?.();
      dispose = undefined;
    };
    const onRestored = () => { dispose = initialize(); };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      dispose?.();
    };
  }, [mood, still]);
  // Reutilizar el contexto permite cambiar de elemento y reiniciar efectos en StrictMode.
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
