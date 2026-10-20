import { commit, type SaveResult } from "./store";
import type {
  AppData,
  ConnectionRelationship,
  Reading,
  ReadingDetails,
  Thread,
} from "./types";

export type NextStepAction = { kind: "done" } | { kind: "replace"; text: string };

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function detailsToReading(details: ReadingDetails) {
  return {
    title: details.title.trim(),
    type: details.type,
    author: optional(details.author),
    url: optional(details.url),
  };
}

function updateThread(data: AppData, threadId: string, update: (thread: Thread) => Thread): AppData {
  return {
    threads: data.threads.map((thread) =>
      thread.id === threadId ? { ...update(thread), updatedAt: now() } : thread,
    ),
  };
}

export function getThread(data: AppData, threadId: string): Thread | undefined {
  return data.threads.find((thread) => thread.id === threadId);
}

export function threadsByActivity(data: AppData): Thread[] {
  return [...data.threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function isOriginal(reading: Reading): boolean {
  return reading.relationship === "raised";
}

export function createThread(input: ReadingDetails & { question: string }): SaveResult & { thread: Thread } {
  const time = now();
  const thread: Thread = {
    id: newId(),
    question: input.question.trim(),
    createdAt: time,
    updatedAt: time,
    readings: [{ id: newId(), ...detailsToReading(input), relationship: "raised", addedAt: time }],
    nextStep: null,
  };
  const result = commit((data) => ({ threads: [...data.threads, thread] }));
  return { ...result, thread };
}

export function updateQuestion(threadId: string, question: string): SaveResult {
  return commit((data) => updateThread(data, threadId, (t) => ({ ...t, question: question.trim() })));
}

function applyNextStep(thread: Thread, action: NextStepAction | undefined): Thread {
  if (!action) return thread;
  if (action.kind === "done") return { ...thread, nextStep: null };
  return { ...thread, nextStep: { text: action.text.trim(), setAt: now() } };
}

/**
 * Adds a connected reading. When `nextStep` is given, the thread's next step is completed or
 * replaced in the same save, so it never changes unless the reading is saved too.
 */
export function connectReading(
  threadId: string,
  input: ReadingDetails & { relationship: ConnectionRelationship; note: string },
  nextStep?: NextStepAction,
): SaveResult & { reading: Reading } {
  const reading: Reading = {
    id: newId(),
    ...detailsToReading(input),
    relationship: input.relationship,
    note: input.note.trim(),
    addedAt: now(),
  };
  const result = commit((data) =>
    updateThread(data, threadId, (t) => applyNextStep({ ...t, readings: [...t.readings, reading] }, nextStep)),
  );
  return { ...result, reading };
}

/** Edits a reading. The original reading keeps its "raised" relationship and its notes stay optional. */
export function updateReading(
  threadId: string,
  readingId: string,
  input: ReadingDetails & { relationship?: ConnectionRelationship; note: string },
): SaveResult {
  return commit((data) =>
    updateThread(data, threadId, (t) => ({
      ...t,
      readings: t.readings.map((r) => {
        if (r.id !== readingId) return r;
        return {
          ...r,
          ...detailsToReading(input),
          relationship: isOriginal(r) ? "raised" : (input.relationship ?? r.relationship),
          note: isOriginal(r) ? optional(input.note) : input.note.trim(),
        };
      }),
    })),
  );
}

/** Removes a connected reading. The original reading cannot be removed. */
export function removeReading(threadId: string, readingId: string): SaveResult {
  return commit((data) =>
    updateThread(data, threadId, (t) => ({
      ...t,
      readings: t.readings.filter((r) => r.id !== readingId || isOriginal(r)),
    })),
  );
}

export function setNextStep(threadId: string, text: string): SaveResult {
  return commit((data) => updateThread(data, threadId, (t) => applyNextStep(t, { kind: "replace", text })));
}

export function markNextStepDone(threadId: string): SaveResult {
  return commit((data) => updateThread(data, threadId, (t) => applyNextStep(t, { kind: "done" })));
}

export function deleteThread(threadId: string): SaveResult {
  return commit((data) => ({ threads: data.threads.filter((t) => t.id !== threadId) }));
}
