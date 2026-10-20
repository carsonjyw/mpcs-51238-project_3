"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { SESSION_ONLY, setFlash, useFlash, type Flash } from "@/lib/flash";
import { plural } from "@/lib/format";
import { connectPath, nextStepPath } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { deleteThread, getThread, updateQuestion } from "@/lib/threads";
import type { Thread } from "@/lib/types";
import { LIMITS, validateQuestion } from "@/lib/validation";
import { Breadcrumbs } from "../Breadcrumbs";
import { DocumentTitle } from "../DocumentTitle";
import { Tour } from "../Tour";
import { PageLoading, ThreadNotFound } from "../PageStates";
import { ThreadExplorer } from "../thread/ThreadExplorer";
import { Button, ButtonLink } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { focusField, TextArea } from "../ui/Field";
import { Notice } from "../ui/Notice";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** "20 October 2026". Only rendered in the browser, after saved data has loaded. */
function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

/** Smaller action buttons on phones, so the map's reading and question fit on the first screen. */
const compactOnPhone = "max-sm:min-h-10 max-sm:px-4 max-sm:text-[0.875rem]";

/** Threads deleted from this page, so it doesn't flash "not found" while navigating home. */
const deletedHere = new Set<string>();

export function ThreadPageView() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  if (store.status === "loading") return <PageLoading label="Loading this map…" />;
  const thread = getThread(store.data, id);
  if (!thread) return deletedHere.has(id) ? <PageLoading label="Going home…" /> : <ThreadNotFound />;
  return <ThreadPage key={thread.id} thread={thread} isFirst={store.data.threads.length === 1} />;
}

function ThreadPage({ thread, isFirst }: { thread: Thread; isFirst: boolean }) {
  const router = useRouter();
  // Set by the form that navigated here, or by an action on this page. Success says "saved" only when storage succeeded.
  const notice = useFlash(thread.id);
  const openReadingId = notice?.readingId ?? null;
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [questionDraft, setQuestionDraft] = useState(thread.question);
  const [questionError, setQuestionError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const questionFieldRef = useRef<HTMLTextAreaElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const nextStepId = useId();

  // After a form saves and lands here, move focus to the heading so the result is announced in context.
  useEffect(() => {
    if (notice?.arrived) headingRef.current?.focus();
  }, [notice]);

  useEffect(() => {
    if (editingQuestion) questionFieldRef.current?.focus();
  }, [editingQuestion]);

  function setNotice(flash: Flash) {
    setFlash(thread.id, flash, { currentPage: true });
  }

  function startEditingQuestion() {
    setQuestionDraft(thread.question);
    setQuestionError(undefined);
    setEditingQuestion(true);
  }

  function cancelEditingQuestion() {
    setEditingQuestion(false);
    setQuestionError(undefined);
    requestAnimationFrame(() => editButtonRef.current?.focus());
  }

  function saveQuestion(event: React.FormEvent) {
    event.preventDefault();
    const error = validateQuestion(questionDraft);
    if (error) {
      flushSync(() => setQuestionError(error));
      focusField(questionFieldRef.current);
      return;
    }
    const { persisted } = updateQuestion(thread.id, questionDraft);
    setEditingQuestion(false);
    setNotice(
      persisted
        ? { message: "Question updated. Saved in this browser.", tone: "success" }
        : { message: `Question updated. ${SESSION_ONLY}`, tone: "warning" },
    );
    requestAnimationFrame(() => editButtonRef.current?.focus());
  }

  function confirmDeletion() {
    deletedHere.add(thread.id);
    const { persisted } = deleteThread(thread.id);
    setFlash(
      "home",
      persisted
        ? { message: "Map deleted.", tone: "success" }
        : {
            message:
              "Map deleted for this session. This browser didn't let us save the change, so it may come back after you refresh.",
            tone: "warning",
          },
    );
    router.push("/");
  }

  return (
    <div ref={rootRef}>
      <DocumentTitle title={thread.question} />
      {/* Tour chapter 2, on the first visit to a thread page. */}
      <Tour chapter="thread" root={rootRef} fallbackFocus={() => headingRef.current} />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: thread.question }]} />
        <Notice tone={notice?.tone} quiet>
          {notice?.message}
        </Notice>
      </div>

      {/* A compact heading: the question itself is the center of the map below, so it isn't repeated here. */}
      <header className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mt-5">
        <div className="min-w-0">
          <h1 ref={headingRef} tabIndex={-1} className="text-[2.125rem] leading-[1.05] lg:text-[2.75rem]">
            {isFirst ? "Your first map" : "Your map"}
          </h1>
          <p className="mt-1 line-clamp-2 text-ink-muted">
            Started from <span className="book-title text-[1.1875rem] text-ink">{thread.readings[0].title}</span>
            <span className="whitespace-nowrap"> · {formatDate(thread.createdAt)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <ButtonLink
            href={connectPath(thread.id, { returnTo: "thread" })}
            className={compactOnPhone}
            data-tour="connect"
          >
            Connect another reading <span aria-hidden="true">→</span>
          </ButtonLink>
          <Button
            ref={editButtonRef}
            variant="secondary"
            onClick={startEditingQuestion}
            aria-expanded={editingQuestion}
            className={compactOnPhone}
          >
            Edit question
          </Button>
        </div>
      </header>

      {editingQuestion ? (
        <form noValidate onSubmit={saveQuestion} className="entry mt-6 max-w-[38rem] space-y-4">
          <TextArea
            label="Your question"
            value={questionDraft}
            onChange={(value) => {
              setQuestionDraft(value);
              if (questionError) setQuestionError(validateQuestion(value));
            }}
            error={questionError}
            required
            rows={2}
            counterMax={LIMITS.question}
            textareaRef={questionFieldRef}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit">Save question</Button>
            <Button variant="secondary" onClick={cancelEditingQuestion}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <section
        aria-labelledby={nextStepId}
        className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-y border-line py-3 sm:mt-7 sm:py-3.5"
      >
        <h2 id={nextStepId} className="mono-label font-mono">
          Next step
        </h2>
        {thread.nextStep ? (
          <>
            <p className="min-w-0 flex-1 font-serif text-[1.3125rem] leading-snug text-ink">{thread.nextStep.text}</p>
            <Link href={nextStepPath(thread.id, "thread")} className="textlink text-[0.875rem]">
              Change next step
            </Link>
          </>
        ) : (
          <>
            <p className="min-w-0 flex-1 text-ink-muted">No next step yet.</p>
            <Link href={nextStepPath(thread.id, "thread")} className="textlink text-[0.875rem]">
              Save a next step
            </Link>
          </>
        )}
      </section>

      <div className="mt-5 sm:mt-8">
        <ThreadExplorer
          thread={thread}
          openReadingId={openReadingId}
          onNotice={(message, tone) => setNotice({ message, tone })}
          quietHeading
          panelOnDemand
        />
      </div>


      {/* Right-aligned, away from where the connect form's save button sat, so it isn't under the pointer after saving. */}
      <div className="mt-12 flex justify-end border-t border-line pt-5">
        <Button variant="danger" className="min-h-10 px-5 text-[0.875rem]" onClick={() => setConfirmDelete(true)}>
          Delete map
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this map?"
        confirmLabel="Delete map"
        onConfirm={confirmDeletion}
        onCancel={() => setConfirmDelete(false)}
      >
        Delete this map, its {plural(thread.readings.length, "reading")} and notes? This can&apos;t be undone.
      </ConfirmDialog>
    </div>
  );
}
