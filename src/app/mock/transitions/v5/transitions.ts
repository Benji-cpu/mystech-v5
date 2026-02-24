// ─── GLSL Transition Shader Functions ─────────────────────────────────────────
// Each transition is a GLSL function that returns vec4 given uv, progress, time, texA, texB
// They are combined into a single fragment shader via switch(uTransitionType)

// Shared simplex noise (inlined from nebula.tsx)
export const GLSL_NOISE = /* glsl */ `
  vec3 mod289_3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289_2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute_3(vec3 x) { return mod289_3(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289_2(i);
    vec3 p = permute_3(permute_3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm3(vec2 p) {
    float v = 0.0, a = 0.5, f = 1.0;
    for (int i = 0; i < 5; i++) {
      v += a * snoise(p * f);
      a *= 0.5; f *= 2.0;
    }
    return v;
  }
`;

// Each transition function body
const WATER_RIPPLE = /* glsl */ `
  vec4 waterRipple(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    vec2 center = vec2(0.5);
    float dist = distance(uv, center);
    float ripple = sin(dist * 30.0 - prog * 12.0) * 0.02 * (1.0 - prog);
    vec2 displaced = uv + normalize(uv - center) * ripple;
    vec4 colA = texture2D(tA, displaced);
    vec4 colB = texture2D(tB, uv);
    float mask = smoothstep(prog - 0.1, prog + 0.1, dist * 1.5);
    return mix(colB, colA, mask);
  }
`;

const LIQUID_MORPH = /* glsl */ `
  vec4 liquidMorph(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    float n = fbm3(uv * 4.0 + t * 0.3);
    float threshold = prog * 2.0 - 0.5;
    vec2 dispA = uv + vec2(n * 0.05 * (1.0 - prog));
    vec2 dispB = uv + vec2(n * 0.05 * prog);
    vec4 colA = texture2D(tA, dispA);
    vec4 colB = texture2D(tB, dispB);
    float blend = smoothstep(threshold - 0.2, threshold + 0.2, n);
    return mix(colA, colB, blend);
  }
`;

const INK_DROP = /* glsl */ `
  vec4 inkDrop(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    vec2 center = vec2(0.5);
    float dist = distance(uv, center);
    float noise = snoise(uv * 8.0 + t * 0.5) * 0.15;
    float radius = prog * 1.2;
    float edge = smoothstep(radius - 0.05, radius + 0.05, dist + noise);
    vec4 colA = texture2D(tA, uv);
    vec4 colB = texture2D(tB, uv);
    // Ink-dark edge
    vec3 inkEdge = vec3(0.02, 0.01, 0.05);
    float edgeMask = smoothstep(radius - 0.08, radius - 0.02, dist + noise) *
                     smoothstep(radius + 0.08, radius + 0.02, dist + noise);
    vec4 result = mix(colB, colA, edge);
    result.rgb = mix(result.rgb, inkEdge, edgeMask * 0.6);
    return result;
  }
`;

const MERCURY_POOL = /* glsl */ `
  vec4 mercuryPool(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    float n1 = snoise(uv * 6.0 + vec2(t * 0.2, 0.0));
    float n2 = snoise(uv * 10.0 + vec2(0.0, t * 0.3));
    float mercury = n1 * 0.5 + n2 * 0.5;
    float threshold = prog * 2.2 - 0.6;
    float mask = smoothstep(threshold - 0.1, threshold + 0.1, mercury);
    vec4 colA = texture2D(tA, uv);
    vec4 colB = texture2D(tB, uv);
    // Chrome highlight at transition edge
    float edgeGlow = smoothstep(threshold - 0.15, threshold - 0.05, mercury) *
                     smoothstep(threshold + 0.15, threshold + 0.05, mercury);
    vec4 result = mix(colA, colB, mask);
    result.rgb += vec3(0.7, 0.72, 0.75) * edgeGlow * 0.5;
    return result;
  }
`;

