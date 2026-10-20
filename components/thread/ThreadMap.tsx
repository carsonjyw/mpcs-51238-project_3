"use client";

import { useElementWidth } from "@/lib/useElementWidth";
import { READING_TYPES, RELATIONSHIPS } from "@/lib/relationships";
import type { Reading, Thread } from "@/lib/types";
import { lineStyle, relationshipColor, RelationshipLabel } from "./RelationshipLabel";

/** Below this width larger maps stack readings under the question instead of placing them in a circle. */
const RADIAL_MIN_WIDTH = 560;
/** Below this width the one-reading figure runs top to bottom instead of left to right. */
const FIGURE_ROW_MIN_WIDTH = 520;
const PER_RING = 8;
/** Up to this many readings sit beside the question (left and right) when there is room, using the width. */
const SIDE_BY_SIDE_MAX = 4;

const SIZES = { nodeW: 216, nodeH: 112, centerW: 250, centerH: 128, ringY: 170, ringGap: 136 };

interface Placed {
  reading: Reading;
  x: number;
  y: number;
}

const SIDE_GAP = 72;
const SIDE_BY_SIDE_MIN_WIDTH = 2 * SIZES.nodeW + SIZES.centerW + 2 * SIDE_GAP;

/**
 * Small maps on wide screens: readings alternate left and right of the question (in the order they were
 * added), so the whole map stays short and uses the available width.
 */
function sideBySide(readings: Reading[], width: number) {
  const left = readings.filter((_, index) => index % 2 === 0);
  const right = readings.filter((_, index) => index % 2 === 1);
  const rowGap = 28;
  const columnHeight = (count: number) => count * SIZES.nodeH + (count - 1) * rowGap;
  const height = Math.max(SIZES.centerH, columnHeight(left.length), columnHeight(right.length)) + 16;
  const cx = width / 2;
  const cy = height / 2;
  const gap = Math.min(160, (width - 2 * SIZES.nodeW - SIZES.centerW) / 2);
  const offset = SIZES.centerW / 2 + gap + SIZES.nodeW / 2;
  const column = (items: Reading[], x: number): Placed[] =>
    items.map((reading, index) => ({
      reading,
      x,
      y: cy + (index - (items.length - 1) / 2) * (SIZES.nodeH + rowGap),
    }));
  return { placed: [...column(left, cx - offset), ...column(right, cx + offset)], height, cx, cy };
}

/**
 * Automatic radial layout: the question sits at the center and readings are spaced evenly on a circle,
 * in the order they were added, starting at the top. Past eight readings they continue on outer rings.
 */
