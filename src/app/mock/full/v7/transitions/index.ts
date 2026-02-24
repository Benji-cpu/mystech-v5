import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { TransitionProps, TransitionRegistry } from "../mirror-types";

// ─── Direct imports (CSS / Canvas / Framer Motion / Spring / SVG) ────────────

import { BlurDissolve } from "./blur-dissolve";
import { Swirl } from "./swirl";
import { RadialMaskWipe } from "./radial-mask-wipe";
import { CircleReveal } from "./circle-reveal";
import { FilterStorm } from "./filter-storm";
import { DisplacementWave } from "./displacement-wave";
import { SmokeDissolve } from "./smoke-dissolve";
import { InkInWater } from "./ink-in-water";
import { BoundaryMorph } from "./boundary-morph";
import { WobbleMorph } from "./wobble-morph";

// ─── Dynamic imports for R3F transitions (SSR disabled) ──────────────────────

const FluidDistortion = dynamic(
  () => import("./fluid-distortion").then((m) => ({ default: m.FluidDistortion })),
  { ssr: false }
) as ComponentType<TransitionProps>;

const ShaderFluid = dynamic(
  () => import("./shader-fluid").then((m) => ({ default: m.ShaderFluid })),
  { ssr: false }
) as ComponentType<TransitionProps>;

const ShaderRipple = dynamic(
  () => import("./shader-ripple").then((m) => ({ default: m.ShaderRipple })),
  { ssr: false }
) as ComponentType<TransitionProps>;

const ShaderWave = dynamic(
  () => import("./shader-wave").then((m) => ({ default: m.ShaderWave })),
  { ssr: false }
) as ComponentType<TransitionProps>;

// ─── Registry ────────────────────────────────────────────────────────────────

export const transitionRegistry: TransitionRegistry = {
  // CSS / Framer Motion
  "blur-dissolve": BlurDissolve,
  "swirl": Swirl,
  "radial-mask-wipe": RadialMaskWipe,
  "circle-reveal": CircleReveal,
  "filter-storm": FilterStorm,

  // SVG / GSAP / Canvas
  "displacement-wave": DisplacementWave,
  "smoke-dissolve": SmokeDissolve,
  "ink-in-water": InkInWater,
  "boundary-morph": BoundaryMorph,

  // React Spring
  "wobble-morph": WobbleMorph,

  // R3F / WebGL (dynamically imported, SSR disabled)
  "fluid-distortion": FluidDistortion,
  "shader-fluid": ShaderFluid,
  "shader-ripple": ShaderRipple,
  "shader-wave": ShaderWave,
};