const FROST_MELT = /* glsl */ `
  vec4 frostMelt(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    // Voronoi-like crystal pattern
    vec2 cell = floor(uv * 8.0);
    vec2 frac_ = fract(uv * 8.0);
    float minDist = 1.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 point = vec2(snoise(cell + neighbor + 0.5) * 0.5 + 0.5,
                          snoise(cell + neighbor + 12.34) * 0.5 + 0.5);
        float d = length(neighbor + point - frac_);
        minDist = min(minDist, d);
      }
    }
    float frost = smoothstep(0.0, 0.4, minDist);
    float melt = smoothstep(prog - 0.2, prog + 0.3, frost + snoise(uv * 3.0) * 0.2);
    vec4 colA = texture2D(tA, uv);
    vec4 colB = texture2D(tB, uv);
    // Ice tint
    vec3 iceTint = vec3(0.7, 0.85, 1.0);
    vec4 result = mix(colB, colA, melt);
    float iceEdge = smoothstep(prog - 0.05, prog, frost) * smoothstep(prog + 0.1, prog + 0.05, frost);
    result.rgb = mix(result.rgb, iceTint, iceEdge * 0.4 * (1.0 - prog));
    return result;
  }
`;

const VORTEX_SWIRL = /* glsl */ `
  vec4 vortexSwirl(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    vec2 center = vec2(0.5);
    vec2 delta = uv - center;
    float dist = length(delta);
    float angle = atan(delta.y, delta.x);
    float swirl = prog * 6.28318 * (1.0 - dist);
    vec2 swirlA = center + dist * vec2(cos(angle + swirl), sin(angle + swirl));
    vec2 swirlB = center + dist * vec2(cos(angle - swirl * 0.5), sin(angle - swirl * 0.5));
    vec4 colA = texture2D(tA, clamp(swirlA, 0.0, 1.0));
    vec4 colB = texture2D(tB, clamp(swirlB, 0.0, 1.0));
    float blend = smoothstep(0.3, 0.7, prog);
    return mix(colA, colB, blend);
  }
`;

const RAIN_WASH = /* glsl */ `
  vec4 rainWash(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    float streak = snoise(vec2(uv.x * 20.0, uv.y * 2.0 - t * 3.0)) * 0.5 + 0.5;
    float threshold = prog * 1.4 - 0.2;
    float vertProgress = uv.y * 0.6 + streak * 0.4;
    float mask = smoothstep(threshold - 0.1, threshold + 0.05, vertProgress);
    vec2 dispA = uv + vec2(0.0, streak * 0.02 * (1.0 - prog));
    vec4 colA = texture2D(tA, dispA);
    vec4 colB = texture2D(tB, uv);
    vec4 result = mix(colB, colA, mask);
    // Water streak highlight
    float streakHighlight = smoothstep(0.6, 0.8, streak) * (1.0 - abs(prog - 0.5) * 2.0);
    result.rgb += vec3(0.1, 0.12, 0.2) * streakHighlight * 0.3;
    return result;
  }
`;

const BUBBLE_RISE = /* glsl */ `
  vec4 bubbleRise(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    float revealed = 0.0;
    for (int i = 0; i < 12; i++) {
      float fi = float(i);
      vec2 bubblePos = vec2(
        0.1 + snoise(vec2(fi * 1.7, 0.0)) * 0.5 + 0.4,
        1.2 - prog * 1.8 - fi * 0.08 + snoise(vec2(fi, t * 0.5)) * 0.1
      );
      float radius = 0.06 + snoise(vec2(fi * 3.1, 1.0)) * 0.03;
      float bubble = 1.0 - smoothstep(radius - 0.02, radius + 0.02, distance(uv, bubblePos));
      revealed = max(revealed, bubble);
    }
    float vertReveal = smoothstep(1.0 - prog * 1.3, 1.0 - prog * 1.3 + 0.2, 1.0 - uv.y);
    revealed = max(revealed, vertReveal);
    vec4 colA = texture2D(tA, uv);
    vec4 colB = texture2D(tB, uv);
    return mix(colA, colB, clamp(revealed, 0.0, 1.0));
  }
`;

