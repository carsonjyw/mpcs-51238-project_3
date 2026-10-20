"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Step 4 (first visit) header. The "+ New thread" link returns with the rest of the
// navigation in a later step; the full version is in pending/components/SiteHeader.tsx.

const brandClasses = "font-serif text-2xl font-semibold tracking-tight text-ink hover:text-accent";

function HeaderFrame({ children }: { children: React.ReactNode }) {
  return (
    <header className="border-b border-line bg-paper-raised/70">
      <nav aria-label="Main" className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        {children}
      </nav>
    </header>
  );
}

/** Shown while the header reads the URL. */
export function SiteHeaderShell() {
  return (
    <HeaderFrame>
      <Link href="/" className={brandClasses}>
        Reading Map
      </Link>
    </HeaderFrame>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <HeaderFrame>
      <Link href="/" className={brandClasses} aria-current={pathname === "/" ? "page" : undefined}>
        Reading Map
      </Link>
    </HeaderFrame>
  );
}
