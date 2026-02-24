"use client";

import { useRef, useEffect } from "react";

/**
 * Shader Fluid Canvas — WebGL fluid simulation overlay
 * Uses a simple WebGL shader to simulate fluid/dye spreading.
 * This provides the visual overlay for the ShaderFluid transition.
 */

const VERT_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAG_SHADER = `
  precision mediump float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform float u_intensity;

  // Pseudo-noise for fluid-like motion
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.0 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time * 0.8;

    // Fluid-like distortion
    vec2 q = vec2(fbm(uv + t * 0.3), fbm(uv + vec2(1.0)));
    vec2 r = vec2(
      fbm(uv + 1.0 * q + vec2(1.7, 9.2) + t * 0.15),
      fbm(uv + 1.0 * q + vec2(8.3, 2.8) + t * 0.126)
    );
    float f = fbm(uv + r);

    // Color the fluid — purple/gold palette
    vec3 color = mix(
      vec3(0.4, 0.1, 0.7),   // deep purple
      vec3(0.8, 0.65, 0.2),  // gold
      clamp(f * f * 4.0, 0.0, 1.0)
    );
    color = mix(color, vec3(0.2, 0.05, 0.4), clamp(length(q), 0.0, 1.0));

    // Fade in and out with intensity
    float alpha = u_intensity * (f * 0.5 + 0.1) * 0.6;
    alpha = clamp(alpha, 0.0, 0.55);

    gl_FragColor = vec4(color, alpha);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vert: string,
  frag: string
): WebGLProgram | null {
  const vs = createShader(gl, gl.VERTEX_SHADER, vert);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

interface ShaderFluidCanvasProps {
  transitionKey: number;
}

export function ShaderFluidCanvas({ transitionKey }: ShaderFluidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    timeLocation: WebGLUniformLocation;
    intensityLocation: WebGLUniformLocation;
    raf: number;
    startTime: number;
    active: boolean;
  } | null>(null);
  const hasRunRef = useRef(-1);

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const program = createProgram(gl, VERT_SHADER, FRAG_SHADER);
    if (!program) return;

    gl.useProgram(program);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time")!;
    const intensityLocation = gl.getUniformLocation(program, "u_intensity")!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    stateRef.current = {
      gl,
      program,
      timeLocation,
      intensityLocation,
      raf: 0,
      startTime: 0,
      active: false,
    };

    return () => {
      if (stateRef.current?.raf) cancelAnimationFrame(stateRef.current.raf);
    };
  }, []);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
        const state = stateRef.current;
        if (state) {
          state.gl.viewport(0, 0, canvas.width, canvas.height);
        }
      }
    });
    observer.observe(canvas.parentElement ?? canvas);
    return () => observer.disconnect();
  }, []);

  // Fire animation on transitionKey change
  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    const state = stateRef.current;
    if (!state) return;

    if (state.raf) cancelAnimationFrame(state.raf);

    state.startTime = performance.now();
    state.active = true;

    const DURATION = 1500;

    function render(now: number) {
      const elapsed = (now - state!.startTime) / 1000;
      const progress = Math.min(elapsed / (DURATION / 1000), 1);

      // Bell curve intensity: rises and falls
      const intensity = Math.sin(progress * Math.PI) * 1.5;

      const { gl, timeLocation, intensityLocation } = state!;

      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(intensityLocation, intensity);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (progress < 1) {
        state!.raf = requestAnimationFrame(render);
      } else {
        state!.active = false;
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }

    state.raf = requestAnimationFrame(render);
  }, [transitionKey]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
