import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full py-2 text-[0.9375rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

/** Concept A: an ink pill for the main action; outlined pills for the rest. */
const variants: Record<Variant, string> = {
  primary: "btn-ink bg-ink px-6 text-paper hover:bg-[#33302a]",
  secondary: "border border-ink px-6 text-ink hover:bg-ink hover:text-paper",
  quiet: "px-0 font-medium text-ink underline decoration-line-strong underline-offset-[3px] hover:decoration-ink",
  danger: "border border-danger px-6 text-danger hover:bg-danger hover:text-paper",
};

export function buttonClasses(variant: Variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
