'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type RefObject,
} from 'react';
import { cn } from '@/lib/utils';
import type { TransitionProps } from '../mirror-types';

// ─── WebGL Utilities ──────────────────────────────────────────────────────────

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertSrc: string,
  fragSrc: string,
): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  return program;
}

function createFullscreenQuad(gl: WebGLRenderingContext): WebGLBuffer | null {
  const buf = gl.createBuffer();
  if (!buf) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  // Two triangles covering clip space [-1, 1]
  const verts = new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1,  1, 1, -1,  1, 1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  return buf;
}

// Shared vertex shader — outputs v_uv in [0,1] space
const FULLSCREEN_VERT = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// ─── Shared Layer Wrapper ─────────────────────────────────────────────────────

interface LayerWrapperProps {
  oldContent: ReactNode;
  newContent: ReactNode;
  oldOpacity: number;
  newOpacity: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  dimensions: { width: number; height: number };
  className?: string;
}

function LayerWrapper({
  oldContent,
  newContent,
  oldOpacity,
  newOpacity,
  canvasRef,
  dimensions,
  className,
}: LayerWrapperProps) {
  return (
    <div
      className={cn('relative w-full h-full overflow-hidden', className)}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {/* Old content — z-0 */}
      <div
        className="absolute inset-0 z-0 transition-none"
        style={{ opacity: oldOpacity }}
      >
        {oldContent}
      </div>

      {/* New content — z-10 */}
      <div
        className="absolute inset-0 z-10 transition-none"
        style={{ opacity: newOpacity }}
      >
        {newContent}
      </div>

      {/* WebGL overlay — z-20, pointer-events: none */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 z-20"
        style={{ pointerEvents: 'none', width: dimensions.width, height: dimensions.height }}
      />
    </div>
  );
}

// ─── 1. WaterDisplacement ─────────────────────────────────────────────────────

const WATER_FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform float u_progress;
  varying vec2 v_uv;

  void main() {
    float ripple = sin(v_uv.x * 20.0 + u_time * 3.0) * sin(v_uv.y * 20.0 + u_time * 2.0);
    ripple *= (1.0 - u_progress) * 0.5;
    float alpha = abs(ripple) * (1.0 - smoothstep(0.3, 0.7, u_progress));
    gl_FragColor = vec4(0.1, 0.05, 0.2, alpha * 0.6);
  }
`;

export function WaterDisplacement({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const quadRef = useRef<WebGLBuffer | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [oldOpacity, setOldOpacity] = useState(1);
  const [newOpacity, setNewOpacity] = useState(0);

  const DURATION = 1500;

  const destroyGl = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const gl = glRef.current;
    if (gl) {
      if (programRef.current) gl.deleteProgram(programRef.current);
      if (quadRef.current) gl.deleteBuffer(quadRef.current);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
    glRef.current = null;
    programRef.current = null;
    quadRef.current = null;
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    if (!isActive) {
      destroyGl();
      setOldOpacity(1);
      setNewOpacity(0);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Init WebGL
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) {
      // Fallback: plain crossfade
      setOldOpacity(0);
      setNewOpacity(1);
      onComplete();
      return;
    }
    glRef.current = gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const program = createProgram(gl, FULLSCREEN_VERT, WATER_FRAG);
    if (!program) {
      setOldOpacity(0);
      setNewOpacity(1);
      onComplete();
      return;
    }
    programRef.current = program;

    const quad = createFullscreenQuad(gl);
    if (!quad) return;
    quadRef.current = quad;

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uProgress = gl.getUniformLocation(program, 'u_progress');
    const aPosition = gl.getAttribLocation(program, 'a_position');

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - (startTimeRef.current ?? now);
      const progress = Math.min(elapsed / DURATION, 1);

      // Update content opacities
      setOldOpacity(1 - progress);
      setNewOpacity(progress);

      // Render WebGL overlay
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(uTime, elapsed / 1000);
      gl.uniform1f(uProgress, progress);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Clear canvas and finish
        gl.clear(gl.COLOR_BUFFER_BIT);
        destroyGl();
        setOldOpacity(0);
        setNewOpacity(1);
        onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      destroyGl();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <LayerWrapper
      oldContent={oldContent}
      newContent={newContent}
      oldOpacity={oldOpacity}
      newOpacity={newOpacity}
      canvasRef={canvasRef}
      dimensions={dimensions}
    />
  );
}

// ─── 2. SimplexDissolve ───────────────────────────────────────────────────────

const SIMPLEX_FRAG = `
  precision mediump float;
  uniform float u_progress;
  uniform float u_time;
  varying vec2 v_uv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),             hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    float n = noise(v_uv * 8.0 + u_time * 0.5);
    float edge = smoothstep(u_progress - 0.1, u_progress, n)
               - smoothstep(u_progress, u_progress + 0.1, n);
    vec3 gold = vec3(0.8, 0.65, 0.2);
    float alpha = edge * 0.8;
    gl_FragColor = vec4(gold * edge, alpha);
  }
