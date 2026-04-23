import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import TypingStatus from './TypingStatus.jsx';
import FollowUpChips from './FollowUpChips.jsx';
import { theme } from '../styles/theme.js';

export default function ChatView({
  messages,
  pending,
  error,
  onSend,
  onRetry,
  onRetryShort,
  onClearError,
  onClear,
  onFlag,
  onStop,
  onEditLast,
  focusToken,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  return (
    <section
      style={{
        flex: '1 1 60%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        background: theme.color.cream,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.space[3],
          padding: `${theme.space[4]}px ${theme.space[5]}px`,
          borderBottom: `1px solid ${theme.color.border}`,
          background: theme.color.white,
        }}
      >
        <span style={{ fontSize: 24 }}>📖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: theme.font.h2, fontWeight: 700, color: theme.color.ink }}>
            Ngữ văn 10 — Gia sư AI
          </div>
          <div style={{ fontSize: theme.font.meta, color: theme.color.muted }}>
            Hỏi bài, phân tích tác phẩm, luyện viết nghị luận
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            style={{
              padding: `${theme.space[2]}px ${theme.space[3]}px`,
              borderRadius: theme.radius.full,
              border: `1px solid ${theme.color.border}`,
              background: theme.color.white,
              color: theme.color.muted,
              fontFamily: theme.font.family,
              fontSize: theme.font.meta,
              cursor: 'pointer',
            }}
          >
            Xóa hội thoại
          </button>
        )}
        <a
          href="#/teacher"
          style={{
            padding: `${theme.space[2]}px ${theme.space[3]}px`,
            borderRadius: theme.radius.full,
            border: `1px solid ${theme.color.border}`,
            background: theme.color.white,
            color: theme.color.ink,
            fontSize: theme.font.meta,
            textDecoration: 'none',
          }}
        >
          Dashboard giáo viên →
        </a>
      </header>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${theme.space[5]}px ${theme.space[5]}px ${theme.space[4]}px`,
        }}
      >
        {messages.length === 0 && !pending && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: theme.color.muted,
              padding: theme.space[6],
            }}
          >
            <div style={{ fontSize: 48, marginBottom: theme.space[3] }}>✨</div>
            <div style={{ fontSize: theme.font.h2, color: theme.color.ink, fontWeight: 600 }}>
              Chào! Bạn muốn hỏi gì về Ngữ văn?
            </div>
            <div style={{ marginTop: theme.space[2], maxWidth: 420, lineHeight: 1.5 }}>
              Gõ câu hỏi bên dưới — ví dụ "Phân tích nhân vật Chí Phèo",
              "Thế nào là thơ cách mạng", hoặc "Mở bài nghị luận xã hội viết sao cho hay".
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isLastUser =
            m.role === 'user' &&
            i === messages.length - 1 - [...messages].reverse().findIndex(x => x.role === 'user');
          return (
            <MessageBubble
              key={i}
              message={m}
              onFlag={onFlag}
              canEdit={isLastUser && !pending}
              onEdit={onEditLast}
            />
          );
        })}

        {!pending && messages.length > 0 &&
          messages[messages.length - 1].role === 'assistant' &&
          messages[messages.length - 1].meta?.follow_up_questions?.length > 0 && (
            <FollowUpChips
              questions={messages[messages.length - 1].meta.follow_up_questions}
              onPick={onSend}
              disabled={pending}
            />
          )}

        {pending && <TypingStatus onStop={onStop} />}

        {error && !pending && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: theme.space[4],
            }}
          >
            <div
              style={{
                padding: `${theme.space[3]}px ${theme.space[4]}px`,
                borderRadius: theme.radius.lg,
                background: '#FFEDED',
                border: `1px solid ${theme.color.coral}`,
                color: theme.color.ink,
                maxWidth: '78%',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: theme.space[1] }}>
                ⚠️ Không gửi được câu hỏi
              </div>
              <div style={{ fontSize: theme.font.meta, color: theme.color.muted, marginBottom: theme.space[2] }}>
                {error}
              </div>
              <div style={{ fontSize: theme.font.small, color: theme.color.muted, marginBottom: theme.space[3], fontStyle: 'italic' }}>
                💡 Gemini đang quá tải — thường hết sau 5-10 giây.
              </div>
              <div style={{ display: 'flex', gap: theme.space[2], flexWrap: 'wrap' }}>
                <button
                  onClick={onRetry}
                  style={{
                    padding: `${theme.space[2]}px ${theme.space[3]}px`,
                    borderRadius: theme.radius.full,
                    border: 'none',
                    background: theme.color.coral,
                    color: theme.color.white,
                    fontFamily: theme.font.family,
                    fontSize: theme.font.meta,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🔄 Thử lại
                </button>
                <button
                  onClick={onRetryShort}
                  style={{
                    padding: `${theme.space[2]}px ${theme.space[3]}px`,
                    borderRadius: theme.radius.full,
                    border: `1px solid ${theme.color.coral}`,
                    background: theme.color.white,
                    color: theme.color.coral,
                    fontFamily: theme.font.family,
                    fontSize: theme.font.meta,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ✂️ Rút gọn câu hỏi
                </button>
                <button
                  onClick={onClearError}
                  style={{
                    padding: `${theme.space[2]}px ${theme.space[3]}px`,
                    borderRadius: theme.radius.full,
                    border: `1px solid ${theme.color.border}`,
                    background: theme.color.white,
                    color: theme.color.ink,
                    fontFamily: theme.font.family,
                    fontSize: theme.font.meta,
                    cursor: 'pointer',
                  }}
                >
                  💬 Hỏi khác
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatInput onSend={onSend} disabled={pending} focusToken={focusToken} />
    </section>
  );
}
