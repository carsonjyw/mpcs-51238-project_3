"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FIRST_VISIT_EXAMPLE } from "@/lib/example";
import { saveFlash, setFlash, useFlash } from "@/lib/flash";
import { plural, timeAgo } from "@/lib/format";
import { connectPath, newThreadPath, nextStepPath, threadPath } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { markNextStepDone, threadsByActivity } from "@/lib/threads";
import { RELATIONSHIPS } from "@/lib/relationships";
import { useElementWidth } from "@/lib/useElementWidth";
import type { Thread } from "@/lib/types";
import { DocumentTitle } from "../DocumentTitle";
import { Tour } from "../Tour";
import { PageLoading } from "../PageStates";
import { StartThreadForm, type StartFormHandle, type StartValues } from "../forms/StartThreadForm";
import { relationshipColor, RelationshipLabel } from "../thread/RelationshipLabel";
import { ThreadMap } from "../thread/ThreadMap";
import { ButtonLink } from "../ui/Button";
import { Notice } from "../ui/Notice";

// With no saved threads, home is the first visit (the journal form beside a live preview plate).
// With saved threads, it is the returning view: continue the latest map, or open any other.

export function HomeView() {
  const store = useStore();
  if (store.status === "loading") return <PageLoading />;
  if (store.data.threads.length === 0) return <FirstVisit />;
  return <ReturningView threads={threadsByActivity(store.data)} />;
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

function FirstVisit() {
  const [values, setValues] = useState<StartValues | null>(null);
  const formRef = useRef<StartFormHandle>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const previewId = useId();
  // For example "Thread deleted." after deleting a thread.
  const flash = useFlash("home");

  const typed = !!values && (values.title.trim() !== "" || values.question.trim() !== "");
  const preview = previewThread(
    values?.title.trim() || "Your reading",
    values?.question.trim() || "Your question",
    values?.type ?? "book",
  );

  return (
    <div ref={rootRef} className="grid items-start gap-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-[72px]">
      <DocumentTitle title="What are you reading?" />
      {/* Tour chapter 1, only on the first visit in this browser. */}
      <Tour chapter="home" root={rootRef} fallbackFocus={() => titleRef.current} />
      <section>
        <Notice tone={flash?.tone} quiet className="mb-6">
          {flash?.message}
        </Notice>
        <p className="kicker">No. 01 — Begin a map</p>
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
          submitLabel="Begin the map"
        />
      </section>

      <aside aria-labelledby={previewId} className="plate">
        <div className="plate-head">
          <h2 id={previewId} className="font-mono text-[12px] leading-none">
            {typed ? "Fig. 1 — Preview" : "Fig. 1 — Example"}
          </h2>
          <span>Not saved</span>
        </div>
        <div className="px-5 pb-10 pt-6 sm:px-9">
          {typed ? <ThreadMap thread={preview} interactive={false} compact /> : <ExampleFigure />}
        </div>
        <p className="border-t border-line px-[18px] pb-[18px] pt-3.5 text-[0.8125rem] text-ink-muted">
          {typed ? (
            "This is how your map will begin. It updates as you write."
          ) : (
            <>
              <b className="font-mono text-[12px] font-medium text-ink">Example.</b> A reader of{" "}
              <i>{FIRST_VISIT_EXAMPLE.title}</i> asks what makes a place feel like home. When you read something
              related, connect it to your question and note how it changes your thinking.{" "}
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

/**
 * The read-only example: one reading raises the question, and a second reading changes the reader's
 * thinking about it, with the note they wrote. It is a constant in the code and never saved.
 */
function ExampleFigure() {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const row = width === 0 || width >= 520;
  const example = FIRST_VISIT_EXAMPLE;
  const next = example.next;
  return (
    <div ref={ref}>
      <div className={row ? "flex items-center" : "figure-v flex flex-col items-start"}>
        <div className="book" style={{ borderLeftColor: relationshipColor.raised }}>
          <span className="t">{example.title}</span>
          <span className="m">Book</span>
        </div>
        <div className="link" aria-hidden="true">
          <span className="annot">raised this question</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="mono-label">The question</p>
          <p className={`quote-q mt-3 ${row ? "text-[2.25rem]" : "text-[2rem]"}`}>{example.question}</p>
        </div>
      </div>

      {/* Then a second reading connects to the question, with a note on how it changed the reader's thinking. */}
      <div className={row ? "ml-[330px]" : ""}>
        <div className="relative h-11 w-px" aria-hidden="true">
          <span
            className="absolute inset-y-1 left-0 border-l-2 border-dashed"
            style={{ borderColor: relationshipColor[next.relationship] }}
          />
        </div>
        <div
          className="border border-ink border-l-[6px] bg-paper-raised px-4 py-3"
          style={{ borderLeftColor: relationshipColor[next.relationship] }}
        >
          <RelationshipLabel relationship={next.relationship} size="xs" />
          <p className="book-title mt-1.5 text-[1.25rem] leading-tight">{next.title}</p>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.05em] text-ink-muted">
            Book · {next.author}
          </p>
          <p className="mono-label mt-3">
            Note <span className="sr-only">({RELATIONSHIPS[next.relationship].label})</span>
          </p>
          <p className="mt-1 text-[0.9375rem] leading-snug">{next.note}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Home once something is saved: continuing comes first. The Continue card holds the most recently
 * updated map; every saved map is listed beside it, so older work is always one click away.
 */
function ReturningView({ threads }: { threads: Thread[] }) {
  const [current] = threads;
  const latest = current.readings[current.readings.length - 1];
  // For example "Next step saved." after changing it from here, or "Thread deleted."
  const flash = useFlash("home");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const continueId = useId();
  const listId = useId();

  // After a form saves and returns here, move focus to the heading so the message is read in context.
  useEffect(() => {
    if (flash?.arrived) headingRef.current?.focus();
  }, [flash]);

  function completeNextStep() {
    const { persisted } = markNextStepDone(current.id);
    setFlash(
      "home",
      saveFlash(persisted, {
        saved: "Next step marked done. Saved in this browser.",
        done: "Next step marked done.",
      }),
      { currentPage: true },
    );
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-[72px]">
      <DocumentTitle title="Welcome back" />
      <div>
        <Notice tone={flash?.tone} quiet className="mb-5">
          {flash?.message}
        </Notice>
        <p className="kicker">Welcome back</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mb-3 mt-3 text-[2.375rem] leading-[1.02] tracking-[-0.015em] lg:text-[3.125rem]"
        >
          Pick up where you <em className="text-accent">left off.</em>
        </h1>
        <p className="mb-7 max-w-[34em] text-ink-muted">
          Read something related to one of your questions, or ready for the next step you saved? Continue below.
        </p>

        <section aria-labelledby={continueId} className="plate">
          <div className="plate-head gap-4">
            <h2 id={continueId} className="font-mono text-[12px] leading-none">
              Continue
            </h2>
            <span>Last active {timeAgo(current.updatedAt)}</span>
          </div>
          <div className="px-5 pb-6 pt-2 sm:px-8">
            <p className="mono-label">The question</p>
            <p className="quote-q mt-2.5 text-[1.875rem] sm:text-[2.375rem]">
              <Link href={threadPath(current.id)} className="hover:underline hover:decoration-1 hover:underline-offset-4">
                {current.question}
              </Link>
            </p>

            <div className="mt-6 grid gap-5 border-t border-line pt-4 sm:grid-cols-2 sm:gap-8">
              <div className="min-w-0">
                <p className="mono-label">Latest reading</p>
                <p className="book-title mt-1.5 text-[1.375rem] leading-tight">{latest.title}</p>
                <p className="mt-1">
                  <RelationshipLabel relationship={latest.relationship} size="xs" />
                </p>
                <p className="fine mt-1">{plural(current.readings.length, "reading")} on this map</p>
              </div>
              <div className="min-w-0 border-l-[3px] border-accent pl-4">
                <p className="mono-label">Your next step</p>
                {current.nextStep ? (
                  <>
                    <p className="mt-1.5 font-serif text-[1.3125rem] leading-snug">{current.nextStep.text}</p>
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.875rem]">
                      <Link href={nextStepPath(current.id, "home")} className="textlink">
                        Change<span className="sr-only"> next step</span>
                      </Link>
                      <button type="button" onClick={completeNextStep} className="textlink">
                        Mark done<span className="sr-only">: {current.nextStep.text}</span>
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-1.5 text-ink-muted">No next step saved.</p>
                    <p className="mt-2 text-[0.875rem]">
                      <Link href={nextStepPath(current.id, "home")} className="textlink">
                        Save a next step
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
              <ButtonLink href={connectPath(current.id, { returnTo: "home" })}>
                Connect another reading <span aria-hidden="true">→</span>
              </ButtonLink>
              <ButtonLink href={threadPath(current.id)} variant="secondary">
                Open map
              </ButtonLink>
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby={listId} className="lg:pt-[3.25rem]">
        <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2.5">
          <h2 id={listId} className="text-[1.75rem]">
            All your maps
          </h2>
          <span className="fine">{plural(threads.length, "map")}</span>
        </div>
        <ol>
          {threads.map((thread, index) => (
            <li key={thread.id} className="relative border-b border-line py-4 hover:bg-paper-raised">
              <div className="flex gap-4">
                <span aria-hidden="true" className="fine w-6 shrink-0 pt-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[1.3125rem] leading-snug">
                    {/* The whole row opens the map. */}
                    <Link href={threadPath(thread.id)} className="after:absolute after:inset-0 hover:underline hover:decoration-1 hover:underline-offset-4">
                      {thread.question}
                    </Link>
                  </h3>
                  <p className="mt-1 text-[0.875rem] leading-snug">
                    {thread.nextStep ? (
                      <>
                        <span className="text-ink-muted">Next: </span>
                        {thread.nextStep.text}
                      </>
                    ) : (
                      <span className="text-ink-muted">No next step</span>
                    )}
                  </p>
                  <p className="fine mt-1">
                    {plural(thread.readings.length, "reading")} · {timeAgo(thread.updatedAt)}
                    {index === 0 ? " · Continuing" : ""}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <ButtonLink href={newThreadPath()} variant="secondary" className="mt-6">
          <span aria-hidden="true">+</span> New thread
        </ButtonLink>
      </section>
    </div>
  );
}
