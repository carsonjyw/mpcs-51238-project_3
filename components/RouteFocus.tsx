"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * After a client-side navigation, the link that was activated usually belongs to the page that was just
 * hidden, so keyboard focus would be lost (the next Tab starts from the end of the document). In that case
 * focus moves to the new page's heading. Focus a page set deliberately (a saved-message heading, a header link that
 * stays on screen) is left alone, and an opening tour chapter takes focus itself.
 */
export function RouteFocus() {
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const visible = (element: Element) => element.getClientRects().length > 0;
    let frame = 0;
    let tries = 0;
    // A page shown for the first time may take a few frames to appear, so look for its heading for up to ~0.5s.
    const attempt = () => {
      // A tour chapter opening on this page owns focus (it returns focus to the page when it closes).
      if (document.querySelector("[data-tour-layer]")) return;
      const active = document.activeElement as HTMLElement | null;
      const lost = !active || active === document.body || !visible(active);
      if (!lost) return;
      const heading = [...document.querySelectorAll<HTMLElement>("main h1")].find(visible);
      if (!heading && ++tries < 30) {
        frame = requestAnimationFrame(attempt);
        return;
      }
      const target = heading ?? document.getElementById("main");
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    frame = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
