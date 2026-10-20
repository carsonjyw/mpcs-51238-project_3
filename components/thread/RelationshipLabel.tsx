import { RELATIONSHIPS } from "@/lib/relationships";
import type { Relationship } from "@/lib/types";

export const relationshipColor: Record<Relationship, string> = {
  raised: "var(--color-rel-raised)",
  supports: "var(--color-rel-supports)",
  challenges: "var(--color-rel-challenges)",
  perspective: "var(--color-rel-perspective)",
};

const textColor: Record<Relationship, string> = {
  raised: "text-rel-raised",
  supports: "text-rel-supports",
  challenges: "text-rel-challenges",
  perspective: "text-rel-perspective",
};

/** Stroke settings shared by the map's connection lines and the line samples. */
export function lineStyle(relationship: Relationship) {
  switch (RELATIONSHIPS[relationship].line) {
    case "solid":
      return { strokeWidth: 3, strokeDasharray: undefined, strokeLinecap: "butt" as const };
    case "dashed":
      return { strokeWidth: 3, strokeDasharray: "9 6", strokeLinecap: "butt" as const };
    case "dotted":
      return { strokeWidth: 3.5, strokeDasharray: "0.5 7", strokeLinecap: "round" as const };
    default:
      return { strokeWidth: 1.75, strokeDasharray: undefined, strokeLinecap: "butt" as const };
  }
}

/** A short sample of the connection's line style, so relationships never rely on color alone. */
export function LineSample({ relationship, width = 28 }: { relationship: Relationship; width?: number }) {
  return (
    <svg aria-hidden="true" width={width} height="10" viewBox={`0 0 ${width} 10`} className="shrink-0">
      <line x1="1" y1="5" x2={width - 1} y2="5" stroke={relationshipColor[relationship]} {...lineStyle(relationship)} />
    </svg>
  );
}

export function RelationshipLabel({
  relationship,
  size = "sm",
}: {
  relationship: Relationship;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap font-semibold ${textColor[relationship]} ${
        size === "xs" ? "text-[0.8rem]" : "text-[0.8rem] uppercase tracking-wide"
      }`}
    >
      <LineSample relationship={relationship} width={size === "xs" ? 20 : 28} />
      {RELATIONSHIPS[relationship].label}
    </span>
  );
}

export function MapLegend() {
  return (
    <ul aria-label="How connections are drawn" className="flex flex-wrap gap-x-5 gap-y-2 text-[0.9rem] text-ink-muted">
      {(["supports", "challenges", "perspective", "raised"] as const).map((relationship) => (
        <li key={relationship} className="flex items-center gap-2">
          <LineSample relationship={relationship} />
          {RELATIONSHIPS[relationship].label}
          <span className="sr-only">
            : {RELATIONSHIPS[relationship].line === "neutral" ? "thin" : RELATIONSHIPS[relationship].line} line
          </span>
        </li>
      ))}
    </ul>
  );
}
