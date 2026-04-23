# PRD — Ngữ văn 10 Tutor

## Problem + context
Học sinh lớp 10 thường bí khi phân tích tác phẩm, giải thích nhân vật, luyện viết Ngữ văn. Giáo viên không scale được 1-1 giải đáp cho cả lớp. App này là **UX lab build** — kiểm chứng pattern chat+panel cho tutor AI, không production, không real backend.

## Users
- **Primary:** Học sinh lớp 10 (hỏi bài Ngữ văn, đọc câu trả lời, flag câu sai)
- **Secondary:** Giáo viên Ngữ văn (xem câu hỏi học sinh, xem câu được flag, lọc theo chủ đề để biết lớp đang vướng chỗ nào)

## User stories
1. **(Demo 1)** Học sinh gõ câu hỏi Ngữ văn (phân tích tác phẩm / nhân vật / luyện viết), nhận câu trả lời text + chủ đề liên quan + mức độ tin cậy AI + trích dẫn tham khảo.
2. **(Demo 1)** Học sinh bấm "câu này chưa đúng" trên câu trả lời để báo flag cho giáo viên review sau.
3. **(Demo 1)** Học sinh xem lại lịch sử hội thoại trong session (không mất khi gõ câu tiếp theo).
4. **(Demo 2)** Giáo viên mở dashboard, xem danh sách câu hỏi học sinh, lọc theo chủ đề + trạng thái flag.
5. **(Demo 2)** Giáo viên click 1 câu → xem chi tiết câu hỏi + câu trả lời AI + lý do flag.
6. **(Later)** Giáo viên xem biểu đồ/thống kê "top chủ đề học sinh vướng nhất trong tuần".

## Data model
- **questions** — id, student_id, text, created_at
- **answers** — id, question_id, text, topics (array), confidence (0–100), citations (array), created_at
- **flags** — id, answer_id, reason, created_at
- **citations** (inline trong answer) — source_name, excerpt, context

## Tech stack
- **Frontend:** React 18 + Vite + plain JSX + inline styles
- **Backend:** Express mock serving JSON
- **LLM:** Gemini 2.5 Flash qua `src/llmService.js`
- **Storage:** In-memory JSON (hoặc file JSON local), không DB
- **Not using:** TypeScript, Tailwind, SQLite

## Constraints
- UX lab build — không real backend, mock JSON là đủ
- Không auth, không session persistence ngoài in-memory
- Demo trên 1 laptop, không cần deploy
- User-facing strings Vietnamese có dấu
- **Topic tagging dùng fixed list**, không free-text (xem dưới)
- **Citations** = mock data trong lab (AI tự sinh tên nguồn từ prompt, chưa có corpus thật) — label rõ là "tham khảo", không bảo đảm chính xác

**Topic list (fixed):**
`["Thơ cách mạng", "Văn học dân gian", "Nghị luận xã hội", "Nhân vật và tác phẩm", "Thể loại và phong cách", "Ngữ pháp và viết"]`

## API surface
- **chat send** — student gửi câu hỏi → trả về `{text, topics[], confidence, citations[]}`
- **list questions** — teacher lấy danh sách questions, filter theo topic + flag status
- **get question detail** — teacher lấy 1 question + answer + flag (nếu có)
- **flag answer** — student báo 1 answer sai, kèm lý do (optional text)
- **list chat history** — student lấy history trong session hiện tại

## Success criteria
- Học sinh hỏi 3 câu liên tiếp, app không mất history trong session
- Panel bên phải hiển thị đủ 3 thành phần: topics (2–4 tag từ fixed list) + confidence dot + 1–3 citations
- Teacher (Demo 2) load dashboard thấy đúng danh sách câu được flag, lọc được theo 6 topic
- Đổi provider LLM = edit 1 file (`src/llmService.js`), UI không đụng

## Out of scope
- Auth / login
- Persistent DB — chỉ mock JSON trong memory
- Mobile layout
- Dark mode, i18n, polish CSS
- Citations từ corpus SGK thật (lab-mode: AI tự sinh nguồn, label rõ ràng)
- Voice input / audio

## Open questions
- (none)
