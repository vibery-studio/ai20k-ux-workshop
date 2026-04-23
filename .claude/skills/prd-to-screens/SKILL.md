---
name: prd-to-screens
description: "Read a PRD, pick the highest-value screen to build first, map it to one of 7 AI-app UI patterns, write GUIDELINE.md into the repo. Use when user has a PRD (link, path, or pasted text) and asks 'what should I build first', 'which screen matters most', 'turn this PRD into a UI', 'help me scope this app', or shows up with a spec but no code. Complement to /ui-pattern (which starts from an idea, not a PRD)."
license: MIT
argument-hint: "[PRD path or pasted PRD text]"
---

# /prd-to-screens — PRD in, GUIDELINE out

User has a PRD. They need to know which one screen matters most and how to build it. This skill reads the PRD, applies a valuable-story filter, picks **one UI pattern**, and writes **`GUIDELINE.md`** into the repo. That's it.

Use when:
- User brings a PRD (file path, pasted text, URL) and wants to start building
- Team is scoped out of control — too many stories, needs to pick the core one
- PRD exists but there's no UI plan yet

If the user has only a vague idea (no PRD yet), route to `/ui-pattern` instead.

## What it writes

**One file:** `<repo-root>/GUIDELINE.md`

- UI pattern choice + why
- Visual style
- User flow (3 steps)
- T·C·R checklist for this pattern
- Hinge rule (`src/llmService.js`)
- What NOT to build yet

No `stories.md`, no `screens.md`, no `prompts.md`. Claude Code plans and builds from `GUIDELINE.md` + the PRD the user already has.

## The 7 UI patterns

Full reference: `./references/archetypes.md` (read before writing). Every AI-app screen maps to one:

1. **Chat + context panel** — Q+A with sources/reasoning visible (RAG, tutor, assistant)
2. **Upload → dashboard** — file in, structured insights out (CSV analysis, report summary)
3. **Query → structured result** — NL question → chart/table (text-to-SQL, analytics)
4. **Wizard + inline audit** — multi-step form with live AI validation (onboarding, config)
5. **Draft → approve → send** — AI drafts, human approves, system sends (email, comms)
6. **Queue + approval** — batch of AI-labeled items, human clears queue (moderation, review)
7. **Real-time streaming** — live voice/text pipeline, low latency (transcription, voice Q&A)

## Flow

```
STEP 1   Load PRD (path, pasted, or URL).
STEP 2   Read ./references/archetypes.md.
STEP 3   Extract candidate stories. Apply valuable-story filter (Gate A/B/C).
STEP 4   If >1 story survives, AskUserQuestion to pick the first one to ship.
         If 1 survives, skip.
         If 0 survive, surface the problem.
STEP 5   Ask UI style (AskUserQuestion, 4 options).
STEP 6   Map story → UI pattern (decision table).
STEP 7   Write GUIDELINE.md. Hand off.
```

Total user interaction: 1–2 `AskUserQuestion` popups max.

---

## STEP 1 — Load PRD

Input forms:
- Path → `Read` it
- Pasted text → use as-is
- URL → fetch with `WebFetch`
- Nothing → ask once in the user's language, e.g. "Paste the PRD or give me a path." / "Dán PRD hoặc cho mình đường dẫn."

Extract silently:
- **App slug** — from PRD title, lowercase-hyphenated (e.g. `syllabus-builder`, `invoice-analyzer`)
- **Language** — detect from PRD + user's messages (EN / VN / mixed / other). Drives all user-facing prompts + the GUIDELINE.md prose below. Code identifiers stay English regardless.
- **Primary actor** — the human using the AI-facing screen (NOT the admin who configures)
- **Domain** — education, commerce, analytics, comms, moderation, voice

If PRD is long-form with strategy sections, skim for Personas / User Stories / Use Cases / Features. The valuable stories live there. Skip market sizing.

## STEP 2 — Read local references

