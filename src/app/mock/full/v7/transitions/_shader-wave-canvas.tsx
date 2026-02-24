"use client";

import { useRef, useEffect } from "react";

/**
 * Shader Wave Canvas — WebGL flowing wave distortion overlay
 * Horizontal sine wave bands sweep across, creating a flowing curtain effect.
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

  void main() {
    vec2 uv = v_uv;

    // Multiple overlapping wave layers
    float wave1 = sin(uv.x * 8.0 + u_time * 3.0) * 0.5 + 0.5;
    float wave2 = sin(uv.x * 5.0 - u_time * 2.0 + 1.5) * 0.5 + 0.5;
    float wave3 = cos(uv.y * 6.0 + u_time * 2.5) * 0.5 + 0.5;

    // Combine waves into pattern
    float pattern = wave1 * wave2 * wave3;
    pattern = smoothstep(0.2, 0.8, pattern);

    // Add traveling wave bands
    float band = sin(uv.y * 12.0 - u_time * 4.0) * 0.5 + 0.5;
    band = smoothstep(0.45, 0.55, band);

    float finalPattern = mix(pattern, band, 0.4);

    // Color gradient — sweeping from purple to gold
    float t = uv.x + sin(uv.y * 4.0 + u_time) * 0.2;
    vec3 colorA = vec3(0.5, 0.1, 0.8);   // violet
    vec3 colorB = vec3(0.9, 0.7, 0.1);   // amber
    vec3 colorC = vec3(0.2, 0.05, 0.5);  // deep purple
    vec3 color = mix(mix(colorA, colorB, t), colorC, finalPattern * 0.3);

    float alpha = finalPattern * u_intensity * 0.55;
    alpha = clamp(alpha, 0.0, 0.65);

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

interface ShaderWaveCanvasProps {
  transitionKey: number;
}

export function ShaderWaveCanvas({ transitionKey }: ShaderWaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    gl: WebGLRenderingContext;
    timeLocation: WebGLUniformLocation;
    intensityLocation: WebGLUniformLocation;
    raf: number;
    startTime: number;
  } | null>(null);
  const hasRunRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

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
      timeLocation,
      intensityLocation,
      raf: 0,
      startTime: 0,
    };

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (stateRef.current?.raf) cancelAnimationFrame(stateRef.current.raf);
    };
  }, []);

  useEffect(() => {
    if (transitionKey === 0 || hasRunRef.current === transitionKey) return;
    hasRunRef.current = transitionKey;

    const state = stateRef.current;
    if (!state) return;

    if (state.raf) cancelAnimationFrame(state.raf);
    state.startTime = performance.now();

    const DURATION = 1500;

    function render(now: number) {
      const elapsed = (now - state!.startTime) / 1000;
      const progress = Math.min(elapsed / (DURATION / 1000), 1);
      // Bell curve — ramps up and fades out
      const intensity = Math.sin(progress * Math.PI) * 1.6;

      const { gl, timeLocation, intensityLocation } = state!;
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(intensityLocation, intensity);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (progress < 1) {
        state!.raf = requestAnimationFrame(render);
      } else {
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
