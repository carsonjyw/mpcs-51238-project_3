export const LIMITS = {
  title: 200,
  author: 120,
  url: 500,
  question: 300,
  note: 500,
  nextStep: 200,
} as const;

export type Errors<K extends string> = Partial<Record<K, string>>;

export function hasErrors(errors: Partial<Record<string, unknown>>): boolean {
  return Object.values(errors).some(Boolean);
}

export function validateTitle(title: string): string | undefined {
  const value = title.trim();
  if (!value) return "Enter the title of the reading.";
  if (value.length > LIMITS.title) return `Keep the title under ${LIMITS.title} characters.`;
}

export function validateAuthor(author: string): string | undefined {
  if (author.trim().length > LIMITS.author) return `Keep the author under ${LIMITS.author} characters.`;
}

export function validateUrl(url: string): string | undefined {
  const value = url.trim();
  if (!value) return;
  const message = "Enter a full link starting with https://.";
  if (value.length > LIMITS.url) return `Keep the link under ${LIMITS.url} characters.`;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return message;
  } catch {
    return message;
  }
}

export function validateQuestion(question: string): string | undefined {
  const value = question.trim();
  if (!value) return "Write the question this reading raised.";
  if (value.length > LIMITS.question) return `Keep your question under ${LIMITS.question} characters.`;
}

export function validateContribution(note: string): string | undefined {
  const value = note.trim();
  if (!value) return "Say what this reading adds or challenges. One sentence is enough.";
  if (value.length > LIMITS.note) return `Keep this note under ${LIMITS.note} characters.`;
}

export function validateOptionalNote(note: string): string | undefined {
  if (note.trim().length > LIMITS.note) return `Keep this note under ${LIMITS.note} characters.`;
}

export function validateNextStep(text: string): string | undefined {
  const value = text.trim();
  if (!value) return "Write one thing to do next, like 'Read chapter 3' or 'Find an article on…'.";
  if (value.length > LIMITS.nextStep) return `Keep your next step under ${LIMITS.nextStep} characters.`;
}

export function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}