Read `./references/archetypes.md` into context. This has the 7 pattern definitions + per-pattern Stage 0 / +T / +T+C / +T+C+R surfaces + traps.

If the file is missing, STOP and tell the user. Don't hallucinate pattern content from memory.

## STEP 3 — Apply the valuable-story filter

List every user story in the PRD (explicit "As a X, I want Y" AND implicit ones in Feature / Use Case lists). A story survives only if it passes all three gates:

### Gate A — Core loop, not admin CRUD

Drop: user management, login, role/permission setup, data import (unless pattern 2), admin-of-admin dashboards, analytics-of-analytics.

Keep: the thing the end-user does to get the value the PRD promised. The moment AI is visibly doing work the user couldn't do alone.

### Gate B — Visible AI hand-off

Drop: no AI in the loop, or AI is only backend with no user-visible moment.

Keep: user asks / uploads / speaks → AI processes → user sees output. This is the pattern trigger.

### Gate C — Failure mode worth designing R for

Drop: failures are impossible (static content) or silent (cached lookup). Every error is "retry the form".

Keep: AI can be wrong, slow, or unavailable, AND the user needs a visible recovery path. Wrong output has cost (sent SMS, approved post, executed SQL).

## STEP 4 — Narrow to the one story to ship first

All prompts below in the user's language (detected in STEP 1). English shown; translate if PRD/user is non-English.

- If exactly 1 story survived: skip, proceed with it.
- If ≥2 survived: use `AskUserQuestion`:
  > "N stories passed the filter. Which one ships first?"
  > Options: [survivor numbers + one-line each]
- If 0 survived: use `AskUserQuestion`:
  > "No story passed the filter. PRD is heavy on {admin CRUD / missing AI hand-off / no failure case}. What now?"
  > Options:
  >   - "Loosen Gate C (drop the R requirement) to surface 1–2 stories"
  >   - "PRD isn't ready — send back to author"
  >   - "Other"

## STEP 5 — Pick UI style

Always ask — visual direction is a product decision. Translate to user's language:

> `AskUserQuestion`
> "UI style direction for this app?"
> - "Minimal clean — Linear / Notion feel, lots of white, sans font"
> - "Playful educational — bright accents, rounded corners, friendly"
> - "Data-dense professional — compact, low contrast, dashboard feel"
> - "Just functional — inline styles, unpolished, demo-grade"

## STEP 6 — Map story to UI pattern

Apply in order, first match wins:

| If the story's core UX moment is… | UI pattern |
|---|---|
| User types a question, AI answers with sources/citations visible | 1 Chat + panel |
| User uploads a file, waits, sees summary tiles/charts | 2 Upload → dashboard |
| User types a question, AI produces a chart/table (not prose) | 3 Query → structured |
| User fills multi-step form, each field AI-checked | 4 Wizard + audit |
| User reviews AI draft before irreversible send/publish | 5 Draft → approve → send |
| User processes list of AI-labeled items (approve/reject per row) | 6 Queue + approval |
| User speaks/streams, AI responds <1s, can interrupt | 7 Real-time streaming |

**Borderline cases:**
- Chat that returns a chart → pattern 3 (pattern is defined by OUTPUT shape)
- Form that ends with "AI drafts, then send" → pattern 5 (the irreversible send dominates)
- Live classifier during typing → pattern 4 if authoring, pattern 6 if reviewing

Never fuse two patterns on one screen. If two actors need two screens (author + consumer), pick the primary actor's screen and note in GUIDELINE that the second is out of scope for now.

## STEP 7 — Write GUIDELINE.md

Write to `<repo-root>/GUIDELINE.md`. Warn + show diff if exists.

