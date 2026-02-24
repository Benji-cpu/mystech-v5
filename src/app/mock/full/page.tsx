import Link from "next/link";

const mocks = [
  {
    id: "v2",
    name: "Full App — Constellation Node Nav",
    description:
      "10-screen app with star-map navigation. Decks, readings, and profile are constellation nodes connected by light trails. Framer Motion.",
  },
  {
    id: "v3",
    name: "Full App — Sidebar + Bottom Nav, Silver-Blue",
    description:
      "10-screen app with left sidebar (desktop) + bottom tab bar (mobile). Silver-blue theme, canvas particle background, mood system. Framer Motion + Cormorant Garamond font.",
  },
  {
    id: "v4",
    name: "Full App — Sidebar + Bottom Nav, Gilded",
    description:
      "10-screen app with same nav pattern as v3. Gold/parchment theme, gilded shell component. Framer Motion.",
  },
  {
    id: "v5",
    name: "Full App — Sidebar + Bottom Nav, Cyan Ink",
    description:
      "10-screen app with same nav pattern. Cyan/teal cyberpunk theme, canvas ink particle background. Framer Motion + Lucide icons.",
  },
  {
    id: "v6",
    name: "Full App — Sidebar + Bottom Nav, Gold Threads",
    description:
      "10-screen app with same nav pattern. Gold art deco theme, canvas thread/string background with spring physics. Framer Motion + Playfair Display font.",
  },
  {
    id: "v7",
    name: "Mirror Transition Explorer",
    description:
      "Playground showcasing watery/fluid transition effects inside decorative mirror frames. 12 mirrors x 14 transitions x 10 content views.",
  },
  {
    id: "v8",
    name: "Full App — Always-Mounted Views",
    description:
      "10-screen app where all views stay in DOM simultaneously. Visibility via opacity/scale/blur — no unmounting. Purple theme, crescent moon, canvas particles. Framer Motion LayoutGroup.",
  },
  {
    id: "v9",
    name: "Lyra Journey",
    description:
      "AI guide Lyra leads an immersive reading journey. Persistent shell with animated zones and phase transitions.",
  },
  {
    id: "v10",
    name: "5-Phase Journey — GSAP + Canvas Ribbons",
    description:
      "Immersive 5-phase journey (not tab nav). GSAP timeline choreography, canvas aurora ribbons, SVG constellation + connections. Evolution of Lyra v9.",
  },
];

export default function FullMockIndexPage() {
  return (
    <div className="min-h-screen bg-[#0a0118] p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white/90">
            Full App Mocks
          </h1>
          <p className="text-white/50 text-sm">
            7 app mocks exploring different navigation patterns and visual themes
          </p>
        </div>

        <div className="space-y-3">
          {mocks.map((mock) => (
            <Link
              key={mock.id}
              href={`/mock/full/${mock.id}`}
              className="block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-[#c9a94e]/30 transition-all group shadow-lg shadow-purple-900/20"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 font-mono shrink-0">
                      {mock.id}
                    </span>
                    <h3 className="text-lg font-semibold text-white/90 group-hover:text-[#c9a94e] transition-colors truncate">
                      {mock.name}
                    </h3>
                  </div>
                  <p className="text-white/40 text-sm mt-1">
                    {mock.description}
                  </p>
                </div>
                <span className="text-white/20 text-xl group-hover:text-[#c9a94e] transition-colors shrink-0">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
