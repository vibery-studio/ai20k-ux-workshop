import { theme } from '../styles/theme.js';

const DIACRITIC = /[àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

export function computeWarnings(text) {
  const trimmed = (text || '').trim();
  const warnings = [];
  if (!trimmed) return warnings;
  if (trimmed.length < 8) {
    warnings.push({
      key: 'short',
      icon: '💭',
      text: 'Câu ngắn quá — AI sẽ đoán mò. Thêm tên tác phẩm / nhân vật cụ thể nhé.',
    });
  }
  if (!DIACRITIC.test(trimmed)) {
    warnings.push({
      key: 'no-diacritic',
      icon: '⚠️',
      text: 'Câu hỏi không dấu — AI trả lời sẽ kém chính xác hơn.',
    });
  }
  return warnings;
}

export default function InputWarnings({ warnings }) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div style={{ padding: `0 ${theme.space[4]}px ${theme.space[3]}px`, background: theme.color.white }}>
      {warnings.map(w => (
        <div
          key={w.key}
          style={{
            display: 'flex',
            gap: theme.space[2],
            alignItems: 'flex-start',
            padding: `${theme.space[2]}px ${theme.space[3]}px`,
            borderRadius: theme.radius.md,
            background: theme.color.peach,
            color: theme.color.ink,
            fontSize: theme.font.meta,
            marginBottom: theme.space[2],
          }}
        >
          <span>{w.icon}</span>
          <span>{w.text}</span>
        </div>
      ))}
    </div>
  );
}
