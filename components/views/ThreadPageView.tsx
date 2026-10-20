"use client";

import { useParams } from "next/navigation";
import { useEffect, useId, useRef } from "react";
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
  return <ThreadPage key={thread.id} thread={thread} saved={store.persistence === "saved"} />;
}

function ThreadPage({ thread, saved }: { thread: Thread; saved: boolean }) {
  const notice = useFlash(thread.id);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextId = useId();
  const original = thread.readings[0];

  // Arriving from the start form: move focus to the question so the result is announced in context.
  useEffect(() => {
    if (notice?.arrived) headingRef.current?.focus();
  }, [notice]);

  return (
    <div className="mx-auto max-w-5xl">
      <DocumentTitle title={thread.question} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: thread.question }]} />
      <Notice tone={notice?.tone} className="mb-6">
        {notice?.message}
      </Notice>

      <header>
        <p className="text-[0.8rem] font-semibold uppercase tracking-wide text-ink-muted">Your question</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-1 max-w-3xl text-4xl font-semibold sm:text-5xl">
          {thread.question}
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-ink-muted">
          Your question sits at the center of your map, with{" "}
          <span className="font-semibold text-ink">{original.title}</span> as the reading that raised it.{" "}
          {saved
            ? "It's saved in this browser, so it will be here when you come back."
            : "This browser isn't saving it, so it lasts only for this session."}
        </p>
      </header>

      <section aria-labelledby={nextId} className="mt-8 rounded-xl bg-accent-soft p-5">
        <h2 id={nextId} className="font-sans text-[0.8rem] font-semibold uppercase tracking-wide text-accent">
          Where this can go next
        </h2>
        <ul className="mt-2 space-y-1.5 text-lg">
          <li>Connect another reading that supports, challenges, or adds a new perspective to your question.</li>
          <li>Save a next step: one thing to read or think about next.</li>
        </ul>
      </section>

      <div className="mt-10">
        <ThreadExplorer thread={thread} readOnly />
      </div>
    </div>
  );
}
