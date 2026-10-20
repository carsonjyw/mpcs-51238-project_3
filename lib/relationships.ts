import type { ConnectionRelationship, ReadingType, Relationship } from "./types";

export const RELATIONSHIPS: Record<
  Relationship,
  {
    label: string;
    description: string;
    /** A concrete illustration shown in the connect form. */
    example?: string;
    line: "solid" | "dashed" | "dotted" | "neutral";
  }
> = {
  raised: {
    label: "Raised this question",
    description: "The reading that started this thread.",
    line: "neutral",
  },
  supports: {
    label: "Supports",
    description: "It strengthens what you currently think about your question.",
    example: "You think home is mostly about people, and a memoir shows the same thing.",
    line: "solid",
  },
  challenges: {
    label: "Challenges",
    description: "It makes you reconsider what you currently think.",
    example: "You think home is mostly about people, but an essay argues it's about familiar places.",
    line: "dashed",
  },
  perspective: {
    label: "Adds a new perspective",
    description: "It opens an angle you hadn't been thinking about.",
    example: "A study of how animals choose where to live.",
    line: "dotted",
  },
};

export const CONNECTION_RELATIONSHIPS: ConnectionRelationship[] = ["supports", "challenges", "perspective"];

export const READING_TYPES: Record<ReadingType, string> = {
  book: "Book",
  article: "Article",
};
