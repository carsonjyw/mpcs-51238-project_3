import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

/** HOME / THREAD QUESTION / CURRENT PAGE, set in small mono. The last crumb is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-[12px] uppercase tracking-[0.04em]">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="textlink max-w-[28ch] truncate">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="max-w-[28ch] truncate text-ink-muted">
                  {item.label}
                </span>
              )}
              {last ? null : <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
