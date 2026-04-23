import { theme } from '../../styles/theme.js';
import ConfidenceBar from './ConfidenceBar.jsx';
import CitationCard from '../CitationCard.jsx';

export default function QuestionDetail({
  item,
  isReviewed,
  onToggleReview,
  onRemoveFlag,
  removingFlag,
}) {
  if (!item) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.color.muted,
          fontSize: theme.font.meta,
          fontStyle: 'italic',
          padding: theme.space[8],
        }}
      >
        Chọn 1 câu hỏi ở bên trái để xem chi tiết.
      </div>
    );
  }

  const q = item.question;
  const a = item.answer;
  const flag = item.flag;

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: `${theme.space[6]}px ${theme.space[8]}px`,
        background: theme.color.white,
      }}
    >
      <div style={{ fontSize: theme.font.small, color: theme.color.muted, marginBottom: theme.space[2] }}>
        HS · {q.session_id.slice(0, 10)} · {new Date(q.created_at).toLocaleString('vi-VN')}
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: theme.font.h2,
          fontWeight: 600,
          color: theme.color.ink,
          lineHeight: 1.4,
        }}
      >
        {q.text}
      </h2>

      {flag && (
        <div
          style={{
            marginTop: theme.space[5],
            padding: theme.space[4],
            borderRadius: theme.radius.md,
            background: '#FDECEC',
            border: `1px solid ${theme.color.coral}`,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.space[2],
          }}
        >
          <div style={{ color: theme.color.coral, fontWeight: 600, fontSize: theme.font.meta }}>
            ⚑ Học sinh đã báo câu này chưa đúng
          </div>
          {flag.reason && (
            <div style={{ fontSize: theme.font.meta, color: theme.color.ink, fontStyle: 'italic' }}>
              "{flag.reason}"
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={onRemoveFlag}
              disabled={removingFlag}
              style={{
                marginTop: theme.space[1],
                padding: `${theme.space[2]}px ${theme.space[4]}px`,
                borderRadius: theme.radius.full,
                border: `1px solid ${theme.color.coral}`,
                background: theme.color.white,
                color: theme.color.coral,
                fontWeight: 600,
                fontSize: theme.font.small,
                cursor: removingFlag ? 'not-allowed' : 'pointer',
                opacity: removingFlag ? 0.6 : 1,
              }}
            >
              {removingFlag ? 'Đang xóa…' : 'Xóa flag'}
            </button>
          </div>
        </div>
      )}

      {!a ? (
        <div
          style={{
            marginTop: theme.space[6],
            padding: theme.space[5],
            borderRadius: theme.radius.md,
            background: '#FDECEC',
            border: `1px solid ${theme.color.coral}`,
            color: theme.color.ink,
          }}
        >
          <div style={{ fontWeight: 600, color: theme.color.coral, marginBottom: theme.space[2] }}>
            Lỗi AI — chưa có câu trả lời
          </div>
          <div style={{ fontSize: theme.font.meta, color: theme.color.muted }}>
            Classification của LLM thất bại với câu hỏi này. Giáo viên cần review thủ công hoặc yêu cầu HS hỏi lại rõ hơn.
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              marginTop: theme.space[6],
              padding: theme.space[5],
              borderRadius: theme.radius.md,
              background: theme.color.cream,
              border: `1px solid ${theme.color.border}`,
            }}
          >
            <div
              style={{
                fontSize: theme.font.small,
                fontWeight: 600,
                color: theme.color.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: theme.space[2],
              }}
            >
              Câu trả lời AI
            </div>
            <div
              style={{
                fontSize: theme.font.chat,
                color: theme.color.ink,
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
              }}
            >
              {a.text}
            </div>
          </div>

          <div
            style={{
              marginTop: theme.space[5],
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: theme.space[5],
            }}
          >
            <div>
              <div
                style={{
                  fontSize: theme.font.small,
                  fontWeight: 600,
                  color: theme.color.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: theme.space[2],
                }}
              >
                Chủ đề AI tag
              </div>
              <div>
                {(a.topics || []).map(t => (
                  <span
                    key={t}
                    style={{
                      display: 'inline-block',
                      padding: `${theme.space[1]}px ${theme.space[3]}px`,
                      borderRadius: theme.radius.full,
                      background: theme.color.mint,
                      color: theme.color.ink,
                      fontSize: theme.font.meta,
                      fontWeight: 500,
                      margin: `0 ${theme.space[2]}px ${theme.space[2]}px 0`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: theme.font.small,
                  fontWeight: 600,
                  color: theme.color.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: theme.space[2],
                }}
              >
                Độ tin cậy
              </div>
              <ConfidenceBar score={a.confidence ?? 0} />
            </div>
          </div>

          {a.reasoning && (
            <div
              style={{
                marginTop: theme.space[5],
                padding: theme.space[4],
                borderRadius: theme.radius.md,
                background: theme.color.white,
                border: `1px dashed ${theme.color.border}`,
              }}
            >
              <div
                style={{
                  fontSize: theme.font.small,
                  fontWeight: 600,
                  color: theme.color.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: theme.space[2],
                }}
              >
                Lập luận của AI
              </div>
              <div style={{ fontSize: theme.font.meta, color: theme.color.ink, lineHeight: 1.6, fontStyle: 'italic' }}>
                {a.reasoning}
              </div>
            </div>
          )}

          {(a.citations || []).length > 0 && (
            <div style={{ marginTop: theme.space[6] }}>
              <div
                style={{
                  fontSize: theme.font.small,
                  fontWeight: 600,
                  color: theme.color.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: theme.space[3],
                }}
              >
                Tham khảo AI sinh · {a.citations.length}
              </div>
              {a.citations.map((c, i) => (
                <CitationCard key={i} citation={c} />
              ))}
            </div>
          )}

          {a.meta && (
            <div
              style={{
                marginTop: theme.space[5],
                fontSize: theme.font.small,
                color: theme.color.muted,
              }}
            >
              {a.meta.model} · {a.meta.latency_ms}ms · {a.meta.word_count} từ
            </div>
          )}
        </>
      )}

      <div
        style={{
          marginTop: theme.space[7],
          paddingTop: theme.space[5],
          borderTop: `1px solid ${theme.color.border}`,
          display: 'flex',
          gap: theme.space[3],
        }}
      >
        <button
          type="button"
          onClick={onToggleReview}
          style={{
            padding: `${theme.space[2]}px ${theme.space[5]}px`,
            borderRadius: theme.radius.full,
            border: `1px solid ${isReviewed ? theme.color.mintDeep : theme.color.border}`,
            background: isReviewed ? theme.color.mint : theme.color.white,
            color: theme.color.ink,
            fontWeight: 600,
            fontSize: theme.font.meta,
            cursor: 'pointer',
          }}
        >
          {isReviewed ? '✓ Đã review — bỏ đánh dấu' : 'Đánh dấu đã review'}
        </button>
      </div>
    </div>
  );
}
