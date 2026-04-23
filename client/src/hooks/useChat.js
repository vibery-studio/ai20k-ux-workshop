import { useCallback, useMemo, useRef, useState } from 'react';
import { sendChat } from '../api/chat.js';

function newSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'sess-' + Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const sessionRef = useRef(newSessionId());
  const abortRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);

  const latestAnswer = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].meta) return messages[i];
    }
    return null;
  }, [messages]);

  const ask = useCallback(async (question) => {
    const trimmed = (question || '').trim();
    if (!trimmed || pending) return;
    setError(null);
    setLastQuestion(trimmed);
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setPending(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const { answer } = await sendChat({
        question: trimmed,
        session_id: sessionRef.current,
        signal: controller.signal,
      });
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: answer.text,
          meta: {
            answer_id: answer.id,
            topics: answer.topics,
            confidence: answer.confidence,
            citations: answer.citations,
            reasoning: answer.reasoning,
            follow_up_questions: answer.follow_up_questions || [],
            latency_ms: answer.meta?.latency_ms,
            model: answer.meta?.model,
            word_count: answer.meta?.word_count,
          },
        },
      ]);
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        setMessages(prev => [...prev, { role: 'assistant', text: '[Bạn đã dừng câu trả lời]' }]);
      } else {
        setError(err.message || 'Lỗi không xác định');
      }
    } finally {
      abortRef.current = null;
      setPending(false);
    }
  }, [pending]);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  const editLastAndResend = useCallback((newText) => {
    const trimmed = (newText || '').trim();
    if (!trimmed) return;
    setMessages(prev => {
      const idx = [...prev].reverse().findIndex(m => m.role === 'user');
      if (idx === -1) return prev;
      return prev.slice(0, prev.length - 1 - idx);
    });
    setTimeout(() => ask(trimmed), 0);
  }, [ask]);

  const retry = useCallback(() => {
    if (!lastQuestion) return;
    setMessages(prev => {
      const idx = [...prev].reverse().findIndex(m => m.role === 'user');
      if (idx === -1) return prev;
      return prev.slice(0, prev.length - idx);
    });
    ask(lastQuestion);
  }, [ask, lastQuestion]);

  const retryShort = useCallback(() => {
    if (!lastQuestion) return;
    const shortened = lastQuestion.length > 120 ? lastQuestion.slice(0, 120) + '…' : lastQuestion;
    setMessages(prev => {
      const idx = [...prev].reverse().findIndex(m => m.role === 'user');
      if (idx === -1) return prev;
      return prev.slice(0, prev.length - idx);
    });
    ask(shortened);
  }, [ask, lastQuestion]);

  const clearError = useCallback(() => setError(null), []);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastQuestion(null);
    sessionRef.current = newSessionId();
  }, []);

  return {
    messages,
    pending,
    error,
    ask,
    retry,
    retryShort,
    clearError,
    clear,
    stop,
    editLastAndResend,
    latestAnswer,
    sessionId: sessionRef.current,
  };
}
