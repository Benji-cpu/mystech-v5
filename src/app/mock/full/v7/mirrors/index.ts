import type { MirrorRegistry } from "../mirror-types";

import { BaroqueMirror } from "./baroque";
import { ArtDecoMirror } from "./art-deco";
import { GothicArchMirror } from "./gothic-arch";
import { VictorianOvalMirror } from "./victorian-oval";
import { ArtNouveauMirror } from "./art-nouveau";
import { RococoMirror } from "./rococo";
import { CrystalBallMirror } from "./crystal-ball";
import { ScryingPoolMirror } from "./scrying-pool";
import { RuneCircleMirror } from "./rune-circle";
import { FloatingPortalMirror } from "./floating-portal";
import { ObsidianMirrorMirror } from "./obsidian-mirror";
import { TarotCardFrameMirror } from "./tarot-card-frame";

export const mirrorRegistry: MirrorRegistry = {
  "baroque": BaroqueMirror,
  "art-deco": ArtDecoMirror,
  "gothic-arch": GothicArchMirror,
  "victorian-oval": VictorianOvalMirror,
  "art-nouveau": ArtNouveauMirror,
  "rococo": RococoMirror,
  "crystal-ball": CrystalBallMirror,
  "scrying-pool": ScryingPoolMirror,
  "rune-circle": RuneCircleMirror,
  "floating-portal": FloatingPortalMirror,
  "obsidian-mirror": ObsidianMirrorMirror,
  "tarot-card-frame": TarotCardFrameMirror,
};

export {
  BaroqueMirror,
  ArtDecoMirror,
  GothicArchMirror,
  VictorianOvalMirror,
  ArtNouveauMirror,
  RococoMirror,
  CrystalBallMirror,
  ScryingPoolMirror,
  RuneCircleMirror,
  FloatingPortalMirror,
  ObsidianMirrorMirror,
  TarotCardFrameMirror,
};