`;

export function SimplexDissolve({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const quadRef = useRef<WebGLBuffer | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [oldOpacity, setOldOpacity] = useState(1);
  const [newOpacity, setNewOpacity] = useState(0);

  const DURATION = 1200;

  const destroyGl = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const gl = glRef.current;
    if (gl) {
      if (programRef.current) gl.deleteProgram(programRef.current);
      if (quadRef.current) gl.deleteBuffer(quadRef.current);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
    glRef.current = null;
    programRef.current = null;
    quadRef.current = null;
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    if (!isActive) {
      destroyGl();
      setOldOpacity(1);
      setNewOpacity(0);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) {
      setOldOpacity(0);
      setNewOpacity(1);
      onComplete();
      return;
    }
    glRef.current = gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const program = createProgram(gl, FULLSCREEN_VERT, SIMPLEX_FRAG);
    if (!program) {
      setOldOpacity(0);
      setNewOpacity(1);
      onComplete();
      return;
    }
    programRef.current = program;

    const quad = createFullscreenQuad(gl);
    if (!quad) return;
    quadRef.current = quad;

    const uProgress = gl.getUniformLocation(program, 'u_progress');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const aPosition = gl.getAttribLocation(program, 'a_position');

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - (startTimeRef.current ?? now);
      const progress = Math.min(elapsed / DURATION, 1);

      setOldOpacity(1 - progress);
      setNewOpacity(progress);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(uProgress, progress);
      gl.uniform1f(uTime, elapsed / 1000);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        gl.clear(gl.COLOR_BUFFER_BIT);
        destroyGl();
        setOldOpacity(0);
        setNewOpacity(1);
        onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      destroyGl();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <LayerWrapper
      oldContent={oldContent}
      newContent={newContent}
      oldOpacity={oldOpacity}
      newOpacity={newOpacity}
      canvasRef={canvasRef}
      dimensions={dimensions}
    />
  );
}

// ─── 3. DisplacementFilter ────────────────────────────────────────────────────

// Uses Canvas 2D to render an animated noise heat-shimmer overlay.
// Each frame draws layered noise blobs that shift and flow, creating
// a visual displacement / heat-shimmer impression over the crossfade.

interface NoiseBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  speed: number;
}

function generateBlobs(count: number, w: number, h: number): NoiseBlob[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    r: 40 + Math.random() * 80,
    phase: (i / count) * Math.PI * 2,
    speed: 0.8 + Math.random() * 1.2,
  }));
}

export function DisplacementFilter({
  oldContent,
  newContent,
  isActive,
  onComplete,
  dimensions,
}: TransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const blobsRef = useRef<NoiseBlob[]>([]);
  const [oldOpacity, setOldOpacity] = useState(1);
  const [newOpacity, setNewOpacity] = useState(0);

  const DURATION = 1200;

  const stopCanvas = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopCanvas();
      setOldOpacity(1);
      setNewOpacity(0);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setOldOpacity(0);
      setNewOpacity(1);
      onComplete();
      return;
    }

    const { width: W, height: H } = dimensions;

    // Seed blobs
    blobsRef.current = generateBlobs(18, W, H);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - (startTimeRef.current ?? now);
      const progress = Math.min(elapsed / DURATION, 1);

      // Envelope: noise strongest in mid-transition, fades at start/end
      const envelope = Math.sin(progress * Math.PI);

      setOldOpacity(1 - progress);
      setNewOpacity(progress);

      // Draw noise blobs
      ctx.clearRect(0, 0, W, H);

      for (const blob of blobsRef.current) {
        // Animate position
        blob.x += blob.vx * blob.speed;
        blob.y += blob.vy * blob.speed;

        // Wrap around edges
        if (blob.x < -blob.r) blob.x = W + blob.r;
        if (blob.x > W + blob.r) blob.x = -blob.r;
        if (blob.y < -blob.r) blob.y = H + blob.r;
        if (blob.y > H + blob.r) blob.y = -blob.r;

        // Pulsing size
        const pulsedR = blob.r * (0.85 + 0.15 * Math.sin(elapsed * 0.003 * blob.speed + blob.phase));

        // Colour oscillates between deep purple and faint violet-gold
        const hue = 260 + 40 * Math.sin(elapsed * 0.002 + blob.phase);
        const sat = 40 + 20 * envelope;
        const lum = 20 + 30 * envelope;
        const alpha = envelope * 0.18;

        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, pulsedR);
        grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${lum}%, ${alpha})`);
        grad.addColorStop(1, `hsla(${hue}, ${sat}%, ${lum}%, 0)`);

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, pulsedR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Scanline shimmer — fine horizontal bands that drift downward
      if (envelope > 0.05) {
        const bandCount = 8;
        const bandHeight = H / bandCount;
        const shimmerOffset = (elapsed * 0.15) % bandHeight;

        for (let i = 0; i < bandCount + 1; i++) {
          const y = i * bandHeight - shimmerOffset;
          const bandAlpha = envelope * 0.06 * (0.5 + 0.5 * Math.sin(i * 1.3 + elapsed * 0.004));
          const shimmerGrad = ctx.createLinearGradient(0, y, 0, y + bandHeight * 0.3);
          shimmerGrad.addColorStop(0, `rgba(200, 170, 80, ${bandAlpha})`);
          shimmerGrad.addColorStop(1, `rgba(200, 170, 80, 0)`);
          ctx.fillStyle = shimmerGrad;
          ctx.fillRect(0, y, W, bandHeight * 0.3);
        }
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
        stopCanvas();
        setOldOpacity(0);
        setNewOpacity(1);
        onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopCanvas();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <LayerWrapper
      oldContent={oldContent}
      newContent={newContent}
      oldOpacity={oldOpacity}
      newOpacity={newOpacity}
      canvasRef={canvasRef}
      dimensions={dimensions}
    />
  );
}
