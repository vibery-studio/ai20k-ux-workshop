---
type: build-prompts
app_slug: nguvan-10-tutor
language: vi
patterns: [1, 6]
created: 2026-04-23
---

# Ngữ văn 10 Tutor — Build Prompts

**UI patterns:** 1 — Chat + Context Panel (Screen 1, student) và 6 — Queue + Approval Dashboard (Screen 2, teacher).
**Stack:** React 18 + Vite + plain JSX (client) + Node + Express (server), Gemini 2.5 Flash Lite, in-memory store.
**Language:** tiếng Việt có dấu cho user-facing strings.
**Usage:** Mở fresh Claude Code session trong empty directory. Copy `GUIDELINE.md` vào đó. Paste Prompt 0 trước, chờ dev server chạy. Sau đó T, C, R theo thứ tự. Ship Screen 1 trước (Demo 1 theo PRD), rồi lặp lại 4 prompt với phần Screen 2 (Demo 2). Tổng ~25–35 phút mỗi screen.

---

## Screen 1 — Student chat (pattern 1)

### Prompt 0 — Setup baseline

```
Read GUIDELINE.md in this directory completely before writing any code.

Build Screen 1 (student chat) baseline exactly as specified in section 5:
single-column chat, header "Ngữ văn 10 Tutor", subtitle "Hỏi bài về tác phẩm,
nhân vật, luyện viết", scrollable thread 60vh, textarea + "Gửi" at bottom,
user bubble right bg #eff6ff, assistant bubble left bg #f9fafb. Loading state:
italic gray "đang soạn câu trả lời…". Placeholder trong textarea: "Thử hỏi:
'Phân tích nhân vật Thúy Kiều trong đoạn Trao duyên'". History preserved in
sessionRef per section 4. Implement server per sections 3–4: Express mount
/api/chat/send, llmService.js with Gemini 2.5 Flash Lite, responseSchema,
validateResponse, retry once, 15s timeout, Vietnamese fake fallback from
section 7. Client uses fetch wrapper in api/chat.js. Respect sections 8–9.
Run npm install in both server/ and client/, start both with npm run dev.
```

### Prompt T — Transparency

```
Following GUIDELINE.md section 6.T for Screen 1, switch the layout to a
2-column flex — chat 60% left, ContextPanel 40% right, container max-width
1280px. ContextPanel reads from latestAnswer.meta only (not history) and
renders three blocks: topics tag pills (import FIXED_TOPICS from
utils/validate.js), a 6px confidence bar colored green (#22c55e) if ≥70,
yellow (#eab308) if ≥40, red (#ef4444) below, with the percentage beside it,
and 1–3 citation cards (white bg, 1px solid #e5e7eb, radius 8px, padding
12px — source_name bold, excerpt 2-line clamp, context 12px gray). Panel
header has the label "tham khảo AI-generated — chưa đối chiếu SGK".
Placeholder "Hỏi câu đầu tiên để thấy nguồn tham khảo" when latestAnswer is
null. Don't touch chat bubbles or useChat logic.
```

### Prompt C — Control

```
Following GUIDELINE.md section 6.C for Screen 1, under each assistant bubble
add a small link "Câu này chưa đúng?" (12px, underlined, gray #6b7280).
Clicking opens an inline form below the bubble (NOT a modal — section 5 forbids
losing chat state) with a textarea placeholder "Vì sao bạn nghĩ câu trả lời
chưa đúng? (tùy chọn)", a primary "Gửi báo cáo" button, and a "Hủy" button.
Submit calls POST /api/flag {answer_id, reason}, then shows a toast bottom-right
"Đã báo giáo viên" with a "Hoàn tác" link that calls DELETE /api/flag/:id within
30 seconds. Add a "Dừng" button that appears only while useChat.pending is true
— clicking aborts the in-flight request via the existing AbortController.
Bind Cmd/Ctrl+K to clear session (new sessionRef). Don't touch the Transparency
panel — it stays exactly as built in Prompt T.
```

### Prompt R — Recovery

```
Following GUIDELINE.md section 6.R for Screen 1, wrap the ask call in useChat
with try/catch. On error, append an assistant message with error:true — render
those bubbles with a red border (#ef4444), a ⚠ emoji, text "Lỗi: [message]",
and two buttons: "Thử lại" (re-runs lastQuestion as-is) and "Rút ngắn rồi thử
lại" (truncates lastQuestion to 120 chars before resending). Add input
validation: if trimmed query length < 5, don't call askLLM — show an inline
orange (#f97316) warning below the textarea: "Câu hỏi quá ngắn, gõ thêm chi
tiết nhé", clearing as the user types more. Ensure llmService.js already has
the 15s timeout via Promise.race — add it if missing. When retrying, keep
latestAnswer.meta in the ContextPanel until the new response replaces it
(no optimistic clear). Don't touch the Transparency or Control UI.
```

