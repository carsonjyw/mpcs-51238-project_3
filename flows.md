# Reading Exploration Map — Flow Specification

Agreed in planning (Step 2: Define Your Flows). This is the source of truth for the user flows; the main diagram is also
shown in [README.md](README.md).

## Main task

**I add a book and a question it raised → connect another reading and explain what it contributes → save my next step →
return later and continue exploring with my previous work still saved.**

## Example used throughout

Maya is reading *The Buried Giant* (Kazuo Ishiguro) and asks **"How does memory shape identity?"** She later connects a
New Yorker article about Clive Wearing as **Challenges** ("Identity survived even though his memory didn't"), and saves the
next step "Read Locke's memory theory of personal identity." On Sunday she returns, chooses **I did this, add what I
found**, connects Locke as **Supports**, and replaces her next step.

This example is also the read-only example on the home page. It is a fixed constant in the code and is **never written to
the user's saved data**.

---

## Main flow

```mermaid
flowchart TD
    OPEN([Open Reading Map at /]) --> LOAD["Read saved data from this device<br/>(brief loading state, no flash of first-visit form)"]
    LOAD --> HAS{Any saved threads?}

    %% First visit
    HAS -- No --> FV["<b>First visit · /</b><br/>Start form: what are you reading?<br/>what question did it raise?"]
    FV -. optional .-> EX["Expand read-only example thread<br/>(map + list, not saved)"]
    EX -. collapse .-> FV
    FV -- Submit --> V1{Title and question valid?}
    V1 -- No --> E1["Errors next to each field<br/>typed text kept"]
    E1 --> FV
    V1 -- Yes --> THREAD

    %% Returning
    HAS -- Yes --> RV["<b>Returning view · /</b><br/>Welcome back + Continue card<br/>(question, next step, last reading, last active)<br/>and other open threads"]
    RV -- Open a thread --> THREAD
    RV -- "I did this, add what I found" --> CONNECT
    RV -- Change next step --> NEXT
    RV -- "New thread" --> NEW["<b>/threads/new</b><br/>same start form"]
    NEW -- Submit --> V1

    %% Thread hub with map
    THREAD["<b>Thread · /threads/[id]</b><br/>Map view: question at center,<br/>readings arranged around it,<br/>lines labeled Supports / Challenges /<br/>Adds a new perspective<br/>List view: same content, accessible alternative"]
    THREAD -- Select a reading --> DETAIL["Detail panel<br/>contribution note · Edit · Remove"]
    DETAIL -- Edit --> CONNECT
    DETAIL -- Remove --> RMQ{Confirm remove?}
    RMQ -- Yes --> THREAD
    RMQ -- No --> DETAIL
    THREAD -- Edit question inline --> THREAD
    THREAD -- Delete thread --> DELQ{Confirm delete?}
    DELQ -- Yes --> HAS
    DELQ -- No --> THREAD

    %% Main task: connect
    THREAD -- Connect a reading --> CONNECT["<b>/threads/[id]/connect</b><br/>title · type · author/link optional<br/>relationship · what it contributes"]
    CONNECT -- Submit --> V2{Valid?}
    V2 -- No --> E2["Errors next to each field<br/>typed text kept<br/>next step unchanged"]
    E2 --> CONNECT
    V2 -- Yes --> SAVED["Reading saved to thread<br/>if started from 'I did this':<br/>step marked done or replaced in the same save"]
    SAVED --> THREAD
    CONNECT -- Cancel --> THREAD

    %% Next step
    THREAD -- "Save / change next step" --> NEXT["<b>/threads/[id]/next-step</b><br/>one current next step"]
    NEXT -- Submit --> V3{Step written, ≤ 200 chars?}
    V3 -- No --> E3["Error next to field<br/>typed text kept"]
    E3 --> NEXT
    V3 -- Yes --> THREAD
    NEXT -- Cancel --> THREAD

    %% Coming back later
    THREAD -. "leave · come back later" .-> OPEN
```

---

## 1. First visit (`/`, nothing saved)

1. Shared header + a one-line explanation: *Follow a question across what you read.*
2. **Start form** (one column):
   - **What are you reading?** — Title (required), Type: Book / Article (default Book), Author (optional), Link
     (optional).
   - **What question did it raise?** (required) — with chips that prefill the field: "What is the author arguing?",
     "Do I agree with this?", "How does this connect to…?".
3. **See an example thread** — an expandable section (`<details>`-style disclosure), collapsed by default. Shows Maya's
   thread in the same read-only map and list. Labeled *Example — not saved*. No edit actions.
