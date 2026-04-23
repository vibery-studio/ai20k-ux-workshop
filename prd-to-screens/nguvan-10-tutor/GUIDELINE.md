---
type: build-contract
app_slug: nguvan-10-tutor
language: vi
patterns: [1, 6]
created: 2026-04-23
---

# GUIDELINE.md — Ngữ văn 10 Tutor build contract

Claude Code reads this completely before writing code for any Prompt (0, T, C, R).

## 1. Project

- **Name:** Ngữ văn 10 Tutor
- **Patterns:** Screen 1 = Chat + Context Panel (pattern 1). Screen 2 = Queue + Approval Dashboard (pattern 6).
- **Primary actors:** Học sinh lớp 10 (Screen 1), Giáo viên Ngữ văn (Screen 2).
- **Purpose:** UX lab build kiểm chứng pattern chat+panel cho tutor AI môn Ngữ văn. Học sinh hỏi được, thấy nguồn tham khảo + confidence, flag câu sai. Giáo viên review list câu hỏi + flags theo topic. Không production, không real DB, không auth.

## 2. Stack

- **Client:** React 18 + Vite + plain JSX + inline styles. No TypeScript. No Tailwind. No CSS modules. No routing library — Screen 1 và Screen 2 chia bằng state flag hoặc hash route thủ công.
- **Server:** Node + Express, JSON API, nanoid cho IDs, ISO timestamps.
- **LLM:** Gemini 2.5 Flash Lite qua `@google/generative-ai` với `responseSchema` cho structured JSON. Chỉ gọi ở server.
- **Storage:** In-memory arrays trong `server/src/store.js`. State chết khi restart.

## 3. `server/src/llmService.js` contract (hinge — đọc kỹ)

**Toàn bộ LLM call đi qua file này.** Client không được `import` Gemini SDK. Đây là quy tắc cứng của repo.

Exports:

```
generateAnswer({ question, history }) → {text, reasoning, topics[], confidence, citations[], follow_up_questions[]}
```

Behavior:
- Model: `gemini-2.5-flash-lite` với `responseSchema` match `LLM_RESPONSE_SCHEMA`.
- `responseSchema` enum topics bằng `FIXED_TOPICS` từ `topics.js`.
- `validateResponse()` kiểm tra shape, filter topics không thuộc `FIXED_TOPICS`, dedupe, cap topics=4, citations=3, follow_ups=3 (≤140 char, non-empty), clamp confidence 0–100.
- Retry 1 lần nếu validate fail. Fail 2 lần → throw → route trả 500.
- 15s timeout qua `Promise.race`.
- AbortController-aware: nhận abort signal từ route, hủy request đang chạy.
- `thinkingConfig: { thinkingBudget: 0 }` để cắt latency.
- Fake fallback: nếu `GEMINI_API_KEY` thiếu → trả canned response tiếng Việt deterministic cho 3–5 câu hỏi Ngữ văn mẫu; 1-in-8 random simulated failure để demo recovery.

Không bao giờ đổi signature này. Đổi provider = edit bên trong, không đụng UI.

## 4. File layout

```
server/
  .env.example          # GEMINI_API_KEY=
  src/
    index.js            # Express bootstrap, mount routes, global JSON error handler
    llmService.js       # HINGE — không thay đổi signature
    prompt.js           # buildSystemPrompt + buildUserPrompt(history 6 messages)
    store.js            # in-memory questions/answers/flags + getHistory(session_id)
    topics.js           # FIXED_TOPICS (6 items) — source of truth
    routes/
      chat.js           # POST /api/chat/send, GET /api/chat/history, GET /api/chat/questions
      flag.js           # POST /api/flag, DELETE /api/flag/:flag_id
client/
  index.html
  vite.config.js        # proxy /api → http://localhost:3001
  src/
    main.jsx
    App.jsx             # shell: flag modal, toast, keybindings, screen switch (student vs teacher)
    api/
      chat.js           # fetch wrapper, throws Error(data.error || "Lỗi <status>")
      flag.js
      teacher.js
    hooks/
      useChat.js        # sessionRef, AbortController, messages[], pending, ask/stop/retry/clear
      useTeacher.js     # fetch questions, filter state (topic + flag status + search)
    components/
      student/
        ChatView.jsx
        ContextPanel.jsx
        MessageBubble.jsx
        ChatInput.jsx
        FlagModal.jsx
        FollowUpChips.jsx
        TypingStatus.jsx
        CitationCard.jsx
        TopicTag.jsx
        InputWarnings.jsx
      teacher/
        QueueSidebar.jsx
        QuestionDetail.jsx
        FilterToolbar.jsx
        ConfidenceBar.jsx
    styles/
      theme.js          # palette + spacing tokens + confidenceColor + confidenceLabel
    utils/
      validate.js       # duplicate of FIXED_TOPICS client-side for defensive filter
```

