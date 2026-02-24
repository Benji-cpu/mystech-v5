/**
 * GLSL transition shader presets.
 * Each preset is a fragment shader that takes:
 *   - uTexFrom: sampler2D (from content texture)
 *   - uTexTo: sampler2D (to content texture)
 *   - uProgress: float (0.0 to 1.0)
 *   - vUv: vec2 (UV coordinates from vertex shader)
 *
 * Shared noise functions are prepended automatically.
 */

export const NOISE_FUNCTIONS = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
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

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5, f = 1.0;
    for (int i = 0; i < 5; i++) { v += a * snoise(p * f); a *= 0.5; f *= 2.0; }
    return v;
  }
`;

export const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Crosswarp: UV coordinates warp in a cross pattern */
export const CROSSWARP = /* glsl */ `
  uniform sampler2D uTexFrom;
  uniform sampler2D uTexTo;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    float p = smoothstep(0.0, 1.0, uProgress);
    float x = p * 2.0 - 1.0;
    // Cross-warping UV offsets
    vec2 uvFrom = vUv + vec2(x * 0.5 * vUv.y, x * 0.3 * (1.0 - vUv.x));
    vec2 uvTo = vUv - vec2((1.0 - p) * 0.5 * (1.0 - vUv.y), (1.0 - p) * 0.3 * vUv.x);
    vec4 from = texture2D(uTexFrom, clamp(uvFrom, 0.0, 1.0));
    vec4 to = texture2D(uTexTo, clamp(uvTo, 0.0, 1.0));
    gl_FragColor = mix(from, to, p);
  }
`;

/** Directional Warp: content slides with exponential pixel stretching */
export const DIRECTIONAL_WARP = /* glsl */ `
  uniform sampler2D uTexFrom;
  uniform sampler2D uTexTo;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    float p = smoothstep(0.0, 1.0, uProgress);
    vec2 dir = normalize(vec2(1.0, -0.5));
    // Stretch from texture
    float stretch = pow(p, 3.0) * 0.8;
    vec2 uvFrom = vUv - dir * stretch;
    // Stretch to texture from opposite side
    float stretchTo = pow(1.0 - p, 3.0) * 0.8;
    vec2 uvTo = vUv + dir * stretchTo;
    vec4 from = texture2D(uTexFrom, clamp(uvFrom, 0.0, 1.0));
    vec4 to = texture2D(uTexTo, clamp(uvTo, 0.0, 1.0));
    gl_FragColor = mix(from, to, p);
  }
`;

/** Burn: noise-based dissolve with glowing edges */
export const BURN = /* glsl */ `
  uniform sampler2D uTexFrom;
  uniform sampler2D uTexTo;
  uniform float uProgress;
  varying vec2 vUv;

  ${NOISE_FUNCTIONS}

  void main() {
    float p = uProgress;
    float n = snoise(vUv * 4.0) * 0.5 + 0.5;
    n += snoise(vUv * 8.0) * 0.25;
    n = n * 0.7 + 0.15;

    float edge = smoothstep(p - 0.08, p, n) - smoothstep(p, p + 0.08, n);
    float mask = smoothstep(p - 0.02, p + 0.02, n);

    vec4 from = texture2D(uTexFrom, vUv);
    vec4 to = texture2D(uTexTo, vUv);

    // Hot edge glow — gold to white
    vec3 edgeColor = mix(vec3(0.83, 0.66, 0.27), vec3(1.0, 0.95, 0.8), edge);
    vec4 result = mix(to, from, mask);
    result.rgb += edgeColor * edge * 2.5;

    gl_FragColor = result;
  }
`;

/** Pixelate: mosaic increases at midpoint, content swaps */
export const PIXELATE = /* glsl */ `
  uniform sampler2D uTexFrom;
  uniform sampler2D uTexTo;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    float p = uProgress;
    // Pixel size peaks at p=0.5
    float pixelSize = 1.0 + 48.0 * pow(sin(p * 3.14159), 2.0);
    vec2 size = vec2(pixelSize) / vec2(512.0);
    vec2 pixelUv = floor(vUv / size) * size + size * 0.5;

    vec4 from = texture2D(uTexFrom, pixelUv);
    vec4 to = texture2D(uTexTo, pixelUv);

    float blend = smoothstep(0.4, 0.6, p);
    gl_FragColor = mix(from, to, blend);
  }
`;

/** Morph: domain-warped fbm noise displaces UVs organically */
export const MORPH_NOISE = /* glsl */ `
  uniform sampler2D uTexFrom;
  uniform sampler2D uTexTo;
  uniform float uProgress;
  varying vec2 vUv;

  ${NOISE_FUNCTIONS}

  void main() {
    float p = smoothstep(0.0, 1.0, uProgress);
    float intensity = sin(p * 3.14159) * 0.15;

    vec2 warp = vec2(
      fbm(vUv * 3.0 + vec2(p * 2.0, 0.0)),
      fbm(vUv * 3.0 + vec2(0.0, p * 2.0))
    ) * intensity;

    vec2 uvFrom = vUv + warp;
    vec2 uvTo = vUv - warp;

    vec4 from = texture2D(uTexFrom, clamp(uvFrom, 0.0, 1.0));
    vec4 to = texture2D(uTexTo, clamp(uvTo, 0.0, 1.0));

    gl_FragColor = mix(from, to, p);
  }
`;

/** Wind: horizontal noise streaks blow content away */
export const WIND = /* glsl */ `
  uniform sampler2D uTexFrom;
  uniform sampler2D uTexTo;
  uniform float uProgress;
  varying vec2 vUv;

  ${NOISE_FUNCTIONS}

  void main() {
    float p = smoothstep(0.0, 1.0, uProgress);

    // Horizontal streaks
    float streak = snoise(vec2(vUv.y * 20.0, p * 3.0)) * 0.5 + 0.5;
    float windOffset = p * (0.3 + streak * 0.4);

    vec2 uvFrom = vUv + vec2(windOffset, snoise(vec2(vUv.y * 10.0, p * 5.0)) * 0.02 * p);
    vec2 uvTo = vUv - vec2((1.0 - p) * (0.3 + streak * 0.4), 0.0);

    vec4 from = texture2D(uTexFrom, clamp(uvFrom, 0.0, 1.0));
    vec4 to = texture2D(uTexTo, clamp(uvTo, 0.0, 1.0));

    // Alpha based on streak position
    float alpha = smoothstep(0.0, 0.3, 1.0 - uvFrom.x) * (1.0 - p);
    gl_FragColor = mix(to, from, alpha * (1.0 - p) + (1.0 - p) * 0.3);
    gl_FragColor = mix(from * (1.0 - p) + to * p, gl_FragColor, sin(p * 3.14159));
    // Simpler blend
    float mask = smoothstep(p - 0.1, p + 0.1, vUv.x + streak * 0.3 - 0.15);
    gl_FragColor = mix(to, from, mask);
  }
`;

export const SHADER_PRESETS_MAP = {
  crosswarp: CROSSWARP,
  "directional-warp": DIRECTIONAL_WARP,
  burn: BURN,
  pixelate: PIXELATE,
  morph: MORPH_NOISE,
  wind: WIND,
} as const;
