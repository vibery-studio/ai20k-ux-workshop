import { Router } from 'express';
import { addFlag, findAnswer, removeFlag } from '../store.js';

const router = Router();

router.post('/', (req, res) => {
  const { answer_id, reason } = req.body || {};
  if (!answer_id) return res.status(400).json({ error: 'Thiếu answer_id' });
  if (!findAnswer(answer_id)) return res.status(404).json({ error: 'Không tìm thấy câu trả lời' });
  const f = addFlag({ answer_id, reason });
  console.log(`[flag] answer=${answer_id} reason="${f.reason}"`);
  res.json({ flag_id: f.id });
});

router.delete('/:flag_id', (req, res) => {
  const { flag_id } = req.params;
  if (!removeFlag(flag_id)) return res.status(404).json({ error: 'Không tìm thấy flag' });
  console.log(`[flag] undo ${flag_id}`);
  res.json({ ok: true });
});

export default router;
