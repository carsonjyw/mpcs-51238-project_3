import type { ConnectionRelationship, ReadingType, Relationship } from "./types";

export const RELATIONSHIPS: Record<
  Relationship,
  {
    label: string;
    description: string;
    line: "solid" | "dashed" | "dotted" | "neutral";
  }
> = {
  raised: {
    label: "Raised this question",
    description: "The reading that started this map.",
    line: "neutral",
  },
  supports: {
    label: "Supports",
    description: "It strengthens what you currently think about your question.",
    line: "solid",
  },
  challenges: {
    label: "Challenges",
    description: "It makes you reconsider what you currently think.",
    line: "dashed",
  },
  perspective: {
    label: "Adds a new perspective",
    description: "It opens an angle you hadn't been thinking about.",
    line: "dotted",
  },
};

export const CONNECTION_RELATIONSHIPS: ConnectionRelationship[] = ["supports", "challenges", "perspective"];

export const READING_TYPES: Record<ReadingType, string> = {
  book: "Book",
  article: "Article",
};
