import { useState } from 'react';
import { theme, confidenceColor } from '../styles/theme.js';

export default function MessageBubble({ message, onFlag, canEdit, onEdit }) {
  const isUser = message.role === 'user';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const [hovering, setHovering] = useState(false);

  const startEdit = () => {
    setDraft(message.text);
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);
  const submitEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onEdit?.(trimmed);
    setEditing(false);
  };

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: theme.space[4],
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          padding: `${theme.space[3]}px ${theme.space[4]}px`,
          borderRadius: theme.radius.lg,
          background: isUser ? theme.color.peach : theme.color.white,
          border: isUser ? 'none' : `1px solid ${theme.color.border}`,
          color: theme.color.ink,
          fontSize: theme.font.chat,
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          position: 'relative',
        }}
      >
        {!editing && <div>{message.text}</div>}

        {editing && (
          <div>
            <textarea
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); }
                if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
              }}
              rows={2}
              style={{
                width: '100%',
                minWidth: 260,
                padding: `${theme.space[2]}px ${theme.space[3]}px`,
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.color.peachDeep}`,
                background: theme.color.white,
                color: theme.color.ink,
                fontFamily: theme.font.family,
                fontSize: theme.font.chat,
                lineHeight: 1.45,
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: theme.space[2], marginTop: theme.space[2], justifyContent: 'flex-end' }}>
              <button
                onClick={cancelEdit}
                style={{
                  padding: `${theme.space[1]}px ${theme.space[3]}px`,
                  borderRadius: theme.radius.full,
                  border: `1px solid ${theme.color.border}`,
                  background: theme.color.white,
                  color: theme.color.muted,
                  fontFamily: theme.font.family,
                  fontSize: theme.font.meta,
                  cursor: 'pointer',
                }}
              >
                Huỷ
              </button>
              <button
                onClick={submitEdit}
                style={{
                  padding: `${theme.space[1]}px ${theme.space[3]}px`,
                  borderRadius: theme.radius.full,
                  border: 'none',
                  background: theme.color.mintDeep,
                  color: theme.color.white,
                  fontFamily: theme.font.family,
                  fontSize: theme.font.meta,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Gửi lại
              </button>
            </div>
          </div>
        )}

        {isUser && canEdit && !editing && hovering && (
          <button
            onClick={startEdit}
            title="Sửa câu hỏi này"
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 28,
              height: 28,
              borderRadius: theme.radius.full,
              border: `1px solid ${theme.color.border}`,
              background: theme.color.white,
              color: theme.color.ink,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(45, 49, 66, 0.12)',
            }}
          >
            ✏️
          </button>
        )}

        {!isUser && message.meta && (
          <>
            <div
              style={{
                marginTop: theme.space[3],
                paddingTop: theme.space[3],
                borderTop: `1px dashed ${theme.color.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[3],
                fontSize: theme.font.meta,
                color: theme.color.muted,
                flexWrap: 'wrap',
              }}
            >
              <span
                title={`Độ tin cậy ${message.meta.confidence}/100`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: theme.radius.full,
                    background: confidenceColor(message.meta.confidence),
                    display: 'inline-block',
                  }}
                />
                {message.meta.confidence}/100
              </span>
              <button
                onClick={() => onFlag?.(message)}
                style={{
                  marginLeft: 'auto',
                  padding: `${theme.space[2]}px ${theme.space[3]}px`,
                  borderRadius: theme.radius.full,
                  border: `1px solid ${theme.color.border}`,
                  background: theme.color.cream,
                  color: theme.color.ink,
                  fontFamily: theme.font.family,
                  fontSize: theme.font.meta,
                  cursor: 'pointer',
                }}
              >
                📛 Câu này chưa đúng
              </button>
            </div>
            {(message.meta.latency_ms != null || message.meta.model || message.meta.word_count != null) && (
              <div
                style={{
                  marginTop: theme.space[2],
                  display: 'flex',
                  gap: theme.space[3],
                  fontSize: theme.font.small,
                  color: theme.color.muted,
                  flexWrap: 'wrap',
                }}
              >
                {message.meta.latency_ms != null && (
                  <span>⏱ {(message.meta.latency_ms / 1000).toFixed(1)}s</span>
                )}
                {message.meta.model && <span>🤖 {message.meta.model}</span>}
                {message.meta.word_count != null && <span>📝 {message.meta.word_count} từ</span>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
