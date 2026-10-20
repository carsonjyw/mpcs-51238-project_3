"use client";

import { useImperativeHandle, useRef, useState, type Ref, type RefObject } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { saveFlash, setFlash } from "@/lib/flash";
import { threadPath } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { createThread } from "@/lib/threads";
import type { ReadingDetails } from "@/lib/types";
import {
  hasErrors,
  LIMITS,
  validateAuthor,
  validateQuestion,
  validateTitle,
  validateUrl,
  type Errors,
} from "@/lib/validation";
import { Button, ButtonLink } from "../ui/Button";
import { TextArea } from "../ui/Field";
import { ReadingDetailsFields } from "./ReadingDetailsFields";

export type StartValues = ReadingDetails & { question: string };
type Field = keyof StartValues;

/** Lets the page fill the form, for example with the preview's example. */
export interface StartFormHandle {
  fill: (values: Partial<StartValues>) => void;
}

const EMPTY: StartValues = { title: "", type: "book", author: "", url: "", question: "" };

/** Complete questions; each fills the field and stays editable. */
const STARTERS = ["What is the author arguing?", "Do I agree with this?", "What would I ask the author?"];

const validators: Partial<Record<Field, (value: string) => string | undefined>> = {
  title: validateTitle,
  author: validateAuthor,
  url: validateUrl,
  question: validateQuestion,
};

function validate(values: StartValues): Errors<Field> {
  return {
    title: validateTitle(values.title),
    author: validateAuthor(values.author),
    url: validateUrl(values.url),
    question: validateQuestion(values.question),
  };
}

/** The start form: what are you reading, and what question did it raise. */
export function StartThreadForm({
  submitLabel = "Begin the map",
  cancelHref,
  titleRef: externalTitleRef,
  handle,
  onValuesChange,
}: {
  submitLabel?: string;
  cancelHref?: string;
  /** Lets the page move focus to the title field. */
  titleRef?: RefObject<HTMLInputElement | null>;
  handle?: Ref<StartFormHandle>;
  /** Called as the person types, for a live preview. */
  onValuesChange?: (values: StartValues) => void;
}) {
  const router = useRouter();
  const store = useStore();
  const [values, setValues] = useState<StartValues>(EMPTY);
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const ownTitleRef = useRef<HTMLInputElement>(null);
  const titleRef = externalTitleRef ?? ownTitleRef;
  const authorRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);

  function update(next: StartValues) {
    setValues(next);
    onValuesChange?.(next);
  }

  useImperativeHandle(handle, () => ({
    fill(partial) {
      const next = { ...values, ...partial };
      update(next);
      setErrors((current) => {
        const cleared = { ...current };
        for (const field of Object.keys(partial) as Field[]) cleared[field] = undefined;
        return cleared;
      });
    },
  }));

  function reset() {
    update(EMPTY);
    setErrors({});
    setDetailsOpen(false);
  }

  function change(field: Field, value: string) {
    update({ ...values, [field]: value });
    // Once a field has an error, re-check it as the person types so the message clears when fixed.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validators[field]?.(value) }));
  }

  function applyStarter(text: string) {
    flushSync(() => change("question", text));
    const field = questionRef.current;
    if (!field) return;
    field.focus();
    field.setSelectionRange(text.length, text.length);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate(values);
    if (hasErrors(nextErrors)) {
      flushSync(() => {
        setErrors(nextErrors);
        if (nextErrors.author || nextErrors.url) setDetailsOpen(true);
      });
      const first = nextErrors.title
        ? titleRef.current
        : nextErrors.author
          ? authorRef.current
          : nextErrors.url
            ? urlRef.current
            : questionRef.current;
      first?.focus();
      return;
    }

    const { thread, persisted } = createThread(values);
    setFlash(
      thread.id,
      saveFlash(persisted, { saved: "Saved in this browser.", done: "Your map is ready." }),
    );
    reset();
    router.push(threadPath(thread.id));
  }

  const savesHere = store.status === "ready" && store.persistence === "saved";

  return (
    <form noValidate onSubmit={submit}>
      {/* Two numbered journal entries, each on a writing line. */}
      <div className="entry" data-tour="reading">
        <ReadingDetailsFields
          values={values}
          errors={errors}
          onChange={change}
          detailsOpen={detailsOpen}
          onDetailsOpenChange={setDetailsOpen}
          titleRef={titleRef}
          authorRef={authorRef}
          urlRef={urlRef}
          titleLabel="The reading"
          number="01"
          large
        />
      </div>

      <div className="entry" data-tour="question">
        <TextArea
          label="The question it raised"
          number="02"
          large
          value={values.question}
          onChange={(value) => change("question", value)}
          error={errors.question}
          required
          rows={2}
          counterMax={LIMITS.question}
          textareaRef={questionRef}
        >
          {values.question.trim() === "" ? (
            <div
              role="group"
              aria-label="Question starters"
              className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.8125rem] text-ink-muted"
            >
              <span>Try:</span>
              {STARTERS.map((text, index) => (
                <span key={text} className="whitespace-nowrap">
                  <button type="button" onClick={() => applyStarter(text)} className="textlink min-h-8">
                    {text}
                  </button>
                  {index < STARTERS.length - 1 ? (
                    <span aria-hidden="true" className="ml-3 text-line-strong">
                      /
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          ) : null}
        </TextArea>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button type="submit">
          {submitLabel} <span aria-hidden="true">→</span>
        </Button>
        {cancelHref ? (
          <ButtonLink href={cancelHref} variant="secondary" onClick={reset}>
            Cancel
          </ButtonLink>
        ) : null}
        <p className="fine">
          {savesHere
            ? "Stays in this browser · no account"
            : "No account needed. This browser isn't allowing storage, so your map will last only for this session."}
        </p>
      </div>
    </form>
  );
}
