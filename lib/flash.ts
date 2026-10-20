"use client";

import { useSyncExternalStore } from "react";

/**
 * One-time messages (in memory only), such as "Connected “Locke”." A form sets a message for the page it
 * navigates to; the message stays while that page is shown and is cleared once the person navigates away,
 * so it isn't stale when a preserved page is shown again.
 */
export interface Flash {
  message: string;
  tone: "success" | "warning";
  /** Reading to highlight and open in the detail panel. */
  readingId?: string;
  /** True when the message came with a navigation, so the page can move focus to its heading. */
  arrived?: boolean;
}

interface Entry {
  flash: Flash;
  /** The path the message was shown on; undefined until the next navigation lands. */
  shownOn?: string;
}

const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Set a message for the page that is about to be shown, or (`currentPage`) for the page shown now. */
export function setFlash(key: string, flash: Flash, options: { currentPage?: boolean } = {}) {
  entries.set(
    key,
    options.currentPage
      ? { flash, shownOn: window.location.pathname }
      : { flash: { ...flash, arrived: true }, shownOn: undefined },
  );
  emit();
}

export function useFlash(key: string): Flash | undefined {
  return useSyncExternalStore(
    subscribe,
    () => entries.get(key)?.flash,
    () => undefined,
  );
}

/** Called on every route change: new messages are attached to the new page, older ones are cleared. */
export function handleRouteChange(pathname: string) {
  let changed = false;
  for (const [key, entry] of entries) {
    if (entry.shownOn === undefined) {
      entries.set(key, { ...entry, shownOn: pathname });
    } else if (entry.shownOn !== pathname) {
      entries.delete(key);
      changed = true;
    }
  }
  if (changed) emit();
}

export const SESSION_ONLY =
  "This browser didn't let us save it, so it's available only for this session and will be gone if you refresh or close this tab.";

/**
 * Message for a save, honest about whether it reached this device's storage:
 * `saved` is shown only when storage succeeded; otherwise `done` plus the session-only warning.
 */
export function saveFlash(
  persisted: boolean,
  messages: { saved: string; done: string },
  readingId?: string,
): Flash {
  return persisted
    ? { message: messages.saved, tone: "success", readingId }
    : { message: `${messages.done} ${SESSION_ONLY}`, tone: "warning", readingId };
}
