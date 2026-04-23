---
type: workshop-artifact
source_prd: /Applications/MAMP/htdocs/vinui-workshop/nguvan-tutor/PRD.md
app_slug: nguvan-10-tutor
language: vi
created: 2026-04-23
---

# Ngữ văn 10 Tutor — User Stories

## Valuable stories (shipping)

1. **(Student)** Học sinh gõ câu hỏi Ngữ văn → nhận câu trả lời text + topics + confidence + citations; flag được câu sai; history giữ trong session.
2. **(Teacher)** Giáo viên mở dashboard → list câu hỏi học sinh, lọc theo topic + flag status, click vào 1 câu để xem Q + A + lý do flag.

Hai actors khác nhau → hai màn hình riêng. Không fuse.

## Candidate stories — filter results

```
Story #1 — Student hỏi Ngữ văn, nhận text + topics + confidence + citations.
  Gate A (core loop):     PASS — moment AI-facing chính, nếu không có thì sản phẩm không tồn tại.
  Gate B (AI hand-off):   PASS — user gõ → LLM suy luận → trả về 4 thành phần trên UI.
  Gate C (R worth it):    PASS — AI có thể sai trên phân tích văn học, cần visible recovery.
  Verdict: KEEP → Screen 1.

Story #2 — Student bấm "câu này chưa đúng" để flag.
  Gate A: FAIL as standalone — đây là Control surface của Story #1, không phải screen mới.
  Verdict: FOLD vào Screen 1 (Stage +T+C).

Story #3 — Student xem lại history trong session.
  Gate A: FAIL as standalone — chat pattern có history là baseline free, không cần screen riêng.
  Verdict: FOLD vào Screen 1 (Stage 0).

Story #4 — Teacher mở dashboard, list questions, lọc theo topic + flag status.
  Gate A (core loop):     PASS — teacher's core loop, xem lớp đang vướng chỗ nào.
  Gate B (AI hand-off):   PASS — AI đã classify topics + confidence; teacher review kết quả + flags.
  Gate C (R worth it):    PASS — classification fail phải hiển thị rõ; undo cho hành động flag-review.
  Verdict: KEEP → Screen 2.

Story #5 — Teacher click 1 câu → xem chi tiết Q + A + lý do flag.
  Gate A: FAIL as standalone — detail view là một phần của queue pattern (sidebar + detail pane).
  Verdict: FOLD vào Screen 2 (Stage 0 — right detail view).

Story #6 — Teacher xem biểu đồ top chủ đề học sinh vướng (weekly stats).
  PRD label: (Later).
  Verdict: DROP — ngoài scope demo.
```

## Notes for the team

- PRD chuẩn UX-lab spec: 2 actors rõ, 6 topic cố định, mock JSON in-memory, không auth. Không cần clarify lại.
- `llmService.js` contract đã được lock cứng bởi `CLAUDE.md` (hinge rule). Mọi screen đều gọi qua đây — không có ngoại lệ.
- Citations label "tham khảo" bắt buộc, không bao giờ trình bày như trích dẫn chính thống SGK. Đây là lab constraint, không phải feature choice.
- Student + Teacher là hai screens độc lập — team có thể ship riêng Screen 1 trước (Demo 1 theo PRD), Screen 2 sau (Demo 2). Không cần cùng lúc.
