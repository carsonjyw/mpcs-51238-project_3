import { isOriginal } from "@/lib/threads";
import { READING_TYPES } from "@/lib/relationships";
import type { Reading } from "@/lib/types";
import { Button, ButtonLink } from "../ui/Button";

export function ReadingMeta({ reading }: { reading: Reading }) {
  return (
    <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.05em] text-ink-muted">
      {READING_TYPES[reading.type]}
      {reading.author ? ` · by ${reading.author}` : ""}
      {reading.url ? (
        <>
          {" · "}
          <a href={reading.url} target="_blank" rel="noopener noreferrer" className="textlink font-sans normal-case tracking-normal">
            Open link<span className="sr-only"> to {reading.title} (opens in a new tab)</span>
          </a>
        </>
      ) : null}
    </p>
  );
}

/** The full contribution note, or the original reading's optional notes. */
export function ReadingNote({ reading }: { reading: Reading }) {
  const original = isOriginal(reading);
  return (
    <div className="mt-3">
      <p className="mono-label">
        {original ? "Notes" : "How it changes your thinking"}
      </p>
      {reading.note ? (
        <p className="mt-1 whitespace-pre-line">{reading.note}</p>
      ) : (
        <p className="mt-1 text-ink-muted">No notes yet.</p>
      )}
    </div>
  );
}

/** Edit for every reading; Remove only for connected readings (the original reading starts the thread). */
export function ReadingActions({
  reading,
  editHref,
  onRemove,
  extra,
}: {
  reading: Reading;
  editHref: string;
  onRemove: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <ButtonLink href={editHref} variant="secondary">
        Edit<span className="sr-only"> “{reading.title}”</span>
      </ButtonLink>
      {isOriginal(reading) ? null : (
        <Button variant="danger" onClick={onRemove}>
          Remove<span className="sr-only"> “{reading.title}”</span>
        </Button>
      )}
      {extra}
    </div>
  );
}
