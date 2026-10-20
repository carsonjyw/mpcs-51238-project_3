import type { ReactNode } from "react";

const tones = {
  success: "border-success-ink/30 bg-success-soft text-success-ink",
  warning: "border-warning-ink/30 bg-warning-soft text-warning-ink",
  info: "border-line bg-paper-raised text-ink",
};

/**
 * A live region that is always rendered, so messages added after the page appears are announced.
 */
export function Notice({
  tone = "success",
  quiet = false,
  children,
  className = "",
}: {
  tone?: keyof typeof tones;
  /** A small inline confirmation with a check mark, for successful saves. Warnings always use the box. */
  quiet?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const inline = quiet && tone === "success";
  return (
    <div role="status" aria-live="polite" className={children ? className : "sr-only"}>
      {children ? (
        inline ? (
          <p className="flex items-center gap-1.5 text-[0.875rem] font-semibold text-success-ink">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.75 8.25 7 10.5l4.25-4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {children}
          </p>
        ) : (
          <p className={`rounded-lg border px-4 py-3 text-[0.9375rem] font-semibold ${tones[tone]}`}>{children}</p>
        )
      ) : null}
    </div>
  );
}
