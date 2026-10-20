"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { saveFlash, setFlash } from "@/lib/flash";
import { threadPath, type ReturnTo } from "@/lib/navigation";
import { markNextStepDone, setNextStep } from "@/lib/threads";
import type { Thread } from "@/lib/types";
import { LIMITS, validateNextStep } from "@/lib/validation";
import { Button, ButtonLink } from "../ui/Button";
import { TextArea } from "../ui/Field";

/**
 * One current next step per thread: save, change, or mark it done. The next step changes only when
 * Save or Mark done succeeds; then the person returns where they came from (home or the thread).
 */
export function NextStepForm({
  thread,
  returnTo,
  cancelHref,
}: {
  thread: Thread;
  returnTo: ReturnTo;
  cancelHref: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(thread.nextStep?.text ?? "");
  const [error, setError] = useState<string | undefined>();
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  function finish(flashed: ReturnType<typeof saveFlash>) {
    setFlash(returnTo === "home" ? "home" : thread.id, flashed);
    setText(thread.nextStep?.text ?? "");
    setError(undefined);
    router.push(returnTo === "home" ? "/" : threadPath(thread.id));
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
        <TextArea
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
          rows={2}
          textareaRef={fieldRef}
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