const WAVE_CRASH = /* glsl */ `
  vec4 waveCrash(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    float wave = sin(uv.y * 12.0 + t * 2.0) * 0.05 + sin(uv.y * 7.0 - t * 1.5) * 0.03;
    float edge = prog * 1.3 - 0.15 + wave;
    float mask = smoothstep(edge - 0.05, edge + 0.05, uv.x);
    // Foam at wave edge
    float foam = smoothstep(edge - 0.08, edge - 0.02, uv.x) * smoothstep(edge + 0.08, edge + 0.02, uv.x);
    vec4 colA = texture2D(tA, uv);
    vec4 colB = texture2D(tB, uv);
    vec4 result = mix(colB, colA, mask);
    result.rgb += vec3(0.8, 0.85, 0.9) * foam * 0.3;
    return result;
  }
`;

const SMOKE_DISSOLVE = /* glsl */ `
  vec4 smokeDissolve(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    float noise = fbm3(uv * 5.0 + t * 0.2) * 0.5 + 0.5;
    float threshold = prog;
    float edge = smoothstep(threshold - 0.05, threshold, noise);
    float glow = smoothstep(threshold - 0.1, threshold - 0.02, noise) *
                 smoothstep(threshold + 0.06, threshold + 0.01, noise);
    vec4 colA = texture2D(tA, uv);
    vec4 colB = texture2D(tB, uv);
    vec4 result = mix(colB, colA, edge);
    // Golden edge glow
    result.rgb += vec3(0.79, 0.66, 0.31) * glow * 0.8;
    return result;
  }
`;

const CRYSTAL_SHATTER = /* glsl */ `
  vec4 crystalShatter(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    vec2 cell = floor(uv * 6.0);
    vec2 frac_ = fract(uv * 6.0);
    float minDist = 1.0;
    vec2 minPoint = vec2(0.0);
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 pt = vec2(snoise(cell + neighbor + 0.5) * 0.5 + 0.5,
                       snoise(cell + neighbor + 7.77) * 0.5 + 0.5);
        float d = length(neighbor + pt - frac_);
        if (d < minDist) {
          minDist = d;
          minPoint = cell + neighbor;
        }
      }
    }
    float cellNoise = snoise(minPoint * 1.23) * 0.5 + 0.5;
    float shatterTime = smoothstep(cellNoise - 0.1, cellNoise + 0.1, prog);
    // Offset each cell as it shatters
    vec2 offset = vec2(snoise(minPoint + 10.0), snoise(minPoint + 20.0)) * shatterTime * 0.03;
    vec4 colA = texture2D(tA, uv + offset * (1.0 - shatterTime));
    vec4 colB = texture2D(tB, uv);
    // Edge highlight on voronoi borders
    float border = smoothstep(0.02, 0.05, minDist);
    vec4 result = mix(colA, colB, shatterTime);
    result.rgb += vec3(0.5, 0.55, 0.7) * (1.0 - border) * 0.3 * (1.0 - prog);
    return result;
  }
`;

const DREAM_FADE = /* glsl */ `
  vec4 dreamFade(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    // Simulated blur via offset sampling
    float blurAmount = sin(prog * 3.14159) * 0.015;
    vec4 colA = vec4(0.0);
    vec4 colB = vec4(0.0);
    float total = 0.0;
    for (int x = -2; x <= 2; x++) {
      for (int y = -2; y <= 2; y++) {
        vec2 off = vec2(float(x), float(y)) * blurAmount;
        float w = 1.0 / (1.0 + float(x*x + y*y));
        colA += texture2D(tA, uv + off) * w;
        colB += texture2D(tB, uv + off) * w;
        total += w;
      }
    }
    colA /= total;
    colB /= total;
    // Subtle UV displacement
    float disp = snoise(uv * 4.0 + t * 0.3) * 0.005 * sin(prog * 3.14159);
    vec2 uvDisp = uv + vec2(disp);
    colA = mix(colA, texture2D(tA, uvDisp), 0.3);
    colB = mix(colB, texture2D(tB, uvDisp), 0.3);
    return mix(colA, colB, smoothstep(0.3, 0.7, prog));
  }
`;