4. On valid submit → the new thread page, which immediately shows the map with the question at the center and the first
   reading connected to it, plus two clear prompts: **Connect another reading** and **Save a next step**.

## 2. Main task — connect a reading (`/threads/[id]/connect`)

Fields, one column:

| Field | Rule | Error text (shown next to the field) |
|---|---|---|
| Title | required | "Enter the title of the reading." |
| Type | Book / Article, default Article | — |
| Author | optional | — |
| Link | optional; if present must start with `http://` or `https://` | "Enter a full link starting with https://." |
| How it relates | required: **Supports**, **Challenges**, **Adds a new perspective** | "Choose how this reading relates to your question." |
| What it contributes | required, 1–500 characters | "Say what this reading adds or challenges — one sentence is enough." |

- The question is shown at the top of the form as context.
- Duplicate title already in this thread → "This reading is already in this thread. Edit its note instead." with a link
  that opens it for editing.
- **Edit mode** — opened from the detail panel (`/threads/[id]/connect?reading=<id>`): same form, prefilled, button reads
  **Save changes**.
- **Coming from "I did this, add what I found"** (`/threads/[id]/connect?from=next-step`): the current next step is shown
  at the top, and the form adds one choice:
  - ( ) Mark my next step done
  - ( ) Replace it with: [new next step] — required if chosen: "Write your new next step, or choose 'Mark it done'."

  The next step is only completed or replaced **after the reading is saved successfully**. If validation fails, nothing
  is saved and the next step stays exactly as it was.
- After saving → thread page, the new or edited reading is highlighted and its detail panel is open. A short
  confirmation message is announced ("Connected *Locke on personal identity*").
- Cancel → back to the thread, nothing changed.

## 3. Next step (`/threads/[id]/next-step`)

- One current next step per thread. Field: **What will you read or think about next?** (required, ≤ 200 characters,
  visible counter).
  - Empty → "Write one thing to do next, like 'Read chapter 3' or 'Find an article on…'."
  - Too long → "Keep your next step under 200 characters."
- If a step already exists, the form is prefilled and also offers **Mark done** (clears the step without replacing it).
- Saving → thread page with the step pinned near the top. Cancel → back where they came from (thread or home).
- History of completed steps is **deferred**.

## 4. The per-thread map

Shown on `/threads/[id]` (and read-only in the home-page example).

- **Layout (automatic, no dragging):** the question is a node at the center; connected readings are placed evenly on a
  circle around it, in the order they were added, starting at the top. The first reading (the one that raised the
  question) is labeled **Raised this question**. If a thread grows past about 8 readings, they continue on a second, outer
  ring.
- **Edges:** each line is labeled with its relationship in text. Relationship is also shown by line style (Supports =
  solid, Challenges = dashed, Adds a new perspective = dotted) so it never relies on color alone.
- **Selecting a reading** (click, or Tab to it and press Enter/Space) opens a detail panel next to or below the map:
  title, type, author/link, relationship, contribution note, **Edit** and **Remove**. Escape closes the panel and returns
  focus to the node.
- **Map / List toggle:** the list view shows the same content as a timeline (question, then each reading with its
  relationship badge, note, and the same actions). It is the accessible alternative and works with screen readers and
  keyboard alone. The last choice is remembered on this device.
- The SVG scales to the screen width; on narrow screens the detail panel sits below the map.
- Out of scope: dragging, manual node positions, a global graph across threads.

```mermaid
stateDiagram-v2
    [*] --> MapView
    MapView --> ListView: choose List
    ListView --> MapView: choose Map
    MapView --> ReadingSelected: click or Enter on a reading
    ReadingSelected --> MapView: Escape / close
    ReadingSelected --> ReadingSelected: select another reading
    ReadingSelected --> EditReading: Edit
    ReadingSelected --> ConfirmRemove: Remove
    ConfirmRemove --> MapView: Remove confirmed
    ConfirmRemove --> ReadingSelected: Cancel
    EditReading --> ReadingSelected: saved
    ListView --> EditReading: Edit
    ListView --> ConfirmRemove: Remove
```

## 5. Returning (`/`, saved data exists)

1. **Welcome back** heading.
2. **Continue card** — the most recently active thread: question, current next step, last reading added, "Last active 3
   days ago", and a small preview of its map. Actions:
   - **I did this, add what I found** → connect form in next-step mode (see §2).
   - **Change next step** → `/threads/[id]/next-step`.
   - **Open thread** → `/threads/[id]`.
   - If the thread has no next step: "No next step yet" with **Save a next step**.
