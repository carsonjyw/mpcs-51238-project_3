/**
 * First-use tour progress, under its own localStorage key (separate from saved threads and preferences).
 * Each chapter shows once, on the first visit to its page; "Skip tour" suppresses every remaining chapter.
 */
export type Chapter = "home" | "thread" | "connect" | "nextStep";

export interface TourStep {
  /** The `data-tour` value of the element being explained, inside the page. */
  target: string;
  title: string;
  body: string;
}

export const CHAPTERS: Record<Chapter, { steps: TourStep[]; finish: string }> = {
  home: {
    finish: "Get started",
    steps: [
      { target: "reading", title: "Add your reading", body: "Start with a book or article you’ve read." },
      {
        target: "question",
        title: "Capture your question",
        body: "What did it leave you wondering? This question becomes the center of your map.",
      },
    ],
  },
  thread: {
    finish: "Got it",
    steps: [
      { target: "question-node", title: "Your question", body: "Everything on this map connects to this question." },
      {
        target: "reading-node",
        title: "Connected readings",
        body: "Each reading links to the question. Select one to see your note.",
      },
      {
        target: "connect",
        title: "Connect another reading",
        body: "Read something related? Add it here and note how it changes your thinking.",
      },
    ],
  },
  connect: {
    finish: "Got it",
    steps: [
      {
        target: "relationship",
        title: "Choose how it relates",
        body: "Pick how this reading affects what you currently think: it supports, challenges, or adds a new perspective.",
      },
      {
        target: "note",
        title: "Note what changed",
        body: "One sentence is enough. Try “I originally thought… After reading this…”",
      },
    ],
  },
  nextStep: {
    finish: "Got it",
    steps: [
      {
        target: "next-step",
        title: "One next step",
        body: "Save one concrete thing to read or look into next. It will be waiting on your map.",
      },
    ],
  },
};

const KEY = "reading-map:tour";
/** The earlier single-page tour, so people who already saw it aren't shown the home chapter again. */
const LEGACY_KEY = "reading-map:first-run-tour";

interface TourProgress {
  skipped: boolean;
  seen: Partial<Record<Chapter, true>>;
}

function read(): TourProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<TourProgress>) : {};
    const progress: TourProgress = { skipped: parsed.skipped === true, seen: { ...(parsed.seen ?? {}) } };
    if (window.localStorage.getItem(LEGACY_KEY) === "seen") progress.seen.home = true;
    return progress;
  } catch {
    return { skipped: false, seen: {} };
  }
}

function write(progress: TourProgress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // If storage is unavailable, chapters may show again next time; nothing else depends on this.
  }
}

export function shouldShowChapter(chapter: Chapter): boolean {
  const progress = read();
  return !progress.skipped && !progress.seen[chapter];
}

/** Mark only this chapter as seen (as soon as it is shown, so refreshing doesn't reopen it). */
export function markChapterSeen(chapter: Chapter) {
  const progress = read();
  progress.seen[chapter] = true;
  write(progress);
}

/** "Skip tour": dismiss this chapter and suppress all remaining ones. */
export function skipTour() {
  const progress = read();
  progress.skipped = true;
  write(progress);
}
