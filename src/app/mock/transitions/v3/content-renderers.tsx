"use client";

import { useState } from "react";
import Image from "next/image";
import type { ContentTypeId, ContentRendererProps } from "./mirror-types";
import {
  MOCK_DECKS,
  MOCK_ART_STYLES,
  MOCK_USER,
  MOCK_STATS,
  MOCK_ACTIVITY,
  MOCK_READING_INTERPRETATION,
  getAllCards,
} from "../../full/_shared/mock-data-v1";

// ─── Helpers ────────────────────────────────────────────────────────────────

function MirrorImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="300px" />
    </div>
  );
}

// ─── 1. Single Card ─────────────────────────────────────────────────────────

function SingleCard({ width, height }: ContentRendererProps) {
  const card = getAllCards()[0];
  const imgH = height * 0.6;
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-gradient-to-b from-purple-950/80 to-black/90" style={{ width, height }}>
      <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ width: width * 0.65, height: imgH }}>
        <Image src={card.imageUrl} alt={card.title} fill className="object-cover" sizes="300px" />
      </div>
      <h3 className="text-amber-200 font-serif text-lg mt-3 text-center">{card.title}</h3>
      <p className="text-purple-300/70 text-xs mt-1 text-center leading-snug px-2 line-clamp-2">{card.meaning}</p>
    </div>
  );
}

// ─── 2. Card Grid ───────────────────────────────────────────────────────────

