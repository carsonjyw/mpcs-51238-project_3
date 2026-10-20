"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { CHAPTERS, markChapterSeen, shouldShowChapter, skipTour, type Chapter } from "@/lib/tour";

/** Phones and narrow windows dock the panel to the bottom of the screen. */
const DOCK_BELOW = 640;
const SPOT_PAD = 10;
const GAP = 16;
const PANEL_W = 340;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** The step's target inside this page only (other pages may stay mounted but hidden). */
function findTarget(root: RefObject<HTMLElement | null>, name: string) {
  return root.current?.querySelector<HTMLElement>(`[data-tour="${name}"]`) ?? null;
}

/**
 * One chapter of the first-use tour. It opens automatically only the first time this page is visited, never
 * submits, saves, or changes thread data, and can be skipped at every step (Skip tour or Escape).
 * On close, focus returns to where it was, or to `fallbackFocus`.
 */
export function Tour({
  chapter,
  root,
  fallbackFocus,
}: {
  chapter: Chapter;
  root: RefObject<HTMLElement | null>;
  fallbackFocus?: () => HTMLElement | null;
}) {
  const { steps, finish } = CHAPTERS[chapter];
  const [open, setOpen] = useState(() => shouldShowChapter(chapter));
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();
  const current = steps[step];
  const targetName = current.target;

  // Remember this chapter as soon as it is shown, so refreshing doesn't reopen it. Other chapters are unaffected.
  useEffect(() => {
    if (open) markChapterSeen(chapter);
  }, [open, chapter]);

  // Track the target's position (and the viewport) while the chapter is open.
  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = findTarget(root, targetName)?.getBoundingClientRect();
        setRect(box ? { top: box.top, left: box.left, width: box.width, height: box.height } : null);
        setViewport({ width: window.innerWidth, height: window.innerHeight });
      });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, root, targetName]);

  // Bring the target fully into view. On phones it must sit entirely above the docked panel.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const element = findTarget(root, targetName);
      if (!element) return;
      const box = element.getBoundingClientRect();
      const docked = window.innerWidth < DOCK_BELOW;
      const panelTop = docked
        ? (panelRef.current?.getBoundingClientRect().top ?? window.innerHeight)
        : window.innerHeight;
      const margin = SPOT_PAD + 8;
      if (box.top >= margin && box.bottom <= panelTop - margin) return;
      const available = panelTop - 2 * margin;
      const desiredTop = box.height < available ? margin + (available - box.height) / 2 : margin;
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollBy({ top: box.top - desiredTop, behavior: smooth ? "smooth" : "auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, root, targetName]);

  // On phones, add room below the page while the panel is docked, so even the last fields can scroll above it.
  useLayoutEffect(() => {
    if (!open || window.innerWidth >= DOCK_BELOW) return;
    const body = document.body;
    const previous = body.style.paddingBottom;
    body.style.paddingBottom = `${panelRef.current?.offsetHeight ?? 0}px`;
    return () => {
      body.style.paddingBottom = previous;
    };
  }, [open, step]);

  // Move focus into the panel once the page has finished its own focus handling.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const active = document.activeElement as HTMLElement | null;
        if (active && active !== document.body && !panelRef.current?.contains(active)) returnFocus.current = active;
        nextRef.current?.focus();
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const close = useCallback(
    (skipped: boolean) => {
      if (skipped) skipTour();
      setOpen(false);
      const previous = returnFocus.current;
      const target = previous && previous.isConnected ? previous : (fallbackFocus?.() ?? null);
      requestAnimationFrame(() => target?.focus());
    },
    [fallbackFocus],
  );

  // Escape skips the tour from anywhere while a chapter is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, close]);

  if (!open) return null;

  // Keep keyboard focus inside the panel while the chapter is open.
  function trapTab(event: React.KeyboardEvent) {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("button")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const docked = viewport.width > 0 && viewport.width < DOCK_BELOW;
  const spot = rect
    ? {
        top: rect.top - SPOT_PAD,
        left: rect.left - SPOT_PAD,
        width: rect.width + SPOT_PAD * 2,
        height: rect.height + SPOT_PAD * 2,
      }
    : null;

  // Desktop: beside the target when there is room (right, then left), otherwise below or above it.
  let panelStyle: React.CSSProperties = {};
  if (!docked && spot) {
    const fitsRight = spot.left + spot.width + GAP + PANEL_W <= viewport.width - GAP;
    const fitsLeft = spot.left - GAP - PANEL_W >= GAP;
    const top = Math.min(Math.max(GAP, spot.top), viewport.height - 260);
    if (fitsRight) panelStyle = { top, left: spot.left + spot.width + GAP };
    else if (fitsLeft) panelStyle = { top, left: spot.left - GAP - PANEL_W };
    else if (spot.top + spot.height + GAP + 220 <= viewport.height)
      panelStyle = {
        top: spot.top + spot.height + GAP,
        left: Math.min(Math.max(GAP, spot.left), viewport.width - PANEL_W - GAP),
      };
    else
      panelStyle = {
        top: Math.max(GAP, spot.top - GAP - 220),
        left: Math.min(Math.max(GAP, spot.left), viewport.width - PANEL_W - GAP),
      };
  }

  const last = step === steps.length - 1;
  const secondary =
    "inline-flex min-h-10 items-center rounded-full border border-ink px-5 text-[0.875rem] font-semibold hover:bg-ink hover:text-paper";

  return (
    <div className="fixed inset-0 z-50">
      {/* The spotlight: everything outside the highlighted area is dimmed and can't be clicked. */}
      {spot ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed border-2 border-accent transition-all duration-200 motion-reduce:transition-none"
          style={{ ...spot, boxShadow: "0 0 0 9999px rgba(28, 26, 22, 0.55)" }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-ink/55" />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onKeyDown={trapTab}
        className={`fixed border border-ink bg-paper text-ink ${
          docked ? "inset-x-0 bottom-0 border-x-0 border-b-0 px-[18px] pb-4 pt-3.5" : "w-[340px] p-5"
        }`}
        style={docked ? undefined : panelStyle}
      >
        <div className="flex items-baseline justify-between gap-4">
          <p className="kicker">
            {step + 1} of {steps.length}
          </p>
          <button type="button" onClick={() => close(true)} className="textlink min-h-9 text-[0.8125rem]">
            Skip tour
          </button>
        </div>
        <h2 id={titleId} className={`leading-tight ${docked ? "text-[1.5rem]" : "mt-1 text-[1.75rem]"}`}>
          {current.title}
        </h2>
        <p id={bodyId} className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">
          {current.body}
        </p>
        <div className={`flex items-center justify-end gap-2.5 ${docked ? "mt-3" : "mt-4"}`}>
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className={secondary}>
              Back
            </button>
          ) : null}
          <button
            ref={nextRef}
            type="button"
            onClick={() => (last ? close(false) : setStep(step + 1))}
            className="btn-ink inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-5 text-[0.875rem] font-semibold text-paper hover:bg-[#33302a]"
          >
            {last ? finish : "Next"} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
