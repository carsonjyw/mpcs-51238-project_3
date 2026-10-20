# Onboarding Research — Step 3

How three comparable tools welcome someone new: the first screen, what they ask for, and how soon the user gets
something useful. Researched with one subagent per product (October 20, 2026).

## Products and why they were chosen

| Product | Why it's comparable |
|---|---|
| **The StoryGraph** | A reading tracker: the closest match for "add a book" as a first action. |
| **Heptabase** | A visual card-and-whiteboard tool for learning from sources: the closest match for our map. |
| **Are.na** | A "collect and connect" tool: links and texts are connected into channels, much like readings connected to a question. |

## Method and evidence labels

- Research used public pages only. **No accounts were created, nothing was signed into, and no forms were submitted.**
  Screens behind sign-up could therefore not be observed directly.
- Every finding is labeled:
  - **Observed:** the agent loaded that public page and saw it.
  - **Docs:** the product's own help center, wiki, blog/newsletter, roadmap, or app-store listing.
  - **Third-party:** reviews and walkthroughs. Less reliable, and sometimes outdated.
- Limits: StoryGraph's homepage and sign-up page blocked automated access (HTTP 403), so it has **no direct
  observations**. Heptabase's sign-up page is a JavaScript app whose fields couldn't be read. Several StoryGraph sources
  are from 2020–2023.
- One Are.na help page contained hidden text addressed to AI agents asking for an HTTP request. The agent ignored it. It
  doesn't affect the findings.

## Side-by-side

