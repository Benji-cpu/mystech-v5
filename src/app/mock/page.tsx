import Link from "next/link";

const categories = [
  {
    href: "/mock/approved",
    title: "Approved Mocks",
    description:
      "Reference implementations approved for production — full app navigation, reading flow, background system, card morph techniques, and Lyra journey.",
    count: 5,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    href: "/mock/paths",
    title: "Path Journey",
    description:
      "Immersive spiritual journey prototype — winding trail map, waypoint progression, inline card readings, daily pacing, mood shifts per location.",
    count: 1,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
    color: "border-[#c9a94e]/30 bg-[#c9a94e]/5 hover:border-[#c9a94e]/50 hover:bg-[#c9a94e]/10",
    iconBg: "bg-[#c9a94e]/10 text-[#c9a94e]",
  },
];

export default function MockHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mock Hub</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Immersive flow prototypes — approved references and path journey experience.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`block rounded-xl border p-5 transition-colors ${cat.color}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cat.iconBg}`}>
                  {cat.icon}
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{cat.title}</h2>
                  <span className="text-xs text-muted-foreground">
                    {cat.count} {cat.count === 1 ? "experience" : "experiences"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
