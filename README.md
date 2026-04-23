# Ngữ văn 10 Tutor — Demo 1

UX lab build. Student chat với Gemini 2.5 Flash, pattern Chat + context panel.

Xem `PRD.md` + `GUIDELINE.md` để hiểu scope.

## Chạy local

### 1. Server
```
cd server
npm install
cp .env.example .env
# paste GEMINI_API_KEY vào .env (https://aistudio.google.com/apikey)
npm run dev
```
Server chạy ở `http://localhost:3001`.

### 2. Client (terminal khác)
```
cd client
npm install
npm run dev
```
Client chạy ở `http://localhost:5173`, đã proxy `/api` → server.

## Cấu trúc
```
client/   React 18 + Vite + plain JSX + inline styles
server/   Express mock + Gemini via server/src/llmService.js
```

## Hinge rule
Mọi LLM call qua `server/src/llmService.js`. UI không gọi Gemini trực tiếp.
Đổi provider = sửa 1 file.
