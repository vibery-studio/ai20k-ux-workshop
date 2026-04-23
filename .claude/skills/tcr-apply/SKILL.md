---
name: tcr-apply
description: "Apply T-C-R pattern to an existing AI app UI. Detects ui pattern from code, generates 3 follow-up prompts (Transparency, Control, Recovery) tailored to what's already built. Use when student says 'thêm T-C-R', 'apply tcr', 'tcr apply', 'làm UX tốt hơn', 'retrofit ux pattern', 'upgrade chat to have sources panel', 'add transparency', 'add confidence score', 'show AI reasoning', 'add undo/retry', or anytime they want to layer T-C-R on a baseline app. Also trigger after a working MVP is demoed and student asks 'tiếp theo làm gì để UX tốt hơn'."
---

# TCR Apply — Retrofit T-C-R onto existing UI

Student already has a working baseline (chat UI, queue, form, dashboard — anything). This skill reads the code, guesses which of the 7 UI patterns it matches, and hands back 3 copy-paste prompts — **Prompt T** (Transparency), **Prompt C** (Control), **Prompt R** (Recovery) — tailored to the code on disk.

The goal is not to rewrite the app. The goal is to layer T-C-R **additively** so students feel the pattern click.

## What this skill does

1. Reads the repo — finds the key UI file(s) and guesses the ui pattern
2. Generates 3 short, additive prompts (T, C, R) that the student pastes into Claude Code one at a time
3. Explains *why* each prompt was chosen for this ui pattern — so students build intuition

## When to use it

Student has a demo that runs. They say "bây giờ em muốn thêm T-C-R" / "UX còn thô, làm sao làm tốt hơn" / "retrofit theo pattern workshop". Run `/tcr-apply` from the repo root.

## T-C-R definitions (keep these exact — students memorize them)

- **T = Transparency.** Show the user what the AI is doing. Status lines ("Đang suy nghĩ...", "Đang tra cứu 3 nguồn..."), sources panel, confidence score with traffic-light colors (green >0.8, yellow 0.5–0.8, red <0.5), visible SQL/reasoning/plan, token usage, which model.
- **C = Control.** User can stop, edit, override *before* the AI acts irreversibly. Abort button, edit-before-execute, pin/clear, bulk shortcuts for queues, keyboard shortcuts, "dry run" preview.
- **R = Recovery.** Pre-flight validation + post-hoc retry. Check input before the LLM call, retry button on error, undo last action, "flag as bad" button (becomes training signal), regenerate, preview + cancel before send.

If a prompt you generate doesn't obviously map to one of T / C / R, rewrite it until it does. The three letters are the load-bearing frame.

## Step 1: Detect the ui pattern

Read the repo. Look for the main UI file — usually in `src/`, `app/`, `streamlit_app.py`, `pages/`, or `components/`. Then match against this table. First strong signal wins; if ambiguous, pick the closest and note the alternative in the output.

| UI pattern | Signals in code | Typical files |
|---|---|---|
| 1. Chat + context panel | `message`, `chat`, `thread`, `useChat`, `role: "user"`, `role: "assistant"`, `st.chat_message` | `chat.tsx`, `Chat.jsx`, `streamlit_app.py` with `st.chat_input` |
| 2. Upload → dashboard | `upload`, `fileInput`, `FormData`, `multer`, `st.file_uploader`, PDF/CSV parsing | `upload.py`, `dashboard.tsx`, ingestion code |
| 3. Query → structured result | `query`, `sql`, `runQuery`, chart/table render, `st.dataframe`, `recharts` | `query.tsx`, `sql_agent.py` |
| 4. Wizard + inline audit | Multi-step form, step indicator, `currentStep`, `wizard`, `stepper` | `Wizard.tsx`, `form-steps/` |
| 5. Draft → approve → send | `send`, `approve`, `confirm` + destination (email/SMS/API/webhook), `sendEmail`, `POST /send` | `compose.tsx`, `outbox.py` |
| 6. Queue + approval | Array of items + approve/reject buttons, bulk selection, `pending`, `review_queue` | `queue.tsx`, `review-list.tsx` |
| 7. Real-time streaming | `stream`, `eventsource`, `SSE`, `audio`, `transcription`, `on_chunk`, `ReadableStream` | `stream.ts`, `live.tsx` |

Fallback: if nothing matches, print the 7 names and ask: "Mình không tự detect được — cái nào giống app của em nhất?"

### Pattern transfers wider (important insight from workshop)

