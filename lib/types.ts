export type ReadingType = "book" | "article";

/** "raised" is reserved for the original reading that raised the thread's question. */
export type Relationship = "raised" | "supports" | "challenges" | "perspective";
export type ConnectionRelationship = Exclude<Relationship, "raised">;

export interface Reading {
  id: string;
  title: string;
  type: ReadingType;
  author?: string;
  url?: string;
  relationship: Relationship;
  /** Required for connected readings; optional notes for the original reading. */
  note?: string;
  addedAt: string;
}

export interface NextStep {
  text: string;
  setAt: string;
}

export interface Thread {
  id: string;
  question: string;
  createdAt: string;
  updatedAt: string;
  /** The first reading is always the original reading (relationship "raised"). */
  readings: Reading[];
  nextStep: NextStep | null;
}

export interface AppData {
  threads: Thread[];
}

export interface ReadingDetails {
  title: string;
  type: ReadingType;
  author: string;
  url: string;
}
