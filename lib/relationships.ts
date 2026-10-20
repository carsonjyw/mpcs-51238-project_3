import type { ConnectionRelationship, ReadingType, Relationship } from "./types";

export const RELATIONSHIPS: Record<
  Relationship,
  { label: string; description: string; line: "solid" | "dashed" | "dotted" | "neutral" }
> = {
  raised: {
    label: "Raised this question",
    description: "The reading that started this thread.",
    line: "neutral",
  },
  supports: {
    label: "Supports",
    description: "Backs up, confirms, or gives evidence for an idea in your question.",
    line: "solid",
  },
  challenges: {
    label: "Challenges",
    description: "Questions, contradicts, or complicates your current thinking.",
    line: "dashed",
  },
  perspective: {
    label: "Adds a new perspective",
    description: "Looks at the question from a different angle, field, or experience.",
    line: "dotted",
  },
};

export const CONNECTION_RELATIONSHIPS: ConnectionRelationship[] = ["supports", "challenges", "perspective"];

export const READING_TYPES: Record<ReadingType, string> = {
  book: "Book",
  article: "Article",
};