const TURBULENCE_WARP = /* glsl */ `
  vec4 turbulenceWarp(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    float intensity = sin(prog * 3.14159) * 0.08;
    float n1 = snoise(uv * 6.0 + t * 0.5);
    float n2 = snoise(uv * 6.0 + t * 0.5 + 100.0);
    vec2 warpedUv = uv + vec2(n1, n2) * intensity;
    vec4 colA = texture2D(tA, warpedUv);
    vec4 colB = texture2D(tB, warpedUv);
    float blend = smoothstep(0.2, 0.8, prog + snoise(uv * 3.0) * 0.15);
    return mix(colA, colB, blend);
  }
`;

const DISPLACEMENT_SLIDE = /* glsl */ `
  vec4 displacementSlide(vec2 uv, float prog, float t, sampler2D tA, sampler2D tB) {
    // Use noise as displacement map
    float disp = snoise(uv * 5.0 + vec2(t * 0.1, 0.0)) * 0.5 + 0.5;
    float threshold = prog;
    float mask = smoothstep(threshold - 0.1, threshold + 0.1, disp);
    // Offset UVs based on displacement
    vec2 offsetA = uv + vec2(disp * 0.03 * (1.0 - prog), 0.0);
    vec2 offsetB = uv - vec2(disp * 0.03 * prog, 0.0);
    vec4 colA = texture2D(tA, offsetA);
    vec4 colB = texture2D(tB, offsetB);
    return mix(colA, colB, mask);
  }
`;

// ─── Combined Fragment Shader ─────────────────────────────────────────────────

export const TRANSITION_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const TRANSITION_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uProgress;
  uniform float uTime;
  uniform int uTransitionType;

  varying vec2 vUv;

  ${GLSL_NOISE}

  ${WATER_RIPPLE}
  ${LIQUID_MORPH}
  ${INK_DROP}
  ${MERCURY_POOL}
  ${FROST_MELT}
  ${VORTEX_SWIRL}
  ${RAIN_WASH}
  ${BUBBLE_RISE}
  ${WAVE_CRASH}
  ${SMOKE_DISSOLVE}
  ${CRYSTAL_SHATTER}
  ${DREAM_FADE}
  ${TURBULENCE_WARP}
  ${DISPLACEMENT_SLIDE}

  void main() {
    vec2 uv = vUv;
    float p = clamp(uProgress, 0.0, 1.0);
    float t = uTime;

    // Clean display at boundaries — no warping artifacts
    if (p <= 0.001) {
      gl_FragColor = texture2D(uTexA, uv);
      return;
    }
    if (p >= 0.999) {
      gl_FragColor = texture2D(uTexB, uv);
      return;
    }

    vec4 color;

    if (uTransitionType == 0) color = waterRipple(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 1) color = liquidMorph(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 2) color = inkDrop(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 3) color = mercuryPool(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 4) color = frostMelt(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 5) color = vortexSwirl(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 6) color = rainWash(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 7) color = bubbleRise(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 8) color = waveCrash(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 9) color = smokeDissolve(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 10) color = crystalShatter(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 11) color = dreamFade(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 12) color = turbulenceWarp(uv, p, t, uTexA, uTexB);
    else if (uTransitionType == 13) color = displacementSlide(uv, p, t, uTexA, uTexB);
    else color = texture2D(uTexA, uv);

    gl_FragColor = color;
  }
`;

export const TRANSITION_COUNT = 14;
