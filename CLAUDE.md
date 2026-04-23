# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope
UX lab build — Ngữ văn 10 AI tutor. Chat + evidence panel pattern. Not production; no auth, no DB, no deploy. See `PRD.md` + `GUIDELINE.md` for user stories, visual rules, T·C·R checklist.

## Commands
Server (port 3001):
- `cd server && npm install && cp .env.example .env` (paste `GEMINI_API_KEY`)
- `npm run dev` — `node --watch src/index.js`

Client (port 5173, proxies `/api` → server):
- `cd client && npm install && npm run dev`
- Both must run in separate terminals.

No test / lint / typecheck scripts configured. Plain JSX, no TS.

## Hinge rule (hard)
**All LLM calls go through `server/src/llmService.js`.** UI must NEVER import Gemini SDK directly. Swapping provider (Gemini → Claude/GPT) = edit this one file. Do not bypass.

## Architecture

Two-process split: React SPA (client) + Express JSON API (server). Client never holds the API key; all LLM goes server-side.

### Server (`server/src/`)
- `index.js` — Express bootstrap, mounts `/api/chat` and `/api/flag`, global JSON error handler.
- `llmService.js` — the hinge. Calls Gemini 2.5 Flash Lite with `responseSchema` (structured JSON), validates shape via `validateResponse()`, retries once on any failure. Active model: `gemini-2.5-flash-lite`. If validation fails twice → 500.
- `prompt.js` — `buildSystemPrompt()` + `buildUserPrompt({question, history})`. History is last 6 messages prepended as plain text transcript (no Gemini multi-turn API).
- `store.js` — in-memory arrays `questions`/`answers`/`flags`, nanoid IDs, ISO timestamps. `getHistory(session_id)` rebuilds `[{role, text, meta}]` transcript. State dies on restart.
- `topics.js` — `FIXED_TOPICS` (6 items). Source of truth; LLM schema enums against it, validator filters unknowns.
- `routes/chat.js` — `POST /api/chat/send`, `GET /api/chat/history`. Attaches `meta = {latency_ms, model, word_count}` to each answer.
- `routes/flag.js` — `POST /api/flag`, `DELETE /api/flag/:flag_id` (undo).

### Client (`client/src/`)
- `App.jsx` — top-level shell. Owns flag modal, toast (with undo for flag-ok), global keybindings (Cmd/Ctrl+K = clear, Esc = stop while pending).
- `hooks/useChat.js` — single source of truth for chat state. Owns `sessionRef` (UUID per session), `AbortController` for stop, `messages[]`, `pending`, `error`, `lastQuestion`. Exposes `ask`, `stop`, `retry`, `retryShort` (truncate to 120ch), `editLastAndResend` (splice back to last user msg + resend), `clear` (new session id), `latestAnswer` (memoized).
- `api/chat.js` — thin `fetch` wrapper, throws `Error(data.error || "Lỗi <status>")`.
- `components/` — `ChatView` (left ~60%), `ContextPanel` (right ~40%, reads `latestAnswer.meta`), `MessageBubble`, `ChatInput`, `FlagModal`, `FollowUpChips`, `TypingStatus`, `CitationCard`, `TopicTag`, `InputWarnings`. Plain JSX + inline styles (no CSS modules, no Tailwind).
- `styles/theme.js` — palette + spacing tokens, `confidenceColor(score)` (green ≥70 / yellow ≥40 / red), `confidenceLabel(score)`. Import this, don't hardcode colors.
- `utils/validate.js` — duplicates `FIXED_TOPICS` client-side for defensive filtering.

### Data flow (one turn)
1. `useChat.ask(text)` optimistically appends user message, calls `POST /api/chat/send {question, session_id}`.
2. Server: `addQuestion` → `getHistory(session_id).slice(0,-1)` (exclude the just-added question) → `generateAnswer({question, history})` → `addAnswer` with meta → respond `{question_id, answer}`.
3. Client appends assistant message with full `meta` (topics, confidence, citations, reasoning, follow_up_questions, latency_ms, model, word_count). `ContextPanel` re-renders from `latestAnswer`.
4. Flag flow: `POST /api/flag {answer_id, reason}` → toast shows "Đã báo…" with Undo button → `DELETE /api/flag/:id` within toast window.

### LLM response contract
`{text, reasoning, topics[], confidence, citations[{source_name, excerpt, context}], follow_up_questions[]}` — all fields required. `topics` enum-constrained to `FIXED_TOPICS`; validator dedupes + caps at 4. `citations` capped at 3, rejected if empty. `follow_up_questions` filtered to non-empty strings ≤140ch, capped at 3. `confidence` clamped 0–100.

## Conventions
- User-facing strings are Vietnamese with diacritics. Keep them that way.
- Topic list is fixed (6 items). Never let a topic string leak in unchecked — always filter through `FIXED_TOPICS`.
- Citations are AI-generated "tham khảo" — UI must label them so (not authoritative SGK quotes).
- Inline styles only on the client. No CSS files, no utility frameworks.
- Session state is in-memory per server process. Restart = reset. Don't add persistence unless PRD scope changes.
