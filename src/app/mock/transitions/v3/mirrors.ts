// Mirror Transition Explorer — 14 Mirror Definitions
// Each mirror = SVG clip path + decorative frame + visual treatment

import type { MirrorDefinition } from "./mirror-types";

export const MIRRORS: MirrorDefinition[] = [
  // 1. Hand Mirror — Gold Filigree
  {
    id: "hand-mirror",
    name: "Hand Mirror",
    shape: "Hand Mirror",
    treatment: "Gold Filigree",
    aspectRatio: 0.55,
    clipPath:
      "M200,30 C280,30 340,90 340,180 C340,280 300,350 280,380 C270,395 265,420 265,440 L265,520 C265,540 250,555 230,555 L170,555 C150,555 135,540 135,520 L135,440 C135,420 130,395 120,380 C100,350 60,280 60,180 C60,90 120,30 200,30 Z",
    frameSvg: `<ellipse cx="200" cy="190" rx="148" ry="168" fill="none" stroke="url(#goldGrad)" stroke-width="6" opacity="0.8"/>
      <ellipse cx="200" cy="190" rx="155" ry="175" fill="none" stroke="rgba(201,169,78,0.3)" stroke-width="1"/>
      <rect x="155" y="400" width="90" height="140" rx="16" fill="none" stroke="url(#goldGrad)" stroke-width="4" opacity="0.7"/>
      <circle cx="200" cy="35" r="8" fill="none" stroke="rgba(201,169,78,0.5)" stroke-width="2"/>
      <circle cx="130" cy="80" r="5" fill="none" stroke="rgba(201,169,78,0.3)" stroke-width="1.5"/>
      <circle cx="270" cy="80" r="5" fill="none" stroke="rgba(201,169,78,0.3)" stroke-width="1.5"/>
      <path d="M160,395 Q200,410 240,395" fill="none" stroke="rgba(201,169,78,0.4)" stroke-width="2"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 20px rgba(201,169,78,0.25))",
    },
    thumbnailPath: "M20,3 C28,3 34,9 34,18 C34,28 28,35 26,38 L26,52 C26,54 25,55 23,55 L17,55 C15,55 14,54 14,52 L14,38 C12,35 6,28 6,18 C6,9 12,3 20,3 Z",
  },

  // 2. Oval Portal — Obsidian
  {
    id: "oval-portal",
    name: "Oval Portal",
    shape: "Oval",
    treatment: "Obsidian",
    aspectRatio: 0.65,
    clipPath:
      "M200,40 C310,40 360,150 360,300 C360,450 310,560 200,560 C90,560 40,450 40,300 C40,150 90,40 200,40 Z",
    frameSvg: `<ellipse cx="200" cy="300" rx="168" ry="268" fill="none" stroke="rgba(100,120,180,0.4)" stroke-width="5"/>
      <ellipse cx="200" cy="300" rx="175" ry="275" fill="none" stroke="rgba(60,70,100,0.6)" stroke-width="2"/>
      <ellipse cx="200" cy="300" rx="162" ry="262" fill="none" stroke="rgba(100,120,180,0.15)" stroke-width="1"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 15px rgba(60,80,160,0.2))",
    },
    thumbnailPath: "M20,4 C31,4 36,15 36,30 C36,45 31,56 20,56 C9,56 4,45 4,30 C4,15 9,4 20,4 Z",
  },

  // 3. Gothic Arch — Cathedral Stone
  {
    id: "gothic-arch",
    name: "Gothic Arch",
    shape: "Gothic Arch",
    treatment: "Cathedral Stone",
    aspectRatio: 0.58,
    clipPath:
      "M60,560 L60,220 C60,100 120,40 200,40 C280,40 340,100 340,220 L340,560 Z",
    frameSvg: `<path d="M55,560 L55,220 C55,95 115,35 200,35 C285,35 345,95 345,220 L345,560 Z" fill="none" stroke="rgba(140,130,120,0.5)" stroke-width="6"/>
      <path d="M200,35 L200,560" fill="none" stroke="rgba(140,130,120,0.1)" stroke-width="1" stroke-dasharray="4,8"/>
      <circle cx="200" cy="130" r="30" fill="none" stroke="rgba(140,130,120,0.25)" stroke-width="2"/>
      <circle cx="200" cy="130" r="15" fill="none" stroke="rgba(140,130,120,0.15)" stroke-width="1.5"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 12px rgba(80,70,60,0.3))",
    },
    thumbnailPath: "M6,56 L6,22 C6,10 12,4 20,4 C28,4 34,10 34,22 L34,56 Z",
  },

  // 4. Hexagonal — Crystal Prism
  {
    id: "hexagonal",
    name: "Hexagonal",
    shape: "Hexagonal",
    treatment: "Crystal Prism",
    aspectRatio: 0.7,
    clipPath:
      "M200,30 L350,150 L350,450 L200,570 L50,450 L50,150 Z",
    frameSvg: `<polygon points="200,25 355,148 355,452 200,575 45,452 45,148" fill="none" stroke="rgba(180,200,255,0.4)" stroke-width="4"/>
      <polygon points="200,30 350,150 350,450 200,570 50,450 50,150" fill="none" stroke="rgba(255,180,220,0.2)" stroke-width="1" stroke-dasharray="6,4"/>
      <polygon points="200,35 345,152 345,448 200,565 55,448 55,152" fill="none" stroke="rgba(180,255,200,0.15)" stroke-width="1"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 18px rgba(180,200,255,0.2)) drop-shadow(0 0 8px rgba(255,180,220,0.15))",
    },
    thumbnailPath: "M20,3 L35,15 L35,45 L20,57 L5,45 L5,15 Z",
  },

  // 5. Circle — Mercury Pool
  {
    id: "mercury-pool",
    name: "Mercury Pool",
    shape: "Circle",
    treatment: "Mercury Pool",
    aspectRatio: 1,
    clipPath:
      "M200,20 C300,20 380,100 380,200 C380,300 300,380 200,380 C100,380 20,300 20,200 C20,100 100,20 200,20 Z",
    frameSvg: `<circle cx="200" cy="200" r="186" fill="none" stroke="rgba(192,200,208,0.5)" stroke-width="4"/>
      <circle cx="200" cy="200" r="192" fill="none" stroke="rgba(192,200,208,0.2)" stroke-width="1"/>
      <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(192,200,208,0.15)" stroke-width="1"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 16px rgba(192,200,208,0.25))",
    },
    thumbnailPath: "M20,2 C30,2 38,10 38,20 C38,30 30,38 20,38 C10,38 2,30 2,20 C2,10 10,2 20,2 Z",
  },

  // 6. Teardrop — Moonstone
  {
    id: "moonstone-tear",
    name: "Moonstone Tear",
    shape: "Teardrop",
    treatment: "Moonstone",
    aspectRatio: 0.55,
    clipPath:
      "M200,560 C120,560 60,490 60,400 C60,280 140,120 200,40 C260,120 340,280 340,400 C340,490 280,560 200,560 Z",
    frameSvg: `<path d="M200,565 C115,565 55,492 55,400 C55,275 138,115 200,33 C262,115 345,275 345,400 C345,492 285,565 200,565 Z" fill="none" stroke="rgba(216,207,232,0.45)" stroke-width="4"/>
      <path d="M200,560 C120,560 60,490 60,400 C60,280 140,120 200,40" fill="none" stroke="rgba(216,207,232,0.2)" stroke-width="1"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 14px rgba(216,207,232,0.25))",
    },
    thumbnailPath: "M20,56 C12,56 6,49 6,40 C6,28 14,12 20,4 C26,12 34,28 34,40 C34,49 28,56 20,56 Z",
  },

  // 7. Diamond — Amethyst
  {
    id: "amethyst-diamond",
    name: "Amethyst Diamond",
    shape: "Diamond",
    treatment: "Amethyst",
    aspectRatio: 0.65,
    clipPath:
      "M200,30 L370,300 L200,570 L30,300 Z",
    frameSvg: `<polygon points="200,25 375,300 200,575 25,300" fill="none" stroke="rgba(107,33,168,0.5)" stroke-width="5"/>
      <polygon points="200,30 370,300 200,570 30,300" fill="none" stroke="rgba(147,73,208,0.25)" stroke-width="1.5"/>
      <line x1="200" y1="30" x2="200" y2="570" stroke="rgba(107,33,168,0.1)" stroke-width="1"/>
      <line x1="30" y1="300" x2="370" y2="300" stroke="rgba(107,33,168,0.1)" stroke-width="1"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 16px rgba(107,33,168,0.3))",
    },
    thumbnailPath: "M20,3 L37,30 L20,57 L3,30 Z",
  },

  // 8. Keyhole — Iron & Rust
  {
    id: "iron-keyhole",
    name: "Iron Keyhole",
    shape: "Keyhole",
    treatment: "Iron & Rust",
    aspectRatio: 0.5,
    clipPath:
      "M200,30 C270,30 320,80 320,160 C320,220 280,270 250,290 L250,540 C250,555 240,565 225,565 L175,565 C160,565 150,555 150,540 L150,290 C120,270 80,220 80,160 C80,80 130,30 200,30 Z",
    frameSvg: `<path d="M200,25 C275,25 325,78 325,160 C325,222 283,274 253,294 L253,542 C253,558 242,568 225,568 L175,568 C158,568 147,558 147,542 L147,294 C117,274 75,222 75,160 C75,78 125,25 200,25 Z" fill="none" stroke="rgba(74,68,88,0.5)" stroke-width="5"/>
      <circle cx="200" cy="160" r="60" fill="none" stroke="rgba(120,80,50,0.3)" stroke-width="2"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 10px rgba(74,68,88,0.3))",
    },
    thumbnailPath: "M20,3 C27,3 32,8 32,16 C32,22 28,27 25,29 L25,54 C25,55 24,56 22.5,56 L17.5,56 C16,56 15,55 15,54 L15,29 C12,27 8,22 8,16 C8,8 13,3 20,3 Z",
  },

  // 9. Vesica Piscis — Ethereal Silver
  {
    id: "vesica-piscis",
    name: "Vesica Piscis",
    shape: "Vesica Piscis",
    treatment: "Ethereal Silver",
    aspectRatio: 0.55,
    clipPath:
      "M200,40 C300,120 340,200 340,300 C340,400 300,480 200,560 C100,480 60,400 60,300 C60,200 100,120 200,40 Z",
    frameSvg: `<path d="M200,35 C305,118 345,200 345,300 C345,402 305,485 200,565 C95,485 55,402 55,300 C55,200 95,118 200,35 Z" fill="none" stroke="rgba(196,201,212,0.4)" stroke-width="3"/>
      <path d="M200,35 C305,118 345,200 345,300 C345,402 305,485 200,565" fill="none" stroke="rgba(196,201,212,0.2)" stroke-width="1"/>
      <circle cx="200" cy="300" r="4" fill="rgba(196,201,212,0.4)"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 12px rgba(196,201,212,0.2))",
    },
    thumbnailPath: "M20,4 C30,12 34,20 34,30 C34,40 30,48 20,56 C10,48 6,40 6,30 C6,20 10,12 20,4 Z",
  },

  // 10. Octagonal — Brass & Glass
  {
    id: "brass-octagon",
    name: "Brass Octagon",
    shape: "Octagonal",
    treatment: "Brass & Glass",
    aspectRatio: 0.7,
    clipPath:
      "M140,40 L260,40 L360,140 L360,380 L260,480 L140,480 L40,380 L40,140 Z",
    frameSvg: `<polygon points="138,37 262,37 363,138 363,382 262,483 138,483 37,382 37,138" fill="none" stroke="rgba(184,150,62,0.5)" stroke-width="5"/>
      <polygon points="140,40 260,40 360,140 360,380 260,480 140,480 40,380 40,140" fill="none" stroke="rgba(184,150,62,0.2)" stroke-width="1.5"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 14px rgba(184,150,62,0.2))",
    },
    thumbnailPath: "M14,4 L26,4 L36,14 L36,38 L26,48 L14,48 L4,38 L4,14 Z",
  },

  // 11. Scalloped — Coral & Pearl
  {
    id: "coral-scallop",
    name: "Coral Scallop",
    shape: "Scalloped",
    treatment: "Coral & Pearl",
    aspectRatio: 0.68,
    clipPath:
      "M100,50 C120,30 150,30 170,45 C185,30 215,30 230,45 C245,30 275,30 300,50 C330,60 350,85 355,120 C370,140 370,170 355,200 C370,230 370,265 355,290 C370,320 365,355 345,380 C355,410 345,440 320,455 C320,480 300,500 275,505 C265,530 240,540 215,535 C200,550 175,550 160,535 C135,545 110,535 100,510 C75,510 55,490 50,465 C30,455 20,430 25,405 C10,385 10,355 25,330 C10,305 15,275 30,255 C15,230 15,200 30,180 C15,155 20,125 40,105 C40,80 55,60 80,50 C85,45 92,45 100,50 Z",
    frameSvg: `<path d="M100,50 C120,30 150,30 170,45 C185,30 215,30 230,45 C245,30 275,30 300,50 C330,60 350,85 355,120 C370,140 370,170 355,200 C370,230 370,265 355,290 C370,320 365,355 345,380 C355,410 345,440 320,455 C320,480 300,500 275,505 C265,530 240,540 215,535 C200,550 175,550 160,535 C135,545 110,535 100,510 C75,510 55,490 50,465 C30,455 20,430 25,405 C10,385 10,355 25,330 C10,305 15,275 30,255 C15,230 15,200 30,180 C15,155 20,125 40,105 C40,80 55,60 80,50 C85,45 92,45 100,50 Z" fill="none" stroke="rgba(232,138,138,0.4)" stroke-width="4"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 14px rgba(232,138,138,0.2))",
    },
    thumbnailPath: "M15,5 C18,3 22,3 25,5 C28,3 32,3 35,7 C37,10 37,15 35,18 C37,22 37,27 35,30 C37,34 36,38 33,40 C34,44 32,47 28,48 C27,52 23,54 20,52 C17,54 13,52 12,48 C8,48 5,45 5,42 C3,40 2,36 4,33 C2,30 3,26 5,24 C3,20 3,16 5,14 C3,11 4,8 7,6 C8,5 11,4 15,5 Z",
  },

  // 12. Coffin — Dark Walnut
  {
    id: "walnut-coffin",
    name: "Walnut Coffin",
    shape: "Coffin",
    treatment: "Dark Walnut",
    aspectRatio: 0.5,
    clipPath:
      "M140,40 L260,40 L320,160 L320,460 L260,560 L140,560 L80,460 L80,160 Z",
    frameSvg: `<polygon points="137,37 263,37 323,158 323,462 263,563 137,563 77,462 77,158" fill="none" stroke="rgba(61,43,31,0.6)" stroke-width="5"/>
      <polygon points="140,40 260,40 320,160 320,460 260,560 140,560 80,460 80,160" fill="none" stroke="rgba(100,70,45,0.3)" stroke-width="1.5"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 10px rgba(61,43,31,0.3))",
    },
    thumbnailPath: "M14,4 L26,4 L32,16 L32,46 L26,56 L14,56 L8,46 L8,16 Z",
  },

  // 13. Trefoil — Stained Glass
  {
    id: "stained-trefoil",
    name: "Stained Trefoil",
    shape: "Trefoil",
    treatment: "Stained Glass",
    aspectRatio: 0.72,
    clipPath:
      "M200,200 C200,130 240,70 300,50 C360,30 380,80 380,130 C380,180 340,220 300,240 C340,260 380,300 380,350 C380,400 360,450 300,430 C240,410 220,360 220,300 L200,280 L180,300 C180,360 160,410 100,430 C40,450 20,400 20,350 C20,300 60,260 100,240 C60,220 20,180 20,130 C20,80 40,30 100,50 C160,70 200,130 200,200 Z",
    frameSvg: `<path d="M200,200 C200,130 240,70 300,50 C360,30 380,80 380,130 C380,180 340,220 300,240 C340,260 380,300 380,350 C380,400 360,450 300,430 C240,410 220,360 220,300 L200,280 L180,300 C180,360 160,410 100,430 C40,450 20,400 20,350 C20,300 60,260 100,240 C60,220 20,180 20,130 C20,80 40,30 100,50 C160,70 200,130 200,200 Z" fill="none" stroke="rgba(74,144,217,0.4)" stroke-width="4"/>
      <line x1="200" y1="20" x2="200" y2="480" stroke="rgba(74,144,217,0.15)" stroke-width="2"/>
      <line x1="20" y1="240" x2="380" y2="240" stroke="rgba(74,144,217,0.15)" stroke-width="2"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 14px rgba(74,144,217,0.2))",
    },
    thumbnailPath: "M20,20 C20,13 24,7 30,5 C36,3 38,8 38,13 C38,18 34,22 30,24 C34,26 38,30 38,35 C38,40 36,45 30,43 C24,41 22,36 22,30 L20,28 L18,30 C18,36 16,41 10,43 C4,45 2,40 2,35 C2,30 6,26 10,24 C6,22 2,18 2,13 C2,8 4,3 10,5 C16,7 20,13 20,20 Z",
  },

  // 14. Shield — Burnished Copper
  {
    id: "copper-shield",
    name: "Copper Shield",
    shape: "Shield",
    treatment: "Burnished Copper",
    aspectRatio: 0.62,
    clipPath:
      "M200,560 C100,480 50,380 50,260 L50,80 C50,60 70,40 90,40 L310,40 C330,40 350,60 350,80 L350,260 C350,380 300,480 200,560 Z",
    frameSvg: `<path d="M200,565 C97,483 45,381 45,260 L45,78 C45,56 67,36 90,36 L310,36 C333,36 355,56 355,78 L355,260 C355,381 303,483 200,565 Z" fill="none" stroke="rgba(184,115,51,0.5)" stroke-width="5"/>
      <path d="M200,560 C100,480 50,380 50,260 L50,80 C50,60 70,40 90,40 L310,40 C330,40 350,60 350,80 L350,260 C350,380 300,480 200,560 Z" fill="none" stroke="rgba(67,179,174,0.2)" stroke-width="1.5"/>`,
    outerStyle: {
      filter: "drop-shadow(0 0 12px rgba(184,115,51,0.25))",
    },
    thumbnailPath: "M20,56 C10,48 5,38 5,26 L5,8 C5,6 7,4 9,4 L31,4 C33,4 35,6 35,8 L35,26 C35,38 30,48 20,56 Z",
  },
];
