import { useEffect, useState } from 'react';
import { theme } from '../styles/theme.js';

export default function FlagModal({ open, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  if (!open) return null;

  const submit = () => {
    onSubmit(reason.trim());
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(45, 49, 66, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: theme.space[4],
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.color.white,
          borderRadius: theme.radius.xl,
          padding: theme.space[6],
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 8px 32px rgba(45, 49, 66, 0.15)',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: theme.space[3] }}>📛</div>
        <div style={{ fontSize: theme.font.h2, fontWeight: 700, color: theme.color.ink, marginBottom: theme.space[2] }}>
          Báo câu trả lời chưa đúng
        </div>
        <div style={{ fontSize: theme.font.meta, color: theme.color.muted, marginBottom: theme.space[4], lineHeight: 1.5 }}>
          Giáo viên sẽ xem lại câu này. Bạn có thể nói ngắn gọn vì sao bạn nghĩ nó sai (không bắt buộc).
        </div>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="VD: sai thông tin về tác giả, chưa phân tích đúng nhân vật…"
          rows={3}
          style={{
            width: '100%',
            padding: `${theme.space[3]}px ${theme.space[4]}px`,
            borderRadius: theme.radius.lg,
            border: `1px solid ${theme.color.border}`,
            background: theme.color.cream,
            color: theme.color.ink,
            fontFamily: theme.font.family,
            fontSize: theme.font.base,
            lineHeight: 1.45,
            outline: 'none',
            resize: 'vertical',
            marginBottom: theme.space[4],
          }}
        />
        <div style={{ display: 'flex', gap: theme.space[3], justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: `${theme.space[3]}px ${theme.space[5]}px`,
              borderRadius: theme.radius.full,
              border: `1px solid ${theme.color.border}`,
              background: theme.color.white,
              color: theme.color.ink,
              fontFamily: theme.font.family,
              fontSize: theme.font.base,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            style={{
              padding: `${theme.space[3]}px ${theme.space[5]}px`,
              borderRadius: theme.radius.full,
              border: 'none',
              background: theme.color.coral,
              color: theme.color.white,
              fontFamily: theme.font.family,
              fontSize: theme.font.base,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Đang gửi…' : 'Gửi báo cáo'}
          </button>
        </div>
      </div>
    </div>
  );
}
