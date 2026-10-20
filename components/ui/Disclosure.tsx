"use client";

import { useId, type ReactNode } from "react";

/**
 * A text-link button that shows and hides a region (Concept A). Open state is controlled so forms can
 * force it open. `before` renders on the same line as the button, such as a compact toggle.
 */
export function Disclosure({
  summary,
  open,
  onOpenChange,
  children,
  before,
  className = "",
}: {
  summary: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  before?: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {before}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => onOpenChange(!open)}
          className="textlink min-h-9 text-left text-[0.8125rem]"
        >
          <span aria-hidden="true">{open ? "− " : "+ "}</span>
          {summary}
        </button>
      </div>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
