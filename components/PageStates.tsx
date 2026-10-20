import { ButtonLink } from "./ui/Button";

/** Shown while saved data is read, so returning users never see the first-visit form flash. */
export function PageLoading({ label = "Loading your threads…" }: { label?: string }) {
  return (
    <div className="max-w-2xl" aria-busy="true">
      <p role="status" className="sr-only">
        {label}
      </p>
      <div aria-hidden="true" className="space-y-4">
        <div className="h-9 w-2/3 animate-pulse rounded bg-paper-sunk" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-paper-sunk" />
        <div className="h-48 animate-pulse rounded-xl bg-paper-sunk" />
      </div>
    </div>
  );
}

export function NotFoundMessage({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="max-w-2xl border-t border-ink pt-6">
      <h1 className="text-[2.25rem]">{title}</h1>
      <p className="mt-3 text-ink-muted">{body}</p>
      <ButtonLink href={actionHref} className="mt-6">
        {actionLabel}
      </ButtonLink>
    </div>
  );
}

export function ThreadNotFound() {
  return (
    <NotFoundMessage
      title="This thread isn't saved on this device."
      body="It may have been deleted, or it was saved in a different browser. Your threads are kept only in the browser where you created them."
      actionHref="/"
      actionLabel="Go home"
    />
  );
}
