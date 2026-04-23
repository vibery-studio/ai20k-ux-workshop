---
type: workshop-artifact
source_prd: /Applications/MAMP/htdocs/vinui-workshop/nguvan-tutor/PRD.md
app_slug: nguvan-10-tutor
language: vi
created: 2026-04-23
---

# Ngữ văn 10 Tutor — Screen Cards

Multi-user split: Student + Teacher là 2 actors với 2 workflows khác nhau → 2 screens độc lập, không fuse.

---

## Screen 1 — Học sinh hỏi Ngữ văn, nhận câu trả lời có căn cứ

- **UI pattern:** 1 — Chat + Context Panel
- **Actor:** Học sinh lớp 10
- **Trigger:** Học sinh mở app, thấy ô chat và gõ câu hỏi về tác phẩm / nhân vật / luyện viết.
- **Input:** Câu hỏi tiếng Việt có dấu, ví dụ "Phân tích nhân vật Thúy Kiều trong đoạn Trao duyên".
- **Agent work:** LLM trả lời text, tag 2–4 topics từ fixed list, cho confidence 0–100, sinh 1–3 citations "tham khảo".
- **Output:** Bubble trả lời ở cột trái; cột phải hiện topics + confidence bar + citations của câu trả lời mới nhất.

### Stage 0 (baseline — broken starting state)

Single-column chat, header "Ngữ văn 10 Tutor", subtitle "Hỏi bài về tác phẩm, nhân vật, luyện viết". Scrollable thread (60vh). Textarea + nút "Gửi" ở đáy. Message có role + content. Loading hiện text xám italic "đang soạn câu trả lời…". History trong session được giữ (3 câu hỏi liên tiếp không mất). Không có panel nguồn, không có confidence, không có nút flag, không có nút Dừng.

### Stage +T (Transparency surface)

Layout chuyển 2-column flex — chat 60% trái, sources panel 40% phải, container max-width 1280px. Panel hiện topics tag pills (2–4 từ FIXED_TOPICS), confidence bar 6px cao (xanh lá ≥70, vàng ≥40, đỏ dưới) + số phần trăm, và 1–3 citation cards của câu trả lời mới nhất. Mỗi card: white bg, border `1px solid #e0e0e0`, radius 8px, padding 12px, hiện `source_name` (bold), `excerpt` (2-line clamp), `context` (12px gray). Nhãn "tham khảo AI-generated, chưa đối chiếu SGK" ở header panel. Placeholder "Hỏi câu đầu tiên để thấy nguồn tham khảo" khi chưa có answer.

### Stage +T+C (Control surface)

Dưới mỗi bubble assistant, link nhỏ "Câu này chưa đúng?" (12px, underlined, gray) mở inline form: textarea "Vì sao bạn nghĩ câu trả lời chưa đúng?" (optional), nút "Gửi báo cáo" và "Hủy". Submit → `POST /api/flag` → toast "Đã báo giáo viên" với nút "Hoàn tác" (30s window → `DELETE /api/flag/:id`). Nút "Dừng" xuất hiện chỉ khi pending; click abort request qua AbortController (Esc key cũng được, đã có trong `useChat`). Cmd/Ctrl+K clear session (mới `sessionRef` mới).

### Stage +T+C+R (Recovery surface)

Input validation: query <5 ký tự chặn không gọi LLM, hiện warning cam "Câu hỏi quá ngắn, gõ thêm chi tiết nhé". Try/catch quanh `askLLM` — error bubble đỏ với ⚠, text "Lỗi: [message]", nút "Thử lại" re-chạy `lastQuestion`. Nút "Rút ngắn rồi thử lại" cắt câu hỏi xuống 120 ký tự. Timeout 15s ở `llmService.js`. Khi validator ở server fail 2 lần → hiện error bubble, không crash UI.

### Traps for this pattern

1. **Agent gọi Gemini SDK trực tiếp từ client.** Biểu hiện: `import { GoogleGenerativeAI }` trong `client/src/`. Prompt fix: `All LLM calls must go through server/src/llmService.js per CLAUDE.md hinge rule. Remove Gemini SDK import from client and call POST /api/chat/send instead.`
2. **Confidence hiện 1 con số cho cả câu.** Biểu hiện: 1 bar duy nhất, không cho biết phần nào chắc, phần nào đoán. Prompt fix: `The confidence bar is per-answer, which is fine for this lab. Do not add per-sentence confidence — it is out of scope.`
3. **Flag modal xóa conversation.** Biểu hiện: open flag form → chat history biến mất. Prompt fix: `Flag form must open inline below the bubble, not as a fullscreen modal. Preserve all previous messages and sessionRef.`
4. **Retry mất topics/citations cũ.** Biểu hiện: click "Thử lại" → panel reset về rỗng trước khi request mới xong. Prompt fix: `When retrying after error, keep latestAnswer.meta visible until the new response replaces it. Do not clear the panel optimistically.`
5. **Sources panel hiện toàn bộ history.** Biểu hiện: cuộn panel thấy citations của cả 5 câu trước. Prompt fix: `ContextPanel must show only latestAnswer metadata. Previous answers' sources stay in the chat bubble itself, not in the side panel.`

### What NOT to include on this screen