```markdown
# GUIDELINE — {app name}

> PRD: see {path or "pasted, saved to PRD.md"}

## UI pattern
**{N}. {pattern name}**

Why this pattern: {1–2 lines tying the user story to the pick}

{If pattern 1: add Conversational UI + Evidence Panel note with suggested panel payload for this domain — "panel = sources" (if RAG), "panel = topic classification" (if no corpus), "panel = reasoning steps" (if agent), etc.}

## Visual style
{From STEP 5: Minimal clean / Playful educational / Data-dense / Just functional}

Concrete rules:
- {4–5 bullets specific to this style — font, spacing, corners, color usage}

## User flow (3 steps)
1. User {input action}
2. App {AI processing — name the LLM call, what it receives, what it returns}
3. User {interacts with output}

## T·C·R checklist for this pattern

### T — Transparency (what AI work is visible)
- [ ] {pattern-specific T item 1 from references/archetypes.md}
- [ ] {T item 2}
- [ ] {T item 3}

### C — Control (what user can stop / edit / override)
- [ ] {C item 1}
- [ ] {C item 2}
- [ ] {C item 3}

### R — Recovery (validation + retry + undo)
- [ ] {R item 1}
- [ ] {R item 2}
- [ ] {R item 3}

## Hinge rule
All LLM calls go through `src/llmService.js` (or the equivalent file named in PRD Tech stack). UI never imports a provider SDK directly. Swap providers = edit one file.

## What NOT to build yet
- {features from PRD that aren't the valuable story — admin, auth beyond mock, persistent DB, polish}
- T·C·R features come in sequence, not all at once. Baseline first, then layer T → C → R.
- {pattern-specific traps to avoid — pull 2–3 from references/archetypes.md traps list}
```

Fill the T·C·R checklist by reading `./references/archetypes.md` for the chosen pattern — copy, don't invent. Consistency across apps is the point.

## STEP 8 — Hand off

Tell the user, briefly, in their language. English baseline:

> GUIDELINE.md written to repo root. Locked UI pattern {N} ({name}) for story: {1-line}.
>
> Claude Code has enough context to plan + build baseline. Once baseline runs, run `/tcr-apply` to layer T·C·R.

Vietnamese equivalent:

> Xong GUIDELINE.md ở repo root. Chốt UI pattern {N} ({name}) cho story: {1-line}.
>
> Claude Code có đủ context để plan + build baseline. Khi baseline chạy được, chạy `/tcr-apply` để layer T·C·R.

Stop there. Do NOT tell the user to "open a fresh session", "copy GUIDELINE.md in", "paste Prompt 0", or anything that reveals this is a scripted flow. Claude Code (outside the skill) handles planning and coding from GUIDELINE.md + PRD.

---

## Anti-patterns — do NOT do these

- **Don't write PRD.md.** The user brought a PRD. Don't rewrite it. If they pasted text, save it verbatim as PRD.md and reference it. Don't restructure.
- **Don't invent a stack.** GUIDELINE references PRD for stack. If PRD doesn't specify, ask once.
- **Don't pick 2+ patterns.** One story, one pattern, one screen. Hybrid = confusion.
- **Don't write build prompts.** No `prompts.md`. No "paste this into Claude Code". The skill's job ends at GUIDELINE.md.
- **Don't invent a pattern outside the 7.** If nothing fits, re-read the story — you probably parsed it wrong. Default to 1 with adapted panel payload.
- **Match the PRD's language for user-facing strings.** Detect in STEP 1. Code identifiers stay English regardless.
- **Don't restate the filter results as a separate file.** The filter is a tool to pick the right story — once picked, the dropped stories don't matter. If the user asks why X was dropped, explain in chat.

## Principles

- **One story, one pattern, one GUIDELINE.** The whole point of the filter is to cut to the screen that matters.
- **Skill records, doesn't invent.** PRD's stack and constraints go into GUIDELINE verbatim (via reference). Skill's job is pattern pick + UX rules.
- **Baseline before T·C·R.** GUIDELINE lists T·C·R as a checklist, not as things to build in Prompt 0. `/tcr-apply` layers them after baseline runs.
- **Match the PRD's language.** UX strings follow the PRD. Code stays English.
