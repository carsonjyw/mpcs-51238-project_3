"use client";

import { useParams, useSearchParams } from "next/navigation";
import { parseReturnTo, returnHref, threadPath } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { getThread, isOriginal } from "@/lib/threads";
import { Breadcrumbs } from "../Breadcrumbs";
import { DocumentTitle } from "../DocumentTitle";
import { NotFoundMessage, PageLoading, ThreadNotFound } from "../PageStates";
import { ConnectReadingForm } from "../forms/ConnectReadingForm";
import { NextStepForm } from "../forms/NextStepForm";
import { StartThreadForm } from "../forms/StartThreadForm";

function FormPage({
  crumbs,
  title,
  intro,
  children,
}: {
  crumbs: { label: string; href?: string }[];
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[38rem]">
      <DocumentTitle title={title} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-5 text-[2.125rem] leading-[1.05] lg:text-[2.75rem]">{title}</h1>
      {intro ? <div className="mt-2 leading-relaxed text-ink-muted">{intro}</div> : null}
      <div className="mt-7">{children}</div>
    </div>
  );
}

export function NewThreadView() {
  const searchParams = useSearchParams();
  const store = useStore();
  if (store.status === "loading") return <PageLoading />;

  // Cancel returns to the thread the person was viewing, when it still exists; otherwise home.
  const fromThread = searchParams.get("thread");
  const returnTo = parseReturnTo(searchParams.get("returnTo"), "home");
  const thread = returnTo === "thread" && fromThread ? getThread(store.data, fromThread) : undefined;
  const cancelHref = thread ? threadPath(thread.id) : "/";

  return (
    <FormPage
      crumbs={[{ label: "Home", href: "/" }, { label: "Start a new thread" }]}
      title="Start a new thread"
      intro="Begin from something you're reading and the question it raised."
    >
      <StartThreadForm cancelHref={cancelHref} submitLabel="Create map" />
    </FormPage>
  );
}

export function ConnectView() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const store = useStore();
  const thread = store.status === "ready" ? getThread(store.data, id) : undefined;
  const readingId = searchParams.get("reading");
  const reading = readingId ? thread?.readings.find((r) => r.id === readingId) : undefined;
  const title = reading ? (isOriginal(reading) ? "Edit the original reading" : "Edit reading") : "Connect another reading";

  if (store.status === "loading") return <PageLoading label="Loading this thread…" />;
  if (!thread) return <ThreadNotFound />;
  if (readingId && !reading) {
    return (
      <NotFoundMessage
        title="That reading isn't in this thread anymore."
        body="It may have been removed. You can connect it again from the thread."
        actionHref={threadPath(thread.id)}
        actionLabel="Back to thread"
      />
    );
  }

  const returnTo = parseReturnTo(searchParams.get("returnTo"), "thread");
  const nextStepMode = !reading && searchParams.get("mode") === "next-step" && thread.nextStep !== null;

  return (
    <FormPage
      crumbs={[{ label: "Home", href: "/" }, { label: thread.question, href: threadPath(thread.id) }, { label: title }]}
      title={title}
      intro={
        <>
          Your question: <span className="font-serif text-[1.1875rem] text-ink">{thread.question}</span>
        </>
      }
    >
      <ConnectReadingForm
        // Keyed on updatedAt too: preserved pages rebuild their form from the latest saved data.
        key={`${thread.id}:${readingId ?? "new"}:${nextStepMode ? "step" : "plain"}:${thread.updatedAt}`}
        thread={thread}
        reading={reading}
        nextStepMode={nextStepMode}
        returnTo={returnTo}
        cancelHref={returnHref(returnTo, thread.id)}
      />
    </FormPage>
  );
}

export function NextStepView() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const store = useStore();
  const thread = store.status === "ready" ? getThread(store.data, id) : undefined;
  const title = thread?.nextStep ? "Change your next step" : "Save a next step";

  if (store.status === "loading") return <PageLoading label="Loading this thread…" />;
  if (!thread) return <ThreadNotFound />;

  const returnTo = parseReturnTo(searchParams.get("returnTo"), "thread");

  return (
    <FormPage
      crumbs={[{ label: "Home", href: "/" }, { label: thread.question, href: threadPath(thread.id) }, { label: "Next step" }]}
      title={title}
      intro={
        <>
          Your question: <span className="font-serif text-[1.1875rem] text-ink">{thread.question}</span>
        </>
      }
    >
      <NextStepForm key={`${thread.id}:${thread.updatedAt}`} thread={thread} cancelHref={returnHref(returnTo, thread.id)} />
    </FormPage>
  );
}
