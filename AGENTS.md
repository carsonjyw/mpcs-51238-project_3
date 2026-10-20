<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project: Reading Exploration Map (Assignment 3 — Patterns & Flows)

A tool that connects things people read with the questions and ideas they want to explore next.
Users manually add books or articles, capture questions and thoughts, and connect related items.
When they return, they can see unfinished threads and choose where to continue.

## Git and publishing

- The user handles all Git staging and commits. Do not run `git add`, `git commit`, or otherwise stage or commit changes.
- Do not create an initial scaffold commit. Before running scaffolding tools, check for and prevent automatic Git commits.
- Repository initialization is allowed, provided it does not create a commit.
- Do not push, publish, or deploy unless the user explicitly requests it.
- Read-only Git commands, such as `git status`, `git diff`, and `git log`, are allowed.
- The Git restrictions in this section take precedence over the generated Next.js block's suggestion to commit changes.
- Do not revert or overwrite the user's existing work.

## Constraints

- Use Next.js App Router and Tailwind CSS.
- Save application data locally with localStorage only. No accounts, database, application backend, or external APIs.
- Core functionality must work without AI-generated content.
- Keep the implementation focused on the agreed MVP. Discuss significant scope changes with the user before implementing them.

## Design and accessibility

- Give first-time users something useful immediately; avoid dead-end empty screens.
- Use one-column forms with real labels for every field.
- Put actionable validation messages next to the relevant fields and preserve entered values when validation fails.
- Use shared components consistently for buttons, fields, navigation, and feedback.
- Provide clear navigation between routes, including a clear way back.
- Support keyboard operation and visible focus states. Check text contrast.
- Design the returning-user experience around saved exploration threads and a clear next step.
- If a visual map is implemented, provide an accessible list view of the same information.

## Process

- Work iteratively. Define the first visit, core task, and returning flows together in plan mode before implementing features.
- Propose important steps, states, and errors, and let the user choose what to keep.
- After the flows are agreed, document them with Mermaid in `flows.md` and show the diagram in `README.md`.
- Build the agreed flow steps as routes with shared navigation.
- Research onboarding in three comparable tools using subagents when the user requests that stage of the assignment.
- Keep `README.md` aligned with the implemented product, including setup instructions, the flow diagram, and the eventual first-run usability check.
- Run checks appropriate to the changes. Report what was verified and any remaining issues without creating a commit.

## Current phase

- MVP and user flows agreed and documented in `flows.md` (diagram also shown in `README.md`). No app features implemented yet.
- Next step: research how three comparable tools onboard new users, then build the agreed routes and shared navigation in stages.
- Update this section when the project moves to a new phase.
