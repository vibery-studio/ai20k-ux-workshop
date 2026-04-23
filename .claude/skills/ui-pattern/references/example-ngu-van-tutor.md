---
type: skill-reference
skill: ui-pattern
purpose: Illustrative walk-through of the full skill flow on one idea. Shows the shape of clarifying questions, the PRD, and the GUIDELINE. This is ONE example from an education domain — the skill should not copy strings from here, only the structure. When your PRD is different, your output will be different.
---

# Worked example — Ngữ văn 10 tutor (illustrative only)

This shows the skill's flow end-to-end on a Vietnamese-literature tutoring app. Use it to understand the PRD and GUIDELINE shape. **Do not copy the Vietnamese strings, topic list, or thresholds into other apps** — they're specific to this domain.

## User pastes

> "App giúp học sinh lớp 10 hỏi bài Ngữ văn — phân tích tác phẩm, giải thích nhân vật, luyện viết. Giáo viên xem được học sinh đang vướng chủ đề nào. Bối cảnh: đây là UX lab — không build real backend, mock JSON API là đủ. Stack định dùng: React 18 + Vite + plain JSX + inline styles + Express mock + Gemini 2.5 Flash qua src/llmService.js. Không TypeScript, không Tailwind, không SQLite."

## Skill's clarifying questions (via AskUserQuestion)

1. "Output của AI là text + topic tags (danh sách cố định, không phải citations từ corpus) + mức độ tin cậy AI tự đánh giá — đúng tinh thần không?" → user: đúng.
2. "2 role: student + teacher. Demo 1 = student chat, Demo 2 = teacher dashboard — đúng chưa?" → user: đúng.
3. "UI pattern mình chọn là **1. Chat + context panel** (Q+A text → text + topics + confidence). OK?" → user: OK.

## Skill writes PRD.md

```markdown
# PRD — Ngữ văn 10 Tutor

## Problem + context
Học sinh lớp 10 thường bí khi phân tích tác phẩm, giải thích nhân vật, luyện viết Ngữ văn. Giáo viên không scale được việc 1-1 giải đáp cho cả lớp. App này là UX lab build — kiểm chứng pattern chat+panel cho tutor AI, không production.

## Users
- **Primary:** Học sinh lớp 10 (hỏi bài Ngữ văn, đọc câu trả lời, đánh flag nếu thấy sai)
- **Secondary:** Giáo viên Ngữ văn (xem câu hỏi + câu được flag, lọc theo chủ đề)

## User stories
1. **(Demo 1)** Học sinh hỏi câu Ngữ văn, nhận câu trả lời + chủ đề liên quan + mức độ tin cậy AI tự đánh giá.
2. **(Demo 1)** Học sinh bấm "câu này chưa đúng" để báo flag cho giáo viên review sau.
3. **(Demo 2)** Giáo viên xem danh sách câu hỏi học sinh, lọc theo chủ đề và flag.
4. **(Demo 2)** Giáo viên click 1 câu để xem chi tiết câu hỏi + câu trả lời AI + lý do flag.

## Data model
- **questions** — id, student_id, text, created_at
- **answers** — id, question_id, text, topics (array), confidence (0–100), created_at
- **flags** — id, answer_id, reason, created_at

## Tech stack
- **Frontend:** React 18 + Vite + plain JSX + inline styles
- **Backend:** Express mock serving JSON
- **LLM:** Gemini 2.5 Flash qua `src/llmService.js`
- **Storage:** In-memory JSON, không DB
- **Not using:** TypeScript, Tailwind, SQLite

## Constraints
- UX lab build — không real backend, mock JSON là đủ
- Không auth, không session persistence
- Demo trên 1 laptop, không cần deploy
- User-facing strings Vietnamese có dấu
- Topic tagging dùng fixed list (xem dưới), không free-text

**Topic list (fixed):**
`["Thơ cách mạng", "Văn học dân gian", "Nghị luận xã hội", "Nhân vật và tác phẩm", "Thể loại và phong cách", "Ngữ pháp và viết"]`

## API surface
- **chat send** — student gửi câu hỏi → trả về answer text + topics (subset of fixed list) + confidence (0–100)
- **list questions** — teacher lấy danh sách questions, optional filter theo topic + flag status
- **get question detail** — teacher lấy 1 question + answer + flag (nếu có)
- **flag answer** — student báo 1 answer sai, kèm lý do

## Success criteria
- Học sinh hỏi 3 câu liên tiếp, app không mất history trong session
- Teacher load dashboard thấy đúng danh sách câu được flag, lọc được theo 6 topic
- Đổi provider LLM = edit 1 file (`src/llmService.js`), UI không đụng

## Out of scope
- Auth / login
- Persistent DB — chỉ mock JSON trong file
- Mobile layout
- Dark mode, i18n, polish CSS
- Citations từ corpus thật (topic tags = labels, không phải trích dẫn)

## Open questions
- (none)
```

