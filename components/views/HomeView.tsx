"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { EXAMPLE_THREAD } from "@/lib/example";
import { threadPath } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { threadsByActivity } from "@/lib/threads";
import type { Thread } from "@/lib/types";
import { DocumentTitle } from "../DocumentTitle";
import { PageLoading } from "../PageStates";
import { StartThreadForm } from "../forms/StartThreadForm";
import { ThreadExplorer } from "../thread/ThreadExplorer";
import { Button } from "../ui/Button";
import { Disclosure } from "../ui/Disclosure";

// Step 4: the home page is the first visit. The designed returning view comes in a later step
// (full version in pending/components/views/HomeView.tsx); until then, a saved thread is linked above the form.

export function HomeView() {
  const store = useStore();
  if (store.status === "loading") return <PageLoading />;
  const latest = threadsByActivity(store.data)[0];
  return <FirstVisit latest={latest} />;
}

const STEPS = ["Ask a question", "Connect readings", "Save your next step"];

function FirstVisit({ latest }: { latest?: Thread }) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [exampleOpen, setExampleOpen] = useState(false);
  const formHeadingId = useId();

  return (
    <div className="mx-auto max-w-2xl">
      <DocumentTitle title="Follow a question across what you read" />
      {latest ? (
        <p className="mb-6 rounded-lg border border-line bg-paper-raised px-4 py-3">
          <span className="text-ink-muted">Your saved exploration: </span>
          <Link href={threadPath(latest.id)} className="font-semibold text-accent underline underline-offset-4">
            {latest.question}
          </Link>
        </p>
      ) : null}
      <h1 className="text-4xl font-semibold sm:text-5xl">Follow a question across what you read.</h1>
      <ol aria-label="How it works" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-lg">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex size-7 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent"
            >
              {index + 1}
            </span>
            <span>{step}</span>
            {index < STEPS.length - 1 ? (
              <span aria-hidden="true" className="text-ink-muted">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <section
        aria-labelledby={formHeadingId}
        className="mt-8 rounded-2xl border border-line bg-paper-raised p-5 shadow-sm sm:p-8"
      >
        <h2 id={formHeadingId} className="mb-6 text-2xl font-semibold sm:text-3xl">
          {latest ? "Start another exploration" : "Start your first exploration"}
        </h2>
        <StartThreadForm titleRef={titleRef} />
      </section>

      <Disclosure
        className="mt-8"
        summary="See an example exploration"
        caption="A read-only thread about memory and identity"
        open={exampleOpen}
        onOpenChange={setExampleOpen}
      >
        <ExampleExploration
          onStartOwn={() => {
            titleRef.current?.scrollIntoView({ block: "center" });
            titleRef.current?.focus();
          }}
        />
      </Disclosure>
    </div>
  );
}

function ExampleExploration({ onStartOwn }: { onStartOwn: () => void }) {
  const thread = EXAMPLE_THREAD;
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-line-strong bg-paper-sunk/40 p-5 sm:p-6">
      <p className="inline-flex rounded-full border border-line-strong bg-paper-raised px-3 py-1 text-sm font-semibold text-ink-muted">
        Example · not saved
      </p>
      <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{thread.question}</h2>
      <p className="mt-2 text-ink-muted">
        Maya started from a novel, then connected readings that support, challenge, and add a new perspective to her
        question.
      </p>
      <div className="mt-6">
        <ThreadExplorer thread={thread} readOnly showBoth level={3} />
      </div>
      {thread.nextStep ? (
        <div className="mt-6 rounded-xl bg-accent-soft p-4">
          <p className="text-[0.8rem] font-semibold uppercase tracking-wide text-accent">Her next step</p>
          <p className="mt-1">{thread.nextStep.text}</p>
        </div>
      ) : null}
      <Button className="mt-6" onClick={onStartOwn}>
        Start your own exploration
      </Button>
    </div>
  );
}