function layout(readings: Reading[], width: number) {
  if (readings.length <= SIDE_BY_SIDE_MAX && width >= SIDE_BY_SIDE_MIN_WIDTH) return sideBySide(readings, width);
  const rings = Math.max(1, Math.ceil(readings.length / PER_RING));
  const outerY = SIZES.ringY + SIZES.ringGap * (rings - 1);
  const height = 2 * outerY + SIZES.nodeH + 16;
  const cx = width / 2;
  const cy = height / 2;
  const maxX = Math.min(width / 2 - SIZES.nodeW / 2 - 4, 340);

  const placed: Placed[] = readings.map((reading, index) => {
    const ring = Math.floor(index / PER_RING);
    const inRing = Math.min(PER_RING, readings.length - ring * PER_RING);
    const step = (2 * Math.PI) / inRing;
    const angle = -Math.PI / 2 + (index % PER_RING) * step + (ring % 2 ? step / 2 : 0);
    const rx = rings === 1 ? maxX : maxX * (0.62 + (0.38 * ring) / (rings - 1));
    const ry = SIZES.ringY + SIZES.ringGap * ring;
    return { reading, x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  });

  return { placed, height, cx, cy };
}

function nodeLabel(reading: Reading) {
  const parts = [reading.title, READING_TYPES[reading.type]];
  if (reading.author) parts.push(`by ${reading.author}`);
  parts.push(RELATIONSHIPS[reading.relationship].label);
  return parts.join(", ");
}

export function ThreadMap({
  thread,
  selectedId,
  highlightId,
  onSelect,
  registerNode,
  interactive = true,
  compact = false,
}: {
  thread: Thread;
  selectedId?: string | null;
  highlightId?: string | null;
  onSelect?: (readingId: string) => void;
  registerNode?: (readingId: string, element: HTMLButtonElement | null) => void;
  /** Non-interactive maps (previews) are hidden from assistive technology; their content is shown as text elsewhere. */
  interactive?: boolean;
  /** Slightly smaller type for the first-visit preview plate. */
  compact?: boolean;
}) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();

  /** Wraps node content in a button (interactive maps) or a plain element (previews). The spine shows the relationship. */
  function node(reading: Reading, className: string, content: React.ReactNode, style?: React.CSSProperties) {
    const selected = selectedId === reading.id;
    const classes = `${className} ${selected ? "outline outline-2 outline-offset-4 outline-accent" : ""} ${
      highlightId === reading.id ? "fade-in" : ""
    }`;
    const spine = { borderLeftColor: relationshipColor[reading.relationship], ...style };
    // The reading that raised the question is a target for the first-use tour.
    const tour = reading.relationship === "raised" ? "reading-node" : undefined;
    if (!interactive) {
      return (
        <div key={reading.id} className={classes} style={spine} data-tour={tour}>
          {content}
        </div>
      );
    }
    return (
      <button
        key={reading.id}
        ref={(element) => registerNode?.(reading.id, element)}
        type="button"
        aria-pressed={selected}
        aria-label={nodeLabel(reading)}
        onClick={() => onSelect?.(reading.id)}
        className={`${classes} cursor-pointer hover:bg-white`}
        style={spine}
        data-tour={tour}
      >
        {content}
      </button>
    );
  }

  const meta = (reading: Reading) => `${READING_TYPES[reading.type]}${reading.author ? ` · ${reading.author}` : ""}`;

  let body: React.ReactNode = null;

  if (thread.readings.length === 1) {
    // One reading and one question: the composed figure from Concept A, in normal flow so text wraps naturally.
    const reading = thread.readings[0];
    const row = width === 0 || width >= FIGURE_ROW_MIN_WIDTH;
    const size = row ? (compact ? "text-[2.5rem]" : "text-[3.25rem]") : "text-[2.125rem]";
    body = (
      <div className={row ? "flex items-center" : "figure-v flex flex-col items-start"}>
        {node(
          reading,
          "book",
          <>
            <span className="t">{reading.title}</span>
            <span className="m">{meta(reading)}</span>
          </>,
        )}
        <div className="link" aria-hidden="true">
          <span className="annot">{RELATIONSHIPS[reading.relationship].label.toLowerCase()}</span>
        </div>
        <div className="min-w-0 flex-1" data-tour="question-node">
          <p className="mono-label">The question</p>
          <p className={`quote-q mt-3 ${size}`}>{thread.question}</p>
        </div>
      </div>
    );
  } else if (width > 0) {
    const card =
      "flex flex-col items-start overflow-hidden border border-ink border-l-[6px] bg-paper-raised px-3 py-2.5 text-left";
    const cardContent = (reading: Reading, clamp: boolean) => (
      <>
        <RelationshipLabel relationship={reading.relationship} size="xs" />
        <span className={`book-title mt-1.5 text-[1.1875rem] leading-[1.15] text-ink ${clamp ? "line-clamp-2" : ""}`}>
          {reading.title}
        </span>
        <span
          className={`mt-1 font-mono text-[11px] uppercase tracking-[0.05em] text-ink-muted ${clamp ? "line-clamp-1" : ""}`}
        >
          {meta(reading)}
        </span>
      </>
    );
    const question = (style?: React.CSSProperties, clamp = true) => (
      <div
        className="flex flex-col justify-center border border-ink bg-paper-raised px-4 py-3 text-center"
        style={style}
        data-tour="question-node"
      >
        <span className="mono-label">The question</span>
        <span className={`quote-q mt-1.5 text-[1.375rem] ${clamp ? "line-clamp-4" : ""}`}>{thread.question}</span>
      </div>
    );

    if (width >= RADIAL_MIN_WIDTH) {
      const { placed, height, cx, cy } = layout(thread.readings, width);
      body = (
        <div className="relative" style={{ height }}>
          <svg aria-hidden="true" className="absolute inset-0" width={width} height={height}>
            {placed.map(({ reading, x, y }) => (
              <line
                key={reading.id}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={relationshipColor[reading.relationship]}
                {...lineStyle(reading.relationship)}
              />
            ))}
          </svg>
          {question({
            position: "absolute",
            left: cx - SIZES.centerW / 2,
            top: cy - SIZES.centerH / 2,
            width: SIZES.centerW,
            height: SIZES.centerH,
          })}
          {placed.map(({ reading, x, y }) =>
            node(reading, card, cardContent(reading, true), {
              position: "absolute",
              left: x - SIZES.nodeW / 2,
              top: y - SIZES.nodeH / 2,
              width: SIZES.nodeW,
              height: SIZES.nodeH,
            }),
          )}
        </div>
      );
    } else {
      // Narrow screens: the question on top, each reading branching off a shared line below it.
      body = (
        <div>
          {question(undefined, false)}
          <ul className="ml-5 border-l border-ink pt-3">
            {thread.readings.map((reading) => (
              <li key={reading.id} className="relative py-1.5 pl-8">
                <svg aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2" width="30" height="10">
                  <line
                    x1="0"
                    y1="5"
                    x2="30"
                    y2="5"
                    stroke={relationshipColor[reading.relationship]}
                    {...lineStyle(reading.relationship)}
                  />
                </svg>
                {node(reading, `${card} w-full`, cardContent(reading, false))}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }

  return (
    <div ref={containerRef} aria-hidden={interactive ? undefined : true} className="w-full">
      {body}
    </div>
  );
}
