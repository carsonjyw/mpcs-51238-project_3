import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { Suspense } from "react";
import { FlashRouteWatcher } from "@/components/FlashRouteWatcher";
import { SiteHeader, SiteHeaderShell } from "@/components/SiteHeader";
import { StorageBanner } from "@/components/StorageBanner";
import "./globals.css";

// Newsreader for the wordmark, headings, book titles and questions; Manrope for everything you read and operate.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reading Map",
  description: "Follow a question across what you read. Connect readings, note what each adds, and save your next step.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable} antialiased`}>
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
        <main id="main" tabIndex={-1} className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:pt-10">
          {children}
        </main>
      </body>
    </html>
  );
}
