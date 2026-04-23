import { theme } from '../../styles/theme.js';
import { confidenceColor, confidenceLabel } from '../../styles/theme.js';

export default function ConfidenceBar({ score }) {
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  const color = confidenceColor(pct);
  return (
    <div style={{ marginTop: theme.space[3] }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.space[1],
          fontSize: theme.font.small,
          color: theme.color.muted,
        }}
      >
        <span>Độ tin cậy · {confidenceLabel(pct)}</span>
        <span style={{ fontWeight: 600, color: theme.color.ink }}>{pct}%</span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: theme.radius.full,
          background: theme.color.border,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width 300ms ease',
          }}
        />
      </div>
    </div>
  );
}
