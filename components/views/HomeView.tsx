"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { FIRST_VISIT_EXAMPLE } from "@/lib/example";
import { threadPath } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { threadsByActivity } from "@/lib/threads";
import type { Thread } from "@/lib/types";
import { DocumentTitle } from "../DocumentTitle";
import { PageLoading } from "../PageStates";
import { StartThreadForm, type StartFormHandle, type StartValues } from "../forms/StartThreadForm";
import { ThreadMap } from "../thread/ThreadMap";

// Step 4: the home page is the first visit. The designed returning view comes in a later step
// (full version in pending/components/views/HomeView.tsx); until then, a saved thread is linked above the form.

export function HomeView() {
  const store = useStore();
  if (store.status === "loading") return <PageLoading />;
  const latest = threadsByActivity(store.data)[0];
  return <FirstVisit latest={latest} />;
}

/** The map the person is about to create, built from what they've typed (never saved from here). */
function previewThread(title: string, question: string, type: StartValues["type"]): Thread {
  return {
    id: "preview",
    question,
    createdAt: "",
    updatedAt: "",
    nextStep: null,
    readings: [{ id: "preview-reading", title, type, relationship: "raised", addedAt: "" }],
  };
}

function FirstVisit({ latest }: { latest?: Thread }) {
  const [values, setValues] = useState<StartValues | null>(null);
  const formRef = useRef<StartFormHandle>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const previewId = useId();

  const typed = !!values && (values.title.trim() !== "" || values.question.trim() !== "");
  const preview = typed
    ? previewThread(values.title.trim() || "Your reading", values.question.trim() || "Your question", values.type)
    : previewThread(FIRST_VISIT_EXAMPLE.title, FIRST_VISIT_EXAMPLE.question, "book");

  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-16">
      <DocumentTitle title="Follow a question through what you read" />
      <div>
        {latest ? (
          <p className="mb-6 text-[0.875rem]">
            <span className="text-ink-muted">Your saved map: </span>
            <Link href={threadPath(latest.id)} className="text-accent underline underline-offset-4">
              {latest.question}
            </Link>
          </p>
        ) : null}
        <h1 className="text-[1.875rem] leading-[1.15] tracking-[-0.01em] sm:text-[2.5rem]">
          Follow a <em className="text-accent">question</em> through what you read.
        </h1>
        <p className="mt-3 max-w-prose text-[1rem] leading-relaxed text-ink-muted">
          Add something you&apos;re reading and a question it raised. Your question becomes the center of a map you
          can keep building.
        </p>
        <div className="mt-8">
          <StartThreadForm
            handle={formRef}
            titleRef={titleRef}
            onValuesChange={setValues}
            submitLabel={latest ? "Create a new map" : "Create my first map"}
          />
        </div>
      </div>

      <aside aria-labelledby={previewId} className="lg:sticky lg:top-10 lg:self-start lg:pt-3">
        <h2
          id={previewId}
          className="flex items-center gap-2 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-muted"
        >
          {typed ? <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" /> : null}
          Preview · not saved
        </h2>
        <div className="mt-3 rounded-xl border border-line bg-paper-raised px-5 py-8">
          <ThreadMap thread={preview} interactive={false} />
        </div>
        <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
          {typed ? (
            "This is how your map will start. It updates as you type."
          ) : (
            <>
              Example: a reader of <i>{FIRST_VISIT_EXAMPLE.title}</i> asks “{FIRST_VISIT_EXAMPLE.question}”{" "}
              <button
                type="button"
                onClick={() => {
                  formRef.current?.fill({ title: FIRST_VISIT_EXAMPLE.title, question: FIRST_VISIT_EXAMPLE.question });
                  titleRef.current?.focus();
                }}
                className="font-semibold text-accent underline underline-offset-4"
              >
                Use this example
              </button>
            </>
          )}
        </p>
      </aside>
    </div>
  );
}
