import { theme } from '../styles/theme.js';

export default function CitationCard({ citation }) {
  return (
    <div
      style={{
        padding: theme.space[4],
        borderRadius: theme.radius.lg,
        background: theme.color.white,
        border: `1px solid ${theme.color.border}`,
        marginBottom: theme.space[3],
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: theme.font.base,
          color: theme.color.ink,
          marginBottom: theme.space[1],
        }}
      >
        {citation.source_name}
      </div>
      {citation.excerpt && (
        <div
          style={{
            fontSize: theme.font.meta,
            color: theme.color.ink,
            lineHeight: 1.5,
            marginBottom: theme.space[2],
            fontStyle: 'italic',
          }}
        >
          "{citation.excerpt}"
        </div>
      )}
      {citation.context && (
        <div style={{ fontSize: theme.font.small, color: theme.color.muted, marginBottom: theme.space[2] }}>
          {citation.context}
        </div>
      )}
      <div
        style={{
          fontSize: theme.font.small,
          color: theme.color.peachDeep,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        ⚠️ Tham khảo AI sinh — cần đối chiếu SGK
      </div>
    </div>
  );
}