function CardGrid({ width, height }: ContentRendererProps) {
  const cards = MOCK_DECKS[0].cards.slice(0, 6);
  return (
    <div className="p-3 bg-gradient-to-br from-purple-950/80 to-black/90 flex flex-col gap-2 overflow-hidden" style={{ width, height }}>
      <p className="text-amber-200/80 text-xs font-medium text-center">Soul&apos;s Garden</p>
      <div className="grid grid-cols-3 gap-1.5 flex-1 min-h-0">
        {cards.map((card) => (
          <div key={card.id} className="relative rounded overflow-hidden bg-white/5">
            <Image src={card.imageUrl} alt={card.title} fill className="object-cover" sizes="100px" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
              <p className="text-[8px] text-white/80 truncate">{card.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Deck Cover ──────────────────────────────────────────────────────────

function DeckCover({ width, height }: ContentRendererProps) {
  const deck = MOCK_DECKS[0];
  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      <Image src={deck.coverUrl} alt={deck.name} fill className="object-cover" sizes="300px" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] bg-amber-600/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-500/30">
            {deck.cardCount} cards
          </span>
        </div>
        <h3 className="text-white font-serif text-xl">{deck.name}</h3>
        <p className="text-white/50 text-xs mt-1 line-clamp-2">{deck.description}</p>
      </div>
    </div>
  );
}

// ─── 4. Three Card Spread ───────────────────────────────────────────────────

function ThreeCardSpread({ width, height }: ContentRendererProps) {
  const cards = getAllCards().slice(0, 3);
  const labels = ["Past", "Present", "Future"];
  const cardW = Math.min((width - 32) / 3 - 4, 80);
  const cardH = cardW * 1.5;
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950/80 to-black/90 p-3 overflow-hidden" style={{ width, height }}>
      <p className="text-amber-200/60 text-[10px] tracking-widest uppercase mb-3">Three Card Reading</p>
      <div className="flex gap-2 items-end">
        {cards.map((card, i) => (
          <div key={card.id} className="flex flex-col items-center">
            <div className="relative rounded overflow-hidden shadow-lg border border-white/10" style={{ width: cardW, height: cardH }}>
              <Image src={card.imageUrl} alt={card.title} fill className="object-cover" sizes="80px" />
            </div>
            <p className="text-purple-300/60 text-[8px] mt-1.5 uppercase tracking-wider">{labels[i]}</p>
            <p className="text-white/80 text-[9px] font-medium">{card.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. Reading Text ────────────────────────────────────────────────────────

function ReadingText({ width, height }: ContentRendererProps) {
  return (
    <div className="relative bg-gradient-to-b from-purple-950/90 to-black/95 p-4 overflow-hidden" style={{ width, height }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-amber-600/30 flex items-center justify-center">
          <span className="text-amber-200 text-[10px]">&#10022;</span>
        </div>
        <p className="text-amber-200/80 text-xs font-medium">Reading Interpretation</p>
      </div>
      <div className="text-purple-200/70 text-[11px] leading-relaxed space-y-2">
        {MOCK_READING_INTERPRETATION.split("\n\n").map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<span class="text-amber-200/90 font-medium">$1</span>') }} />
        ))}
      </div>
      {/* Bottom fade gradient for overflow */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/95 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── 6. Art Style ───────────────────────────────────────────────────────────

function ArtStyleContent({ width, height }: ContentRendererProps) {
  const style = MOCK_ART_STYLES[2]; // Celestial
  return (
    <div className={`bg-gradient-to-br ${style.gradient} p-4 flex flex-col overflow-hidden`} style={{ width, height }}>
      <h3 className="text-white font-serif text-lg">{style.name}</h3>
      <p className="text-white/60 text-[10px] mt-1">{style.description}</p>
      <div className="grid grid-cols-2 gap-1.5 mt-3 flex-1 min-h-0">
        {style.sampleImages.map((img, i) => (
          <div key={i} className="relative rounded overflow-hidden bg-black/20">
            <Image src={img} alt={`${style.name} sample ${i + 1}`} fill className="object-cover" sizes="150px" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 7. User Profile ────────────────────────────────────────────────────────

function UserProfile({ width, height }: ContentRendererProps) {
  const user = MOCK_USER;
  const stats = MOCK_STATS;
  return (
    <div className="bg-gradient-to-b from-purple-950/80 to-black/90 flex flex-col items-center justify-center p-4 overflow-hidden" style={{ width, height }}>
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600/40 to-purple-600/40 border-2 border-amber-500/30 flex items-center justify-center">
        <span className="text-amber-200 text-xl font-serif">
          {user.name.split(" ").map(n => n[0]).join("")}
        </span>
      </div>
      <h3 className="text-white font-serif text-lg mt-3">{user.name}</h3>
      <span className="text-[10px] bg-purple-600/30 text-purple-200 px-2 py-0.5 rounded-full border border-purple-500/30 mt-1 uppercase tracking-wider">
        {user.plan} plan
      </span>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
        {[
          { label: "Decks", value: stats.totalDecks },
          { label: "Cards", value: stats.totalCards },
          { label: "Readings", value: stats.totalReadings },
          { label: "Credits", value: `${stats.creditsUsed}/${stats.creditsTotal}` },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-white text-sm font-medium">{s.value}</p>
            <p className="text-purple-300/50 text-[9px] uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 8. Activity Feed ───────────────────────────────────────────────────────

function ActivityFeed({ width, height }: ContentRendererProps) {
  const icons: Record<string, string> = { sparkles: "\u2728", layers: "\u25A3", plus: "+", palette: "\u25C6" };
  const items = MOCK_ACTIVITY.slice(0, 3);
  return (
    <div className="bg-gradient-to-b from-purple-950/80 to-black/90 p-4 overflow-hidden" style={{ width, height }}>
      <p className="text-amber-200/80 text-xs font-medium mb-3">Recent Activity</p>
      <div className="space-y-2.5">
        {items.map((act) => (
          <div key={act.id} className="flex items-start gap-2.5 bg-white/5 rounded-lg p-2.5">
            <div className="w-7 h-7 rounded-full bg-purple-600/20 flex items-center justify-center shrink-0">
              <span className="text-purple-300 text-xs">{icons[act.icon] ?? "\u2022"}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white/90 text-[11px] font-medium truncate">{act.title}</p>
              <p className="text-purple-300/50 text-[9px] truncate">{act.subtitle}</p>
              <p className="text-purple-300/30 text-[8px] mt-0.5">{act.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 9. Stats Dashboard ─────────────────────────────────────────────────────

function StatsDashboard({ width, height }: ContentRendererProps) {
  const stats = MOCK_STATS;
  const items = [
    { label: "Decks", value: stats.totalDecks, color: "from-purple-600/30 to-purple-800/30" },
    { label: "Cards", value: stats.totalCards, color: "from-amber-600/30 to-amber-800/30" },
    { label: "Readings", value: stats.totalReadings, color: "from-indigo-600/30 to-indigo-800/30" },
    { label: "Credits", value: `${stats.creditsUsed}/${stats.creditsTotal}`, color: "from-emerald-600/30 to-emerald-800/30" },
  ];
  return (
    <div className="bg-gradient-to-b from-purple-950/80 to-black/90 p-4 flex flex-col overflow-hidden" style={{ width, height }}>
      <p className="text-amber-200/80 text-xs font-medium mb-3 text-center">Dashboard</p>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {items.map((item) => (
          <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-xl border border-white/10 flex flex-col items-center justify-center p-2`}>
            <p className="text-white text-2xl font-bold">{item.value}</p>
            <p className="text-white/50 text-[10px] uppercase tracking-wider mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 10. Card Detail (Flippable) ────────────────────────────────────────────

function CardDetail({ width, height }: ContentRendererProps) {
  const [flipped, setFlipped] = useState(false);
  const card = getAllCards()[2];
  const cardW = Math.min(width * 0.75, 200);
  const cardH = cardW * 1.5;
  return (
    <div
      className="bg-gradient-to-b from-purple-950/80 to-black/90 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      style={{ width, height }}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="relative" style={{ width: cardW, height: cardH, perspective: 800 }}>
        <div
          className="absolute inset-0 transition-transform duration-700"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}
        >
          {/* Front */}
          <div className="absolute inset-0 rounded-lg overflow-hidden border border-white/15 shadow-xl" style={{ backfaceVisibility: "hidden" }}>
            <Image src={card.imageUrl} alt={card.title} fill className="object-cover" sizes="200px" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-white font-serif text-sm">{card.title}</p>
            </div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-900 to-indigo-950 border border-amber-500/20 flex flex-col items-center justify-center p-4"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-amber-200 font-serif text-sm text-center">{card.title}</p>
            <div className="w-8 h-px bg-amber-500/30 my-2" />
            <p className="text-purple-200/70 text-[10px] text-center leading-relaxed">{card.meaning}</p>
            <p className="text-purple-200/50 text-[9px] text-center leading-relaxed mt-2">{card.guidance}</p>
          </div>
        </div>
      </div>
      <p className="text-purple-300/40 text-[9px] mt-3">Tap to flip</p>
    </div>
  );
}

// ─── 11. Five Card Spread ───────────────────────────────────────────────────

function FiveCardSpread({ width, height }: ContentRendererProps) {
  const cards = getAllCards().slice(0, 5);
  const cardW = Math.min((width - 40) / 4, 55);
  const cardH = cardW * 1.4;
  const positions = [
    { x: 0, y: 0 },       // left
    { x: 1, y: -0.5 },    // top
    { x: 1, y: 0.5 },     // bottom
    { x: 2, y: 0 },       // center-right
    { x: 1, y: 0 },       // center
  ];
  return (
    <div className="bg-gradient-to-b from-indigo-950/80 to-black/90 flex items-center justify-center overflow-hidden" style={{ width, height }}>
      <div className="relative" style={{ width: cardW * 3 + 16, height: cardH * 2 + 20 }}>
        {cards.map((card, i) => {
          const pos = positions[i];
          return (
            <div
              key={card.id}
              className="absolute rounded overflow-hidden border border-white/10 shadow-lg"
              style={{
                width: cardW,
                height: cardH,
                left: pos.x * (cardW + 4),
                top: `calc(50% + ${pos.y * (cardH * 0.55)}px - ${cardH / 2}px)`,
              }}
            >
              <Image src={card.imageUrl} alt={card.title} fill className="object-cover" sizes="60px" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 12. Deck List ──────────────────────────────────────────────────────────

function DeckList({ width, height }: ContentRendererProps) {
  const decks = MOCK_DECKS.slice(0, 3);
  return (
    <div className="bg-gradient-to-b from-purple-950/80 to-black/90 p-3 overflow-hidden" style={{ width, height }}>
      <p className="text-amber-200/80 text-xs font-medium mb-2">Your Decks</p>
      <div className="space-y-2">
        {decks.map((deck) => (
          <div key={deck.id} className="flex items-center gap-2.5 bg-white/5 rounded-lg p-2 border border-white/5">
            <div className="relative w-10 h-14 rounded overflow-hidden shrink-0">
              <Image src={deck.coverUrl} alt={deck.name} fill className="object-cover" sizes="40px" />
            </div>
            <div className="min-w-0">
              <p className="text-white/90 text-[11px] font-medium truncate">{deck.name}</p>
              <p className="text-purple-300/50 text-[9px] truncate">{deck.description}</p>
              <p className="text-purple-300/30 text-[8px] mt-0.5">{deck.cardCount} cards</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Renderer Map ───────────────────────────────────────────────────────────

const RENDERERS: Record<ContentTypeId, React.FC<ContentRendererProps>> = {
  "single-card": SingleCard,
  "card-grid": CardGrid,
  "deck-cover": DeckCover,
  "three-card-spread": ThreeCardSpread,
  "reading-text": ReadingText,
  "art-style": ArtStyleContent,
  "user-profile": UserProfile,
  "activity-feed": ActivityFeed,
  "stats-dashboard": StatsDashboard,
  "card-detail": CardDetail,
  "five-card-spread": FiveCardSpread,
  "deck-list": DeckList,
};

export function renderContent(contentId: ContentTypeId, width: number, height: number) {
  const Renderer = RENDERERS[contentId];
  return <Renderer width={width} height={height} />;
}
