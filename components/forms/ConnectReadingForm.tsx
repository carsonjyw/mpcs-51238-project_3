"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode, type RefObject } from "react";
import { flushSync } from "react-dom";
import { saveFlash, setFlash } from "@/lib/flash";
import { connectPath, threadPath, type ReturnTo } from "@/lib/navigation";
import { CONNECTION_RELATIONSHIPS, RELATIONSHIPS } from "@/lib/relationships";
import { connectReading, isOriginal, updateReading, type NextStepAction } from "@/lib/threads";
import type { ConnectionRelationship, Reading, ReadingDetails, Thread } from "@/lib/types";
import {
  hasErrors,
  LIMITS,
  normalizeTitle,
  validateAuthor,
  validateContribution,
  validateNextStep,
  validateOptionalNote,
  validateTitle,
  validateUrl,
} from "@/lib/validation";
import { LineSample } from "../thread/RelationshipLabel";
import { Button, ButtonLink } from "../ui/Button";
import { focusField, RadioGroup, TextArea } from "../ui/Field";
import { ReadingDetailsFields } from "./ReadingDetailsFields";

type StepChoice = "keep" | "done" | "replace";

interface Values extends ReadingDetails {
  relationship: ConnectionRelationship | "";
  note: string;
  stepChoice: StepChoice;
  newStep: string;
}

type Field = keyof Values;
type FormErrors = Partial<Record<Field, ReactNode>>;

const relationshipOptions = CONNECTION_RELATIONSHIPS.map((value) => ({
  value,
  label: RELATIONSHIPS[value].label,
  description: RELATIONSHIPS[value].description,
  marker: <LineSample relationship={value} />,
}));

function initialValues(reading?: Reading): Values {
  return {
    title: reading?.title ?? "",
    type: reading?.type ?? "article",
    author: reading?.author ?? "",
    url: reading?.url ?? "",
    relationship: reading && !isOriginal(reading) ? (reading.relationship as ConnectionRelationship) : "",
    note: reading?.note ?? "",
    stepChoice: "keep",
    newStep: "",
  };
}

/**
 * Connects a new reading, or edits one (`reading`). Editing the original reading changes its details only:
 * it stays "Raised this question", and its notes are optional.
 * When the map has a next step, a new connection can keep it (the default), mark it done, or replace it. That
 * change is applied in the same save as the reading, so a failed validation or Cancel leaves it as it was.
 */
