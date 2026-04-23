async function parseOrThrow(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Lỗi ${res.status}`);
  }
  return data;
}

export async function sendChat({ question, session_id, signal }) {
  const res = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, session_id }),
    signal,
  });
  return parseOrThrow(res);
}

export async function fetchHistory(session_id) {
  const res = await fetch(`/api/chat/history?session_id=${encodeURIComponent(session_id)}`);
  return parseOrThrow(res);
}

export async function flagAnswer({ answer_id, reason }) {
  const res = await fetch('/api/flag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer_id, reason }),
  });
  return parseOrThrow(res);
}

export async function undoFlag(flag_id) {
  const res = await fetch(`/api/flag/${encodeURIComponent(flag_id)}`, { method: 'DELETE' });
  return parseOrThrow(res);
}

export async function fetchTeacherQuestions() {
  const res = await fetch('/api/chat/questions');
  return parseOrThrow(res);
}