Chat + context panel is secretly **"Conversational UI + Evidence Panel."** Rename the panel payload and it covers 5 ui patterns:

- panel = **sources** → RAG chatbot
- panel = **progress** → long-running agent
- panel = **reasoning** → research / planning agent
- panel = **chart** → data Q&A
- panel = **queue** → inbox / approval

When the detected ui pattern is Chat + panel, always add this note to the output:

> Your baseline is also adaptable to: sources-panel (RAG), progress-panel (agent), reasoning-panel (research), chart-panel (data Q&A), queue-panel (inbox). Same shell, swap the panel payload.

This saves students from thinking each ui pattern needs a new app.

## Step 2: Generate the 3 prompts

The ui pattern determines which prompts to emit. Keep each prompt **≤80 words** and **additive** (don't touch file structure).

**Language rule for user-facing strings in the generated prompts:** detect the existing app's language by reading its source (button labels, placeholder text, copy in JSX/templates) and emit prompts that match that language. If the app is in English, use English strings. If Vietnamese, use Vietnamese. If unsure, read `GUIDELINE.md` if present (written by `/ui-pattern`) — it specifies the target language. The example prompts below show both English and Vietnamese phrasings where helpful; pick one to match the app.

### UI pattern 1 — Chat + context panel

> **Before generating prompts:** Read `GUIDELINE.md` (written by `/ui-pattern`) if it exists. Pick domain-specific copy, thresholds, endpoint shapes, and trust-signal type (sources / topics / confidence / freshness) from there. If no GUIDELINE, ask the user one question to pick the signal type before writing Prompt T.
>
> **On trust signals — honesty rule:** If the app has RAG / real corpus → show real source citations. If the app has NO retrieval → do NOT fake citations. Use topic classification, self-reported confidence, freshness, or model name instead — and label them honestly (e.g. "AI self-assessment"). Never ship fake sources.

**Prompt T (Transparency):**
> Add Transparency features. Build a two-column layout: chat left (~60%), evidence panel right (~40%). For each AI message, the panel shows 1–2 honest trust signals — pick what fits this app (real sources if RAG, topic tags if classification, self-reported confidence, freshness, model name). Traffic-light color coding for confidence (green high / yellow medium / red low) with thresholds appropriate to this domain. Label each signal honestly (e.g. "N sources", "AI self-assessment"). If switching to JSON output from the LLM, update the LLM service to request structured output with the shape this app needs ({answer, <trust-signal-fields>}). Update any mock data to match. Keep the fake-fallback path working. Additive only — no refactor of existing chat.

*Why:* Chat hides AI's work. Visible trust signals make reasoning auditable. The honesty rule is load-bearing: signals must match what the app can truthfully show — faking citations breaks trust more than hiding them.

**Prompt C (Control):**
> Add Control features. (1) Stop button visible during loading — use AbortController to cancel in-flight fetch. On abort, render a neutral placeholder in place of the AI response. (2) Below each AI message, a flag/report affordance (small link or icon) that opens an inline form for the user to say what was wrong. Submit → persist to whatever storage this app uses (new endpoint if needed, file append if mock-only). Show a small "reported" badge after submit. (3) Edit-last-user-message: hover the last user turn → edit icon → click to edit and resubmit without retyping. Additive only.

*Why:* Users need (a) an escape hatch mid-stream, (b) a one-click way to flag bad answers (lower friction than a full comment modal), and (c) refinement without retyping. Flagging generates a data signal for whoever maintains the app.

**Prompt R (Recovery):**
> Add Recovery features. (1) Wrap the LLM service call in try/catch. On error: render an error bubble with the error message + a retry button. Retry resubmits the last user message — store it in state BEFORE the failing request so it's available. (2) Pre-flight: if user input is empty or too short for this domain, show an inline warning under the input nudging better input. DO NOT block submit — warn only. (3) No automatic retry — user must click retry. Do not modify the success path.

*Why:* Errors break trust. Manual retry (not auto) keeps the user in control. Pre-flight warning (not block) respects user agency while nudging better input. "Warn, don't block" is the key rule for non-critical validation.

> In each pattern below, quoted strings like `"Cancel"` or `"View query"` are example labels. Replace with the localized equivalent in the app's existing language before pasting the prompt.

### UI pattern 2 — Upload → dashboard

**Prompt T:**
> After upload, show a progress panel with stepped status (e.g. "Parsing", "Extracting", "Analyzing", "Done") — check each step as it completes. On the dashboard, for each AI-generated metric/insight, add a small "source" affordance — hover/click reveals which rows of the file it pulled from. Don't refactor the parser.

*Why:* Upload flows feel like a black box. A visible pipeline + per-insight source link turns the dashboard from "trust me" into "I see where it came from".

**Prompt C:**
> During processing, show a "Cancel" button — aborts the fetch + clears state. Before running analysis, if the file exceeds a threshold (e.g. >5MB or >500 rows), show a preview modal with row count, estimated tokens, estimated cost, and Confirm / Cancel. Additive.

*Why:* Long-running + expensive = user needs kill switch and cost preview. Preview-before-execute prevents surprise bills.

**Prompt R:**
> Validate the file before sending to LLM: check extension, size cap, non-empty. On fail, show inline error with specific reason. After parse, if zero rows or parse error, show "Try a different file" + "Report this format". Add undo: keep the previously uploaded file so the user can revert.

*Why:* Garbage-in is the #1 upload-app failure. Pre-flight validation + undo lets users recover without re-uploading.

### UI pattern 3 — Query → structured result

**Prompt T:**
> When the user asks, show the generated SQL (or query plan) in a collapsible panel labeled "View query". On the result, add a confidence badge (green/yellow/red) with tooltip explanation. Add a meta line: rows returned · ms · model. If a chart renders, add a "View raw data" button → table view.

*Why:* Query apps fail silently when SQL is wrong. Showing the query lets power users catch hallucinations; confidence + row count lets everyone else sanity-check.

**Prompt C:**
> Add an "Edit query" button so the user can modify the generated SQL and re-run. Before running, if the query contains `DELETE/UPDATE/DROP`, show a confirm modal. Keyboard: Enter = run, Esc = clear. Additive.

*Why:* Generated SQL needs an edit loop — 80% right is common, and auto-run is dangerous for destructive queries.

**Prompt R:**
> If the query fails (syntax, timeout, empty result), show an error card with: error text, "Retry" button, "Reformulate" button (re-prompt LLM with the error as context). Keep query history — add a "back to previous" button.

*Why:* Query iteration is the core loop. Giving the LLM its own error message as recovery context is a pattern that generalizes.

### UI pattern 4 — Wizard + inline audit

**Prompt T:**
> Next to each step, show an "AI checking" indicator. When the user fills a field, show inline audit: ✓ valid / ⚠ review / ✗ problem — with a one-line explanation. At the end of the wizard, show a summary card with all fields + AI assessment per section.

*Why:* Wizards feel long; inline audit gives instant feedback so users don't submit then find out it's wrong.

**Prompt C:**
> Allow back/forward between steps without resetting data. Add a "Save draft" button — persist to localStorage, restore on reload. Allow overriding AI warning with a required acknowledgement ("I understand, continue").

*Why:* Multi-step forms lose data constantly. Draft save + override ack respects user autonomy (AI gives advice, human decides).

**Prompt R:**
> Validate each step before next. If AI audit fails, don't block — warn only. Before final submit, show full preview + "Edit" jump-back per section. On submit failure, keep all data, don't reset the wizard.

*Why:* Losing N steps of input to one network error breaks trust forever.

### UI pattern 5 — Draft → approve → send

**Prompt T:**
> In the draft view, show AI confidence per section. Show context references if any ("Referenced N prior items"). Before send, show a meta panel: recipient, subject, attachment count, estimated delivery. Log: "Generated by model X, edited Y times".

*Why:* Send actions are irreversible in users' minds (even if technically undoable). Transparency before send = confidence before click.

**Prompt C:**
> Force a preview step before send — no "generate & send" in one click. Allow editing any field in preview. Add "Save as draft instead of send". Keyboard: Cmd+Enter = send, Esc = back to edit.

*Why:* The #1 AI send-app failure is auto-send with wrong recipient/content. Forced preview is non-negotiable.

**Prompt R:**
> After send, show an "Sent · Undo" toast with a 10s window to unsend (delete + recover draft). Log all sends to a "Sent" table with retry button. On send failure, keep the draft intact and show the error.

*Why:* Gmail-style undo-send trains the user to trust the system. No undo = user second-guesses every click.

### UI pattern 6 — Queue + approval

**Prompt T:**
> Each queue item shows: confidence dot (green/yellow/red), one-line AI reasoning (why approve/reject), source reference if any. At the top of the queue, show counts: N pending · M high-confidence auto-approvable · K low-confidence.

*Why:* Queues scale when reviewers can triage by confidence. High-conf batch through fast, low-conf get human attention.

**Prompt C:**
> Add bulk select (checkbox + shift-click range) and an "Approve all selected" button. Keyboard: J/K = next/prev, A = approve, R = reject, U = undo last action. Filter: "Show confidence <0.7 only" so reviewers focus on hard cases.

*Why:* A queue without keyboard + bulk is unusable at scale. This is where Control compounds — 10x faster review.

**Prompt R:**
> Undo last N actions (stack of 10). If approved in error, show an "Undo" button to revert. Add "Flag for review" as an alternative to reject — sends item + reason to a review log. If AI confidence changes after data update, re-surface items.

*Why:* Reviewer fatigue = misclicks. Undo + flag-instead-of-reject gives a safe middle path.

### UI pattern 7 — Real-time streaming

**Prompt T:**
> Show live status ("Listening…", "Transcribing… (N sec)", "Analyzing…"). Stream partial output into the UI as it arrives (token-by-token). Show running confidence if available. Meta bar: model · latency ms · chunk count.

*Why:* Silence in a streaming app = broken app. Token-by-token + status keeps the user oriented.

**Prompt C:**
> Add a "Stop" button (stop listening / stop stream) — aborts fetch/WebSocket. Allow pause + resume for transcription. Keyboard: Space = pause/resume, Esc = stop.

*Why:* Real-time flows need instant stop. Users panic when they can't kill an open mic.

**Prompt R:**
> If the stream disconnects, auto-reconnect up to 3 times, show "Disconnected · Reconnecting (N/3)". Preserve the transcript buffer — on reconnect, append, don't reset. Add a "Restart" button that clears + restarts cleanly.

*Why:* Network hiccups are constant. Silent reconnect + preserved buffer = the app feels production-grade.

## Step 3: Output format

Print this, nothing else:

```
━━━ TCR Apply — UI pattern detected: {ui pattern name} ━━━

Evidence: {1-2 lines of what files/patterns led to this guess}

{If ui pattern 1, include the "Pattern transfers wider" note here}

━━━ Prompt T (Transparency) ━━━
{prompt text in a code block the student copies}

Why: {1-2 sentences}

━━━ Prompt C (Control) ━━━
{prompt text in a code block}

Why: {1-2 sentences}

━━━ Prompt R (Recovery) ━━━
{prompt text in a code block}

Why: {1-2 sentences}

━━━ How to use ━━━
Paste 1 prompt at a time into Claude Code. After each one: review the diff, test in browser, commit. Then paste the next. Don't paste all 3 at once — T-C-R compound when added in sequence.
```

## Anti-patterns — do NOT do these

- **Don't rewrite from scratch.** Every prompt must be additive. If your prompt says "refactor" or "restructure", delete it.
- **Don't change file structure.** Student's folder layout is theirs. Add new components, don't move old ones.
- **Don't bundle T+C+R into one prompt.** The whole point is sequential paste-review-commit. A mega-prompt loses the pedagogical rhythm.
- **Match the app's existing UI language.** If the app's buttons and copy are English, user-facing strings in your prompts stay English. If Vietnamese, stay Vietnamese. Don't force a language swap. Code identifiers always stay English.
- **Don't prescribe the exact component library.** If student uses shadcn, let them; if raw Tailwind, let them. Prompts say *what*, not *which npm package*.
- **Don't skip the "Why".** A prompt without reasoning is a recipe. The workshop teaches the *pattern* — reasoning is the whole point.
- **Don't guess the ui pattern silently.** If signals are weak, say so and ask. Wrong ui pattern = wrong prompts = wasted student time.
- **Don't add Control/Recovery features that require backend changes the student hasn't built.** If there's no `/feedback` endpoint, note "tạo mới nếu chưa có, in-memory array OK" — keep it frontend-friendly.

## Principles

- **Additive, not transformative.** Student leaves with the same app + 3 focused upgrades, not a new app.
- **One ui pattern, 3 prompts.** Don't generate 7 prompts hedging across ui patterns. Pick one, commit.
- **Intuition over recipe.** Every "Why" builds the mental model of T-C-R so the student applies it to the next app without this skill.
- **Copy-paste ready.** If the student has to edit your prompt before pasting, you failed.
- **Match the app's language.** Read the app's existing UI strings and mirror that language in your generated prompts. Don't impose a language.
