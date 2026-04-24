import Link from "next/link";

const STYLES = [
  {
    slug: "editorial",
    name: "Editorial Paper",
    reference: "Like The Pattern × Kinfolk",
    tagline: "Quiet confidence. Cards as precious objects.",
    palette: ["#F5EFE4", "#1A1614", "#3D342E", "#A8863F"],
    preview: { bg: "#F5EFE4", fg: "#1A1614", accent: "#A8863F" },
    serif: "'Fraunces', Georgia, serif",
    label: "Editorial",
  },
  {
    slug: "cinematic",
    name: "Deep Cinematic",
    reference: "Like Sanctuary × Othership",
    tagline: "Dark, atmospheric, emotional.",
    palette: ["#07050E", "#17112B", "#D4B158", "#EDE4D0"],
    preview: { bg: "#07050E", fg: "#EDE4D0", accent: "#D4B158" },
    serif: "Alegreya, serif",
    label: "Cinematic",
  },
  {
    slug: "brutalist",
    name: "Brutalist Raw",
    reference: "Like Co-Star × Playtype",
    tagline: "Oversized, confident, unapologetic.",
    palette: ["#F4F1EB", "#0A0A0A", "#E8D547", "#4A4844"],
    preview: { bg: "#F4F1EB", fg: "#0A0A0A", accent: "#E8D547" },
    serif: "'Inter', sans-serif",
    label: "Brutalist",
  },
  {
    slug: "analog",
    name: "Analog Handmade",
    reference: "Like Chani × Labyrinthos",
    tagline: "Paper textures, warm tones, tactile.",
    palette: ["#EFE4CD", "#2E2318", "#A34B2A", "#4A5B3D"],
    preview: { bg: "#EFE4CD", fg: "#2E2318", accent: "#A34B2A" },
    serif: "'Instrument Serif', Georgia, serif",
    label: "Analog",
  },
];

const PAGES = [
  { slug: "home", name: "Home", desc: "Daily re-entry" },
  { slug: "reading", name: "Reading ceremony", desc: "The three-card reveal" },
  { slug: "library", name: "Decks library", desc: "Your collection" },
  { slug: "card", name: "Card detail", desc: "One card, close up" },
];

export default function OverhaulGallery() {
  return (
    <div className="min-h-[100dvh] bg-[#F7F4EE] px-6 py-12 sm:px-10" style={{ color: "#1A1614" }}>
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: "#7A6E63" }}>
            MysTech · Style Gallery
          </p>
          <h1
            className="mt-4 text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95]"
            style={{ fontFamily: "'Fraunces', Georgia, serif", letterSpacing: "-0.02em" }}
          >
            Four directions.
          </h1>
          <p
            className="mt-5 max-w-xl text-lg leading-relaxed italic"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: "#3D342E" }}
          >
            Each style renders the same four pages. Compare, flip between them, pick the one that feels right — or tell me which elements to blend from where.
          </p>
        </header>

        {/* By Style */}
        <section className="mt-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: "#7A6E63" }}>
            By Style
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {STYLES.map((s) => (
              <StyleCard key={s.slug} style={s} />
            ))}
          </div>
        </section>

        {/* By Page (comparison view) */}
        <section className="mt-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: "#7A6E63" }}>
            By Page — for side-by-side comparison
          </p>
          <div className="mt-6 space-y-5">
            {PAGES.map((p) => (
              <div key={p.slug} className="rounded-2xl border p-5" style={{ borderColor: "#E0D5BF", background: "#FBF7EE" }}>
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-2xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                      {p.name}
                    </h3>
                    <p className="text-sm" style={{ color: "#7A6E63" }}>{p.desc}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {STYLES.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/mock/overhaul/${s.slug}/${p.slug}`}
                      className="group flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:border-[#1A1614]"
                      style={{ borderColor: "#E0D5BF" }}
                    >
                      <span className="text-sm">{s.label}</span>
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ background: s.preview.accent, boxShadow: `inset 0 0 0 1.5px ${s.preview.bg}` }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20 border-t pt-8" style={{ borderColor: "#E0D5BF" }}>
          <p className="text-xs" style={{ color: "#7A6E63" }}>
            Non-functional visual prototypes · mobile-first · hardcoded data · each variant is self-contained
          </p>
        </footer>
      </div>
    </div>
  );
}

function StyleCard({ style }: { style: typeof STYLES[number] }) {
  return (
    <div
      className="group overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg"
      style={{ borderColor: "#E0D5BF" }}
    >
      {/* Preview panel */}
      <Link
        href={`/mock/overhaul/${style.slug}/home`}
        className="block relative p-6 pt-12 pb-14"
        style={{ background: style.preview.bg, color: style.preview.fg, minHeight: "220px" }}
      >
        <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: style.preview.accent, fontWeight: 500 }}>
          {style.reference}
        </div>
        <h3 className="mt-2 text-3xl leading-tight" style={{ fontFamily: style.serif, fontWeight: style.slug === "brutalist" ? 900 : 400, letterSpacing: style.slug === "brutalist" ? "-0.03em" : undefined }}>
          {style.slug === "brutalist" ? "GOOD EVENING." : "Good evening,"}
        </h3>
        <p
          className="mt-1 text-2xl italic"
          style={{
            fontFamily: style.serif,
            color: style.preview.accent,
            letterSpacing: style.slug === "brutalist" ? "-0.03em" : undefined,
            fontStyle: style.slug === "brutalist" ? "normal" : "italic",
            fontWeight: style.slug === "brutalist" ? 800 : 400,
          }}
        >
          {style.slug === "brutalist" ? "BENJI." : "Benji."}
        </p>

        {/* Palette strip */}
        <div className="absolute bottom-4 left-6 right-6 flex h-3 overflow-hidden rounded-full border" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          {style.palette.map((c) => (
            <div key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </Link>

      {/* Meta row */}
      <div className="flex items-center justify-between p-5" style={{ background: "#FBF7EE" }}>
        <div>
          <h4 className="text-base font-semibold" style={{ color: "#1A1614" }}>
            {style.name}
          </h4>
          <p className="mt-0.5 text-sm" style={{ color: "#7A6E63" }}>{style.tagline}</p>
        </div>
        <Link
          href={`/mock/overhaul/${style.slug}/home`}
          className="rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-[#1A1614] hover:text-[#F5EFE4]"
          style={{ borderColor: "#1A1614", color: "#1A1614" }}
        >
          Open →
        </Link>
      </div>

      {/* Page links row */}
      <div className="grid grid-cols-4 border-t text-xs" style={{ borderColor: "#E0D5BF", background: "#F5EFE4" }}>
        {PAGES.map((p, i) => (
          <Link
            key={p.slug}
            href={`/mock/overhaul/${style.slug}/${p.slug}`}
            className="py-3 text-center transition-colors hover:bg-[#EFE7D6]"
            style={{ borderLeft: i > 0 ? "1px solid #E0D5BF" : undefined, color: "#3D342E" }}
          >
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
