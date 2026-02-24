import type { ComponentType } from "react";
import type { TechniqueId, TechniqueProps } from "../types";
import { SpringProperty } from "./spring-property";
import { LayoutTeleport } from "./layout-teleport";
import { ClipPathSculpt } from "./clip-path-sculpt";
import { ShatterReconstitute } from "./shatter-reconstitute";
import { CanvasParticles } from "./canvas-particles";
import { PerspectiveFold } from "./perspective-fold";
import { DisplacementWave } from "./displacement-wave";

export const techniqueRegistry: Record<
  TechniqueId,
  ComponentType<TechniqueProps>
> = {
  "spring-property": SpringProperty,
  "layout-teleport": LayoutTeleport,
  "clip-path-sculpt": ClipPathSculpt,
  "shatter-reconstitute": ShatterReconstitute,
  "canvas-particles": CanvasParticles,
  "perspective-fold": PerspectiveFold,
  "displacement-wave": DisplacementWave,
};