export function ConnectReadingForm({
  thread,
  reading,
  returnTo,
  cancelHref,
}: {
  thread: Thread;
  reading?: Reading;
  returnTo: ReturnTo;
  cancelHref: string;
}) {
  const router = useRouter();
  const editingOriginal = reading ? isOriginal(reading) : false;
  // Only a new connection offers the next-step choice; editing a reading never changes the next step.
  const currentStep = reading ? null : thread.nextStep;
  const [values, setValues] = useState<Values>(() => initialValues(reading));
  const [errors, setErrors] = useState<FormErrors>({});
  const [detailsOpen, setDetailsOpen] = useState(() => !!(reading?.author || reading?.url));
  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const relationshipRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const newStepRef = useRef<HTMLTextAreaElement>(null);

  function duplicateOf(title: string) {
    const normalized = normalizeTitle(title);
    if (!normalized) return undefined;
    return thread.readings.find((r) => r.id !== reading?.id && normalizeTitle(r.title) === normalized);
  }

  function validateField(field: Field, current: Values): ReactNode {
    switch (field) {
      case "title": {
        const error = validateTitle(current.title);
        if (error) return error;
        const duplicate = duplicateOf(current.title);
        if (duplicate)
          return (
            <>
              This reading is already on this map.{" "}
              <Link
                href={connectPath(thread.id, { readingId: duplicate.id, returnTo })}
                className="underline underline-offset-4"
              >
                Edit its note instead
              </Link>
              .
            </>
          );
        return undefined;
      }
      case "author":
        return validateAuthor(current.author);
      case "url":
        return validateUrl(current.url);
      case "relationship":
        return editingOriginal || current.relationship
          ? undefined
          : "Choose how this reading relates to your question.";
      case "note":
        return editingOriginal ? validateOptionalNote(current.note) : validateContribution(current.note);
      case "newStep":
        if (!currentStep || current.stepChoice !== "replace") return undefined;
        return current.newStep.trim()
          ? validateNextStep(current.newStep)
          : "Write your new next step, or choose 'Keep it'.";
      default:
        return undefined;
    }
  }

  const order: Field[] = ["title", "author", "url", "relationship", "note", "newStep"];

  function change(field: Field, value: string) {
    const next = { ...values, [field]: value } as Values;
    setValues(next);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validateField(field, next) }));
    if (field === "stepChoice" && value !== "replace") setErrors((current) => ({ ...current, newStep: undefined }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    for (const field of order) nextErrors[field] = validateField(field, values);

    if (hasErrors(nextErrors)) {
      flushSync(() => {
        setErrors(nextErrors);
        if (nextErrors.author || nextErrors.url) setDetailsOpen(true);
      });
      const fieldRefs: Partial<Record<Field, RefObject<HTMLInputElement | HTMLTextAreaElement | null>>> = {
        title: titleRef,
        author: authorRef,
        url: urlRef,
        relationship: relationshipRef,
        note: noteRef,
        newStep: newStepRef,
      };
      const first = order.find((field) => nextErrors[field]);
      if (first) focusField(fieldRefs[first]?.current);
      return;
    }

    const title = values.title.trim();
    if (reading) {
      const { persisted } = updateReading(thread.id, reading.id, {
        ...values,
        relationship: values.relationship || undefined,
      });
      setFlash(
        thread.id,
        saveFlash(
          persisted,
          { saved: `Updated “${title}”. Saved in this browser.`, done: `Updated “${title}”.` },
          reading.id,
        ),
      );
    } else {
      const step: NextStepAction | undefined = !currentStep
        ? undefined
        : values.stepChoice === "done"
          ? { kind: "done" }
          : values.stepChoice === "replace"
            ? { kind: "replace", text: values.newStep }
            : undefined;
      const stepMessage = step ? (step.kind === "done" ? " Next step marked done." : " Next step replaced.") : "";
      const { persisted, reading: saved } = connectReading(
        thread.id,
        { ...values, relationship: values.relationship as ConnectionRelationship },
        step,
      );
      setFlash(
        thread.id,
        saveFlash(
          persisted,
          {
            saved: `Connected “${title}”.${stepMessage} Saved in this browser.`,
            done: `Connected “${title}”.${stepMessage}`,
          },
          saved.id,
        ),
      );
    }
    setValues(initialValues(reading));
    setErrors({});
    router.push(threadPath(thread.id));
  }

  return (
    <form noValidate onSubmit={submit}>
      {/* Ruled journal entries, as on the first visit. */}
      <fieldset className="entry">
        <legend className="sr-only">The reading</legend>
        <ReadingDetailsFields
          values={values}
          errors={errors}
          onChange={change}
          detailsOpen={detailsOpen}
          onDetailsOpenChange={setDetailsOpen}
          titleRef={titleRef}
          authorRef={authorRef}
          urlRef={urlRef}
          titleLabel="Reading title"
        />
      </fieldset>

      <div className="entry" data-tour="relationship">
        {editingOriginal ? (
          <div>
            <p className="text-[0.875rem] font-semibold">Relationship</p>
            <p className="mt-1 font-mono text-[12.5px] italic text-accent">raised this question</p>
            <p className="mt-1 text-[0.875rem] text-ink-muted">
              This is the reading that started the map, so its relationship stays the same.
            </p>
          </div>
        ) : (
          <>
            <RadioGroup
              legend="How does it relate to your question?"
              hint="Choose how this reading affects what you currently think about your question."
              name="relationship"
              options={relationshipOptions}
              value={values.relationship}
              onChange={(value) => change("relationship", value)}
              error={errors.relationship}
              required
              firstInputRef={relationshipRef}
            />
          </>
        )}
      </div>

      <div className="entry" data-tour="note">
        <TextArea
          label={editingOriginal ? "Notes" : "How does it change your thinking?"}
          hint={
            editingOriginal
              ? "Anything you want to remember about this reading."
              : "One sentence is enough. Try: “I originally thought… After reading this…”"
          }
          placeholder={editingOriginal ? undefined : "I originally thought… After reading this…"}
          value={values.note}
          onChange={(value) => change("note", value)}
          error={errors.note}
          required={!editingOriginal}
          rows={4}
          counterMax={LIMITS.note}
          textareaRef={noteRef}
        />
      </div>

      {currentStep ? (
        <div className="entry space-y-4">
          <div className="border-l-[3px] border-accent bg-paper-raised px-4 py-3">
            <p className="mono-label">Your next step</p>
            <p className="mt-1 font-serif text-[1.25rem] leading-snug">{currentStep.text}</p>
          </div>
          <RadioGroup
            legend="When this reading is saved"
            hint="Your next step changes only if the reading saves."
            name="step"
            options={[
              { value: "keep" as const, label: "Keep it" },
              { value: "done" as const, label: "Mark it done" },
              { value: "replace" as const, label: "Replace it" },
            ]}
            value={values.stepChoice}
            onChange={(value) => change("stepChoice", value)}
            required
            inline
          />
          {values.stepChoice === "replace" ? (
            <div className="border-l border-line pl-4">
              <TextArea
                label="New next step"
                hint="One concrete thing, like 'Read chapter 3' or 'Find an article on…'."
                value={values.newStep}
                onChange={(value) => change("newStep", value)}
                error={errors.newStep}
                required
                rows={2}
                counterMax={LIMITS.nextStep}
                textareaRef={newStepRef}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit">
          {reading ? "Save changes" : "Connect reading"} <span aria-hidden="true">→</span>
        </Button>
        <ButtonLink
          href={cancelHref}
          variant="secondary"
          onClick={() => {
            setValues(initialValues(reading));
            setErrors({});
          }}
        >
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
