"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Step 4 (first visit) header. The "+ New thread" link returns with the rest of the
// navigation in a later step; the full version is in pending/components/SiteHeader.tsx.

const brandClasses = "group inline-flex items-center gap-2 font-serif text-[1.3rem] font-medium text-ink";

/** A tiny map: one reading connected to one question. */
function Mark() {
  return (
    <svg aria-hidden="true" width="18" height="22" viewBox="0 0 18 22" className="text-accent">
      <rect x="4.5" y="1" width="9" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="7" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="17" r="4" fill="currentColor" />
    </svg>
  );
}

function HeaderFrame({ children }: { children: React.ReactNode }) {
  return (
    <header className="border-b border-line px-4 sm:px-6">
      <nav aria-label="Main" className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-4">
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
        <Mark />
        <span className="group-hover:text-accent">Reading Map</span>
      </Link>
    </HeaderFrame>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <HeaderFrame>
      <Link href="/" className={brandClasses} aria-current={pathname === "/" ? "page" : undefined}>
        <Mark />
        <span className="group-hover:text-accent">Reading Map</span>
      </Link>
    </HeaderFrame>
  );
}
