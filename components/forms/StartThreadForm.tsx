"use client";

import { useRef, useState, type RefObject } from "react";
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

type Values = ReadingDetails & { question: string };
type Field = keyof Values;

const EMPTY: Values = { title: "", type: "book", author: "", url: "", question: "" };

const STARTERS = [
  { label: "What is the author arguing?", text: "What is the author arguing?" },
  { label: "Do I agree with this?", text: "Do I agree with this?" },
  // The caret lands before the "?" so the question can be finished right away.
  { label: "How does this connect to…?", text: "How does this connect to ?", caret: 25 },
];

const validators: Partial<Record<Field, (value: string) => string | undefined>> = {
  title: validateTitle,
  author: validateAuthor,
  url: validateUrl,
  question: validateQuestion,
};

function validate(values: Values): Errors<Field> {
  return {
    title: validateTitle(values.title),
    author: validateAuthor(values.author),
    url: validateUrl(values.url),
    question: validateQuestion(values.question),
  };
}

/** The start form: what are you reading, and what question did it raise. Used on the home page and /threads/new. */
export function StartThreadForm({
  submitLabel = "Start exploring",
  cancelHref,
  titleRef: externalTitleRef,
}: {
  submitLabel?: string;
  cancelHref?: string;
  /** Lets the page move focus to the title field, for example from the example's "Start your own" button. */
  titleRef?: RefObject<HTMLInputElement | null>;
}) {
  const router = useRouter();
  const store = useStore();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const ownTitleRef = useRef<HTMLInputElement>(null);
  const titleRef = externalTitleRef ?? ownTitleRef;
  const authorRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setDetailsOpen(false);
  }

  function change(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    // Once a field has an error, re-check it as the person types so the message clears when fixed.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validators[field]?.(value) }));
  }

  function applyStarter(starter: (typeof STARTERS)[number]) {
    flushSync(() => change("question", starter.text));
    const field = questionRef.current;
    if (!field) return;
    field.focus();
    const caret = starter.caret ?? starter.text.length;
    field.setSelectionRange(caret, caret);
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
      saveFlash(persisted, {
        saved: "Your exploration is saved on this device.",
        done: "Your exploration is ready.",
      }),
    );
    reset();
    router.push(threadPath(thread.id));
  }

  const savesHere = store.status === "ready" && store.persistence === "saved";

  return (
    <form noValidate onSubmit={submit} className="space-y-6">
      <fieldset className="space-y-5">
        <legend className="mb-1 font-serif text-xl font-semibold">What are you reading?</legend>
        <ReadingDetailsFields
          values={values}
          errors={errors}
          onChange={change}
          detailsOpen={detailsOpen}
          onDetailsOpenChange={setDetailsOpen}
          titleRef={titleRef}
          authorRef={authorRef}
          urlRef={urlRef}
        />
      </fieldset>

      <TextArea
        label={<span className="font-serif text-xl">What question did it raise?</span>}
        hint="A question you want to keep exploring."
        value={values.question}
        onChange={(value) => change("question", value)}
        error={errors.question}
        required
        rows={2}
        counterMax={LIMITS.question}
        textareaRef={questionRef}
      >
        {values.question.trim() === "" ? (
          <div role="group" aria-label="Question starters" className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[0.95rem] text-ink-muted">Try a starter:</span>
            {STARTERS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                onClick={() => applyStarter(starter)}
                className="min-h-10 rounded-full border border-line-strong bg-paper-raised px-3 text-[0.95rem] hover:border-accent hover:bg-accent-soft"
              >
                {starter.label}
              </button>
            ))}
          </div>
        ) : null}
      </TextArea>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">{submitLabel}</Button>
        {cancelHref ? (
          <ButtonLink href={cancelHref} variant="secondary" onClick={reset}>
            Cancel
          </ButtonLink>
        ) : null}
      </div>
      <p className="text-[0.95rem] text-ink-muted">
        {savesHere
          ? "Everything stays in this browser. No account needed."
          : "No account needed. This browser isn't allowing storage, so your exploration will last only for this session."}
      </p>
    </form>
  );
}
