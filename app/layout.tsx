import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import { Suspense } from "react";
import { FlashRouteWatcher } from "@/components/FlashRouteWatcher";
import { RouteFocus } from "@/components/RouteFocus";
import { SiteHeader, SiteHeaderShell } from "@/components/SiteHeader";
import { StorageBanner } from "@/components/StorageBanner";
import "./globals.css";

// Concept A type: Instrument Serif for the wordmark, headings, book titles and questions;
// IBM Plex Sans for reading and controls; IBM Plex Mono for small editorial annotations.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Reading Map",
  description: "Follow a question across what you read. Connect readings, note what each adds, and save your next step.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded bg-accent px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <Suspense fallback={<SiteHeaderShell />}>
          <SiteHeader />
          <FlashRouteWatcher />
          <RouteFocus />
        </Suspense>
        <StorageBanner />
        <main id="main" tabIndex={-1} className="flex-1 px-[18px] pb-16 pt-7 lg:px-14 lg:pt-11">
          {children}
        </main>
      </body>
    </html>
  );
}