## 5. Baseline (Stage 0)

### Screen 1 — Student chat

- Header "Ngữ văn 10 Tutor" 24px bold, subtitle "Hỏi bài về tác phẩm, nhân vật, luyện viết" 14px gray.
- Single-column chat, max-width 800px, center.
- Scrollable thread 60vh. Message bubble: user bg `#eff6ff` align-right, assistant bg `#f9fafb` align-left, radius 12px, padding 12px 16px.
- Loading: italic gray `#6b7280` "đang soạn câu trả lời…".
- Textarea bottom + nút "Gửi" primary `#2563eb`. Enter gửi, Shift+Enter xuống dòng.
- History giữ trong `sessionRef` (nanoid UUID, reset khi clear). 3 câu hỏi liên tiếp không mất.
- Seed: hiện placeholder "Thử hỏi: 'Phân tích nhân vật Thúy Kiều trong đoạn Trao duyên'" trong textarea.

### Screen 2 — Teacher dashboard

- Top bar sticky: "Dashboard giáo viên — Ngữ văn 10", counter bên phải "X / Y câu hỏi".
- Layout: sidebar 360px trái + detail pane 1fr phải.
- Sidebar list: mỗi item có student_id (bold, truncate), câu hỏi (2-line clamp), topic badge đầu tiên, timestamp tương đối ("3 phút trước"). Selected item: bg `#eff6ff`, border-left 3px `#2563eb`.
- Detail pane: câu hỏi đầy đủ (16px), divider, câu trả lời AI (15px), list topics (tag pills), confidence number (placeholder nếu thiếu Stage T), citations section label "Tham khảo AI-generated". Nếu có flag hiện banner đỏ "Học sinh đã báo câu này chưa đúng" + reason text.
- Không có filter, không có bulk ops, không có undo — Stage C + R thêm.

## 6. T·C·R additions

### 6.T — Transparency

**Screen 1:** layout → 2-col flex (chat 60% trái, ContextPanel 40% phải, container max-width 1280px). Panel hiện của `latestAnswer` (không phải history): topics tag pills (import `FIXED_TOPICS`), confidence bar 6px (green ≥70, yellow ≥40, red dưới) kèm số %, 1–3 citation cards (source_name bold, excerpt 2-line clamp, context 12px gray). Header panel có nhãn "tham khảo AI-generated — chưa đối chiếu SGK". Placeholder "Hỏi câu đầu tiên để thấy nguồn tham khảo" khi chưa có answer.

**Screen 2:** detail pane thêm confidence bar (cùng color rule) + reasoning text từ `meta.reasoning` (nếu có). Sidebar items confidence <60 viền vàng 2px. Trong cùng time group, low-confidence bubble lên trên. Header tóm tắt: `N câu · M đã flag · K confidence thấp`. Citation cards đều có nhãn "tham khảo AI".

### 6.C — Control

**Screen 1:** dưới mỗi bubble assistant, link "Câu này chưa đúng?" (12px underline gray `#6b7280`) mở inline form (KHÔNG phải modal) với textarea "Vì sao bạn nghĩ câu trả lời chưa đúng?" (optional), nút "Gửi báo cáo" + "Hủy". Submit → `POST /api/flag {answer_id, reason}` → toast "Đã báo giáo viên" với "Hoàn tác" (30s → `DELETE /api/flag/:id`). Nút "Dừng" xuất hiện khi pending, abort qua AbortController (Esc cũng dừng). Cmd/Ctrl+K clear session (sessionRef mới).

**Screen 2:** top bar có chip bar topics (`[Tất cả] + FIXED_TOPICS`), dropdown flag status (`Tất cả / Đã flag / Chưa flag`), search box trong câu hỏi. Counter update theo filter. Detail pane có nút "Đánh dấu đã review" (local state) và "Xóa flag" nếu đang flag (gọi `DELETE /api/flag/:flag_id`).

### 6.R — Recovery

