"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";

/**
 * Accessible confirmation built on the native <dialog>: focus moves into it, Escape cancels,
 * and focus returns to whatever was focused before it opened.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function restoreFocus() {
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target && target.isConnected) target.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
        restoreFocus();
      }}
      className="m-auto w-[min(32rem,calc(100%-2rem))] border border-ink bg-paper p-6 text-ink backdrop:bg-ink/40"
    >
      <h2 id={titleId} className="text-[1.875rem]">
        {title}
      </h2>
      <div id={bodyId} className="mt-3 text-ink-muted">
        {children}
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          ref={cancelRef}
          variant="secondary"
          onClick={() => {
            onCancel();
            restoreFocus();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            // Close first so the page is no longer inert and onConfirm can move focus.
            dialogRef.current?.close();
            returnFocusRef.current = null;
            onConfirm();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