- Login / user selection — không có auth theo PRD.
- Biểu đồ thống kê topic theo tuần — thuộc Story #6, out of scope.
- Persistent DB hoặc localStorage cho session — in-memory only, restart = reset.
- Voice input — out of scope.
- Teacher view nhúng vào cùng screen — phải là Screen 2 riêng.

---

## Screen 2 — Giáo viên review câu hỏi + flags trong lớp

- **UI pattern:** 6 — Queue + Approval Dashboard
- **Actor:** Giáo viên Ngữ văn
- **Trigger:** Giáo viên mở trang `/teacher` (hoặc route tương đương) để xem học sinh đang vướng gì.
- **Input:** Filter chọn topic (1 trong 6) + flag status (tất cả / đã flag / chưa flag).
- **Agent work:** AI đã tag topics + tính confidence lúc học sinh hỏi; dashboard chỉ hiển thị + lọc + detail view của từng câu.
- **Output:** Sidebar trái list questions đã filter; right pane hiện câu hỏi gốc + câu trả lời AI + reason flag (nếu có).

### Stage 0 (baseline — broken starting state)

Top bar "Dashboard giáo viên — Ngữ văn 10" với counter "X / Y câu hỏi". Left sidebar 360px list questions theo thứ tự thời gian mới nhất → cũ nhất. Mỗi item: student_id (truncated, bold), câu hỏi (first line truncate 2 dòng), topic badge đầu tiên, timestamp tương đối ("3 phút trước"). Right detail view: câu hỏi đầy đủ, câu trả lời AI đầy đủ, list topics, confidence number, citations. Nếu có flag hiện "Đã bị flag" đỏ + reason. Không có filter, không có bulk ops, không có undo.

### Stage +T (Transparency surface)

Right detail view thêm confidence bar 0–100 (xanh lá ≥70, vàng ≥40, đỏ dưới) và AI reasoning text (nếu có meta.reasoning). Sidebar items có confidence <60 được viền vàng 2px "cần review kỹ". Sort sidebar: trong mỗi nhóm thời gian, câu confidence thấp bubble lên trên. Header hiện tóm tắt: `12 câu · 3 đã flag · 2 confidence thấp`. Mỗi citation card trong detail view có nhãn "tham khảo AI, chưa đối chiếu SGK".

### Stage +T+C (Control surface)

Top bar thêm filter toolbar: chip bar topics `[Tất cả] [Thơ cách mạng] [Văn học dân gian] [Nghị luận xã hội] [Nhân vật và tác phẩm] [Thể loại và phong cách] [Ngữ pháp và viết]` (source: `FIXED_TOPICS`). Dropdown flag status: `Tất cả / Đã flag / Chưa flag`. Search box "Tìm trong câu hỏi…". Counter cập nhật live theo filter. Sidebar item click → detail view update không reload. Trong detail view: nút "Đánh dấu đã review" (state local cho demo), nút "Xóa flag" nếu đang flag (gọi `DELETE /api/flag/:flag_id`).

### Stage +T+C+R (Recovery surface)

Mọi action (xóa flag, mark reviewed) → toast bottom-right "Đã xử lý · Hoàn tác" (6s auto-dismiss). Hoàn tác phục hồi state + vị trí gốc trong sidebar. Câu hỏi mà llmService validate fail 2 lần (store có question nhưng answer thiếu) → sidebar hiện viền đỏ 3px trái, badge "Lỗi AI — review thủ công" thay vì topic. Bulk filter ra >50 items hiện banner "Hiển thị 50 câu mới nhất, dùng filter topic để thu hẹp" — tránh render toàn list. Nếu `GET /api/chat/questions` fail → inline error card + "Thử lại", không crash toàn trang.

### Traps for this pattern

1. **Bulk operation gọi LLM lại cho mỗi item.** Biểu hiện: click filter topic → 50 request LLM chạy song song → timeout. Prompt fix: `Filtering is client-side on already-returned data. Do NOT re-call askLLM when filter changes. The server route /api/chat/questions returns all, client filters.`
2. **Undo khôi phục item nhưng mất vị trí sort.** Biểu hiện: hoàn tác xong item nhảy về cuối list. Prompt fix: `Undo must restore the item to its original index in the sorted sidebar, not append to end.`
3. **Confidence <60 sort rule bị severity override.** Biểu hiện: low-confidence câu bị chôn dưới, giáo viên không bao giờ thấy. Prompt fix: `Within each time group, low-confidence items bubble to top. Do not let timestamp-only sort hide borderline answers.`
4. **Classification-failed items pile ở dưới.** Biểu hiện: câu lỗi AI bị sort cuối, giáo viên miss. Prompt fix: `Items with AI error must pin to top of sidebar regardless of timestamp, with red border + "review manually" badge.`
5. **Filter topic dùng free-text string match.** Biểu hiện: "Thơ cách mạng" không match "thơ cách mạng" vì case, hoặc match cả "Thơ". Prompt fix: `Topic filter uses exact equality against FIXED_TOPICS values. Import FIXED_TOPICS from server/src/topics.js or client/src/utils/validate.js — do not hardcode the list a second time.`

### What NOT to include on this screen

- Biểu đồ weekly stats — Story #6, out of scope.
- Nút edit/sửa câu trả lời AI — giáo viên chỉ review, không overwrite answer.
- Per-student view / grading — không có user table theo PRD.
- Export CSV — out of scope.
- Re-classify topic thủ công — topic là kết quả LLM, giáo viên không sửa trong demo này.
