import type { Thread } from "./types";

/**
 * The read-only example shown on the home page. It is a constant in the code and is
 * never written to the user's saved data.
 */
export const EXAMPLE_THREAD: Thread = {
  id: "example",
  question: "How does memory shape identity?",
  createdAt: "2026-10-04T18:00:00.000Z",
  updatedAt: "2026-10-18T18:00:00.000Z",
  readings: [
    {
      id: "example-buried-giant",
      title: "The Buried Giant",
      type: "book",
      author: "Kazuo Ishiguro",
      relationship: "raised",
      note: "A mist erases everyone's memories. Would the couple still be themselves if they remembered their past?",
      addedAt: "2026-10-04T18:00:00.000Z",
    },
    {
      id: "example-clive-wearing",
      title: "The Abyss: Clive Wearing's amnesia",
      type: "article",
      author: "Oliver Sacks",
      relationship: "challenges",
      note: "Identity survived even though his memory didn't. Maybe it lives in relationships and skills, not recollection.",
      addedAt: "2026-10-09T18:00:00.000Z",
    },
    {
      id: "example-locke",
      title: "An Essay Concerning Human Understanding (Of Identity and Diversity)",
      type: "book",
      author: "John Locke",
      relationship: "supports",
      note: "Locke ties personal identity to consciousness reaching back through memory, close to the novel's fear.",
      addedAt: "2026-10-18T18:00:00.000Z",
    },
    {
      id: "example-sacks",
      title: "The Man Who Mistook His Wife for a Hat",
      type: "book",
      author: "Oliver Sacks",
      relationship: "perspective",
      note: "Case studies from neurology show memory loss in very different forms, so 'memory' is several things, not one.",
      addedAt: "2026-10-18T18:30:00.000Z",
    },
  ],
  nextStep: {
    text: "Find a critique of Locke's memory theory of personal identity.",
    setAt: "2026-10-18T18:30:00.000Z",
  },
};

/**
 * The first-visit preview example: an illustrative reader question, shown only in the preview
 * and never saved unless the person chooses to use it and creates their own map.
 */
export const FIRST_VISIT_EXAMPLE = {
  title: "The Little Prince",
  question: "What makes a place feel like home?",
  /** A second reading, so the example shows how an exploration continues. Read-only, never saved. */
  next: {
    title: "The Poetics of Space",
    author: "Gaston Bachelard",
    relationship: "challenges",
    note: "I originally thought home was mostly about people. After reading this, I think it's also the rooms and corners that hold our memories.",
  },
} as const;
