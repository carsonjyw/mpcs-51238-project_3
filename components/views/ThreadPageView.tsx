"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useFlash } from "@/lib/flash";
import { useStore } from "@/lib/store";
import { getThread } from "@/lib/threads";
import type { Thread } from "@/lib/types";
import { Breadcrumbs } from "../Breadcrumbs";
import { DocumentTitle } from "../DocumentTitle";
import { PageLoading, ThreadNotFound } from "../PageStates";
import { ThreadExplorer } from "../thread/ThreadExplorer";
import { Notice } from "../ui/Notice";

// Step 4: the result of the first visit, the person's own question-centered map.
// Editing, connecting, next steps and deletion return in later steps
// (full version in pending/components/views/ThreadPageView.tsx).

export function ThreadPageView() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  if (store.status === "loading") return <PageLoading label="Loading this thread…" />;
  const thread = getThread(store.data, id);
  if (!thread) return <ThreadNotFound />;
  return <ThreadPage key={thread.id} thread={thread} isFirst={store.data.threads.length === 1} />;
}

function ThreadPage({ thread, isFirst }: { thread: Thread; isFirst: boolean }) {
  // Set by the start form: "Saved in this browser." only when the write succeeded, otherwise a session-only warning.
  const notice = useFlash(thread.id);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Arriving from the start form: move focus to the question so the result is announced in context.
  useEffect(() => {
    if (notice?.arrived) headingRef.current?.focus();
  }, [notice]);

  return (
    <div className="mx-auto max-w-6xl">
      <DocumentTitle title={thread.question} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: thread.question }]} />

      {/* A compact heading: the question itself is the center of the map right below, so it isn't repeated here. */}
      <header>
        <h1 ref={headingRef} tabIndex={-1} className="text-[1.75rem] leading-[1.2] sm:text-[2.25rem]">
          {isFirst ? "Your first map" : "Your map"}
        </h1>
        <p className="mt-1 line-clamp-2 text-ink-muted">
          Started from <span className="book-title text-ink">{thread.readings[0].title}</span>
        </p>
        <Notice tone={notice?.tone} quiet className="mt-3">
          {notice?.message}
        </Notice>
      </header>

      <div className="mt-6">
        <ThreadExplorer thread={thread} readOnly quietHeading panelOnDemand />
      </div>
    </div>
  );
}
