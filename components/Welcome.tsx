"use client";

import { useCallback, useEffect, useRef } from "react";

/** Text: fade in 0.5 s, hold 1.5 s, fade out 0.5 s; then the paper fades 0.3 s (see `.welcome-layer` in globals.css). */
const DURATION = 2800;
const DISMISS_TEXT_FADE = 120;
const DISMISS_FADE = 250;

/**
 * A brief welcome over the first-visit page. It closes by itself once its fade-out ends, or earlier on a click,
 * Escape, Enter, or Space, fading out from wherever it is. Callers skip it entirely when reduced motion is preferred.
 */
export function Welcome({ onDone }: { onDone: () => void }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const done = useRef(false);
  const dismissing = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    onDone();
  }, [onDone]);

  const dismiss = useCallback(() => {
    const layer = layerRef.current;
    if (dismissing.current || !layer) return;
    dismissing.current = true;
    // Continue from the current opacities, so dismissing mid-fade never jumps. The text goes first, so it never
    // shows over the page.
    const fade = (element: HTMLElement | null, ms: number, delay = 0) => {
      if (!element) return;
      const opacity = getComputedStyle(element).opacity;
      element.style.animation = "none";
      element.style.opacity = opacity;
      void element.offsetWidth;
      element.style.transition = `opacity ${ms}ms ease-out ${delay}ms`;
      element.style.opacity = "0";
    };
    fade(textRef.current, DISMISS_TEXT_FADE);
    fade(layer, DISMISS_FADE, DISMISS_TEXT_FADE);
    window.setTimeout(finish, DISMISS_TEXT_FADE + DISMISS_FADE);
  }, [finish]);

  useEffect(() => {
    // A fallback in case the animation end event doesn't arrive (for example, in a background tab).
    const timer = window.setTimeout(finish, DURATION + 150);
    const onKey = (event: KeyboardEvent) => {
      if (["Escape", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [finish, dismiss]);

  return (
    <div
      ref={layerRef}
      role="status"
      data-welcome=""
      onClick={dismiss}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && !dismissing.current) finish();
      }}
      className="welcome-layer fixed inset-0 z-[60] flex cursor-pointer items-center justify-center bg-paper px-[18px]"
    >
      <p ref={textRef} className="welcome-text text-center font-serif text-[2.5rem] leading-[1.05] tracking-[-0.015em] text-ink lg:text-[3.5rem]">
        Welcome to Reading <i className="text-accent">Map</i>
      </p>
    </div>
  );
}
