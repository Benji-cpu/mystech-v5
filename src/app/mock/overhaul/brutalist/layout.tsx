// Brutalist Raw — "Like Co-Star × Playtype × independent art-show catalogs."
// Pure black and bone white. Single yellow accent. Oversized bold sans.
// No ornament, no chrome, no borders. Confident emptiness.

export default function BrutalistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="brutalist-variant"
      style={{
        ["--bone" as string]: "#F4F1EB",
        ["--black" as string]: "#0A0A0A",
        ["--yellow" as string]: "#E8D547",
        ["--mid" as string]: "#4A4844",
        ["--dim" as string]: "#8A8680",
      }}
    >
      <style>{`
        .brutalist-variant {
          background: var(--bone);
          color: var(--black);
          min-height: 100dvh;
          font-family: var(--font-inter), 'Helvetica Neue', system-ui, sans-serif;
          font-feature-settings: "ss01", "cv11";
        }
        .brutalist-variant .display {
          font-family: var(--font-inter), 'Helvetica Neue', system-ui, sans-serif;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 0.88;
        }
        .brutalist-variant .display-tight {
          font-family: var(--font-inter), 'Helvetica Neue', system-ui, sans-serif;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 0.9;
        }
        .brutalist-variant .mono {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
        }
        .brutalist-variant .eyebrow {
          font-family: var(--font-inter), 'Helvetica Neue', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 10px;
          font-weight: 700;
        }
        .brutalist-variant .divider {
          height: 2px;
          background: var(--black);
        }
      `}</style>
      {children}
    </div>
  );
}
