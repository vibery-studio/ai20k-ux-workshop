import { useState } from 'react';
import { theme, confidenceColor, confidenceLabel } from '../styles/theme.js';
import TopicTag from './TopicTag.jsx';
import CitationCard from './CitationCard.jsx';

function SectionHeader({ icon, label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.space[2],
        marginBottom: theme.space[3],
        fontSize: theme.font.base,
        fontWeight: 700,
        color: theme.color.ink,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      {label}
    </div>
  );
}

export default function ContextPanel({ latestAnswer }) {
  const meta = latestAnswer?.meta;
  const [reasoningOpen, setReasoningOpen] = useState(false);

  return (
    <aside
      style={{
        flex: '0 0 40%',
        maxWidth: 440,
        minWidth: 320,
        background: theme.color.white,
        borderLeft: `1px solid ${theme.color.border}`,
        overflowY: 'auto',
        padding: theme.space[5],
      }}
    >
      {!meta && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: theme.color.muted,
            padding: theme.space[5],
          }}
        >
          <div style={{ fontSize: 40, marginBottom: theme.space[3] }}>🧭</div>
          <div style={{ fontSize: theme.font.base, color: theme.color.ink, fontWeight: 600, marginBottom: theme.space[2] }}>
            Panel tham khảo
          </div>
          <div style={{ fontSize: theme.font.meta, lineHeight: 1.5, maxWidth: 260 }}>
            Hỏi 1 câu để xem chủ đề, độ tin cậy, và nguồn tham khảo liên quan.
          </div>
        </div>
      )}

      {meta && (
        <>
          <div style={{ marginBottom: theme.space[6] }}>
            <SectionHeader icon="📚" label="Chủ đề" />
            <div>
              {meta.topics.map(t => <TopicTag key={t} label={t} />)}
            </div>
          </div>

          <div style={{ marginBottom: theme.space[6] }}>
            <SectionHeader icon="💡" label="Độ tin cậy" />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[3],
                padding: theme.space[4],
                borderRadius: theme.radius.lg,
                background: theme.color.cream,
                border: `1px solid ${theme.color.border}`,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: theme.radius.full,
                  background: confidenceColor(meta.confidence),
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: theme.font.h2, fontWeight: 700, color: theme.color.ink, lineHeight: 1 }}>
                  {meta.confidence}<span style={{ fontSize: theme.font.meta, color: theme.color.muted, fontWeight: 400 }}> / 100</span>
                </div>
                <div style={{ fontSize: theme.font.meta, color: theme.color.muted, marginTop: 2 }}>
                  {confidenceLabel(meta.confidence)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: theme.space[6] }}>
            <SectionHeader icon="📖" label="Tham khảo" />
            {meta.citations.map((c, i) => <CitationCard key={i} citation={c} />)}
          </div>

          {meta.reasoning && (
            <div>
              <button
                onClick={() => setReasoningOpen(o => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.space[2],
                  width: '100%',
                  padding: theme.space[3],
                  borderRadius: theme.radius.lg,
                  border: `1px solid ${theme.color.border}`,
                  background: reasoningOpen ? theme.color.cream : theme.color.white,
                  color: theme.color.ink,
                  fontFamily: theme.font.family,
                  fontSize: theme.font.base,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 18 }}>🧠</span>
                <span style={{ flex: 1 }}>AI đã nghĩ gì</span>
                <span style={{ fontSize: theme.font.meta, color: theme.color.muted }}>
                  {reasoningOpen ? '▾' : '▸'}
                </span>
              </button>
              {reasoningOpen && (
                <div
                  style={{
                    marginTop: theme.space[2],
                    padding: theme.space[4],
                    borderRadius: theme.radius.lg,
                    background: theme.color.cream,
                    border: `1px dashed ${theme.color.border}`,
                    fontSize: theme.font.meta,
                    color: theme.color.ink,
                    lineHeight: 1.55,
                    fontStyle: 'italic',
                  }}
                >
                  {meta.reasoning}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
}
