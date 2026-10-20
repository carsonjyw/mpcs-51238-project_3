"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { newThreadPath } from "@/lib/navigation";
import { useStore } from "@/lib/store";

function HeaderFrame({ children }: { children: React.ReactNode }) {
  return (
    <header className="px-[18px] lg:px-14">
      <nav aria-label="Main" className="masthead">
        {children}
      </nav>
    </header>
  );
}

function Wordmark({ current }: { current?: boolean }) {
  return (
    <Link href="/" className="wordmark" aria-current={current ? "page" : undefined}>
      Reading <i>Map</i>
    </Link>
  );
}

/** Shown while the header reads the URL. */
export function SiteHeaderShell() {
  return (
    <HeaderFrame>
      <Wordmark />
    </HeaderFrame>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const store = useStore();
  // Hidden until the first thread exists: on the first visit the start form is already on screen.
  const hasThreads = store.status === "ready" && store.data.threads.length > 0;

  // "+ New thread" returns to the thread being viewed when cancelled.
  const threadMatch = pathname.match(/^\/threads\/([^/]+)/);
  const currentThreadId = threadMatch && threadMatch[1] !== "new" ? decodeURIComponent(threadMatch[1]) : undefined;

  return (
    <HeaderFrame>
      <Wordmark current={pathname === "/"} />
      {hasThreads ? (
        <Link
          href={newThreadPath(currentThreadId)}
          aria-current={pathname === "/threads/new" ? "page" : undefined}
          className="inline-flex min-h-9 items-center rounded-full border border-ink px-4 text-[0.875rem] font-medium text-ink hover:bg-ink hover:text-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper"
        >
          <span aria-hidden="true">+&nbsp;</span>New thread
        </Link>
      ) : (
        <span className="folio hidden sm:inline">A journal for following questions</span>
      )}
    </HeaderFrame>
  );
}
