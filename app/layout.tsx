import type { Metadata } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import { Suspense } from "react";
import { FlashRouteWatcher } from "@/components/FlashRouteWatcher";
import { SiteHeader, SiteHeaderShell } from "@/components/SiteHeader";
import { StorageBanner } from "@/components/StorageBanner";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reading Map",
  description: "Follow a question across what you read. Connect readings, note what each adds, and save your next step.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${sourceSans.variable} antialiased`}>
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
        </Suspense>
        <StorageBanner />
        <main id="main" tabIndex={-1} className="flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
          {children}
        </main>
        <footer className="border-t border-line px-4 py-6 text-center text-sm text-ink-muted sm:px-6">
          Reading Map keeps everything in this browser. No account needed.
        </footer>
      </body>
    </html>
  );
}
