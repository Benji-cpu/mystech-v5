// Deep Cinematic — "Like Sanctuary × Othership × Arc Browser ambient gradients."
// Dark indigo atmosphere, gold reward accents, breathing gradients,
// serif display with generous tracking.

export default function CinematicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="cinematic-variant"
      style={{
        ["--bg" as string]: "#07050E",
        ["--bg-mid" as string]: "#0F0A1C",
        ["--surface" as string]: "rgba(26, 20, 40, 0.6)",
        ["--surface-solid" as string]: "#17112B",
        ["--ink" as string]: "#EDE4D0",
        ["--ink-soft" as string]: "#B9AC92",
        ["--ink-mute" as string]: "#6B6178",
        ["--line" as string]: "rgba(237, 228, 208, 0.1)",
        ["--line-strong" as string]: "rgba(237, 228, 208, 0.2)",
        ["--gold" as string]: "#D4B158",
        ["--gold-soft" as string]: "#8F7635",
        ["--violet" as string]: "#4E2F7A",
      }}
    >
      <style>{`
        .cinematic-variant {
          min-height: 100dvh;
          font-family: var(--font-inter), system-ui, sans-serif;
          color: var(--ink);
          background:
            radial-gradient(ellipse 70% 60% at 50% 0%, rgba(78, 47, 122, 0.5) 0%, transparent 60%),
            radial-gradient(ellipse 80% 80% at 80% 100%, rgba(212, 177, 88, 0.08) 0%, transparent 55%),
            var(--bg);
          background-attachment: fixed;
        }
        .cinematic-variant .display { font-family: var(--font-alegreya), Georgia, serif; letter-spacing: -0.01em; }
        .cinematic-variant .whisper { font-family: var(--font-alegreya), Georgia, serif; font-style: italic; letter-spacing: 0.005em; }
        .cinematic-variant .eyebrow { text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; font-weight: 500; color: var(--gold); }
        .cinematic-variant .surface { background: var(--surface); backdrop-filter: blur(20px); border: 1px solid var(--line); }
        @keyframes cin-breathe {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        .cinematic-variant .breathe { animation: cin-breathe 8s ease-in-out infinite; }
        @keyframes cin-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .cinematic-variant .float { animation: cin-float 5s ease-in-out infinite; }
        @keyframes cin-starfield {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        .cinematic-variant .stars {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(1px 1px at 20% 30%, rgba(237,228,208,0.6), transparent),
            radial-gradient(1px 1px at 60% 70%, rgba(237,228,208,0.4), transparent),
            radial-gradient(1px 1px at 80% 10%, rgba(237,228,208,0.5), transparent),
            radial-gradient(1px 1px at 35% 85%, rgba(212,177,88,0.3), transparent),
            radial-gradient(1px 1px at 90% 40%, rgba(237,228,208,0.3), transparent);
          background-size: 100% 100%;
        }
      `}</style>
      <div className="stars" />
      {children}
    </div>
  );
}
