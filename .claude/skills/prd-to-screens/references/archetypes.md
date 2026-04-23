---
type: skill-reference
skill: prd-to-screens
purpose: The 7 AI-app UI patterns — per-pattern Stage 0 / +T / +T+C / +T+C+R surfaces + traps. The skill reads this to fill GUIDELINE.md. Examples are illustrative — swap to the user's domain.
---

# The 7 UI patterns — screen-surface reference card

Teaching order: simplest → most complex. Every AI-app screen maps to exactly one.

> When filling GUIDELINE.md, **copy the pattern structure** (Stage 0 shape, what +T/+C/+R add, the traps) but **swap the examples** to match the user's PRD domain. Don't paste illustrative strings verbatim — they're placeholders.

## 1 · Chat + Context Panel

**Shape:** single chat bubble stream + evidence panel (sources, reasoning, topics, or confidence).
**Core UX problem:** hallucination + no visible grounding. User can't tell what's backed by data vs. guessed.
**Production refs:** Perplexity, ChatGPT with Search, Claude.ai citations.

- **Stage 0:** single-column chat. User asks. Answer appears confidently. No evidence panel. Out-of-scope questions get answered anyway.
- **+T:** layout splits ~60/40 — chat left, evidence panel right. Each AI message shows 1–2 honest trust signals: sources (if RAG), topic tags (if classification), confidence score, or model/freshness. Traffic-light colors for confidence (green high / yellow medium / red low). Label what the signal actually is — e.g. `<self-reported-confidence>` if the AI rated itself, `<N sources>` if retrieved from a corpus. Translate the label to the app's UI language when emitting GUIDELINE.
- **+T+C:** trust signals interactive where it makes sense (click source → scroll to passage; click topic → filter). Flag/report button under each assistant message opens inline correction form. Stop button during loading aborts in-flight request. Edit-last-user-message to refine without retyping.
- **+T+C+R:** out-of-scope questions blocked or warned (don't wipe conversation). try/catch around LLM call → error bubble with retry. Short/empty input validated inline (warn, don't block). Network fail preserves conversation.

**Traps:**
1. Agent writes `fetch` directly instead of using the existing LLM wrapper (breaks hinge rule).
2. Confidence shown as single number for the whole answer instead of per-claim.
3. Out-of-scope block is a modal that wipes the conversation.
4. Retry loses pinned sources or edit history.
5. Evidence panel shows history of all answers — overwhelms. Show latest only.
6. Fake citations (app has no corpus, but UI shows "Source: …"). If no retrieval, use topics or self-reported confidence — never fake sources.

---

## 2 · Upload → Dashboard

**Shape:** file drop → wait → summary tiles/charts derived from the batch.
**Core UX problem:** black-box wait. User waits minutes with no feedback, then faces opaque summary.
**Production refs:** Julius AI, ChatGPT Advanced Data Analysis.