3. **Other threads** — sorted by last activity, each with its question, next step (or "No next step yet"), and reading
   count.
4. **+ New thread** in the header and below the list.

```mermaid
flowchart LR
    R["Returning view<br/>Continue card"] -- "I did this, add what I found" --> C["Connect form<br/>shows current next step<br/>+ Mark done / Replace with…"]
    C -- invalid --> C
    C -- "valid save" --> S["Save reading AND<br/>mark step done or replace it<br/>(one save)"]
    S --> T["Thread page<br/>new reading highlighted on map"]
    C -- Cancel --> R2["Back to returning view<br/>next step unchanged"]
```

## 6. Editing and deletion

| What | How | Confirm? |
|---|---|---|
| Question | Inline edit on the thread page (same field component and validation) | No; Cancel restores it |
| First reading (raised the question) | Edit from its detail panel | — |
| Connected reading | Edit via connect form in edit mode | — |
| Remove a connected reading | Detail panel or list → **Remove** | Yes: "Remove *Clive Wearing article* from this thread? Its note will be deleted." |
| First reading | Cannot be removed (edit it, or delete the thread) | — |
| Next step | `/threads/[id]/next-step` → change or **Mark done** | No |
| Delete thread | Thread page → **Delete thread** | Yes: "Delete this thread, its 3 readings and notes? This can't be undone." → home |

Confirmations use an accessible dialog: focus moves into it, Escape cancels, and focus returns afterwards.

## 7. Empty, error, and system states

| State | What the user sees |
|---|---|
| No saved threads | First-visit start form (never a blank screen) |
| Thread with only the first reading | Map shows question + one reading; prompt card: "Connect a reading that supports or challenges this." |
| No next step | "What will you read or think about next?" with **Save a next step** |
| No other threads (returning) | "Start another thread" link instead of an empty list |
| Loading saved data | Brief loading placeholder (prevents a first-visit flash for returning users) |
| Thread not found (bad link, cleared data) | "This thread isn't saved on this device." + **Go home** |
| Reading not found in edit link | "That reading isn't in this thread anymore." + **Back to thread** |
| localStorage unavailable or full | Banner: "Changes can't be saved on this device." Forms still work for this visit |
| Saved data unreadable | "We couldn't read your saved threads." Data is left as is (not overwritten) |

## 8. Routes and shared navigation

| Route | Purpose |
|---|---|
| `/` | First visit (start form + expandable example) or returning view |
| `/threads/new` | Start another thread (same start form component) |
| `/threads/[id]` | Thread hub: map / list toggle, detail panel, next step, edit question, delete thread |
| `/threads/[id]/connect` | Connect a reading; also edit mode (`?reading=`) and next-step mode (`?from=next-step`) |
| `/threads/[id]/next-step` | Save, change, or mark done the one current next step |

- **Shared header** on every page: **Reading Map** (home) and **+ New thread**, with `aria-current` on the current page.
- **Breadcrumbs** on thread subpages: *Home › How does memory shape identity? › Connect a reading*.
- Every form has **Cancel** returning to where the user came from; after saving, the user always lands on the thread.
- Browser Back works throughout; a skip-to-content link is the first focusable element.

**Shared components:** Header, Breadcrumbs, Button, TextField, TextArea, RadioGroup (relationship / type), FieldError,
ThreadMap, ThreadList, ReadingDetail, ThreadCard, EmptyState, ConfirmDialog, StorageBanner.

## 9. Saved data (localStorage)

One versioned key, e.g. `reading-map:v1`:

```
{
  threads: [{
    id, question, createdAt, updatedAt,
    readings: [{ id, title, type: "book" | "article", author?, url?,
                 relationship: "raised" | "supports" | "challenges" | "perspective",
                 note?, addedAt }],          // first reading has relationship "raised"
    nextStep: { text, setAt } | null
  }]
}
```

Map/List preference is stored separately. Example content is not stored.

## 10. Scope

**In the MVP:** thread creation, the first-visit start form with an expandable read-only example, connecting readings
with a relationship and contribution note, the per-thread map with its list alternative, one current next step, the
returning view, editing and deletion, and essential validation and storage states.

**Deferred:** "Raises a new question" relationship, next-step history, a global reading library, reusing readings across
threads, thread statuses, search, export/import, a global cross-thread graph, dragging or manual node positions.
