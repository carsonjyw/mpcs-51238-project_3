"use client";

import { useStore } from "@/lib/store";

const messages = {
  unavailable:
    "This browser isn't letting Reading Map save. Anything you add is available only for this session, until you refresh or close this tab.",
  failed:
    "Your latest changes couldn't be saved on this device, so they're available only for this session, until you refresh or close this tab.",
  unreadable:
    "We couldn't read the maps saved in this browser, so we've left them untouched. Anything you add now is available only for this session.",
};

export function StorageBanner() {
  const store = useStore();
  const message = store.status === "ready" && store.persistence !== "saved" ? messages[store.persistence] : null;

  return (
    <div role="status" aria-live="polite">
      {message ? (
        <div className="border-b border-warning-ink/30 bg-warning-soft px-4 py-3 text-warning-ink sm:px-6">
          <p className="mx-auto max-w-5xl font-semibold">{message}</p>
        </div>
      ) : null}
    </div>
  );
}
