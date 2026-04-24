// Analog Handmade — "Like Chani × Labyrinthos × Rider-Waite plates × risograph zines."
// Parchment paper, rust-red accent, moss green, ink-brown. Noise grain.
// Hand-drawn feel, warm organic tones, tactile and personal.

export default function AnalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="analog-variant"
      style={{
        ["--parchment" as string]: "#EFE4CD",
        ["--parchment-warm" as string]: "#E5D8BC",
        ["--parchment-card" as string]: "#F4EBD4",
        ["--ink-brown" as string]: "#2E2318",
        ["--ink-soft" as string]: "#5A4632",
        ["--ink-faint" as string]: "#8F7A5F",
        ["--rust" as string]: "#A34B2A",
        ["--rust-deep" as string]: "#6E2F18",
        ["--moss" as string]: "#4A5B3D",
        ["--moss-deep" as string]: "#2F3A26",
        ["--line" as string]: "#C9B994",
      }}
    >
      <style>{`
        .analog-variant {
          min-height: 100dvh;
          color: var(--ink-brown);
          font-family: var(--font-inter), system-ui, sans-serif;
          background-color: var(--parchment);
          background-image:
            radial-gradient(circle at 20% 10%, rgba(163, 75, 42, 0.04) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(74, 91, 61, 0.05) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.18 0 0 0 0 0.14 0 0 0 0 0.09 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
          background-attachment: fixed;
        }
        .analog-variant .display {
          font-family: var(--font-instrument), 'Cormorant Garamond', Georgia, serif;
          letter-spacing: 0;
          line-height: 0.98;
        }
        .analog-variant .display-italic {
          font-family: var(--font-instrument), Georgia, serif;
          font-style: italic;
          letter-spacing: 0;
        }
        .analog-variant .whisper {
          font-family: var(--font-fraunces), Georgia, serif;
          font-style: italic;
          letter-spacing: 0.005em;
        }
        .analog-variant .eyebrow {
          font-family: var(--font-inter), system-ui, sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          font-size: 10px;
          font-weight: 500;
          color: var(--rust);
        }
        .analog-variant .stamp {
          display: inline-block;
          padding: 2px 8px;
          border: 1px solid var(--rust);
          color: var(--rust);
          font-family: var(--font-inter), system-ui, sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 9px;
          font-weight: 600;
          transform: rotate(-1.5deg);
        }
        .analog-variant .paper {
          background: var(--parchment-card);
          position: relative;
        }
        .analog-variant .paper::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.12 0 0 0 0 0.08 0 0 0 0.07 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23p)'/%3E%3C/svg%3E");
          border-radius: inherit;
          opacity: 0.6;
        }
        .analog-variant .hair { border-color: var(--line); }
        .analog-variant .drop-cap::first-letter {
          font-family: var(--font-instrument), Georgia, serif;
          float: left;
          font-size: 4.5em;
          line-height: 0.85;
          padding: 6px 8px 0 0;
          color: var(--rust);
        }
      `}</style>
      {children}
    </div>
  );
}
