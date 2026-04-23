import { useEffect, useRef, useState } from 'react';
import { theme } from '../styles/theme.js';
import InputWarnings, { computeWarnings } from './InputWarnings.jsx';

export default function ChatInput({ onSend, disabled, focusToken }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const warnings = computeWarnings(value);

  useEffect(() => {
    if (focusToken != null && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [focusToken]);

  const submit = (e) => {
    e?.preventDefault();
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div style={{ borderTop: `1px solid ${theme.color.border}`, background: theme.color.white }}>
      <InputWarnings warnings={warnings} />
    <form
      onSubmit={submit}
      style={{
        display: 'flex',
        gap: theme.space[3],
        padding: theme.space[4],
        background: theme.color.white,
        alignItems: 'flex-end',
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Bạn muốn hỏi gì về Ngữ văn? VD: Phân tích nhân vật Chí Phèo…"
        rows={2}
        style={{
          flex: 1,
          resize: 'none',
          padding: `${theme.space[3]}px ${theme.space[4]}px`,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.color.border}`,
          background: theme.color.cream,
          color: theme.color.ink,
          fontFamily: theme.font.family,
          fontSize: theme.font.chat,
          lineHeight: 1.45,
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        style={{
          padding: `${theme.space[3]}px ${theme.space[5]}px`,
          borderRadius: theme.radius.full,
          border: 'none',
          background: disabled || !value.trim() ? theme.color.border : theme.color.mintDeep,
          color: theme.color.white,
          fontFamily: theme.font.family,
          fontSize: theme.font.base,
          fontWeight: 600,
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          height: 52,
          whiteSpace: 'nowrap',
        }}
      >
        Gửi ✨
      </button>
    </form>
    </div>
  );
}
