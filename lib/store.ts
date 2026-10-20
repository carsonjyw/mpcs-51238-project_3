"use client";

import { useSyncExternalStore } from "react";
import type { AppData, Reading, Thread } from "./types";

export const STORAGE_KEY = "reading-map:v1";

/**
 * saved       – changes are written to localStorage
 * unavailable – the browser refused storage (private mode, blocked); changes last for this session only
 * failed      – a write failed (for example, storage is full); changes last for this session only
 * unreadable  – saved data exists but could not be read; it is left untouched and never overwritten
 */
export type Persistence = "saved" | "unavailable" | "failed" | "unreadable";

export type StoreState =
  | { status: "loading" }
  | { status: "ready"; data: AppData; persistence: Persistence };

export interface SaveResult {
  persisted: boolean;
}

const LOADING: StoreState = { status: "loading" };
let state: StoreState = LOADING;
const listeners = new Set<() => void>();
let listeningToOtherTabs = false;

function emptyData(): AppData {
  return { threads: [] };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isReading(value: unknown): value is Reading {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    isString(r.id) &&
    isString(r.title) &&
    (r.type === "book" || r.type === "article") &&
    ["raised", "supports", "challenges", "perspective"].includes(r.relationship as string) &&
    isString(r.addedAt) &&
    (r.author === undefined || isString(r.author)) &&
    (r.url === undefined || isString(r.url)) &&
    (r.note === undefined || isString(r.note))
  );
}

function isThread(value: unknown): value is Thread {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  const nextStep = t.nextStep as Record<string, unknown> | null;
  return (
    isString(t.id) &&
    isString(t.question) &&
    isString(t.createdAt) &&
    isString(t.updatedAt) &&
    Array.isArray(t.readings) &&
    t.readings.length > 0 &&
    t.readings.every(isReading) &&
    (t.readings[0] as Reading).relationship === "raised" &&
    (nextStep === null || (typeof nextStep === "object" && isString(nextStep.text) && isString(nextStep.setAt)))
  );
}

function isAppData(value: unknown): value is AppData {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as AppData).threads) &&
    (value as AppData).threads.every(isThread)
  );
}

function readFromStorage(): StoreState {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { status: "ready", data: emptyData(), persistence: "unavailable" };
  }

  let data = emptyData();
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isAppData(parsed)) throw new Error("Unexpected shape");
      data = parsed;
    } catch {
      return { status: "ready", data: emptyData(), persistence: "unreadable" };
    }
  }

  // Check that writes work too, so the first visit can be honest before anything is typed.
  try {
    const probe = `${STORAGE_KEY}:probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
  } catch {
    return { status: "ready", data, persistence: "unavailable" };
  }

  return { status: "ready", data, persistence: "saved" };
}

function ensureLoaded() {
  if (state.status === "loading" && typeof window !== "undefined") {
    state = readFromStorage();
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function handleOtherTab(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  if (state.status === "ready" && state.persistence === "unreadable") return;
  state = readFromStorage();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!listeningToOtherTabs) {
    window.addEventListener("storage", handleOtherTab);
    listeningToOtherTabs = true;
  }
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): StoreState {
  ensureLoaded();
  return state;
}

function getServerSnapshot(): StoreState {
  return LOADING;
}

/** Saved data, or `{ status: "loading" }` until the browser has read it (always on the server). */
export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Applies an update in memory and tries to write it to localStorage.
 * `persisted` is true only when the write succeeded.
 */
export function commit(update: (data: AppData) => AppData): SaveResult {
  ensureLoaded();
  if (state.status !== "ready") return { persisted: false };

  const data = update(state.data);
  let persistence = state.persistence;

  if (persistence !== "unreadable") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      persistence = "saved";
    } catch {
      persistence = persistence === "unavailable" ? "unavailable" : "failed";
    }
  }

  state = { status: "ready", data, persistence };
  emit();
  return { persisted: persistence === "saved" };
}

/** Small per-device preferences (such as Map/List). Failures are ignored. */
export function readPreference(key: string): string | null {
  try {
    return window.localStorage.getItem(`reading-map:pref:${key}`);
  } catch {
    return null;
  }
}

export function writePreference(key: string, value: string) {
  try {
    window.localStorage.setItem(`reading-map:pref:${key}`, value);
  } catch {
    // Preferences are a convenience; nothing to tell the user.
  }
}