- **Stage 0:** drop file → spinner → 3 insight tiles with blanket "based on N rows". No progress. No row-level visibility.
- **+T:** live progress during upload ("processed N / M rows"). Each insight tile has "view source rows" + source-column badge (e.g. "from column X"). If partial-fail, show what succeeded vs. failed.
- **+T+C:** filter chips over the batch (by category, date range, segment). Click chip → insights re-render for subset. "Exclude N outliers" button (hides, doesn't delete).
- **+T+C+R:** partial-success banner on broken files ("parsed N / M rows · K failed → retry K"). Resumable upload from last chunk on network fail. Pre-flight file validation (type/size/non-empty).

**Traps:**
1. Progress bar is fake (`setInterval`) not tied to real parse count.
2. Insights cite total rows when some failed to parse.
3. Upload blocks all interaction — user can't browse other tiles while a file processes.
4. Outlier filter permanently deletes rows instead of hiding them.
5. Resume-from-chunk loses the user's applied filters after recovery.

---

## 3 · Query → Structured Result

**Shape:** text input → chart/table out (not prose).
**Core UX problem:** generated query (SQL, DSL, API params) can be subtly wrong. User without query-language knowledge can't tell. Dangerous queries (DROP/DELETE) can execute.
**Production refs:** Hex, Mode, ThoughtSpot.

- **Stage 0:** textarea + Run button + sample chips. User asks. Chart + table appear. No query visible. No confidence. No raw data access.
- **+T:** collapsible "view query" above result → query shown in monospace, auto-opened on first result. Confidence/clarity badge ("clear match" / "ambiguous question"). "View raw data" reveals table.
- **+T+C:** query block becomes editable textarea + "Re-run with edited query" button. Dangerous edits (DROP/DELETE/TRUNCATE) trigger confirm modal. Query history / "back to previous query" button.
- **+T+C+R:** destructive queries blocked at input before LLM call. Too-short inputs blocked. try/catch → error card with retry. Timeout (e.g. 15s via `Promise.race`). "Re-prompt with error as context" button for LLM to self-correct.

**Traps:**
1. Agent removes the sample chips in Stage C because "they conflict with editable query".
2. Query block is collapsible but auto-collapses on re-run — user loses their edit.
3. DROP-block is regex on `DROP` — fails on `drop table`, `DROP--comment`, `/*foo*/DROP`. Use AST or lowercase + word-boundary.
4. Retry re-runs the LLM call instead of re-running cached query against data.
5. Chart redraws from scratch on every keystroke in query textarea — janky; wait for explicit re-run.

---

## 4 · Wizard + Inline Audit

**Shape:** multi-step form with AI-generated fields + live rule/standard check.
**Core UX problem:** user can't tell if AI-drafted step N passes an external rule without consulting a separate document.
**Production refs:** GitHub Copilot inline, Grammarly rule highlights.

- **Stage 0:** N-field wizard, AI fills all fields, "Submit" button clickable. No rule references. No per-field validation indicators. User doesn't know which field passes the rules.
- **+T:** each field has inline colored indicator (green/yellow/red) + small rule chip (name of the rule/standard it's checked against). Click chip → sidecar shows verbatim standard text. Summary header: "N pass · M warning · K fail".
- **+T+C:** hover field → "Regenerate this field only" button — other fields untouched. "Mark rule not applicable" with required justification textbox. Back/forward between steps without data loss. Save-draft.
- **+T+C+R:** Submit disabled while ≥1 red field exists — tooltip lists which. Autosave banner ("draft saved N seconds ago"). Regen failure isolates to that field (doesn't wipe others). Placeholder text like "Lorem ipsum" blocked at input.

**Traps:**
1. Regenerate replaces ALL fields, wiping the user's manual edits on the ones they didn't ask to regenerate.
2. Rule chip sidecar is a modal — blocks the form and kills flow.
3. Autosave stores draft to localStorage only — lost if user switches device.
4. "Not applicable" checkbox doesn't require reason → users disable every rule to pass.
5. Green/yellow/red is the only signal — fails for colorblind users. Pair color with icon or text label.

---

## 5 · Draft → Approve → Send

**Shape:** AI draft + per-channel previews + recipient segment + hard-confirm Send.
**Core UX problem:** irreversible. One wrong mass message / published post / sent email can't be taken back.
**Production refs:** Mailchimp test-send, Twilio message preview.

- **Stage 0:** AI draft in single blob. Single Send button. No per-channel preview. No diff from template. User sees only "Send to N recipients".
- **+T:** draft shown as diff vs. last-approved template (+ green, - red). Per-channel tabs (SMS / email / push / etc.) with char counts. Recipient segment expandable with opt-out count. Generation meta (model, time).
- **+T+C:** each channel independently editable. Regenerate-per-channel preserves the others. Template-locked fields (brand name, pricing) show lock icon — editing requires confirmation + reason. "Save as draft" instead of send.
- **+T+C+R:** Send behind hard confirm (type a specific word in a box, like `SEND`). Dry-run to 1 test recipient first, shows delivered receipt. Undo window (10–30s) after send. Mid-batch failure: "sent N · failed M → retry M only". Placeholder text blocked pre-LLM-call.

**Traps:**
1. Dry-run accidentally goes to the full list — always verify the path in QA.
2. Undo window tries to recall already-delivered messages (impossible) instead of cancelling the queue.
3. Confirm box accepts lowercase `send` — too easy to trigger accidentally.
4. Regenerate-per-channel re-runs the full LLM call for untouched channels too.
5. Failure retry re-sends to ALL recipients instead of only the ones that failed.

---

## 6 · Queue + Approval Dashboard

**Shape:** list of AI-classified items + per-item approve/reject + bulk ops.
**Core UX problem:** reviewer throughput. N flagged items → burnout if one-at-a-time.
**Production refs:** Reddit AutoModerator, content moderation consoles.

- **Stage 0:** N items sorted by severity/time. Each has Approve/Reject. No AI reason shown. No confidence. No bulk ops.
- **+T:** each item has 1–3 reason chips (what the AI flagged: rule name, keyword hit, pattern match) with confidence bar. Header counts: "N need review · M high-confidence · K borderline". Low-confidence items visually distinct (yellow border). Sort so low-confidence bubbles up within severity.
- **+T+C:** bulk-select checkboxes + shift-click range. Filter toolbar (by reason, user, confidence threshold). "Select all with same reason" → auto-select. Bulk approve/reject button. Per-item override dropdown (change category). Keyboard shortcuts (J/K nav, A/R/U action).
- **+T+C+R:** every action creates undo toast with time window. Classification-failed items show distinct marker + "manual review needed". Bulk >N items triggers preview confirm ("about to reject N — preview 3 samples"). Undo stack of 10+.

**Traps:**
1. Bulk approve processes N items in one LLM call → timeout. Batch in smaller groups.
2. Undo restores items but NOT their original position in the sorted queue.
3. Low-confidence items sort to top, but severity sort wins — reviewer never sees borderline cases.
4. Override dropdown changes category but doesn't re-run confidence calculation — new category shows old reasons.
5. Failed-classification items pile at bottom instead of top — reviewer misses them.

---

## 7 · Real-time Streaming

**Shape:** mic/camera/text-stream in → partial output streams → user can interrupt.
**Core UX problem:** sub-second latency budget. Any lag >~800ms feels broken. Silence = dead app.
**Production refs:** ChatGPT Voice, Google Gemini Live, Pipecat, LiveKit.

- **Stage 0:** "Start" button. After delay, full transcript + AI reply appear. No activity indicator. No confidence. No interrupt.
- **+T:** output streams word-by-word / token-by-token. Low-confidence words visually distinct (dashed underline, lower opacity). Activity indicator (waveform / pulsing dot). Status line ("listening…", "thinking…", "speaking…"). Latency meta.
- **+T+C:** spacebar/tap/click interrupts mid-reply — AI stops, user redoes current input. "Switch to text" fallback swaps UI without losing context. Pause/resume for transcription.
- **+T+C+R:** network-fail banner ("disconnected · reconnecting · don't speak yet"). Session context preserved across reconnect. Low-confidence words hoverable for alternatives. Permission-denied (mic/camera) falls back gracefully with clear explanation. Auto-reconnect capped (max 3 tries).

**Traps:**
1. Simulated streaming uses single `setInterval` — prod needs WebSocket or streaming HTTP. Shape must match.
2. Interrupt cuts audio but keeps the network call running → next input queues behind it.
3. "Switch to text" loses the last partial transcript instead of converting it to seed text.
4. Reconnect shows "done" as soon as TCP reconnects, but the LLM stream hasn't resumed yet — user starts talking, AI is deaf.
5. Low-confidence word alternatives on hover flicker every time new words stream in — jitter.

---

## Mapping decision table

| Story's core UX moment | UI pattern |
|---|---|
| Type question → get answer with sources/citations | 1 |
| Upload file → wait → see summary of that batch | 2 |
| Type question → get chart/table (not prose) | 3 |
| Multi-step form → each field AI-checked against rule | 4 |
| Review AI draft → irreversible send/publish | 5 |
| Process list of AI-classified items (approve/reject) | 6 |
| Speak/stream → AI responds <1s, can interrupt | 7 |

**Borderline disambiguators:**
- Chat that outputs a chart, not prose → pattern 3. Output shape wins.
- Form that ends with "AI drafts + send" → pattern 5. Irreversible stake dominates.
- Live classifier while typing → pattern 4 (user authoring) vs. pattern 6 (user reviewing already-classified).
- Upload that returns a chat-style Q&A, not a dashboard → pattern 1 (with file as context), not pattern 2.

**Multi-user split:**
- If PRD has two distinct actors using two distinct screens (author vs. consumer, admin vs. end-user, teacher vs. student), emit two screen cards. Never fuse. Each actor's screen may be a different pattern.

## Meta-pattern — "Conversational UI + Evidence Panel"

Pattern 1 is secretly a meta-pattern: swap what the panel shows and it covers other use cases:
- panel = sources → RAG chatbot
- panel = progress → long-running agent
- panel = reasoning → research / planning agent
- panel = chart → data Q&A (overlaps pattern 3 — pick by output shape)
- panel = queue → inbox / triage

When in doubt between patterns 1, 3, and 6, default to 1 and choose the panel payload.
