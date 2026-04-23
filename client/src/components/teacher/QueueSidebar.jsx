import { theme } from '../../styles/theme.js';

function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s trước`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}

export default function QueueSidebar({
  items,
  selectedId,
  onSelect,
  reviewedIds,
  truncated,
  totalFiltered,
}) {
  if (!items.length) {
    return (
      <div
        style={{
          padding: theme.space[6],
          color: theme.color.muted,
          fontSize: theme.font.meta,
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        Không có câu hỏi nào khớp bộ lọc.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {truncated && (
        <div
          style={{
            padding: `${theme.space[3]}px ${theme.space[5]}px`,
            background: theme.color.peach,
            color: theme.color.ink,
            fontSize: theme.font.small,
            borderBottom: `1px solid ${theme.color.border}`,
          }}
        >
          Hiển thị 50 câu đầu (lọc ra {totalFiltered}). Dùng filter topic để thu hẹp.
        </div>
      )}
      {items.map(it => {
        const q = it.question;
        const a = it.answer;
        const failed = !a;
        const low = a && (a.confidence ?? 100) < 60;
        const flagged = !!it.flag;
        const reviewed = reviewedIds.has(q.id);
        const selected = selectedId === q.id;
        const topTopic = a?.topics?.[0];

        let borderLeft = '3px solid transparent';
        if (failed) borderLeft = `3px solid ${theme.color.coral}`;
        else if (selected) borderLeft = `3px solid ${theme.color.ink}`;

        const lowOutline = low && !failed
          ? { boxShadow: `inset 0 0 0 2px ${theme.color.yellow}` }
          : null;

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelect(q.id)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              padding: `${theme.space[4]}px ${theme.space[5]}px`,
              borderBottom: `1px solid ${theme.color.border}`,
              background: selected ? theme.color.cream : theme.color.white,
              borderLeft,
              opacity: reviewed ? 0.55 : 1,
              display: 'block',
              boxSizing: 'border-box',
              ...(lowOutline || {}),
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: theme.space[2],
                marginBottom: theme.space[1],
              }}
            >
              <span style={{ fontSize: theme.font.small, color: theme.color.muted }}>
                HS · {q.session_id.slice(0, 6)}
              </span>
              <span style={{ fontSize: theme.font.small, color: theme.color.muted }}>
                {relativeTime(q.created_at)}
              </span>
            </div>
            <div
              style={{
                fontSize: theme.font.meta,
                color: theme.color.ink,
                lineHeight: 1.45,
                marginBottom: theme.space[2],
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {q.text}
            </div>
            <div style={{ display: 'flex', gap: theme.space[2], flexWrap: 'wrap', alignItems: 'center' }}>
              {failed ? (
                <span
                  style={{
                    padding: `2px ${theme.space[2]}px`,
                    borderRadius: theme.radius.full,
                    background: theme.color.coral,
                    color: theme.color.white,
                    fontSize: theme.font.small,
                    fontWeight: 600,
                  }}
                >
                  Lỗi AI — review thủ công
                </span>
              ) : topTopic ? (
                <span
                  style={{
                    padding: `2px ${theme.space[2]}px`,
                    borderRadius: theme.radius.full,
                    background: theme.color.mint,
                    color: theme.color.ink,
                    fontSize: theme.font.small,
                  }}
                >
                  {topTopic}
                </span>
              ) : null}
              {flagged && (
                <span
                  style={{
                    padding: `2px ${theme.space[2]}px`,
                    borderRadius: theme.radius.full,
                    background: theme.color.coral,
                    color: theme.color.white,
                    fontSize: theme.font.small,
                    fontWeight: 600,
                  }}
                >
                  ⚑ Đã flag
                </span>
              )}
              {low && !failed && (
                <span style={{ fontSize: theme.font.small, color: theme.color.yellow, fontWeight: 600 }}>
                  ⚠ Confidence thấp
                </span>
              )}
              {reviewed && (
                <span style={{ fontSize: theme.font.small, color: theme.color.mintDeep }}>
                  ✓ Đã review
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
