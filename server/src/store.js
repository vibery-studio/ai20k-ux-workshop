import { nanoid } from 'nanoid';

const questions = [];
const answers = [];
const flags = [];

export function addQuestion({ session_id, text }) {
  const q = { id: nanoid(8), session_id, text, created_at: new Date().toISOString() };
  questions.push(q);
  return q;
}

export function addAnswer({ question_id, text, reasoning, topics, confidence, citations, follow_up_questions, meta }) {
  const a = {
    id: nanoid(8),
    question_id,
    text,
    reasoning: reasoning || '',
    topics,
    confidence,
    citations,
    follow_up_questions: Array.isArray(follow_up_questions) ? follow_up_questions : [],
    meta: meta || null,
    created_at: new Date().toISOString(),
  };
  answers.push(a);
  return a;
}

export function addFlag({ answer_id, reason }) {
  const f = {
    id: nanoid(8),
    answer_id,
    reason: reason || '',
    created_at: new Date().toISOString(),
  };
  flags.push(f);
  return f;
}

export function removeFlag(flag_id) {
  const idx = flags.findIndex(f => f.id === flag_id);
  if (idx === -1) return false;
  flags.splice(idx, 1);
  return true;
}

export function getHistory(session_id) {
  const sessionQuestions = questions.filter(q => q.session_id === session_id);
  const messages = [];
  for (const q of sessionQuestions) {
    messages.push({ role: 'user', text: q.text });
    const a = answers.find(x => x.question_id === q.id);
    if (a) {
      messages.push({
        role: 'assistant',
        text: a.text,
        meta: {
          topics: a.topics,
          confidence: a.confidence,
          citations: a.citations,
          reasoning: a.reasoning,
          follow_up_questions: a.follow_up_questions || [],
          answer_id: a.id,
          ...(a.meta || {}),
        },
      });
    }
  }
  return messages;
}

export function findAnswer(answer_id) {
  return answers.find(a => a.id === answer_id);
}

export function listQuestionsForTeacher() {
  return questions
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(q => {
      const a = answers.find(x => x.question_id === q.id) || null;
      const f = a ? flags.find(x => x.answer_id === a.id) || null : null;
      return {
        question: q,
        answer: a,
        flag: f,
      };
    });
}

export const _debug = { questions, answers, flags };
