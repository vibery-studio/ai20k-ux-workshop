import { useEffect, useState } from 'react';
import { theme } from '../styles/theme.js';

const STEPS = [
  { at: 0, label: '💭 Đang đọc câu hỏi…' },
  { at: 800, label: '📚 Đang chọn chủ đề phù hợp…' },
  { at: 2500, label: '✍️ Đang viết câu trả lời…' },
];

export default function TypingStatus({ onStop }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    setStepIdx(0);
    const timers = STEPS.slice(1).map((s, i) =>
      setTimeout(() => setStepIdx(i + 1), s.at)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: theme.space[4],
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.space[3],
          padding: `${theme.space[3]}px ${theme.space[4]}px`,
          borderRadius: theme.radius.lg,
          background: theme.color.white,
          border: `1px solid ${theme.color.border}`,
          color: theme.color.muted,
          fontSize: theme.font.chat,
          fontStyle: 'italic',
        }}
      >
        <span>{STEPS[stepIdx].label}</span>
        {onStop && (
          <button
            onClick={onStop}
            style={{
              padding: `${theme.space[1]}px ${theme.space[3]}px`,
              borderRadius: theme.radius.full,
              border: `1px solid ${theme.color.coral}`,
              background: theme.color.white,
              color: theme.color.coral,
              fontFamily: theme.font.family,
              fontSize: theme.font.meta,
              fontWeight: 600,
              cursor: 'pointer',
              fontStyle: 'normal',
            }}
          >
            ⏹ Dừng
          </button>
        )}
      </div>
    </div>
  );
}
