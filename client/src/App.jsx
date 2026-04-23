import { useEffect, useRef, useState } from 'react';
import ChatView from './components/ChatView.jsx';
import ContextPanel from './components/ContextPanel.jsx';
import FlagModal from './components/FlagModal.jsx';
import TeacherView from './components/teacher/TeacherView.jsx';
import { useChat } from './hooks/useChat.js';
import { useHashRoute } from './hooks/useHashRoute.js';
import { flagAnswer, undoFlag } from './api/chat.js';

export default function App() {
  const route = useHashRoute();
  if (route === 'teacher') {
    return (
      <div style={{ display: 'flex', height: '100%' }}>
        <TeacherView />
      </div>
    );
  }
  return <StudentApp />;
}

function StudentApp() {
  const {
    messages,
    pending,
    error,
    ask,
    retry,
    retryShort,
    clearError,
    clear,
    stop,
    editLastAndResend,
    latestAnswer,
  } = useChat();
  const [flagTarget, setFlagTarget] = useState(null);
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [focusToken, setFocusToken] = useState(0);
  const toastTimerRef = useRef(null);

  const showToast = (payload, ms = 3000) => {
    setToast(payload);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), ms);
  };

  const openFlag = (message) => {
    if (!message?.meta?.answer_id) return;
    setFlagTarget(message);
  };

  const handleClearError = () => {
    clearError();
    setFocusToken(t => t + 1);
  };

  useEffect(() => {
    const handler = (e) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        clear();
      }
      if (e.key === 'Escape' && pending) {
        e.preventDefault();
        stop();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [clear, stop, pending]);

  const submitFlag = async (reason) => {
    if (!flagTarget) return;
    setFlagSubmitting(true);
    try {
      const { flag_id } = await flagAnswer({ answer_id: flagTarget.meta.answer_id, reason });
      setFlagTarget(null);
      showToast({ kind: 'flag-ok', text: 'Đã báo cho giáo viên — cảm ơn bạn!', flag_id }, 10000);
    } catch (err) {
      showToast({ kind: 'plain', text: 'Không gửi được: ' + (err.message || 'lỗi') }, 3500);
    } finally {
      setFlagSubmitting(false);
    }
  };

  const handleUndoFlag = async () => {
    if (toast?.kind !== 'flag-ok' || !toast.flag_id) return;
    const fid = toast.flag_id;
    setToast(null);
    clearTimeout(toastTimerRef.current);
    try {
      await undoFlag(fid);
      showToast({ kind: 'plain', text: 'Đã bỏ báo cáo' }, 2500);
    } catch (err) {
      showToast({ kind: 'plain', text: 'Không hoàn tác được: ' + (err.message || 'lỗi') }, 3500);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <ChatView
        messages={messages}
        pending={pending}
        error={error}
        onSend={ask}
        onRetry={retry}
        onRetryShort={retryShort}
        onClearError={handleClearError}
        onClear={clear}
        onFlag={openFlag}
        onStop={stop}
        onEditLast={editLastAndResend}
        focusToken={focusToken}
      />
      <ContextPanel latestAnswer={latestAnswer} />

      <FlagModal
        open={!!flagTarget}
        onClose={() => !flagSubmitting && setFlagTarget(null)}
        onSubmit={submitFlag}
        submitting={flagSubmitting}
      />

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2D3142',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 9999,
            fontSize: 14,
            zIndex: 200,
            boxShadow: '0 4px 16px rgba(45, 49, 66, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span>{toast.text}</span>
          {toast.kind === 'flag-ok' && (
            <button
              onClick={handleUndoFlag}
              style={{
                background: 'transparent',
                color: '#A7E8BD',
                border: 'none',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Hoàn tác
            </button>
          )}
        </div>
      )}
    </div>
  );
}