## Skill writes GUIDELINE.md

```markdown
# GUIDELINE — Ngữ văn 10 Tutor

> Tech stack: see `PRD §Tech stack`.

## UI pattern
**1. Chat + context panel**

Why this pattern: input là câu hỏi text, output là text + metadata (topics, confidence). Q+A dạng text → pattern 1 mặc định.

**Conversational UI + Evidence Panel:** panel = **topic tags (from fixed list of 6) + AI self-reported confidence (0–100)**. NOT citations — app không grounding trên corpus thật, nên gọi là "topics" chứ không phải "sources". Honest labeling matters.

## User flow (Demo 1 — student)
1. Học sinh gõ câu hỏi Ngữ văn vào input ở nửa trái.
2. App gửi câu hỏi tới `src/llmService.js` → Gemini 2.5 Flash trả về `{text, topics[], confidence}`. Mock JSON lưu question + answer.
3. Học sinh đọc câu trả lời bên trái, thấy topic tags + confidence bên phải. Có thể bấm "câu này chưa đúng" để flag.

## User flow (Demo 2 — teacher)
1. Giáo viên mở dashboard, thấy danh sách câu hỏi học sinh (có filter theo topic + flag).
2. Giáo viên chọn filter → app lọc từ mock JSON → hiển thị list.
3. Giáo viên click 1 câu → panel detail hiện question + answer + lý do flag.

## T·C·R checklist for this pattern

### T — Transparency (what AI work is visible)
- [ ] Topic panel hiển thị 2–4 topic tags từ fixed list
- [ ] Streaming status line (ví dụ: "đang trả lời…")
- [ ] Confidence dot (green ≥70 / yellow 40–69 / red <40) cạnh mỗi câu trả lời

### C — Control (what user can stop / edit / override)
- [ ] Stop button khi AI đang stream
- [ ] Edit-last-user-message (chỉnh lại câu hỏi cuối, gửi lại)
- [ ] Cmd+K clear chat history trong session

### R — Recovery (validation + retry + undo)
- [ ] Error bubble với retry + report khi LLM fail
- [ ] Thumbs-down / "câu này chưa đúng" trên mỗi câu trả lời (chính là flag trong user story 2)

**Fixed topic list:**
`["Thơ cách mạng", "Văn học dân gian", "Nghị luận xã hội", "Nhân vật và tác phẩm", "Thể loại và phong cách", "Ngữ pháp và viết"]`

LLM được prompt trả về `topics: string[]` mà mỗi item phải nằm trong list này. Validate ở service layer, reject nếu AI trả topic lạ.

## Hinge rule
All LLM calls go through `src/llmService.js`. UI không bao giờ import Gemini SDK trực tiếp. Đổi provider (Gemini → Claude → GPT) = edit một file.

## What NOT to build yet
- Auth, login, student/teacher tài khoản riêng
- Persistent DB — chỉ mock JSON trong memory
- Mobile layout, responsive polish
- Dark mode, i18n, loading skeletons nhiều state
- Citations thật từ corpus — chỉ topic labels
- T·C·R features đầy đủ (chạy `/tcr-apply` sau khi baseline xong)
```

## What this example demonstrates (not the domain specifics)

- **3 clarifying questions max.** Each one removes real ambiguity.
- **PRD records what user briefed** — stack, language, constraints go in verbatim.
- **GUIDELINE focuses on UX** — pattern pick + flow + T·C·R checklist. Doesn't restate stack.
- **Honest trust signals** — this app has no RAG, so panel = topics + self-reported confidence, NOT citations. The honesty rule from the pattern reference applies.
- **Skill stops after PRD + GUIDELINE.** No build prompt, no "paste this into Claude Code". The next-step (baseline build) is handled by Claude Code reading the two files.
