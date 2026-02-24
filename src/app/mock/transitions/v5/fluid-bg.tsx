"use client";

import { useEffect, useRef } from "react";

interface FluidBgProps {
  className?: string;
}

export function FluidBg({ className }: FluidBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<ReturnType<typeof initFluidSim> | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 640;
    const sim = initFluidSim(canvas, isMobile);
    simRef.current = sim;

    // Auto-splat interval for ambient motion
    const autoSplatInterval = setInterval(() => {
      if (simRef.current) {
        const x = 0.2 + Math.random() * 0.6;
        const y = 0.2 + Math.random() * 0.6;
        const angle = Math.random() * Math.PI * 2;
        const dx = Math.cos(angle) * 0.002;
        const dy = Math.sin(angle) * 0.002;
        const colors = [
          [0.05, 0.02, 0.12], // deep purple
          [0.1, 0.04, 0.2],   // violet
          [0.3, 0.25, 0.08],  // gold
          [0.02, 0.02, 0.08], // deep blue
        ];
        const c = colors[Math.floor(Math.random() * colors.length)];
        simRef.current.splat(x, y, dx, dy, c[0], c[1], c[2]);
      }
    }, isMobile ? 5000 : 3000);

    // Pointer handlers
    const handlePointer = (e: PointerEvent) => {
      if (!simRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      const dx = e.movementX * 0.0001;
      const dy = -e.movementY * 0.0001;
      // Gold-ish splat on interaction
      simRef.current.splat(x, y, dx, dy, 0.15, 0.1, 0.03);
    };

    canvas.addEventListener("pointermove", handlePointer);

    // Animation loop
    const loop = () => {
      sim.step();
      sim.render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(autoSplatInterval);
      canvas.removeEventListener("pointermove", handlePointer);
      sim.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─── Minimal Navier-Stokes Fluid Simulation ──────────────────────────────────
// Self-contained WebGL fluid sim inspired by Pavel Dobryakov's implementation
// Simulates velocity + dye advection with pressure solve

function initFluidSim(canvas: HTMLCanvasElement, isMobile: boolean) {
  const SIM_RES = isMobile ? 64 : 128;
  const DYE_RES = isMobile ? 256 : 512;
  const SPLAT_RADIUS = 0.25;
  const PRESSURE_ITERATIONS = 20;
  const CURL_STRENGTH = 30;
  const VELOCITY_DISSIPATION = 0.98;
  const DYE_DISSIPATION = 0.97;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  })!;

  if (!gl) {
    return { step: () => {}, render: () => {}, splat: () => {}, destroy: () => {} };
  }

  const ext = {
    halfFloat: gl.getExtension("OES_texture_half_float"),
    halfFloatLinear: gl.getExtension("OES_texture_half_float_linear"),
    floatLinear: gl.getExtension("OES_texture_float_linear"),
  };

  // Determine internal format support
  const halfFloatType = ext.halfFloat?.HALF_FLOAT_OES ?? gl.UNSIGNED_BYTE;

  // ─── Shader compilation ─────────────────────────────────────────────────

  function compileShader(type: number, source: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function createProgram(vs: string, fs: string) {
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    return prog;
  }

  // ─── Shaders ────────────────────────────────────────────────────────────

  const baseVS = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const splatFS = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main() {
      vec2 p = vUv - point;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }
  `;

  const advectionFS = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main() {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      vec4 result = dissipation * texture2D(uSource, coord);
      gl_FragColor = result;
    }
  `;

  const divergenceFS = `
    precision mediump float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `;

  const pressureFS = `
    precision mediump float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main() {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float div = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - div) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
  `;

  const gradientSubtractFS = `
    precision mediump float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `;

  const curlFS = `
    precision mediump float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
  `;

  const vorticityFS = `
    precision highp float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main() {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity += force * dt;
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `;

  const displayFS = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main() {
      vec3 c = texture2D(uTexture, vUv).rgb;
      // Darken further for mystical atmosphere
      c = pow(c, vec3(1.2));
      gl_FragColor = vec4(c, 1.0);
    }
  `;

  // ─── Create programs ────────────────────────────────────────────────────

  const splatProg = createProgram(baseVS, splatFS);
  const advProg = createProgram(baseVS, advectionFS);
  const divProg = createProgram(baseVS, divergenceFS);
  const pressureProg = createProgram(baseVS, pressureFS);
  const gradProg = createProgram(baseVS, gradientSubtractFS);
  const curlProg = createProgram(baseVS, curlFS);
  const vortProg = createProgram(baseVS, vorticityFS);
  const displayProg = createProgram(baseVS, displayFS);

  // ─── Quad geometry ──────────────────────────────────────────────────────

  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  function blit(prog: WebGLProgram) {
    gl.useProgram(prog);
    const loc = gl.getAttribLocation(prog, "aPosition");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ─── FBO helpers ────────────────────────────────────────────────────────

  type DoubleFBO = { read: { tex: WebGLTexture; fbo: WebGLFramebuffer }; write: { tex: WebGLTexture; fbo: WebGLFramebuffer }; swap: () => void };

  function createFBO(w: number, h: number): { tex: WebGLTexture; fbo: WebGLFramebuffer } {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, halfFloatType, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fbo };
  }

  function createDoubleFBO(w: number, h: number): DoubleFBO {
    let fbo1 = createFBO(w, h);
    let fbo2 = createFBO(w, h);
    return {
      get read() { return fbo1; },
      get write() { return fbo2; },
      swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
    };
  }

  // ─── Create sim textures ────────────────────────────────────────────────

  const simW = SIM_RES;
  const simH = SIM_RES;
  const dyeW = DYE_RES;
  const dyeH = DYE_RES;

  const velocity = createDoubleFBO(simW, simH);
  const dye = createDoubleFBO(dyeW, dyeH);
  const pressure = createDoubleFBO(simW, simH);
  const divergence = createFBO(simW, simH);
  const curl = createFBO(simW, simH);

  // ─── Uniform helpers ────────────────────────────────────────────────────

  function setUniform1i(prog: WebGLProgram, name: string, val: number) {
    gl.useProgram(prog);
    gl.uniform1i(gl.getUniformLocation(prog, name), val);
  }

  function setUniform1f(prog: WebGLProgram, name: string, val: number) {
    gl.useProgram(prog);
    gl.uniform1f(gl.getUniformLocation(prog, name), val);
  }

  function setUniform2f(prog: WebGLProgram, name: string, x: number, y: number) {
    gl.useProgram(prog);
    gl.uniform2f(gl.getUniformLocation(prog, name), x, y);
  }

  function setUniform3f(prog: WebGLProgram, name: string, x: number, y: number, z: number) {
    gl.useProgram(prog);
    gl.uniform3f(gl.getUniformLocation(prog, name), x, y, z);
  }

  // ─── Initial splats for atmosphere ──────────────────────────────────────

  function doSplat(x: number, y: number, dx: number, dy: number, r: number, g: number, b: number) {
    // Splat velocity
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
    gl.viewport(0, 0, simW, simH);
    setUniform1i(splatProg, "uTarget", 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
    setUniform2f(splatProg, "point", x, y);
    setUniform3f(splatProg, "color", dx * 5000, dy * 5000, 0);
    setUniform1f(splatProg, "aspectRatio", canvas.width / canvas.height);
    setUniform1f(splatProg, "radius", SPLAT_RADIUS / 100);
    blit(splatProg);
    velocity.swap();

    // Splat dye
    gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo);
    gl.viewport(0, 0, dyeW, dyeH);
    setUniform1i(splatProg, "uTarget", 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dye.read.tex);
    setUniform2f(splatProg, "point", x, y);
    setUniform3f(splatProg, "color", r, g, b);
    setUniform1f(splatProg, "aspectRatio", canvas.width / canvas.height);
    setUniform1f(splatProg, "radius", SPLAT_RADIUS / 100);
    blit(splatProg);
    dye.swap();
  }

  // Initial ambient splats
  const initColors = [
    [0.05, 0.02, 0.12],
    [0.1, 0.04, 0.2],
    [0.02, 0.01, 0.06],
    [0.08, 0.06, 0.02],
  ];
  for (let i = 0; i < 6; i++) {
    const c = initColors[i % initColors.length];
    doSplat(
      0.2 + Math.random() * 0.6,
      0.2 + Math.random() * 0.6,
      (Math.random() - 0.5) * 0.001,
      (Math.random() - 0.5) * 0.001,
      c[0], c[1], c[2]
    );
  }

  // ─── Simulation step ───────────────────────────────────────────────────

  const dt = 0.016;
  const simTexelSize = [1.0 / simW, 1.0 / simH] as const;
  const dyeTexelSize = [1.0 / dyeW, 1.0 / dyeH] as const;

  function step() {
    // Curl
    gl.bindFramebuffer(gl.FRAMEBUFFER, curl.fbo);
    gl.viewport(0, 0, simW, simH);
    setUniform2f(curlProg, "texelSize", simTexelSize[0], simTexelSize[1]);
    setUniform1i(curlProg, "uVelocity", 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
    blit(curlProg);

    // Vorticity
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
    gl.viewport(0, 0, simW, simH);
    setUniform2f(vortProg, "texelSize", simTexelSize[0], simTexelSize[1]);
    setUniform1i(vortProg, "uVelocity", 0);
    setUniform1i(vortProg, "uCurl", 1);
    setUniform1f(vortProg, "curl", CURL_STRENGTH);
    setUniform1f(vortProg, "dt", dt);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, curl.tex);
    blit(vortProg);
    velocity.swap();

    // Divergence
    gl.bindFramebuffer(gl.FRAMEBUFFER, divergence.fbo);
    gl.viewport(0, 0, simW, simH);
    setUniform2f(divProg, "texelSize", simTexelSize[0], simTexelSize[1]);
    setUniform1i(divProg, "uVelocity", 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
    blit(divProg);

    // Pressure solve (Jacobi)
    setUniform2f(pressureProg, "texelSize", simTexelSize[0], simTexelSize[1]);
    setUniform1i(pressureProg, "uDivergence", 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, divergence.tex);
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo);
      gl.viewport(0, 0, simW, simH);
      setUniform1i(pressureProg, "uPressure", 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex);
      blit(pressureProg);
      pressure.swap();
    }

    // Gradient subtract
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
    gl.viewport(0, 0, simW, simH);
    setUniform2f(gradProg, "texelSize", simTexelSize[0], simTexelSize[1]);
    setUniform1i(gradProg, "uPressure", 0);
    setUniform1i(gradProg, "uVelocity", 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
    blit(gradProg);
    velocity.swap();

    // Advect velocity
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
    gl.viewport(0, 0, simW, simH);
    setUniform2f(advProg, "texelSize", simTexelSize[0], simTexelSize[1]);
    setUniform1i(advProg, "uVelocity", 0);
    setUniform1i(advProg, "uSource", 0);
    setUniform1f(advProg, "dt", dt);
    setUniform1f(advProg, "dissipation", VELOCITY_DISSIPATION);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
    blit(advProg);
    velocity.swap();

    // Advect dye
    gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo);
    gl.viewport(0, 0, dyeW, dyeH);
    setUniform2f(advProg, "texelSize", dyeTexelSize[0], dyeTexelSize[1]);
    setUniform1i(advProg, "uVelocity", 0);
    setUniform1i(advProg, "uSource", 1);
    setUniform1f(advProg, "dt", dt);
    setUniform1f(advProg, "dissipation", DYE_DISSIPATION);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, dye.read.tex);
    blit(advProg);
    dye.swap();
  }

  // ─── Render to screen ───────────────────────────────────────────────────

  function render() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    setUniform1i(displayProg, "uTexture", 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dye.read.tex);
    blit(displayProg);
  }

  // ─── Resize handler ─────────────────────────────────────────────────────

  const onResize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };
  window.addEventListener("resize", onResize);

  return {
    step,
    render,
    splat: doSplat,
    destroy: () => {
      window.removeEventListener("resize", onResize);
    },
  };
}
