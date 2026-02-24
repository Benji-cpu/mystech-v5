"use client";

import { useRef, useEffect } from "react";

/**
 * Shader Ripple Canvas — WebGL concentric ripple waves
 * Emits expanding concentric rings from center using a WebGL shader.
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
  uniform vec2 u_resolution;

  void main() {
    vec2 uv = v_uv - 0.5;
    // Correct for aspect ratio
    uv.x *= u_resolution.x / u_resolution.y;

    float dist = length(uv);

    // Multiple ripple rings expanding outward
    float ripple = 0.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float speed = 0.8 + fi * 0.15;
      float t = u_time * speed - fi * 0.18;
      float ring = abs(sin(dist * 18.0 - t * 6.28));
      ring = 1.0 - smoothstep(0.0, 0.15, ring);

      // Ring fades as it expands from center
      float attenuation = exp(-dist * (3.0 + fi * 0.5)) * 2.0;
      ripple += ring * attenuation;
    }

    // Color — purple to gold
    float hue = dist * 2.0 + u_time * 0.3;
    vec3 colorA = vec3(0.6, 0.15, 0.9);  // purple
    vec3 colorB = vec3(0.8, 0.65, 0.15); // gold
    vec3 color = mix(colorA, colorB, clamp(sin(hue) * 0.5 + 0.5, 0.0, 1.0));

    float alpha = clamp(ripple * u_intensity * 0.5, 0.0, 0.7);

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

interface ShaderRippleCanvasProps {
  transitionKey: number;
}

export function ShaderRippleCanvas({ transitionKey }: ShaderRippleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    gl: WebGLRenderingContext;
    timeLocation: WebGLUniformLocation;
    intensityLocation: WebGLUniformLocation;
    resolutionLocation: WebGLUniformLocation;
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
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    stateRef.current = {
      gl,
      timeLocation,
      intensityLocation,
      resolutionLocation,
      raf: 0,
      startTime: 0,
    };

    // Size canvas
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

    const canvas = canvasRef.current;
    const DURATION = 1500;

    function render(now: number) {
      const elapsed = (now - state!.startTime) / 1000;
      const progress = Math.min(elapsed / (DURATION / 1000), 1);
      const intensity = Math.sin(progress * Math.PI) * 1.8;

      const { gl, timeLocation, intensityLocation, resolutionLocation } = state!;
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(intensityLocation, intensity);
      if (canvas) gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

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
