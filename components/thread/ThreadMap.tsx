"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { READING_TYPES, RELATIONSHIPS } from "@/lib/relationships";
import type { Reading, Thread } from "@/lib/types";
import { lineStyle, relationshipColor, RelationshipLabel } from "./RelationshipLabel";

/** Below this width the map stacks readings under the question instead of placing them in a circle. */
const RADIAL_MIN_WIDTH = 560;
const PER_RING = 8;

interface Sizes {
  nodeW: number;
  nodeH: number;
  centerW: number;
  centerH: number;
  ringY: number;
  ringGap: number;
}

const FULL: Sizes = { nodeW: 184, nodeH: 96, centerW: 236, centerH: 116, ringY: 160, ringGap: 124 };
const COMPACT: Sizes = { nodeW: 184, nodeH: 84, centerW: 210, centerH: 96, ringY: 120, ringGap: 100 };

interface Placed {
  reading: Reading;
  x: number;
  y: number;
}

/**
 * Automatic radial layout: the question sits at the center and readings are spaced evenly on a circle,
 * in the order they were added, starting at the top. Past eight readings they continue on outer rings.
 */
function layout(readings: Reading[], width: number, sizes: Sizes) {
  const rings = Math.max(1, Math.ceil(readings.length / PER_RING));
  const outerY = sizes.ringY + sizes.ringGap * (rings - 1);
  const height = 2 * outerY + sizes.nodeH + 16;
  const cx = width / 2;
  const cy = height / 2;
  const maxX = Math.min(width / 2 - sizes.nodeW / 2 - 4, 320);

  const placed: Placed[] = readings.map((reading, index) => {
    const ring = Math.floor(index / PER_RING);
    const inRing = Math.min(PER_RING, readings.length - ring * PER_RING);
    const step = (2 * Math.PI) / inRing;
    const angle = -Math.PI / 2 + (index % PER_RING) * step + (ring % 2 ? step / 2 : 0);
    const rx = rings === 1 ? maxX : maxX * (0.62 + (0.38 * ring) / (rings - 1));
    const ry = sizes.ringY + sizes.ringGap * ring;
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
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const sizes = compact ? COMPACT : FULL;

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // One reading and one question: a compact two-node layout in normal flow, so long titles and
  // questions wrap naturally at any width. Larger threads go radial, or stack on narrow screens.
  const twoNode = thread.readings.length === 1;
  const radial = width >= (compact ? 420 : RADIAL_MIN_WIDTH);

  function renderNode(reading: Reading, style?: React.CSSProperties, flow = false) {
    const selected = selectedId === reading.id;
    const content = (
      <>
        <RelationshipLabel relationship={reading.relationship} size="xs" />
        <span className={`book-title mt-1 leading-snug text-ink ${flow ? "" : "line-clamp-2"} ${compact ? "text-[1rem]" : "text-[1.0625rem]"}`}>
          {reading.title}
        </span>
        <span className={`mt-0.5 text-[0.8125rem] text-ink-muted ${flow ? "" : "line-clamp-1"}`}>
          {READING_TYPES[reading.type]}
          {reading.author ? ` · ${reading.author}` : ""}
        </span>
      </>
    );
    const classes = `flex flex-col items-start overflow-hidden rounded-lg border bg-paper-raised px-3 py-2 text-left ${
      selected ? "border-accent ring-2 ring-accent" : "border-line-strong"
    } ${highlightId === reading.id ? "fade-in" : ""}`;

    if (!interactive) {
      return (
        <div key={reading.id} className={classes} style={style}>
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
        className={`${classes} hover:border-accent`}
        style={style}
      >
        {content}
      </button>
    );
  }

  const question = (style?: React.CSSProperties, flow = false) => (
    <div
      className={`flex flex-col justify-center rounded-xl border border-ink bg-paper-raised text-center ${flow ? "px-6 py-5" : "px-4 py-3"}`}
      style={style}
    >
      <span className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">Question</span>
      <span
        className={`mt-1 font-serif leading-[1.35] text-ink ${flow ? "" : "line-clamp-4"} ${
          flow ? (compact ? "text-[1.1875rem]" : "text-[1.3125rem]") : compact ? "text-base" : "text-lg"
        }`}
      >
        {thread.question}
      </span>
    </div>
  );

  let body: React.ReactNode = null;
  if (twoNode) {
    const reading = thread.readings[0];
    body = (
      <div className="flex flex-col items-center">
        {renderNode(reading, { width: "min(100%, 16rem)" }, true)}
        <svg aria-hidden="true" width="12" height="40" className="shrink-0">
          <line
            x1="6"
            y1="0"
            x2="6"
            y2="34"
            stroke={relationshipColor[reading.relationship]}
            {...lineStyle(reading.relationship)}
          />
          <circle cx="6" cy="36" r="3.5" fill="var(--color-ink)" />
        </svg>
        {question({ width: "min(100%, 24rem)" }, true)}
      </div>
    );
  } else if (width > 0 && radial) {
    const { placed, height, cx, cy } = layout(thread.readings, width, sizes);
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
          left: cx - sizes.centerW / 2,
          top: cy - sizes.centerH / 2,
          width: sizes.centerW,
          height: sizes.centerH,
        })}
        {placed.map(({ reading, x, y }) =>
          renderNode(reading, {
            position: "absolute",
            left: x - sizes.nodeW / 2,
            top: y - sizes.nodeH / 2,
            width: sizes.nodeW,
            height: sizes.nodeH,
          }),
        )}
      </div>
    );
  } else if (width > 0) {
    // Narrow screens: the question on top, each reading branching off a shared line below it.
    body = (
      <div>
        {question()}
        <ul className="ml-5 border-l-2 border-line-strong pt-3">
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
              {renderNode(reading, { width: "100%", minHeight: compact ? 64 : 80 })}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={containerRef} aria-hidden={interactive ? undefined : true} className="w-full">
      {body}
    </div>
  );
}
