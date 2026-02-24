import type { ComponentType } from "react";

export type StageId =
  | "oracle-card"
  | "crystal-orb"
  | "ancient-tome"
  | "summoning-circle"
  | "rune-stone"
  | "potion-vial"
  | "enchanted-mirror"
  | "star-map"
  | "tarot-stack";

export interface StageContentProps {
  morphed: boolean;
  onMorphComplete?: () => void;
  className?: string;
}

export interface StageMeta {
  id: StageId;
  name: string;
  tech: string;
}

export const STAGES: StageMeta[] = [
  { id: "oracle-card", name: "Oracle Card", tech: "HTML/CSS" },
  { id: "crystal-orb", name: "Crystal Orb", tech: "R3F + Drei" },
  { id: "ancient-tome", name: "Ancient Tome", tech: "CSS 3D" },
  { id: "summoning-circle", name: "Summoning Circle", tech: "SVG + GSAP" },
  { id: "rune-stone", name: "Rune Stone", tech: "SVG + GSAP" },
  { id: "potion-vial", name: "Potion Vial", tech: "SVG + Filters" },
  { id: "enchanted-mirror", name: "Enchanted Mirror", tech: "CSS + Canvas" },
  { id: "star-map", name: "Star Map", tech: "Canvas 2D" },
  { id: "tarot-stack", name: "Tarot Stack", tech: "CSS 3D" },
];

import { OracleCard } from "./oracle-card";
import { CrystalOrb } from "./crystal-orb";
import { AncientTome } from "./ancient-tome";
import { SummoningCircle } from "./summoning-circle";
import { RuneStone } from "./rune-stone";
import { PotionVial } from "./potion-vial";
import { EnchantedMirror } from "./enchanted-mirror";
import { StarMap } from "./star-map";
import { TarotStack } from "./tarot-stack";

export const stageRegistry: Record<
  StageId,
  ComponentType<StageContentProps>
> = {
  "oracle-card": OracleCard,
  "crystal-orb": CrystalOrb,
  "ancient-tome": AncientTome,
  "summoning-circle": SummoningCircle,
  "rune-stone": RuneStone,
  "potion-vial": PotionVial,
  "enchanted-mirror": EnchantedMirror,
  "star-map": StarMap,
  "tarot-stack": TarotStack,
};
