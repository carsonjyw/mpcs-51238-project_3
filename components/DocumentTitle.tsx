"use client";

import { useEffect } from "react";

/**
 * Sets the tab title from saved data, which the server can't know. Next.js writes the layout's static
 * title on navigation, so while this page is visible the title is re-applied whenever it changes.
 * Effects are cleaned up when a preserved page is hidden and re-run when it is shown again.
 */
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    const full = `${title} · Reading Map`;
    const apply = () => {
      if (document.title !== full) document.title = full;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);
  return null;
}
