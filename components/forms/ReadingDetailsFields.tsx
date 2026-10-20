"use client";

import type { ReactNode, Ref } from "react";
import { READING_TYPES } from "@/lib/relationships";
import type { ReadingDetails, ReadingType } from "@/lib/types";
import { Disclosure } from "../ui/Disclosure";
import { RadioGroup, TextField } from "../ui/Field";

export type DetailsErrors = Partial<Record<"title" | "author" | "url", ReactNode>>;

const typeOptions = (Object.keys(READING_TYPES) as ReadingType[]).map((value) => ({
  value,
  label: READING_TYPES[value],
}));

/** Title and type are always visible; author and link sit under "Add details (optional)". */
export function ReadingDetailsFields({
  values,
  errors,
  onChange,
  detailsOpen,
  onDetailsOpenChange,
  titleRef,
  authorRef,
  urlRef,
  titleLabel = "Title",
  compact = false,
}: {
  values: ReadingDetails;
  errors: DetailsErrors;
  onChange: (field: keyof ReadingDetails, value: string) => void;
  detailsOpen: boolean;
  onDetailsOpenChange: (open: boolean) => void;
  titleRef?: Ref<HTMLInputElement>;
  authorRef?: Ref<HTMLInputElement>;
  urlRef?: Ref<HTMLInputElement>;
  titleLabel?: string;
  /** First-visit layout: compact type pills and a one-line details toggle. */
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <TextField
        label={titleLabel}
        value={values.title}
        onChange={(value) => onChange("title", value)}
        error={errors.title}
        required
        inputRef={titleRef}
      />
      <RadioGroup
        legend="Type"
        name="type"
        options={typeOptions}
        value={values.type}
        onChange={(value) => onChange("type", value)}
        required
        inline
        compact={compact}
      />
      <Disclosure
        summary={compact ? "Add author or link (optional)" : "Add details (optional)"}
        caption={compact ? undefined : "Author and link"}
        open={detailsOpen}
        onOpenChange={onDetailsOpenChange}
      >
        <div className="mt-2 space-y-4 border-l border-line pl-4">
          <TextField
            label="Author"
            value={values.author}
            onChange={(value) => onChange("author", value)}
            error={errors.author}
            inputRef={authorRef}
          />
          <TextField
            label="Link"
            hint="Starts with https://"
            type="url"
            inputMode="url"
            value={values.url}
            onChange={(value) => onChange("url", value)}
            error={errors.url}
            inputRef={urlRef}
          />
        </div>
      </Disclosure>
    </div>
  );
}
