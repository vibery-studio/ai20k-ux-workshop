# GUIDELINE — Ngữ văn 10 Tutor

> Tech stack: see `PRD §Tech stack`.

## UI pattern
**1. Chat + context panel**

Why this pattern: input là câu hỏi text (phân tích tác phẩm / nhân vật / luyện viết), output là text + metadata (topics, confidence, citations). Q+A dạng text → pattern 1 mặc định.

**Conversational UI + Evidence Panel:** panel bên phải hiển thị **3 thành phần**:
1. **Topic tags** — 2–4 tag từ fixed list 6 topic
2. **Confidence dot** — AI tự đánh giá độ tin cậy (0–100), hiển thị dot màu
3. **Citations** — 1–3 trích dẫn tham khảo (lab-mode: AI tự sinh, label "Tham khảo" chứ không khẳng định là nguồn thật)

Lý do gộp cả 3: Ngữ văn cần vừa label chủ đề (teacher tracking) vừa có trích dẫn để học sinh đối chiếu. Honest labeling: citations là "tham khảo AI sinh", không phải trích chính xác từ SGK — UI phải nói rõ.

## Visual style
**Playful educational**

Concrete rules:
- **Palette:** mint (`#A7E8BD`), peach (`#FFD4B8`), cream background (`#FFF9F0`), ink text (`#2D3142`)
- **Accent:** 1 primary (mint green), 1 warn (peach), 1 danger (soft coral `#F47B7B`)
- **Corners:** rounded-xl (12px) cho card, rounded-full cho button + tag
- **Type:** sans-serif (Inter / system-ui), 16px base, 18px cho chat message, 14px cho meta
- **Spacing:** 16px base unit, 24px giữa section
- **Tone:** friendly copy — "Bạn muốn hỏi gì về Ngữ văn?" thay vì "Enter your query"
- **Emoji OK** trong label (ví dụ: "📚 Chủ đề", "💡 Tham khảo", "📝 Câu trả lời")
- **No shadows nặng** — dùng subtle 1px border + light tint background

## User flow (Demo 1 — student)
1. Học sinh mở app, thấy layout 2 cột: chat bên trái (~60%), panel bên phải (~40%).
2. Gõ câu hỏi vào input dưới cùng → app gọi `src/llmService.js` → Gemini 2.5 Flash trả về `{text, topics[], confidence, citations[]}`. Mock JSON lưu question + answer.
3. Câu trả lời hiện bên trái (bubble). Panel bên phải update: topic tags + confidence dot + citations list.
4. Học sinh có thể bấm "📛 Câu này chưa đúng" dưới câu trả lời → modal nhỏ hỏi lý do (optional) → flag lưu vào mock JSON.
5. Hỏi câu tiếp theo → history giữ nguyên, panel update theo câu trả lời mới nhất.

## T·C·R checklist for this pattern

### T — Transparency (what AI work is visible)
- [ ] Topic panel hiển thị 2–4 tag từ fixed list (6 topic)
- [ ] Streaming status line khi AI đang trả lời (ví dụ: "Đang soạn câu trả lời…")
- [ ] Confidence dot cạnh mỗi câu trả lời: 🟢 green (≥70) / 🟡 yellow (40–69) / 🔴 red (<40)
- [ ] Citations section trong panel, mỗi citation hiển thị source_name + excerpt, kèm label "Tham khảo AI sinh — cần đối chiếu SGK"

### C — Control (what user can stop / edit / override)
- [ ] Stop button khi AI đang stream (hủy giữa chừng)
- [ ] Edit-last-user-message (click bubble câu hỏi vừa gửi → sửa → gửi lại)
- [ ] Cmd+K / nút "Xóa hội thoại" clear chat trong session

### R — Recovery (validation + retry + undo)
- [ ] Error bubble với nút "Thử lại" khi LLM fail
- [ ] Thumbs-down / "Câu này chưa đúng" trên mỗi câu trả lời (chính là flag trong user story 2)
- [ ] Validate response ở service layer: topics phải nằm trong fixed list, confidence phải 0–100 — reject nếu AI trả sai format

**Fixed topic list:**
`["Thơ cách mạng", "Văn học dân gian", "Nghị luận xã hội", "Nhân vật và tác phẩm", "Thể loại và phong cách", "Ngữ pháp và viết"]`

LLM được prompt trả về JSON với `topics: string[]` mà mỗi item phải ∈ list này. Validate ở `src/llmService.js`, reject + retry nếu AI trả topic lạ.

## Hinge rule
All LLM calls go through `src/llmService.js`. UI không bao giờ import Gemini SDK trực tiếp. Đổi provider (Gemini → Claude → GPT) = edit một file.

## What NOT to build yet
- Auth, login, student/teacher tài khoản riêng
- Persistent DB — chỉ mock JSON trong memory/file
- Mobile layout, responsive polish
- Dark mode, i18n, loading skeletons phức tạp
- Citations thật từ corpus SGK (lab-mode: AI tự sinh + label rõ)
- Teacher dashboard (Demo 2 — build sau, dùng cùng PRD)
- T·C·R features đầy đủ — chạy `/tcr-apply` sau khi baseline xong
- Biểu đồ thống kê topic (Later story)
