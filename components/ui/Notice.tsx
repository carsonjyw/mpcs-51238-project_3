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
  children,
  className = "",
}: {
  tone?: keyof typeof tones;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={children ? className : "sr-only"}>
      {children ? (
        <p className={`rounded-lg border px-4 py-3 font-semibold ${tones[tone]}`}>{children}</p>
      ) : null}
    </div>
  );
}
