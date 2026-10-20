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

/** The title on a writing line; below it, a compact Book/Article toggle and "+ Author or link (optional)". */
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
  number,
  large = false,
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
  /** Journal number for the title label, such as "01". */
  number?: string;
  large?: boolean;
}) {
  return (
    <div>
      <TextField
        label={titleLabel}
        number={number}
        large={large}
        value={values.title}
        onChange={(value) => onChange("title", value)}
        error={errors.title}
        required
        inputRef={titleRef}
      />
      <Disclosure
        className="mt-3"
        summary="Author or link (optional)"
        open={detailsOpen}
        onOpenChange={onDetailsOpenChange}
        before={
          <RadioGroup
            legend="Type"
            name="type"
            options={typeOptions}
            value={values.type}
            onChange={(value) => onChange("type", value)}
            required
            compact
          />
        }
      >
        <div className="mt-3 space-y-5 border-l border-line pl-4">
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