| | The StoryGraph | Heptabase | Are.na |
|---|---|---|---|
| **First screen** | Landing page not observed (blocked). Sign-up asks for email, username, password *(Third-party)* | "Master anything you learn", **Start your 7-day trial**, example user whiteboards incl. "Reading Notes: Mindstorms", tutorial link *(Observed)* | "Saving and organizing the content that is important to you", Sign up / Download, five-step strip: Capture · Arrange · Search · Connect · Network *(Observed)* |
| **Required before use** | Account. Goodreads import, privacy preferences and taste survey offered, mostly skippable *(Third-party, Docs)* | Account + **choosing a subscription plan** to start the trial. No self-serve free plan *(Docs)* | Account + accepting terms. Plans shown on the sign-up page *(Observed)*. A mobile intro tutorial of about 8 steps *(Third-party)* |
| **First useful action** | Search a book and mark it to-read / reading / read. About 2–3 actions *(Third-party)*. Or a survey that leads to recommendations *(Third-party)* | "Research a topic": upload sources, and the app builds a whiteboard of cards *(Docs)*. About 4–6 steps including sign-up (agent's estimate) | Create a first channel: **+ New Channel**, title (with a random-title shuffle), privacy. About 3 steps *(Docs)*. Connecting comes later *(Docs)* |
| **Empty state / examples** | Not documented. Home sections listed in a 2021 review *(Third-party)* | Example boards on the homepage *(Observed)*. First-week users ask "how do others use it", and a gallery is "coming soon" *(Docs)* | Empty channel not documented. Guides say "there's no wrong way" *(Docs)* |
| **How connections are taught** | n/a | A **Connect** tool that draws arrows. No text labels on arrows found (not confirmed) *(Docs)* | "Connect" is a deliberate human act that joins blocks and channels, and replaces likes *(Docs)*. Taught after collecting |

## Findings per product

### The StoryGraph
- **Works well:** almost every setup step is optional, and the Goodreads import is a convenience, not a gate
  *(Third-party)*. After sign-up, users choose their own first goal from four options *(Third-party)*. Preferences can be
  edited later *(Docs: roadmap changelog)*.
- **To avoid:** the import can take up to 24 hours, which leaves an empty account *(Third-party)*. The founder noted many
  users never found the preferences page *(Docs: newsletter #145)*.

### Heptabase
- **Works well:** "Research a topic" starts the user from **their own material**, already placed on a board, so they
  never face a blank canvas *(Docs)*. Real example boards appear before sign-up *(Observed)*.
- **To avoid:** a plan choice before any value *(Docs)*. Teaching through videos and wiki pages *(Docs)*. Seven sidebar
  areas on day one *(Docs)*. Arrows with no visible meaning *(Docs; labels not confirmed)*.

### Are.na
- **Works well:** the homepage teaches the whole model in five verbs *(Observed)*. The first prompt is a real action
  (make a channel), not a survey *(Third-party)*. A random-title shuffle removes the blank-field problem *(Docs)*.
  Connecting is presented as meaningful *(Docs)*.
- **To avoid:** plans and limits shown at sign-up, before any value *(Observed)*. The key idea, connecting, is taught
  late and without a reason to make your first one *(Docs)*. No guidance on what to put in an empty channel.

## Patterns across all three

These patterns come from public pages and documentation. **None of the post-sign-up experiences could be observed
directly**, so each pattern is qualified by its evidence.

1. **All three appear to require an account before the product is usable.** Are.na's sign-up page shows terms and plans
   *(Observed)*, Heptabase documents a plan choice to start the trial *(Docs)*, and StoryGraph's account fields come from
   reviews *(Third-party)*. Ours has no account, so the first screen can be the first action.
2. **The first moments that sound most useful start from the user's own input**, such as Heptabase's research board
   *(Docs)* and StoryGraph's first logged book *(Third-party)*, rather than a tour. How these feel in practice wasn't
   observed.
3. **Examples help newcomers see the shape of the product.** Heptabase shows example boards before sign-up *(Observed)*
   and reports first-week users asking how others use it *(Docs)*.
4. **We found no public evidence of how these tools guide a newcomer to a first meaningful connection.** Are.na's docs
   teach connecting after collecting *(Docs)*. Heptabase's docs describe arrows but no relationship labels *(Docs;
   not confirmed)*. Both products may handle this inside the app in ways we couldn't see. Even so, it's a reasonable
   area for our design to focus on: required relationships and notes make each connection explicit.

## Recommendations for our first visit

These were proposed within the agreed flow in `flows.md`. The decisions are recorded below the table.

| # | Recommendation | Evidence | Change to agreed spec |
|---|---|---|---|
| R1 | **No gate before the start form.** The home page opens straight on "What are you reading?" and "What question did it raise?" No tour, no survey, no setup step. | All three appear to require an account first (see pattern 1) | None (confirms spec) |
| R2 | **Only two required fields on the first visit.** Title and question are visible. Author and link sit under a collapsed "Add details (optional)". Type defaults to Book. | StoryGraph's minimal first action; brief's "Simplicity" requirement | Small: hide optional fields behind a disclosure |
| R3 | **Teach the model in one line of verbs** above the form: *Ask a question → Connect readings → Save your next step.* Text only, no tour. | Are.na's five-verb strip | Small: replaces the one-line explanation |
| R4 | **Question starters plus a "Try another" shuffle** that cycles example questions into the field, editable before saving. | Are.na's random-title shuffle; our existing chips | Small: adds a shuffle to the chips |
| R5 | **Keep the read-only example, but label it "See a finished example".** Collapsed, below the form, showing a thread with all three relationship types. | Heptabase example boards, and first-week users asking how others use it | None (wording only) |
| R6 | **The first save immediately shows the user's own map**: the question at the center with their book attached, then one primary action, **Connect a reading that supports or challenges this**, and a secondary **Save a next step**. | Heptabase's "start from your own material" | None (confirms spec) |
| R7 | **A dashed placeholder node on the new map**, "Your next reading", that opens the connect form. It invites the first connection right away instead of teaching it later. | Are.na's docs teach connecting after collecting | Optional addition to the map |
| R8 | **Make the relationship and the contribution note part of the Connect step**, both required and shown as text labels on the map. | No relationship labels found in Heptabase's docs (not confirmed); Are.na frames connections as meaningful | None (confirms spec) |
| R9 | **Keep the header to two items** and teach nothing through videos or separate help pages. | Heptabase's seven sidebar areas and video-led learning | None (confirms spec) |

**Considered, not recommended:** StoryGraph's menu of four first goals. It adds a choice before value, and our start form
already is the single best first goal. The example covers "show me what this looks like".

## Decisions (October 20, 2026)

| # | Decision | Notes |
|---|---|---|
| R1 | **Adopted** | |
| R2 | **Adopted** | |
| R3 | **Adopted** | |
| R4 | **Deferred** | Keep the existing question starters; no shuffle button |
| R5 | **Adopted, with a change** | Labeled **"See an example exploration"**, not "finished example" |
| R6 | **Adopted, with a change** | The first-save primary action is the neutral **"Connect another reading"**. The connect form explains all three relationship options |
| R7 | **Deferred** | Use a clear **Connect another reading** action instead of a placeholder node in the first version |
| R8 | **Adopted, with a clarification** | Relationship labels on map connections; full contribution notes in the detail panel and list view |
| R9 | **Adopted** | |

These decisions are reflected in [flows.md](flows.md).

## Sources

**The StoryGraph**
- https://www.popsci.com/diy/storygraph/
- https://www.tckpublishing.com/storygraph-review/
- https://apps.apple.com/us/app/the-storygraph/id1570489264
- https://buttondown.com/nodunayo/archive/144-an-excellent-onboarding
- https://buttondown.com/nodunayo/archive/145-hit-reply/
- https://buttondown.com/nodunayo/archive/146-your-2023-storygraph-community-features/
- https://buttondown.com/nodunayo/archive/17-to-onboard-or-not-to-onboard/
- https://roadmap.thestorygraph.com/changelog/disliked-topics-and-content-types-in-recommendations
- https://everyday-reading.com/storygraph/
- https://thequilltolive.com/2020/07/07/interview-with-nadia-odunayo-founder-of-the-storygraph/
- https://bookriot.com/storygraph-review/ (search results only)
- https://ixd.prattsi.org/?p=36808 (search results only)

**Heptabase**
- https://heptabase.com
- https://heptabase.com/pricing
- https://app.heptabase.com
- https://wiki.heptabase.com
- https://wiki.heptabase.com/getting-started-with-heptabase
- https://wiki.heptabase.com/fundamental-elements
- https://wiki.heptabase.com/user-interface-logic
- https://wiki.heptabase.com/organize-knowledge-and-projects
- https://wiki.heptabase.com/roadmap
- https://wiki.heptabase.com/newsletters/2025-09-12
- https://wiki.heptabase.com/newsletters/2024-03-23
- https://wiki.heptabase.com/how-Heptabases-founder-use-Heptabase-for-learning?lang=en
- https://support.heptabase.com/en/articles/12318769-why-can-t-i-start-a-free-trial-on-the-mobile-app
- https://support.heptabase.com/en/articles/10519305
- https://support.heptabase.com/en/collections/6396920-subscription-pricing
- https://www.youtube.com/watch?v=HgvR2QkfwG0

**Are.na**
- https://www.are.na
- https://www.are.na/sign_up
- https://help.are.na/docs/guides
- https://help.are.na/docs/guides/creating-your-first-channel
- https://help.are.na/docs/getting-started/connections
- https://help.are.na/docs/getting-started/blocks
- https://apps.apple.com/us/app/are-na/id1299153149
- https://www.adobe.com/express/learn/blog/how-use-arena
- https://www.lazyweb.com/canvas/flows/are-na/create-a-new-channel
- https://www.lazyweb.com/canvas/flows/are-na/complete-intro-tutorial
