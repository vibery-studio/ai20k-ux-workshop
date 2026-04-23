import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRoute from './routes/chat.js';
import flagRoute from './routes/flag.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/chat', chatRoute);
app.use('/api/flag', flagRoute);

app.use((err, _req, res, _next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: err.message || 'Lỗi server' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Ngữ văn tutor server chạy ở http://localhost:${PORT}`);
});