---

## Screen 2 — Teacher dashboard (pattern 6)

### Prompt 0 — Setup baseline

```
Read GUIDELINE.md completely before writing any code. This is Screen 2
(teacher dashboard) — add it alongside Screen 1 with a hash route (#/teacher
opens teacher view, default is student chat). Do NOT regress Screen 1.

Build the baseline exactly from section 5: sticky top bar "Dashboard giáo viên
— Ngữ văn 10" with "X / Y câu hỏi" counter. Layout: 360px sidebar left + detail
pane right. Sidebar items sorted newest-first: student_id (bold, truncated),
câu hỏi (2-line clamp), first topic badge, relative timestamp ("3 phút trước").
Selected item: bg #eff6ff, border-left 3px #2563eb. Detail pane shows full
question, divider, full AI answer, topic tag list, placeholder confidence
(Prompt T adds the bar), citations section labeled "Tham khảo AI-generated".
If flag exists, show red banner "Học sinh đã báo câu này chưa đúng" + reason.
Add GET /api/chat/questions on server returning all questions + answers +
flags. Use useTeacher hook for fetch + state. No filter, no bulk, no undo.
Run both dev servers.
```

### Prompt T — Transparency

```
Following GUIDELINE.md section 6.T for Screen 2, extend the detail pane: below
the topic list, add a confidence bar (green #22c55e ≥70, yellow #eab308 ≥40,
red #ef4444 below) with percentage shown, and the AI reasoning text from
meta.reasoning (if present). In the sidebar, items with confidence <60 get a
yellow 2px border to flag "cần review kỹ". Within each time group (today /
yesterday / earlier), sort so low-confidence items bubble to the top — do NOT
let pure timestamp sort bury borderline answers. Add a summary line in the top
bar: "N câu · M đã flag · K confidence thấp", live-updated from the current
fetched list. Citation cards in the detail pane get the label "tham khảo AI".
Don't change Screen 1. Don't add filters yet.
```

### Prompt C — Control

```
Following GUIDELINE.md section 6.C for Screen 2, add a filter toolbar under
the top bar: chip bar with "[Tất cả]" + each of FIXED_TOPICS (import from
utils/validate.js — do NOT hardcode the list), a dropdown flag status
"Tất cả / Đã flag / Chưa flag", and a search input "Tìm trong câu hỏi…".
Filtering is entirely client-side over the already-fetched question list —
do NOT re-call askLLM when filters change. Counter in the top bar updates
live to the filtered count. In the detail pane, add a "Đánh dấu đã review"
button (local state only, no backend) and, if the answer is currently
flagged, a "Xóa flag" button that calls DELETE /api/flag/:flag_id and
refreshes the detail. Keep Screen 1 and the Transparency UI untouched.
```

### Prompt R — Recovery

```
Following GUIDELINE.md section 6.R for Screen 2, every action (mark reviewed,
delete flag) shows a toast bottom-right "Đã xử lý · Hoàn tác" with a 6-second
auto-dismiss — clicking Hoàn tác restores the item state AND its original
index in the sorted sidebar (don't append to end). Items whose server state
has a question but no answer (classification-failed) must pin to the top of
the sidebar regardless of timestamp, with a red 3px left border and badge
"Lỗi AI — review thủ công" replacing the topic badge. If a filter produces
>50 items, show a banner "Hiển thị 50 câu mới nhất — dùng filter topic để
thu hẹp" and cap the render. If GET /api/chat/questions fails, render an
inline error card in the sidebar area with a "Thử lại" button — do not
crash the whole dashboard. Don't touch Screen 1.
```

---

## Stage failure protocol

| Symptom | Action |
|---|---|
| Claude Code generates broken code | `That errored with: [paste]. Fix it.` |
| Prompt running >90 sec silent | Narrate the prompt structure or what you'd watch for |
| Unexpected feature added (e.g. login, localStorage persistence) | "Interesting choice. Let's scope back." → prompt to remove |
| Gemini API fails entirely | `rm server/.env && npm run dev` — fake fallback kicks in |
| Gemini returns malformed JSON | `The response isn't parsing — llmService validateResponse should retry once then throw. Check the retry path.` |
| Client imports Gemini SDK directly | `This violates the hinge rule in CLAUDE.md — all LLM calls go through server/src/llmService.js. Remove the import and use POST /api/chat/send.` |
| Topic appears that isn't in FIXED_TOPICS | `Filter through FIXED_TOPICS in validator and in the client. See GUIDELINE.md section 9.` |
| Dev server won't start | `npm run dev failed with: [paste]. Fix the Vite config or Express port (3001 server, 5173 client).` |
| Port conflict | Ctrl+C, rerun. Vite picks next port; Express needs 3001 free. |
