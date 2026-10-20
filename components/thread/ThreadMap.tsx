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

  const radial = width >= (compact ? 420 : RADIAL_MIN_WIDTH);

  function renderNode(reading: Reading, style?: React.CSSProperties) {
    const selected = selectedId === reading.id;
    const content = (
      <>
        <RelationshipLabel relationship={reading.relationship} size="xs" />
        <span className={`mt-1 line-clamp-2 font-serif font-semibold leading-snug text-ink ${compact ? "text-[0.95rem]" : "text-base"}`}>
          {reading.title}
        </span>
        <span className="mt-0.5 line-clamp-1 text-[0.82rem] text-ink-muted">
          {READING_TYPES[reading.type]}
          {reading.author ? ` · ${reading.author}` : ""}
        </span>
      </>
    );
    const classes = `flex flex-col items-start overflow-hidden rounded-lg border bg-paper-raised px-3 py-2 text-left shadow-sm ${
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

  const question = (style?: React.CSSProperties) => (
    <div
      className="flex flex-col justify-center rounded-xl border-2 border-ink bg-paper-raised px-4 py-3 text-center"
      style={style}
    >
      <span className="text-[0.72rem] font-semibold uppercase tracking-wide text-ink-muted">Question</span>
      <span className={`line-clamp-4 font-serif font-semibold leading-snug ${compact ? "text-base" : "text-lg"}`}>
        {thread.question}
      </span>
    </div>
  );

  let body: React.ReactNode = null;
  if (width > 0 && radial) {
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
