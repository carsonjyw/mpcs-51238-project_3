"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
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
  // The chapter's other highlighted elements, which the panel shouldn't cover, and the panel's real height.
  const [others, setOthers] = useState<Rect[]>([]);
  const [panelHeight, setPanelHeight] = useState(0);
  // Start from the real window size (the tour only renders in the browser), so the very first frame is already
  // laid out for this screen: docked on phones, and the first scroll check sees the panel where it really is.
  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined" ? { width: 0, height: 0 } : { width: window.innerWidth, height: window.innerHeight },
  );
  // The target the spotlight and panel are currently shown for. It catches up with the current step only once that
  // step's target is in view and has stopped moving, so nothing is ever drawn at a stale or in-between position.
  const [shownTarget, setShownTarget] = useState<string | null>(null);
  // True for the one update where the spotlight moves from the previous step's target to the next one.
  const [moving, setMoving] = useState(false);
  const shownRef = useRef<string | null>(null);
  const rectRef = useRef<Rect | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();
  const current = steps[step];
  const targetName = current.target;
  const settled = shownTarget === targetName;
  // The panel shows once its step has settled and the spotlight has finished moving there.
  const panelVisible = settled && !moving;
  useEffect(() => {
    rectRef.current = rect;
  }, [rect]);

  // Remember this chapter as soon as it is shown, so refreshing doesn't reopen it. Other chapters are unaffected.
  useEffect(() => {
    if (open) markChapterSeen(chapter);
  }, [open, chapter]);

  // For each step: wait until its target is on the page and visible, bring it into view (above the docked panel on
  // phones), wait until it has stopped moving (the scroll has finished), and only then show the spotlight and panel.
  useEffect(() => {
    if (!open) return;
    let frame = 0;
    let frames = 0;
    let stableFrames = 0;
    let scrolled = false;
    let last: DOMRect | null = null;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      frames += 1;
      const element = findTarget(root, targetName);
      const box = element && element.getClientRects().length > 0 ? element.getBoundingClientRect() : null;
      if (!box) {
        // The page (for example, one just navigated to) isn't ready yet.
        if (frames < 120) frame = requestAnimationFrame(tick);
        return;
      }
      if (!scrolled) {
        scrolled = true;
        const docked = window.innerWidth < DOCK_BELOW;
        const panelTop = docked ? window.innerHeight - (panelRef.current?.offsetHeight ?? 0) : window.innerHeight;
        const margin = SPOT_PAD + 8;
        if (box.top < margin || box.bottom > panelTop - margin) {
          const available = panelTop - 2 * margin;
          const desiredTop = box.height < available ? margin + (available - box.height) / 2 : margin;
          window.scrollBy({ top: box.top - desiredTop, behavior: smooth ? "smooth" : "auto" });
        }
      }
      const same =
        last &&
        Math.abs(last.top - box.top) < 0.5 &&
        Math.abs(last.left - box.left) < 0.5 &&
        Math.abs(last.height - box.height) < 0.5;
      stableFrames = same ? stableFrames + 1 : 0;
      last = box;
      if (stableFrames < 3 && frames < 90) {
        frame = requestAnimationFrame(tick);
        return;
      }
      // Ease the spotlight from the previous target only if it actually moves (and motion is allowed); the panel
      // then appears when that move has finished, so text and spotlight always change together.
      const next = { top: box.top, left: box.left, width: box.width, height: box.height };
      const from = rectRef.current;
      const moves =
        smooth &&
        shownRef.current !== null &&
        !!from &&
        (Math.abs(from.top - next.top) > 0.5 || Math.abs(from.left - next.left) > 0.5 || Math.abs(from.height - next.height) > 0.5);
      setRect(next);
      setOthers(
        steps
          .filter((s) => s.target !== targetName)
          .map((s) => findTarget(root, s.target)?.getBoundingClientRect())
          .filter((b): b is DOMRect => !!b && b.width > 0)
          .map((b) => ({ top: b.top, left: b.left, width: b.width, height: b.height })),
      );
      setPanelHeight(panelRef.current?.offsetHeight ?? 0);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setMoving(moves);
      shownRef.current = targetName;
      setShownTarget(targetName);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open, root, targetName, steps]);

  // Once shown, the spotlight follows its target exactly as the page scrolls or resizes (no easing, so it never lags).
  useEffect(() => {
    if (!open || !shownTarget) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = findTarget(root, shownTarget)?.getBoundingClientRect();
        if (box) setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
        setViewport({ width: window.innerWidth, height: window.innerHeight });
      });
    };
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, root, shownTarget]);

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

  // While open, everything outside the tour layer is inert: it stays visible (dimmed, with the spotlight) but
  // can't be focused, clicked, or reached by screen readers. Only what the tour made inert is restored on close.
  useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement as HTMLElement | null;
    if (active && active !== document.body) returnFocus.current = active;
    const made: HTMLElement[] = [];
    const makeInert = (element: Element) => {
      if (!(element instanceof HTMLElement) || element.hasAttribute("data-tour-layer") || element.inert) return;
      if (["SCRIPT", "STYLE", "TEMPLATE", "NEXT-ROUTE-ANNOUNCER"].includes(element.tagName)) return;
      element.inert = true;
      made.push(element);
    };
    [...document.body.children].forEach(makeInert);
    // Content added to the page while the chapter is open is made inert too.
    const observer = new MutationObserver((records) =>
      records.forEach((record) => record.addedNodes.forEach((node) => node instanceof Element && makeInert(node))),
    );
    observer.observe(document.body, { childList: true });
    return () => {
      observer.disconnect();
      for (const element of made) element.inert = false;
    };
  }, [open]);

  // Move focus into the panel when the chapter first appears (after its target has settled), not before.
  const firstShown = shownTarget !== null;
  useEffect(() => {
    if (open && firstShown) nextRef.current?.focus();
  }, [open, firstShown]);

  const close = useCallback(
    (skipped: boolean) => {
      if (skipped) skipTour();
      setOpen(false);
      const previous = returnFocus.current;
      // A page heading focused only as a landing spot after navigation gives way to the chapter's own target.
      const landing =
        previous && previous.tabIndex === -1 && (/^H[1-6]$/.test(previous.tagName) || previous.tagName === "MAIN");
      const fallback = fallbackFocus?.() ?? null;
      const usable = previous && previous.isConnected && previous.getClientRects().length > 0;
      const target = usable && !(landing && fallback) ? previous : fallback;
      requestAnimationFrame(() => target?.focus());
    },
    [fallbackFocus],
  );

  // Leaving the page with the browser's Back or Forward closes the chapter first (it isn't marked skipped, and it
  // was already recorded as seen, so it won't reopen).
  useEffect(() => {
    if (!open) return;
    const onPopState = () => setOpen(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [open]);

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

  // Desktop: beside the target (right, then left), otherwise below or above it. The first position that fits on
  // screen and doesn't cover the chapter's other highlighted elements (such as the reading beside the question)
  // wins; failing that, the first that fits.
  let panelStyle: React.CSSProperties = {};
  if (!docked && spot) {
    const height = panelHeight || 230;
    const clampTop = (top: number) => Math.min(Math.max(GAP, top), viewport.height - height - GAP);
    const clampLeft = (left: number) => Math.min(Math.max(GAP, left), viewport.width - PANEL_W - GAP);
    const below = spot.top + spot.height + GAP;
    const above = spot.top - GAP - height;
    const candidates = [
      { top: clampTop(spot.top), left: spot.left + spot.width + GAP },
      { top: clampTop(spot.top), left: spot.left - GAP - PANEL_W },
      { top: below, left: clampLeft(spot.left) },
      { top: below, left: clampLeft(spot.left + spot.width - PANEL_W) },
      { top: above, left: clampLeft(spot.left) },
      { top: above, left: clampLeft(spot.left + spot.width - PANEL_W) },
    ];
    const fits = (c: { top: number; left: number }) =>
      c.left >= GAP && c.left + PANEL_W <= viewport.width - GAP && c.top >= GAP && c.top + height <= viewport.height - GAP;
    const covers = (c: { top: number; left: number }, r: Rect) =>
      c.left < r.left + r.width + SPOT_PAD &&
      c.left + PANEL_W > r.left - SPOT_PAD &&
      c.top < r.top + r.height + SPOT_PAD &&
      c.top + height > r.top - SPOT_PAD;
    panelStyle =
      candidates.find((c) => fits(c) && !others.some((r) => covers(c, r))) ?? candidates.find(fits) ?? candidates[2];
  }

  const last = step === steps.length - 1;
  const secondary =
    "inline-flex min-h-10 items-center rounded-full border border-ink px-5 text-[0.875rem] font-semibold hover:bg-ink hover:text-paper";

  // Rendered at the end of <body>, outside the page, so the rest of the page can be made inert. Until the first
  // target has settled, the layer is invisible but already blocks the page, so there's no interactive gap.
  return createPortal(
    <div
      data-tour-layer=""
      className={`fixed inset-0 z-50 transition-opacity duration-200 motion-reduce:transition-none ${
        firstShown ? "opacity-100" : "opacity-0"
      }`}
      // Clicking the dimmed page does nothing and keeps focus in the panel.
      onMouseDown={(event) => {
        if (!panelRef.current?.contains(event.target as Node)) event.preventDefault();
      }}
    >
      {/* The spotlight: everything outside the highlighted area is dimmed and can't be clicked. It moves to the next
          step's target only once that target has settled, easing just for that move. */}
      {spot ? (
        <div
          key="spot"
          aria-hidden="true"
          className={`pointer-events-none fixed border-2 border-accent ${
            moving ? "transition-all duration-200 motion-reduce:transition-none" : ""
          }`}
          style={{ ...spot, boxShadow: "0 0 0 9999px rgba(28, 26, 22, 0.55)" }}
          onTransitionEnd={() => setMoving(false)}
        />
      ) : (
        <div key="dim" aria-hidden="true" className="fixed inset-0 bg-ink/55" />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onKeyDown={trapTab}
        // Hidden at once when the step changes; fades in once the new step has settled.
        className={`fixed border border-ink bg-paper text-ink ${
          docked ? "inset-x-0 bottom-0 border-x-0 border-b-0 px-[18px] pb-4 pt-3.5" : "w-[340px] p-5"
        } ${
          panelVisible
            ? "opacity-100 transition-opacity duration-200 motion-reduce:transition-none"
            : "pointer-events-none opacity-0"
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
    </div>,
    document.body,
  );
}