**Screen 1:** query <5 ký tự chặn, warning cam "Câu hỏi quá ngắn, gõ thêm chi tiết nhé". Try/catch quanh `ask` trong `useChat` — error bubble viền đỏ `#ef4444`, ⚠, text "Lỗi: [message]", nút "Thử lại" re-run `lastQuestion`, nút "Rút ngắn rồi thử lại" cắt 120 char. Timeout 15s qua `Promise.race` trong `llmService.js`. Panel giữ `latestAnswer` cũ cho đến khi response mới thành công (không optimistic clear).

**Screen 2:** mọi action → toast bottom-right "Đã xử lý · Hoàn tác" (6s auto-dismiss), undo phục hồi state + vị trí. Items classification-failed (question có trong store nhưng answer thiếu) → sidebar viền đỏ 3px trái + badge "Lỗi AI — review thủ công", pin top. Filter ra >50 items → banner "Hiển thị 50 câu mới nhất". `GET /api/chat/questions` fail → inline error card + "Thử lại", không crash.

## 7. Fake fallback seed data

`llmService.js` khi thiếu `GEMINI_API_KEY` trả deterministic mock cho câu hỏi khớp keyword:

- "thúy kiều" / "trao duyên" → `{text: "Thúy Kiều trong đoạn Trao duyên là hình ảnh người con gái hiếu nghĩa…", topics: ["Nhân vật và tác phẩm", "Thể loại và phong cách"], confidence: 82, citations: [{source_name: "Truyện Kiều - Nguyễn Du", excerpt: "Cậy em em có chịu lời…", context: "Đoạn trao duyên, câu 723–756"}], follow_up_questions: ["Vì sao Kiều chọn Thúy Vân?", "Nỗi đau trao duyên thể hiện qua hình ảnh nào?"]}`
- "tây tiến" / "quang dũng" → topic "Thơ cách mạng", confidence 78, cite "Tây Tiến - Quang Dũng".
- "tấm cám" → topic "Văn học dân gian", confidence 88.
- "nghị luận" → topic "Nghị luận xã hội", confidence 65.
- "viết bài" / "câu văn" → topic "Ngữ pháp và viết", confidence 70.
- Fallback câu chung: topic ["Nhân vật và tác phẩm"], confidence 55, 1 citation generic.

1-in-8 random trả `{error: "LLM_SIMULATED_FAIL"}` để demo Stage R. Cùng seed input → cùng output ngoài random failure.

## 8. Design tokens

Định nghĩa trong `client/src/styles/theme.js`. Import, KHÔNG hardcode.

- **Font:** system-ui, -apple-system, "Segoe UI", Roboto, sans-serif.
- **Colors:**
  - Primary `#2563eb`, Primary hover `#1d4ed8`
  - Success `#22c55e`, Warning `#eab308`, Danger `#ef4444`, Orange warning `#f97316`
  - Text `#111827`, Text muted `#6b7280`
  - Bg `#ffffff`, Bg muted `#f9fafb`, Bg user bubble `#eff6ff`
  - Border `#e5e7eb`, Border muted `#f3f4f6`
- **Spacing:** 4 / 8 / 12 / 16 / 24 / 32.
- **Radius:** 6 / 8 / 12.
- **Helpers:** `confidenceColor(score)` (green ≥70 / yellow ≥40 / red), `confidenceLabel(score)` (`Khớp rõ` / `Đang suy luận` / `Không chắc`).

## 9. Constraints

- Không TypeScript. Không Tailwind. Không CSS modules / styled-components. Inline styles only trên client.
- Dependencies được phép:
  - Client: `react`, `react-dom`, `vite`, `nanoid`.
  - Server: `express`, `@google/generative-ai`, `nanoid`, `dotenv`.
- Không routing library. Screen switch bằng `useState` + hash route tay (ví dụ `#/teacher`).
- Không state lib (Redux/Zustand) — `useState` + custom hooks đủ.
- Tất cả user-facing strings tiếng Việt có dấu.
- Topic list = `FIXED_TOPICS` duy nhất, không free-text. Filter 2 lớp: server enum trong `responseSchema` + client defensive filter trong `utils/validate.js`.
- Citations luôn label "tham khảo AI-generated" — không được gọi là "trích dẫn SGK".
- Session state in-memory per server process. Restart = reset. Không persist.
- Không import Gemini SDK ở client. Vi phạm hinge rule = stop và báo.
