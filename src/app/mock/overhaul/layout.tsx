import type { Metadata } from "next";
import { Fraunces, Inter, Instrument_Serif } from "next/font/google";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "MysTech — Overhaul Mocks",
};

export default function OverhaulLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${instrumentSerif.variable} overhaul-root`}
    >
      <style>{`
        .overhaul-root {
          min-height: 100dvh;
          -webkit-font-smoothing: antialiased;
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        .overhaul-root .font-fraunces { font-family: var(--font-fraunces), Georgia, serif; }
        .overhaul-root .font-inter { font-family: var(--font-inter), system-ui, sans-serif; }
        .overhaul-root .font-instrument { font-family: var(--font-instrument), Georgia, serif; }
        .overhaul-root .font-alegreya { font-family: var(--font-alegreya), Georgia, serif; }
      `}</style>
      {children}
    </div>
  );
}
