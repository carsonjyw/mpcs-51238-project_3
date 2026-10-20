"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { FIRST_VISIT_EXAMPLE } from "@/lib/example";
import { useFlash } from "@/lib/flash";
import { threadPath } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { threadsByActivity } from "@/lib/threads";
import type { Thread } from "@/lib/types";
import { DocumentTitle } from "../DocumentTitle";
import { PageLoading } from "../PageStates";
import { StartThreadForm, type StartFormHandle, type StartValues } from "../forms/StartThreadForm";
import { ThreadMap } from "../thread/ThreadMap";
import { Notice } from "../ui/Notice";

// The home page is the first visit (Concept A spread: the journal form beside a live preview plate).
// The designed returning view comes in Step 6 (pending/components/views/HomeView.tsx);
// until then, a saved thread is linked above the form.

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
  // For example "Thread deleted." after deleting a thread.
  const flash = useFlash("home");

  const typed = !!values && (values.title.trim() !== "" || values.question.trim() !== "");
  const preview = typed
    ? previewThread(values.title.trim() || "Your reading", values.question.trim() || "Your question", values.type)
    : previewThread(FIRST_VISIT_EXAMPLE.title, FIRST_VISIT_EXAMPLE.question, "book");

  return (
    <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-[72px]">
      <DocumentTitle title="What are you reading?" />
      <section>
        <Notice tone={flash?.tone} quiet className="mb-6">
          {flash?.message}
        </Notice>
        {latest ? (
          <p className="fine mb-5">
            Your saved map:{" "}
            <Link href={threadPath(latest.id)} className="textlink font-sans text-[0.875rem]">
              {latest.question}
            </Link>
          </p>
        ) : null}
        <p className="kicker">{latest ? "Begin another map" : "No. 01 — Begin a map"}</p>
        <h1 className="mb-3.5 mt-3.5 text-[2.375rem] leading-[1.02] tracking-[-0.015em] lg:text-[3.375rem]">
          What are you reading, and what did it make you <em className="text-accent">wonder?</em>
        </h1>
        <p className="mb-7 max-w-[30em] text-ink-muted">
          Write down one reading and the question it raised. That&apos;s the first page of your map.
        </p>
        <StartThreadForm
          handle={formRef}
          titleRef={titleRef}
          onValuesChange={setValues}
          submitLabel={latest ? "Begin a new map" : "Begin the map"}
        />
      </section>

      <aside aria-labelledby={previewId} className="plate">
        <div className="plate-head">
          <h2 id={previewId} className="font-mono text-[12px] leading-none">
            Fig. 1 — Preview
          </h2>
          <span>Not saved</span>
        </div>
        <div className="px-5 pb-10 pt-6 sm:px-9">
          <ThreadMap thread={preview} interactive={false} compact />
        </div>
        <p className="border-t border-line px-[18px] pb-[18px] pt-3.5 text-[0.8125rem] text-ink-muted">
          {typed ? (
            "This is how your map will begin. It updates as you write."
          ) : (
            <>
              <b className="font-mono text-[12px] font-medium text-ink">Example.</b> A reader of{" "}
              <i>{FIRST_VISIT_EXAMPLE.title}</i> asks what makes a place feel like home.{" "}
              <button
                type="button"
                onClick={() => {
                  formRef.current?.fill({ title: FIRST_VISIT_EXAMPLE.title, question: FIRST_VISIT_EXAMPLE.question });
                  titleRef.current?.focus();
                }}
                className="textlink"
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
