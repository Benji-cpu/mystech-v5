// Editorial Paper — "Like The Pattern × Kinfolk × Apple rare-book pages."
// Warm cream background, Fraunces display, generous whitespace, hairline rules,
// gold used sparingly for earned moments only.

export default function EditorialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="editorial-variant"
      style={{
        // Palette
        ["--paper" as string]: "#F5EFE4",
        ["--paper-warm" as string]: "#EFE7D6",
        ["--paper-card" as string]: "#FBF7EE",
        ["--ink" as string]: "#1A1614",
        ["--ink-soft" as string]: "#3D342E",
        ["--ink-mute" as string]: "#7A6E63",
        ["--ink-faint" as string]: "#B5A898",
        ["--line" as string]: "#E0D5BF",
        ["--line-soft" as string]: "#EBE1CC",
        ["--gold" as string]: "#A8863F",
        ["--accent-deep" as string]: "#2A2130",
      }}
    >
      <style>{`
        .editorial-variant {
          background: var(--paper);
          color: var(--ink);
          min-height: 100dvh;
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        .editorial-variant .display { font-family: var(--font-fraunces), Georgia, serif; letter-spacing: -0.02em; }
        .editorial-variant .whisper { font-family: var(--font-fraunces), Georgia, serif; font-style: italic; }
        .editorial-variant .eyebrow { font-family: var(--font-inter), system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.14em; font-size: 11px; font-weight: 500; color: var(--ink-mute); }
        .editorial-variant .hair { border-color: var(--line); }
      `}</style>
      {children}
    </div>
  );
}
