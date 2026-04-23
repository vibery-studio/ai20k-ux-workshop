import { Router } from 'express';
import { addQuestion, addAnswer, getHistory, listQuestionsForTeacher } from '../store.js';
import { generateAnswer, ACTIVE_MODEL } from '../llmService.js';

const router = Router();

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

router.post('/send', async (req, res) => {
  const { question, session_id } = req.body || {};
  if (!question || !session_id) {
    return res.status(400).json({ error: 'Thiếu question hoặc session_id' });
  }

  const q = addQuestion({ session_id, text: question });
  const history = getHistory(session_id).slice(0, -1);

  const t0 = Date.now();
  try {
    const result = await generateAnswer({ question, history });
    const latency_ms = Date.now() - t0;
    const meta = {
      latency_ms,
      model: ACTIVE_MODEL,
      word_count: countWords(result.text),
    };
    const a = addAnswer({
      question_id: q.id,
      text: result.text,
      reasoning: result.reasoning,
      topics: result.topics,
      confidence: result.confidence,
      citations: result.citations,
      follow_up_questions: result.follow_up_questions,
      meta,
    });
    res.json({ question_id: q.id, answer: a });
  } catch (err) {
    console.error('[chat/send] LLM fail:', err);
    res.status(500).json({ error: err.message || 'Lỗi gọi LLM' });
  }
});

router.get('/history', (req, res) => {
  const session_id = req.query.session_id;
  if (!session_id) return res.status(400).json({ error: 'Thiếu session_id' });
  res.json({ messages: getHistory(session_id) });
});

router.get('/questions', (_req, res) => {
  res.json({ items: listQuestionsForTeacher() });
});

export default router;
