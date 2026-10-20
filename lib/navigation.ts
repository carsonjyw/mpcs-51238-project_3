/**
 * Where a form's Cancel goes. Links into a form pass `returnTo=home` or `returnTo=thread`;
 * any other value is ignored and the form's own fallback is used.
 */
export type ReturnTo = "home" | "thread";

export function parseReturnTo(value: string | null, fallback: ReturnTo): ReturnTo {
  return value === "home" || value === "thread" ? value : fallback;
}

export function returnHref(returnTo: ReturnTo, threadId: string | undefined): string {
  return returnTo === "thread" && threadId ? threadPath(threadId) : "/";
}

export function threadPath(threadId: string): string {
  return `/threads/${threadId}`;
}

export function connectPath(
  threadId: string,
  options: { returnTo: ReturnTo; readingId?: string; nextStepMode?: boolean },
): string {
  const params = new URLSearchParams();
  if (options.readingId) params.set("reading", options.readingId);
  if (options.nextStepMode) params.set("mode", "next-step");
  params.set("returnTo", options.returnTo);
  return `${threadPath(threadId)}/connect?${params}`;
}

export function nextStepPath(threadId: string, returnTo: ReturnTo): string {
  return `${threadPath(threadId)}/next-step?returnTo=${returnTo}`;
}

export function newThreadPath(fromThreadId?: string): string {
  return fromThreadId ? `/threads/new?returnTo=thread&thread=${encodeURIComponent(fromThreadId)}` : "/threads/new?returnTo=home";
}
