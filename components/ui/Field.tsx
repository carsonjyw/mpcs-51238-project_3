"use client";

import { useId, type ReactNode, type Ref } from "react";

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 flex gap-1.5 text-[0.875rem] font-semibold text-danger">
      <span aria-hidden="true">!</span>
      <span>{children}</span>
    </p>
  );
}

/** Concept A label: small sans, with an optional journal number in mono oxblood. */
function Label({
  htmlFor,
  required,
  number,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  number?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline gap-3 text-[0.875rem] font-semibold text-ink">
      {number ? (
        <span aria-hidden="true" className="font-mono text-[0.75rem] font-normal text-accent">
          {number}
        </span>
      ) : null}
      <span>
        {children}
        {required ? null : <span className="font-normal text-ink-muted"> (optional)</span>}
      </span>
    </label>
  );
}

/** Appears only near the limit, so it doesn't add noise to short entries. */
function Counter({ length, max }: { length: number; max: number }) {
  const over = length > max;
  if (length < max * 0.8) return null;
  return (
    <p className={`mt-1 text-right font-mono text-[0.75rem] ${over ? "font-semibold text-danger" : "text-ink-muted"}`}>
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
  /** Journal number shown before the label, such as "01". */
  number?: string;
  /** The larger serif writing line used for the two first-visit fields. */
  large?: boolean;
}

function Hint({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1 text-[0.8125rem] text-ink-muted">
      {children}
    </p>
  );
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  counterMax,
  number,
  large,
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
      <Label htmlFor={id} required={required} number={number}>
        {label}
      </Label>
      <Hint id={hintId}>{hint}</Hint>
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
        className={`line-input mt-2 ${large ? "large" : ""}`}
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
  number,
  large,
  rows = 3,
  textareaRef,
  placeholder,
  children,
}: BaseFieldProps & {
  rows?: number;
  /** An example of what to write; the visible label and hint still explain the field. */
  placeholder?: string;
  textareaRef?: Ref<HTMLTextAreaElement>;
  /** Extra content after the field and its error, such as starter questions. */
  children?: ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id} required={required} number={number}>
        {label}
      </Label>
      <Hint id={hintId}>{hint}</Hint>
      <textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint ? hintId : undefined, error ? errorId : undefined)}
        aria-required={required || undefined}
        className={`line-input mt-2 resize-y placeholder:text-ink-muted ${large ? "large" : ""}`}
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
  compact,
  hint,
  firstInputRef,
}: {
  legend: ReactNode;
  /** Short explanation under the legend. */
  hint?: ReactNode;
  name: string;
  options: RadioOption<V>[];
  value: V | "";
  onChange: (value: V) => void;
  error?: ReactNode;
  required?: boolean;
  inline?: boolean;
  /** Concept A toggle pill for secondary choices such as reading type (legend kept for screen readers). */
  compact?: boolean;
  firstInputRef?: Ref<HTMLInputElement>;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  if (compact) {
    return (
      <fieldset aria-describedby={error ? errorId : undefined} className="inline-flex">
        <legend className="sr-only">{legend}</legend>
        <div className="inline-flex rounded-full border border-line p-0.5 text-[0.8125rem]">
          {options.map((option, index) => {
            const optionId = `${id}-${option.value}`;
            const checked = value === option.value;
            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={`cursor-pointer rounded-full px-3 py-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent ${
                  checked ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
                }`}
              >
                <input
                  ref={index === 0 ? firstInputRef : undefined}
                  id={optionId}
                  type="radio"
                  name={`${id}-${name}`}
                  value={option.value}
                  checked={checked}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
        <FieldError id={errorId}>{error}</FieldError>
      </fieldset>
    );
  }

  return (
    <fieldset aria-describedby={[hint ? `${id}-hint` : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined}>
      <legend className="text-[0.875rem] font-semibold text-ink">
        {legend}
        {required ? null : <span className="font-normal text-ink-muted"> (optional)</span>}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-[0.8125rem] text-ink-muted">
          {hint}
        </p>
      ) : null}
      <div className="h-2" aria-hidden="true" />
      <div className={inline ? "flex flex-wrap gap-x-6 gap-y-2" : "border-t border-line"}>
        {options.map((option, index) => {
          const optionId = `${id}-${option.value}`;
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`flex cursor-pointer gap-3 py-3 ${inline ? "" : "border-b border-line"} ${
                checked ? "text-ink" : "text-ink hover:bg-paper-raised/60"
              }`}
            >
              <input
                ref={index === 0 ? firstInputRef : undefined}
                id={optionId}
                type="radio"
                name={`${id}-${name}`}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-1 size-4 shrink-0 accent-ink"
                aria-describedby={option.description ? `${optionId}-description` : undefined}
              />
              <span>
                <span className={`flex items-center gap-2 font-medium ${checked ? "font-semibold" : ""}`}>
                  {option.marker}
                  {option.label}
                </span>
                {option.description ? (
                  <span id={`${optionId}-description`} className="block text-[0.875rem] text-ink-muted">
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
