---
name: ui-pattern
description: "Brainstorm partner for a new AI app idea. Takes a 1-paragraph idea, clarifies it through a short conversation, picks one of 7 UI patterns, then writes PRD.md + GUIDELINE.md into the repo. Use when user says 'help me spec this app', 'brainstorm my idea', 'viết spec / PRD cho app', 'chọn pattern / UI cho idea', 'bắt đầu app mới', 'blank page', 'I have an idea, help me turn it into a plan', 'app em sẽ như thế nào', or is at the blank-page moment before any code exists."
---

# UI Pattern — From idea to PRD + GUIDELINE in one conversation

User has an idea for an AI app and wants to start building. Blank-page paralysis is the #1 reason teams ship confused demos. This skill runs a **short brainstorm conversation** with the user, picks **one of 7 UI patterns**, then writes two files into the repo:

- `PRD.md` — problem, users, stories, data model, **tech stack (from user's brief)**, constraints, API surface, success criteria
- `GUIDELINE.md` — chosen UI pattern, T·C·R checklist, what NOT to build yet (references `PRD §Tech stack` for tech — doesn't restate it)

Stack is a **product decision**, not a UX decision. If the user briefs a stack in their paragraph (e.g., "Stack định dùng: React + Vite + Express mock"), the skill **records it verbatim into PRD**. The skill does NOT invent stack. If the user didn't mention one, the skill asks once before writing.

## What this skill does

1. Accepts a 1-paragraph idea from the user (or asks for one)
2. Asks 2–3 clarifying questions — adaptive, not a canned script
3. Picks one of the 7 UI patterns, explains why in one line
4. Writes `PRD.md` + `GUIDELINE.md` to the repo root
5. Tells the user what to paste next into Claude Code to start building

## When to use it

- User has an app idea but no PRD and no code
- User has a backend and wants to figure out the frontend
- User is re-spec'ing an abandoned repo
- Team needs a paved path from idea to "ready to build"

If the team already has working UI, route them to `/tcr-apply` instead — that skill retrofits T·C·R on existing code.

## The 7 UI patterns

Memorize names — `/tcr-apply` and `/prd-to-screens` use the same list.

1. **Chat + context panel** — conversation left, evidence panel right. AI TA, RAG chatbot, Socratic tutor, admissions assistant.
2. **Upload → dashboard** — file in, structured insights out. Survey analysis, report summarizer, invoice extractor.
3. **Query → structured result** — NL question in, table/chart out. Text-to-SQL, digital twin Q&A, knowledge graph search.
4. **Wizard + inline audit** — multi-step form with AI checking each step. Syllabus generator, compliance-form builder, onboarding flow.
5. **Draft → approve → send** — AI drafts, human reviews + approves, system dispatches. Emergency comms, email assistant, scheduled announcements.
6. **Queue + approval** — batch of AI-labeled items, human clears the queue. Moderation, grading at scale, contract review.
7. **Real-time streaming** — live voice/video/text pipeline. Voice Q&A moderator, live transcription, streaming tutor.

### Meta-pattern — "Conversational UI + Evidence Panel"

Pattern 1 (Chat + panel) is secretly a meta-pattern: swap what the panel shows and it covers 5 other use cases:

- panel = **sources** → RAG chatbot
- panel = **progress** → long-running agent
- panel = **reasoning** → research / planning agent
- panel = **chart** → data Q&A
- panel = **queue** → inbox / approval

When in doubt between patterns 1, 3, and 6, default to **1** and choose the panel payload.

## Step 1 — Get the idea

**Language rule:** match the user's input language. If their message is in Vietnamese, ask in Vietnamese. If English, ask in English. Same for Spanish, Japanese, etc. Every user-facing string in this skill (clarifying questions, style options, handoff) follows this rule. Below are example phrasings in English and Vietnamese — adapt to whatever language the user spoke.

If the user has already pasted an idea, summarize it back in one sentence to confirm. If they haven't, ask:

> EN: **Briefly describe your idea:** what does the app do, who uses it, what problem does it solve? If you've already picked a stack, mention it.
> VN: **Mô tả ngắn ý tưởng của bạn:** app làm gì, ai dùng, giải quyết vấn đề gì? Nếu đã định stack rồi thì nói luôn.

## Step 2 — Clarify through conversation

Based on the idea, pick 2-3 things that are actually unclear. Use the **AskUserQuestion tool** (multi-choice, with suggested options) — never print plain-text questions and wait for chat reply.

Pool to pick from (only what's unclear for *this* idea):

- **Input/Output shape** — how does user give input, what comes back?
- **Reversibility** — does AI action send something irreversible (email, money, published post)?
- **Roles** — one user or multiple? If multiple, which is Demo 1 vs Demo 2?
- **Trust signal type** — do we cite sources (need real data/RAG) or classify topics (no retrieval needed)?
- **Constraints** — UX lab, no auth, single-laptop demo, Vietnamese UI?
- **Stack** — if user hasn't specified, ask before assuming

For each question you pick, give 2-4 suggested options + an "Other" option. Phrase questions + options in the user's language. Example (phrase in user's language — here shown in English):

> AskUserQuestion
> - question: "What should the context panel show?"
> - options:
>   1. "Topic tags (classification, no RAG needed)"
>   2. "Source citations (needs real data or RAG)"
>   3. "Both"
>   4. "Other — I'll say"

If the idea paragraph already covered everything, skip to Step 2.5 with one short confirmation. Don't ask to fill a form.

## Step 2.5 — Pick UI style

Use **AskUserQuestion** with these options (ask this unless the user already stated a visual preference in Step 1). Phrase in the user's language; below shown in English:

> AskUserQuestion
> - question: "UI style direction for this app?"
> - options:
>   1. "Minimal clean — Linear / Notion feel, lots of whitespace, sans font, subtle borders"
>   2. "Playful — bright accents, rounded corners, friendly for consumer / Gen-Z apps"
>   3. "Data-dense professional — compact, low contrast, admin / reviewer dashboard feel"
>   4. "Just functional — inline styles, unpolished, demo-grade"

Save the answer — it goes into `GUIDELINE.md §Visual style` and shapes the build.

## Step 3 — Pick the UI pattern

Apply priority rules (top wins):

1. **Irreversible action** (send email, deduct money, publish publicly) → pattern 5.
2. **Batch work** (many items to approve/label) → pattern 6.
3. **Streaming** (voice, live video, live text) → pattern 7.
4. **Multi-step form** (user fills over time) → pattern 4.
5. **File upload** (CSV, PDF, audio, image) → pattern 2.
6. **Text question → chart/table output** → pattern 3.
7. **Text question → text + sources/reasoning output** → pattern 1.
8. **Still ambiguous** → default to 1 and set panel payload.

Tell the user the pattern + one-line reason. Offer the runner-up if the pick feels forced: "Mình chọn 1 vì Q+A dạng text. Nếu bạn thấy giống pattern 3 hơn (data analysis), nói mình biết."

## Step 4 — Write PRD.md

Write to `<repo-root>/PRD.md`. Overwrite if exists (warn + show diff first). Template:

```markdown
# PRD — {product name}

## Problem + context
{1–2 sentences on the pain. Add the "why now" — deadline, launch context, or internal demo scope.}

## Users
- **Primary:** {who uses it most, what they need}
- **Secondary:** {if any — e.g., admin, reviewer, operator}

## User stories
3–5 stories. Tag each with **(Demo 1)**, **(Demo 2)**, or **(Later)**. Demo 1 = what gets built
from the first build prompt. Demo 2 = second surface (often a different role). Later = nice-to-have.

1. **(Demo 1)** As a {role}, {action} so that {outcome}.
2. **(Demo 1)** ...
3. **(Demo 2)** ...
4. **(Demo 2)** ...
5. **(Later)** ...

## Data model
Core entities + 3–5 fields each. Sketch only — no schema, no migrations.

- **{entity 1}** — {field, field, field}
- **{entity 2}** — {field, field, field}
- **{entity 3}** — {field, field, field}

## Tech stack
Copy verbatim from the user's brief. Skill does NOT invent. If the user didn't specify
a stack, this section says "TBD — ask before building".

- **Frontend:** {e.g., React 18 + Vite + plain JSX + inline styles}
- **Backend:** {e.g., Express mock serving JSON}
- **LLM:** {e.g., Gemini 2.5 Flash via src/llmService.js}
- **Storage:** {e.g., in-memory JSON, no DB}
- **Not using:** {things user explicitly ruled out — e.g., TypeScript, Tailwind, SQLite}

## Constraints
Hard rules that shape the build. List what matters for this specific project.

- {e.g., "UX lab — không real backend, mock JSON là đủ"}
- {e.g., "Không auth, không session"}
- {e.g., "Demo trên 1 laptop, không cần deploy"}
- {e.g., "User-facing strings Vietnamese có dấu"}

## API surface
Kinds of endpoints the frontend will need. Name the operation, not the URL. Claude Code
decides exact route shapes when building.

- {e.g., "chat send — user asks a question, gets back answer + metadata"}
- {e.g., "list items — reviewer loads all flagged items, filtered by category"}
- {e.g., "flag answer — user marks a response as wrong"}

## Success criteria
Observable checks. 3 bullets, each one a thing you could watch someone do.

- {e.g., "User hỏi 3 câu liên tiếp không bị reload / mất history"}
- {e.g., "Reviewer load trang thấy đúng danh sách item được flag"}
- {e.g., "Đổi provider LLM = edit 1 file (src/llmService.js)"}

## Out of scope
Explicit. Prevents scope creep mid-build.

- {e.g., "Auth / login"}
- {e.g., "Persistent DB — chỉ mock JSON"}
- {e.g., "Mobile layout"}
- {e.g., "Dark mode, i18n, polish CSS"}

## Open questions
{Empty by default. Skill adds items only when it asked something during Step 2 that the
user didn't answer definitively. Example: "Dashboard lọc theo ngày hay chỉ theo category?"}
```

Fill from the conversation. Keep stories concrete — no "as a user, I want a great experience". Force role + action + outcome.

## Step 5 — Write GUIDELINE.md

Write to `<repo-root>/GUIDELINE.md`. Template:

```markdown
# GUIDELINE — {product name}

> Tech stack: see `PRD §Tech stack`.

## UI pattern
**{pattern number}. {pattern name}**

Why this pattern: {1–2 lines tying the user's answers to the pick}

{If pattern 1: add "Conversational UI + Evidence Panel" note with suggested panel payload —
e.g., "Panel = topic tags + AI self-reported confidence (0–100). NOT citations, NOT sources —
this app doesn't ground on a corpus, so honest labeling matters."}

## Visual style
{One of: Minimal clean / Playful educational / Data-dense professional / Just functional — from user's Step 2.5 answer}

Concrete rules for this style:
- {e.g. Minimal clean → "white background, sans-serif, 16px base, subtle 1px borders, no shadows, 24px spacing unit"}
- {e.g. Playful educational → "soft color palette (mint/peach/cream), rounded-xl corners, emoji OK in labels, friendly button copy"}
- {e.g. Data-dense → "14px base, compact 8px spacing, table rows 32px tall, monospace for IDs/numbers"}
- {e.g. Just functional → "inline styles, no CSS framework, demo-grade"}

## User flow (3 steps)
1. User {does input action}
2. App {AI processing step — be concrete about what the LLM sees}
3. User {interacts with output}

{If multiple roles: add a second flow block for the Demo 2 role.}

## T·C·R checklist for this pattern

### T — Transparency (what AI work is visible)
- [ ] {pattern-specific T item 1}
- [ ] {pattern-specific T item 2}
- [ ] {pattern-specific T item 3}

### C — Control (what user can stop / edit / override)
- [ ] {pattern-specific C item 1}
- [ ] {pattern-specific C item 2}
- [ ] {pattern-specific C item 3}

### R — Recovery (validation + retry + undo)
- [ ] {pattern-specific R item 1}
- [ ] {pattern-specific R item 2}
- [ ] {pattern-specific R item 3}

{If pattern 1 and app has no RAG corpus: note that trust signal is topics/confidence/freshness — NOT fake citations. If the app has its own taxonomy (fixed list of categories), note that LLM must return values from it + validation rule. Otherwise skip.}

## Hinge rule
All LLM calls go through `src/llmService.js` (or equivalent named in `PRD §Tech stack`).
UI never imports a provider SDK directly. Swap providers = edit one file.

## What NOT to build yet
- {things that feel urgent but aren't — auth, persistent DB beyond mock, complex routing, dark mode, i18n, mobile layout, polish CSS}
- Demo cares about the core loop working end-to-end, not polish.
- T·C·R features come in a separate prompt (run `/tcr-apply` after baseline).
```

Fill the T·C·R checklist from the matrix below — **copy, don't invent**. Consistency across patterns is the whole point.

## Step 6 — Hand off

**The skill's job ends when PRD + GUIDELINE are on disk.** Do NOT plan the build. Do NOT list files to create. Do NOT prescribe libraries beyond what PRD §Tech stack already says.

Tell the user, briefly — **in their language**:

> EN:
> Wrote PRD + GUIDELINE at repo root.
> - **PRD** — problem, users, stories, tech stack, constraints, API surface
> - **GUIDELINE** — chosen UI pattern, visual style, T·C·R checklist, hinge rule
>
> Next: baseline build from these two files. Run `/tcr-apply` after baseline to layer T·C·R.

> VN:
> Xong PRD + GUIDELINE ở repo root.
> - **PRD** — problem, users, stories, tech stack, constraints, API surface
> - **GUIDELINE** — UI pattern đã chọn, visual style, T·C·R checklist, hinge rule
>
> Tiếp theo: build baseline từ 2 file này. Chạy `/tcr-apply` sau baseline để layer T·C·R.

Stop there. Claude Code (outside the skill) handles planning and coding from the two files. The skill's output is the two files, not a build script.

## T·C·R matrix by pattern

Use to fill the checklist in `GUIDELINE.md`. Identical to `/tcr-apply`'s matrix — do not drift.

### 1. Chat + context panel
- **T:** sources/topic panel (2–4 refs), streaming status line, confidence dot (green/yellow/red)
- **C:** stop button during streaming, edit-last-user-message, Cmd+K clear chat
- **R:** error bubble with retry + report, thumbs-down on each assistant message

### 2. Upload → dashboard
- **T:** parse/extract/analyze progress panel, per-insight source link back to file
- **C:** cancel during processing, preview modal before analyze if file is large
- **R:** pre-flight file validation (type/size/non-empty), "try different file", keep-previous-file undo

### 3. Query → structured result
- **T:** collapsible "view SQL/query" panel, confidence badge on result, meta line (rows/ms/model)
- **C:** edit generated query before run, confirm modal for destructive queries, Enter/Esc shortcuts
- **R:** retry on fail, "rephrase question" button that feeds error back to LLM, query history

### 4. Wizard + inline audit
- **T:** per-field audit (✓/⚠/✗) with 1-line reason, end-of-wizard summary card
- **C:** back/forward without data loss, save draft to localStorage, override AI warning
- **R:** validate per step, don't block on audit fail, preview + edit before final submit

### 5. Draft → approve → send
- **T:** confidence score per section, recipient/subject/attachment preview, generation meta log
- **C:** mandatory preview step (no generate-and-send), edit any field, save-as-draft option
- **R:** "sent · undo" toast with 10s window, sent log with retry, keep draft on send failure

### 6. Queue + approval
- **T:** confidence dot per item, 1-line AI reasoning, header counts (pending/auto-approvable/low-conf)
- **C:** bulk select + shift-click range, keyboard (J/K/A/R/U), filter by confidence threshold
- **R:** undo stack of 10, "flag for review" instead of reject, re-surface on data update

### 7. Real-time streaming
- **T:** live status ("listening/transcribing/analyzing"), token-by-token output, latency meta bar
- **C:** stop button aborts stream, pause/resume for transcription, Space/Esc shortcuts
- **R:** auto-reconnect (max 3), preserve transcript buffer on reconnect, manual restart button

## Anti-patterns — do NOT do these

- **Don't invent a stack.** If user didn't brief one, ask. Never guess "React + Next.js because it's popular".
- **Don't restate the stack in GUIDELINE.** GUIDELINE references `PRD §Tech stack`. One source of truth.
- **Don't run a rigid script.** Ask what's needed to remove uncertainty. If idea is clear, skip questions.
- **Don't pick 2 patterns.** Commit to one. "Hybrid" = confused users.
- **Don't write any code.** Only `PRD.md` + `GUIDELINE.md`. User runs the build prompt in Claude Code — that's the learning moment.
- **Don't design the backend in detail.** PRD sketches data model + API surface (operations, not URLs). Claude Code picks route shapes when building.
- **Don't add T·C·R features in the baseline build prompt.** Baseline = skeleton. T·C·R = separate prompts. Two phases, two commits.
- **Don't use English in user-facing strings** (if user-facing language is Vietnamese). Code identifiers stay English.
- **Don't invent a new pattern.** If nothing fits, default to 1 and adjust panel payload. The 7 cover >95% of ideas.
- **Don't skip the "Why this pattern" line.** Users who can explain the pick will pick correctly next time without this skill.

## Principles

- **Idea → short brainstorm → PRD + GUIDELINE → build prompt.** Four artifacts, one flow.
- **PRD owns product + stack. GUIDELINE owns UX.** Stack is a product decision (provider choice, mock vs real backend, language). UX is how users touch it. Don't mix them.
- **Skill records, doesn't invent.** User's stack goes in PRD verbatim. User's constraints go in PRD verbatim. Skill's job is structure + pattern pick, not tech opinion.
- **Skeleton before T·C·R.** Never bundle baseline build with T·C·R upgrades. Two phases, two prompts, two commits.
- **Vietnamese-first UX strings when the user is Vietnamese-speaking.** Code stays English.
- **Commit to the pick.** Ambiguous case → pattern 1 with adapted panel. Consistency beats perfection.
- **PRD is reused.** Demo 1 builds (Demo 1) stories. Demo 2 (via `/prd-to-screens`) picks (Demo 2) stories from the same PRD. Don't regenerate PRD per surface.


---

## Reference — worked example

For a full end-to-end walk-through (clarifying questions → PRD → GUIDELINE), see `./references/example-ngu-van-tutor.md`. Illustrative only — domain-specific strings and thresholds don't transfer to other apps.
