import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { FIXED_TOPICS } from './topics.js';
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

const MODEL_NAME = 'gemini-2.5-flash-lite';

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    text: { type: SchemaType.STRING },
    reasoning: { type: SchemaType.STRING },
    topics: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING, enum: FIXED_TOPICS },
    },
    confidence: { type: SchemaType.NUMBER },
    citations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          source_name: { type: SchemaType.STRING },
          excerpt: { type: SchemaType.STRING },
          context: { type: SchemaType.STRING },
        },
        required: ['source_name', 'excerpt', 'context'],
      },
    },
    follow_up_questions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ['text', 'reasoning', 'topics', 'confidence', 'citations', 'follow_up_questions'],
};

export const ACTIVE_MODEL = MODEL_NAME;

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY chưa được set trong server/.env');
  return new GoogleGenerativeAI(key);
}

function validateResponse(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('LLM trả về không phải object');

  const text = typeof raw.text === 'string' ? raw.text.trim() : '';
  if (!text) throw new Error('LLM trả về thiếu text');

  const reasoning = typeof raw.reasoning === 'string' ? raw.reasoning.trim() : '';

  const topics = Array.isArray(raw.topics) ? raw.topics.filter(t => FIXED_TOPICS.includes(t)) : [];
  if (topics.length === 0) throw new Error('LLM trả về topics không hợp lệ');
  const uniqueTopics = [...new Set(topics)].slice(0, 4);

  let confidence = Number(raw.confidence);
  if (!Number.isFinite(confidence)) throw new Error('LLM trả về confidence không phải số');
  confidence = Math.max(0, Math.min(100, Math.round(confidence)));

  const citationsInput = Array.isArray(raw.citations) ? raw.citations : [];
  const citations = citationsInput
    .filter(c => c && typeof c.source_name === 'string' && typeof c.excerpt === 'string')
    .slice(0, 3)
    .map(c => ({
      source_name: c.source_name.trim(),
      excerpt: c.excerpt.trim(),
      context: (c.context || '').trim(),
    }));
  if (citations.length === 0) throw new Error('LLM trả về citations rỗng');

  const followInput = Array.isArray(raw.follow_up_questions) ? raw.follow_up_questions : [];
  const follow_up_questions = followInput
    .filter(q => typeof q === 'string')
    .map(q => q.trim())
    .filter(q => q.length > 0 && q.length <= 140)
    .slice(0, 3);

  return { text, reasoning, topics: uniqueTopics, confidence, citations, follow_up_questions };
}

async function callOnce({ question, history }) {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: buildSystemPrompt(),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.7,
    },
  });

  const result = await model.generateContent(buildUserPrompt({ question, history }));
  const raw = result.response.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('LLM trả về JSON không parse được');
  }
  return validateResponse(parsed);
}

export async function generateAnswer({ question, history }) {
  try {
    return await callOnce({ question, history });
  } catch (err) {
    console.warn('[llmService] retry do:', err.message);
    return await callOnce({ question, history });
  }
}
