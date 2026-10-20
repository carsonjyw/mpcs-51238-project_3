"use client";

import { useId, type ReactNode, type Ref } from "react";

const control =
  "block w-full rounded-lg border bg-paper-raised px-3 py-2.5 text-base text-ink placeholder:text-ink-muted/80";

function controlClasses(invalid: boolean) {
  return `${control} ${invalid ? "border-danger border-2" : "border-line-strong"}`;
}

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 flex gap-1.5 text-[0.95rem] font-semibold text-danger">
      <span aria-hidden="true">!</span>
      <span>{children}</span>
    </p>
  );
}

function Label({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-semibold text-ink">
      {children}
      {required ? null : <span className="font-normal text-ink-muted"> (optional)</span>}
    </label>
  );
}

function Counter({ length, max }: { length: number; max: number }) {
  const over = length > max;
  return (
    <p className={`mt-1 text-right text-sm ${over ? "font-semibold text-danger" : "text-ink-muted"}`}>
      {length} / {max}
    </p>
  );
}

function describedBy(...ids: (string | undefined)[]) {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

interface BaseFieldProps {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  /** Shows a live character count against this limit (the field still accepts more, and validation explains). */
  counterMax?: number;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  counterMax,
  inputRef,
  type = "text",
  autoComplete = "off",
  inputMode,
}: BaseFieldProps & {
  inputRef?: Ref<HTMLInputElement>;
  type?: "text" | "url";
  autoComplete?: string;
  inputMode?: "text" | "url";
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {hint ? (
        <p id={hintId} className="-mt-0.5 mb-1.5 text-[0.95rem] text-ink-muted">
          {hint}
        </p>
      ) : null}
      <input
        ref={inputRef}
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint ? hintId : undefined, error ? errorId : undefined)}
        aria-required={required || undefined}
        autoComplete={autoComplete}
        className={controlClasses(!!error)}
      />
      {counterMax ? <Counter length={value.trim().length} max={counterMax} /> : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  counterMax,
  rows = 3,
  textareaRef,
  children,
}: BaseFieldProps & {
  rows?: number;
  textareaRef?: Ref<HTMLTextAreaElement>;
  /** Extra content after the field and its error, such as starter chips. */
  children?: ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {hint ? (
        <p id={hintId} className="-mt-0.5 mb-1.5 text-[0.95rem] text-ink-muted">
          {hint}
        </p>
      ) : null}
      <textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint ? hintId : undefined, error ? errorId : undefined)}
        aria-required={required || undefined}
        className={`${controlClasses(!!error)} resize-y`}
      />
      {counterMax ? <Counter length={value.trim().length} max={counterMax} /> : null}
      <FieldError id={errorId}>{error}</FieldError>
      {children}
    </div>
  );
}

export interface RadioOption<V extends string> {
  value: V;
  label: string;
  description?: string;
  /** Optional decoration shown before the label, such as a line-style sample. */
  marker?: ReactNode;
}

export function RadioGroup<V extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  required,
  inline,
  firstInputRef,
}: {
  legend: ReactNode;
  name: string;
  options: RadioOption<V>[];
  value: V | "";
  onChange: (value: V) => void;
  error?: ReactNode;
  required?: boolean;
  inline?: boolean;
  firstInputRef?: Ref<HTMLInputElement>;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 font-semibold text-ink">
        {legend}
        {required ? null : <span className="font-normal text-ink-muted"> (optional)</span>}
      </legend>
      <div className={inline ? "flex flex-wrap gap-2" : "grid gap-2"}>
        {options.map((option, index) => {
          const optionId = `${id}-${option.value}`;
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 ${
                checked ? "border-accent bg-accent-soft" : "border-line bg-paper-raised hover:border-line-strong"
              } ${error ? "border-danger" : ""}`}
            >
              <input
                ref={index === 0 ? firstInputRef : undefined}
                id={optionId}
                type="radio"
                name={`${id}-${name}`}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-1 size-4 shrink-0 accent-accent"
                aria-describedby={option.description ? `${optionId}-description` : undefined}
              />
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  {option.marker}
                  {option.label}
                </span>
                {option.description ? (
                  <span id={`${optionId}-description`} className="block text-[0.95rem] text-ink-muted">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
}
