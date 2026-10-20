# Reading Exploration Map

A tool that connects what you read with the questions and ideas you want to explore next. Built for
Design, Build, Ship — Assignment 3: Patterns & Flows. Data is saved in your browser with localStorage.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Flows diagram

**Main task:** I add a book and a question it raised → connect another reading and explain what it contributes → save my
next step → return later and continue exploring with my previous work still saved.

The diagram covers the first visit, the main task, the per-thread map, and the returning-user flow. The full
specification (fields, validation messages, empty and error states, map behavior, and routes) is in
[flows.md](flows.md).

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
    THREAD -- "New thread (header)" --> NEW
    THREAD -- Select a reading --> DETAIL["Detail panel<br/>note · Edit · Remove<br/>original reading: Raised this question · Edit only"]
    DETAIL -- Edit --> CONNECT
    DETAIL -- "Remove (connected readings only)" --> RMQ{Confirm remove?}
    RMQ -- Yes --> THREAD
    RMQ -- No --> DETAIL
    THREAD -- Edit question inline --> THREAD
    THREAD -- Delete thread --> DELQ{Confirm delete?}
    DELQ -- Yes --> HAS
    DELQ -- No --> THREAD

    %% Main task: connect
    THREAD -- Connect a reading --> CONNECT["<b>/threads/[id]/connect</b><br/>title · type · author/link optional<br/>relationship · what it contributes<br/>editing the original reading: details only,<br/>relationship stays Raised this question"]
    CONNECT -- Submit --> V2{Valid?}
    V2 -- No --> E2["Errors next to each field<br/>typed text kept<br/>next step unchanged"]
    E2 --> CONNECT
    V2 -- Yes --> SAVED["Reading saved to thread<br/>if started from 'I did this':<br/>step marked done or replaced in the same save"]
    SAVED --> THREAD

    %% Next step
    THREAD -- "Save / change next step" --> NEXT["<b>/threads/[id]/next-step</b><br/>one current next step"]
    NEXT -- Submit --> V3{Step written, ≤ 200 chars?}
    V3 -- No --> E3["Error next to field<br/>typed text kept"]
    E3 --> NEXT
    V3 -- Yes --> THREAD

    %% Cancel: always back to the page the user entered from
    CONNECT -- Cancel --> BACK{"Cancel: nothing saved<br/>entered from?"}
    NEXT -- Cancel --> BACK
    NEW -- Cancel --> BACK
    BACK -- Home --> RV
    BACK -- Thread --> THREAD

    %% Coming back later
    THREAD -. "leave · come back later" .-> OPEN
```

## First-run check

_To be added after deployment._
