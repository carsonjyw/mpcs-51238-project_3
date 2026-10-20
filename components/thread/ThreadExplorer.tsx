"use client";

import { useEffect, useId, useRef, useState } from "react";
import { connectPath } from "@/lib/navigation";
import { readPreference, writePreference } from "@/lib/store";
import { removeReading } from "@/lib/threads";
import { SESSION_ONLY } from "@/lib/flash";
import type { Thread } from "@/lib/types";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { MapLegend, RelationshipLabel } from "./RelationshipLabel";
import { ReadingActions, ReadingMeta, ReadingNote } from "./ReadingInfo";
import { ThreadMap } from "./ThreadMap";

type View = "map" | "list";

/**
 * The thread's readings as a map (with a detail panel) or as a list. Both show the same content:
 * relationship labels, full notes, and the same actions. `readOnly` hides all editing (the example).
 */
export function ThreadExplorer({
  thread,
  readOnly = false,
  showBoth = false,
  openReadingId,
  onNotice,
  level = 2,
  quietHeading = false,
  panelOnDemand = false,
}: {
  thread: Thread;
  /** Heading level for "Readings"; reading titles use the next level down. */
  level?: 2 | 3;
  /** Keep the "Readings" heading for screen readers only, so the map follows the page heading directly. */
  quietHeading?: boolean;
  /** Show the details panel only once a reading is selected, so a small map isn't paired with an empty box. */
  panelOnDemand?: boolean;
  readOnly?: boolean;
  /** Show the map and the list together instead of a Map/List toggle (used by the example). */
  showBoth?: boolean;
  /** Reading to select and open, for example right after it was saved. */
  openReadingId?: string | null;
  onNotice?: (message: string, tone: "success" | "warning") => void;
}) {
  const [view, setView] = useState<View>(() => (readPreference("view") === "list" ? "list" : "map"));
  const [selectedId, setSelectedId] = useState<string | null>(openReadingId ?? null);
  const [followedOpenId, setFollowedOpenId] = useState(openReadingId);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const nodes = useRef(new Map<string, HTMLButtonElement>());
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const regionHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusPanelOnSelect = useRef(false);
  const headingId = useId();
  const panelId = useId();

  // A newly saved reading opens in the detail panel (adjusting state during render, not in an effect).
  if (openReadingId !== followedOpenId) {
    setFollowedOpenId(openReadingId);
    if (openReadingId) setSelectedId(openReadingId);
  }

  const selected = thread.readings.find((reading) => reading.id === selectedId) ?? null;

  useEffect(() => {
    if (selected && focusPanelOnSelect.current) {
      focusPanelOnSelect.current = false;
      panelHeadingRef.current?.focus();
    }
  }, [selected]);

  function chooseView(next: View) {
    setView(next);
    writePreference("view", next);
  }

  function select(readingId: string) {
    focusPanelOnSelect.current = true;
    setSelectedId(readingId);
  }

  function closePanel() {
    const id = selectedId;
    setSelectedId(null);
    if (id) nodes.current.get(id)?.focus();
  }

  function confirmRemoval() {
    const reading = thread.readings.find((r) => r.id === pendingRemoval);
    setPendingRemoval(null);
    if (!reading) return;
    const { persisted } = removeReading(thread.id, reading.id);
    if (selectedId === reading.id) setSelectedId(null);
    onNotice?.(
      persisted ? `Removed “${reading.title}”.` : `Removed “${reading.title}”. ${SESSION_ONLY}`,
      persisted ? "success" : "warning",
    );
    regionHeadingRef.current?.focus();
  }

  const Heading = level === 2 ? "h2" : "h3";
  const SubHeading = level === 2 ? "h3" : "h4";

  const editHref = (readingId: string) => connectPath(thread.id, { readingId, returnTo: "thread" });
  const pendingReading = thread.readings.find((r) => r.id === pendingRemoval);

  const showPanel = !panelOnDemand || selected !== null;
  const relationships = thread.readings.map((reading) => reading.relationship);
  const mapView = (
    <div
      className={showPanel ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]" : ""}
      onKeyDown={(event) => {
        if (event.key === "Escape" && selectedId) {
          event.stopPropagation();
          closePanel();
        }
      }}
    >
      {/* The map sits on a plate, as in the first-visit preview. */}
      <div className="bg-paper-sunk px-5 pb-8 pt-10 sm:px-12 sm:pt-14">
        <div role="group" aria-label={`Map: readings connected to “${thread.question}”`}>
          <ThreadMap
            thread={thread}
            selectedId={selectedId}
            highlightId={openReadingId}
            onSelect={select}
            registerNode={(id, element) => {
              if (element) nodes.current.set(id, element);
              else nodes.current.delete(id);
            }}
          />
        </div>
        {relationships.some((relationship) => relationship !== "raised") ? (
          <div className="mt-8">
            <MapLegend relationships={relationships} />
          </div>
        ) : null}
        {showPanel ? null : (
          <p className="fine mt-8 text-center">Select the book to see its details.</p>
        )}
      </div>
      {showPanel ? (
        <section
          id={panelId}
          aria-label={selected ? undefined : "Reading details"}
          aria-labelledby={selected ? `${panelId}-title` : undefined}
          className="self-start border border-ink bg-paper-raised p-5"
        >
          {selected ? (
            <>
              <RelationshipLabel relationship={selected.relationship} />
              <SubHeading
                id={`${panelId}-title`}
                ref={panelHeadingRef}
                tabIndex={-1}
                className="book-title mt-2 text-[1.625rem] leading-[1.1]"
              >
                {selected.title}
              </SubHeading>
              <ReadingMeta reading={selected} />
              <ReadingNote reading={selected} />
              {readOnly ? (
                <div className="mt-4">
                  <Button variant="secondary" onClick={closePanel}>
                    Close
                  </Button>
                </div>
              ) : (
                <ReadingActions
                  reading={selected}
                  editHref={editHref(selected.id)}
                  onRemove={() => setPendingRemoval(selected.id)}
                  extra={
                    <Button variant="quiet" onClick={closePanel}>
                      Close
                    </Button>
                  }
                />
              )}
            </>
          ) : (
            <p className="text-ink-muted">
              Select a reading on the map to see its full note{readOnly ? "" : " and actions"}.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );

  const listView = (
    <ol className="border-t border-ink">
      {thread.readings.map((reading) => (
        <li
          key={reading.id}
          className={`border-b border-line py-5 ${openReadingId === reading.id ? "fade-in bg-paper-raised px-4" : ""}`}
        >
          <RelationshipLabel relationship={reading.relationship} />
          <SubHeading className="book-title mt-2 text-[1.625rem] leading-[1.1]">{reading.title}</SubHeading>
          <ReadingMeta reading={reading} />
          <ReadingNote reading={reading} />
          {readOnly ? null : (
            <ReadingActions
              reading={reading}
              editHref={editHref(reading.id)}
              onRemove={() => setPendingRemoval(reading.id)}
            />
          )}
        </li>
      ))}
    </ol>
  );

  return (
    <section aria-labelledby={headingId}>
      <div
        className={`flex flex-wrap items-center gap-3 ${quietHeading ? "border-b border-line" : "mb-4 justify-between"}`}
      >
        <Heading id={headingId} ref={regionHeadingRef} tabIndex={-1} className={quietHeading ? "sr-only" : "text-2xl"}>
          Readings <span className="font-sans text-base font-normal text-ink-muted">({thread.readings.length})</span>
        </Heading>
        {showBoth ? null : (
          <div role="group" aria-label="View" className="flex gap-[22px]">
            {(["map", "list"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => chooseView(option)}
                className={`min-h-10 py-2.5 text-[0.875rem] ${
                  view === option
                    ? "font-semibold text-ink shadow-[inset_0_-2px_0_var(--color-ink)]"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {option === "map" ? "Map" : "List"}
              </button>
            ))}
          </div>
        )}
      </div>

      {showBoth ? (
        <>
          {mapView}
          <SubHeading className="mb-3 mt-8 text-xl font-semibold">As a list</SubHeading>
          {listView}
        </>
      ) : view === "map" ? (
        mapView
      ) : (
        listView
      )}

      {readOnly ? null : (
        <ConfirmDialog
          open={pendingReading !== undefined}
          title="Remove this reading?"
          confirmLabel="Remove reading"
          onConfirm={confirmRemoval}
          onCancel={() => setPendingRemoval(null)}
        >
          Remove “{pendingReading?.title}” from this thread? Its note will be deleted.
        </ConfirmDialog>
      )}
    </section>
  );
}
