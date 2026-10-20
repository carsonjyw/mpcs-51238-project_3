"use client";

import { useId, type ReactNode } from "react";

/** A button that shows and hides a region. Open state is controlled so forms can force it open. */
export function Disclosure({
  summary,
  caption,
  open,
  onOpenChange,
  children,
  className = "",
}: {
  summary: ReactNode;
  caption?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => onOpenChange(!open)}
        className="group flex min-h-11 w-full items-start gap-2 rounded-lg py-1.5 text-left font-semibold text-accent hover:underline hover:underline-offset-4"
      >
        <span aria-hidden="true" className={`mt-0.5 inline-block transition-transform ${open ? "rotate-90" : ""}`}>
          ▸
        </span>
        <span>
          {summary}
          {caption ? <span className="block text-[0.95rem] font-normal text-ink-muted">{caption}</span> : null}
        </span>
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
