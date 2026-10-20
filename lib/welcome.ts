/**
 * The first-visit welcome, shown once per browser. People who already used the app (saved data, or any
 * recorded tour progress, including the earlier single-page tour) never see it.
 */
const KEY = "reading-map:welcome";
const EXISTING_USE = ["reading-map:v1", "reading-map:tour", "reading-map:first-run-tour"];

export function shouldShowWelcome(): boolean {
  try {
    const storage = window.localStorage;
    if (storage.getItem(KEY) !== null) return false;
    return EXISTING_USE.every((key) => storage.getItem(key) === null);
  } catch {
    // Without storage it couldn't be remembered, so it would replay on every visit: skip it.
    return false;
  }
}

export function markWelcomeSeen() {
  try {
    window.localStorage.setItem(KEY, "seen");
  } catch {
    // Nothing else depends on this.
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
