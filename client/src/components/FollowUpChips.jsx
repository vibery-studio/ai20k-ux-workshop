import { theme } from '../styles/theme.js';

export default function FollowUpChips({ questions, onPick, disabled }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: theme.space[4],
      }}
    >
      <div style={{ maxWidth: '78%' }}>
        <div
          style={{
            fontSize: theme.font.meta,
            color: theme.color.muted,
            marginBottom: theme.space[2],
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>💡</span>
          <span>Hỏi tiếp?</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.space[2] }}>
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => !disabled && onPick?.(q)}
              disabled={disabled}
              style={{
                textAlign: 'left',
                padding: `${theme.space[2]}px ${theme.space[3]}px`,
                borderRadius: theme.radius.lg,
                border: `1px solid ${theme.color.peachDeep}`,
                background: theme.color.white,
                color: theme.color.ink,
                fontFamily: theme.font.family,
                fontSize: theme.font.meta,
                lineHeight: 1.45,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                if (disabled) return;
                e.currentTarget.style.background = theme.color.peach;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = theme.color.white;
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
