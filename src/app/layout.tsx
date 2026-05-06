import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Alegreya, Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MysTech - AI Oracle Card Readings",
  description:
    "Create personalized oracle card decks from your life experiences, perform AI-powered readings, and share your mystical insights with others.",
  applicationName: "MysTech",
};

export const viewport: Viewport = {
  themeColor: "#15110E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${alegreya.variable} ${fraunces.variable} ${inter.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster richColors position="bottom-right" />
        <Analytics />
      </body>
    </html>
  );
}
