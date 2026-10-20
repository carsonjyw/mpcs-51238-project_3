"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { saveFlash, setFlash } from "@/lib/flash";
import { threadPath } from "@/lib/navigation";
import { markNextStepDone, setNextStep } from "@/lib/threads";
import type { Thread } from "@/lib/types";
import { LIMITS, validateNextStep } from "@/lib/validation";
import { Button, ButtonLink } from "../ui/Button";
import { TextField } from "../ui/Field";

/** One current next step per thread: save, change, or mark it done. */
export function NextStepForm({ thread, cancelHref }: { thread: Thread; cancelHref: string }) {
  const router = useRouter();
  const [text, setText] = useState(thread.nextStep?.text ?? "");
  const [error, setError] = useState<string | undefined>();
  const fieldRef = useRef<HTMLInputElement>(null);

  function finish(flashed: ReturnType<typeof saveFlash>) {
    setFlash(thread.id, flashed);
    setText(thread.nextStep?.text ?? "");
    setError(undefined);
    router.push(threadPath(thread.id));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextError = validateNextStep(text);
    if (nextError) {
      setError(nextError);
      fieldRef.current?.focus();
      return;
    }
    const { persisted } = setNextStep(thread.id, text);
    finish(saveFlash(persisted, { saved: "Next step saved in this browser.", done: "Next step updated." }));
  }

  function markDone() {
    const { persisted } = markNextStepDone(thread.id);
    finish(
      saveFlash(persisted, {
        saved: "Next step marked done. Saved in this browser.",
        done: "Next step marked done.",
      }),
    );
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-6 border-t border-line pt-5">
      <div data-tour="next-step">
        <TextField
          label="What will you read or think about next?"
          hint="One concrete thing, like 'Read chapter 3' or 'Find an article on…'."
          value={text}
          onChange={(value) => {
            setText(value);
            if (error) setError(validateNextStep(value));
          }}
          error={error}
          required
          counterMax={LIMITS.nextStep}
          inputRef={fieldRef}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">
          Save next step <span aria-hidden="true">→</span>
        </Button>
        {thread.nextStep ? (
          <Button variant="secondary" onClick={markDone}>
            Mark done
          </Button>
        ) : null}
        <ButtonLink
          href={cancelHref}
          variant="quiet"
          onClick={() => {
            setText(thread.nextStep?.text ?? "");
            setError(undefined);
          }}
        >
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
