import { useRef, useState } from 'react';
import { theme } from '../../styles/theme.js';
import { useTeacher } from '../../hooks/useTeacher.js';
import FilterToolbar from './FilterToolbar.jsx';
import QueueSidebar from './QueueSidebar.jsx';
import QuestionDetail from './QuestionDetail.jsx';
import { undoFlag as undoFlagApi } from '../../api/chat.js';

export default function TeacherView() {
  const t = useTeacher();
  const [toast, setToast] = useState(null);
  const [removingFlag, setRemovingFlag] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = (payload, ms = 6000) => {
    setToast(payload);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), ms);
  };

  const handleToggleReview = () => {
    if (!t.selected) return;
    const id = t.selected.question.id;
    const was = t.reviewed.has(id);
    if (was) {
      t.unmarkReviewed(id);
      showToast({ kind: 'review-undo', text: 'Đã bỏ đánh dấu review', id });
    } else {
      t.markReviewed(id);
      showToast({ kind: 'review-done', text: 'Đã đánh dấu review · Hoàn tác?', id });
    }
  };

  const handleUndoReview = () => {
    if (!toast) return;
    if (toast.kind === 'review-done') t.unmarkReviewed(toast.id);
    else if (toast.kind === 'review-undo') t.markReviewed(toast.id);
    setToast(null);
    clearTimeout(toastTimerRef.current);
  };

  const handleRemoveFlag = async () => {
    if (!t.selected?.flag) return;
    const flag = t.selected.flag;
    const qid = t.selected.question.id;
    setRemovingFlag(true);
    try {
      await undoFlagApi(flag.id);
      t.removeFlagLocal(qid);
      showToast({ kind: 'flag-removed', text: 'Đã xóa flag · Hoàn tác?', qid, flag });
    } catch (err) {
      showToast({ kind: 'plain', text: 'Không xóa được: ' + (err.message || 'lỗi') }, 4000);
    } finally {
      setRemovingFlag(false);
    }
  };

  const handleUndoRemoveFlag = () => {
    if (toast?.kind !== 'flag-removed') return;
    t.restoreFlagLocal(toast.qid, toast.flag);
    setToast(null);
    clearTimeout(toastTimerRef.current);
    showToast({ kind: 'plain', text: 'Flag đã khôi phục cục bộ (không gọi lại server)' }, 3500);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.color.cream, minWidth: 0 }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: `${theme.space[5]}px ${theme.space[7]}px`,
          background: theme.color.white,
          borderBottom: `1px solid ${theme.color.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: theme.space[4],
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: theme.color.ink }}>
            Dashboard giáo viên — Ngữ văn 10
          </div>
          <div style={{ fontSize: theme.font.meta, color: theme.color.muted, marginTop: 2 }}>
            {t.counts.total} câu · {t.counts.flagged} đã flag · {t.counts.lowConf} confidence thấp
            {t.counts.failed > 0 && ` · ${t.counts.failed} lỗi AI`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: theme.space[2] }}>
          <a
            href="#/"
            style={{
              padding: `${theme.space[2]}px ${theme.space[4]}px`,
              borderRadius: theme.radius.full,
              background: theme.color.white,
              border: `1px solid ${theme.color.border}`,
              color: theme.color.ink,
              fontSize: theme.font.meta,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            ← Về chế độ học sinh
          </a>
          <button
            type="button"
            onClick={t.reload}
            style={{
              padding: `${theme.space[2]}px ${theme.space[4]}px`,
              borderRadius: theme.radius.full,
              border: `1px solid ${theme.color.border}`,
              background: theme.color.white,
              color: theme.color.ink,
              fontSize: theme.font.meta,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            ↻ Tải lại
          </button>
        </div>
      </div>

      <FilterToolbar
        topicFilter={t.topicFilter}
        onTopicChange={t.setTopicFilter}
        flagFilter={t.flagFilter}
        onFlagChange={t.setFlagFilter}
        search={t.search}
        onSearchChange={t.setSearch}
      />

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <aside
          style={{
            width: 360,
            flexShrink: 0,
            overflow: 'auto',
            borderRight: `1px solid ${theme.color.border}`,
            background: theme.color.white,
          }}
        >
          {t.loading ? (
            <div style={{ padding: theme.space[6], color: theme.color.muted, fontSize: theme.font.meta }}>
              Đang tải danh sách…
            </div>
          ) : t.error ? (
            <div
              style={{
                margin: theme.space[5],
                padding: theme.space[4],
                borderRadius: theme.radius.md,
                background: '#FDECEC',
                border: `1px solid ${theme.color.coral}`,
                color: theme.color.ink,
                fontSize: theme.font.meta,
              }}
            >
              <div style={{ fontWeight: 600, color: theme.color.coral, marginBottom: theme.space[2] }}>
                Không tải được danh sách
              </div>
              <div style={{ marginBottom: theme.space[3], color: theme.color.muted }}>{t.error}</div>
              <button
                type="button"
                onClick={t.reload}
                style={{
                  padding: `${theme.space[2]}px ${theme.space[4]}px`,
                  borderRadius: theme.radius.full,
                  border: `1px solid ${theme.color.coral}`,
                  background: theme.color.white,
                  color: theme.color.coral,
                  fontWeight: 600,
                  fontSize: theme.font.small,
                  cursor: 'pointer',
                }}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <QueueSidebar
              items={t.capped}
              selectedId={t.selected?.question?.id}
              onSelect={t.setSelectedId}
              reviewedIds={t.reviewed}
              truncated={t.truncated}
              totalFiltered={t.filtered.length}
            />
          )}
        </aside>

        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: theme.color.white }}>
          <QuestionDetail
            item={t.selected}
            isReviewed={t.selected ? t.reviewed.has(t.selected.question.id) : false}
            onToggleReview={handleToggleReview}
            onRemoveFlag={handleRemoveFlag}
            removingFlag={removingFlag}
          />
        </section>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: theme.color.ink,
            color: theme.color.white,
            padding: '12px 20px',
            borderRadius: theme.radius.full,
            fontSize: theme.font.meta,
            zIndex: 200,
            boxShadow: '0 4px 16px rgba(45, 49, 66, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span>{toast.text}</span>
          {(toast.kind === 'review-done' || toast.kind === 'review-undo') && (
            <button
              type="button"
              onClick={handleUndoReview}
              style={{
                background: 'transparent',
                color: theme.color.mint,
                border: 'none',
                fontFamily: 'inherit',
                fontSize: theme.font.meta,
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Hoàn tác
            </button>
          )}
          {toast.kind === 'flag-removed' && (
            <button
              type="button"
              onClick={handleUndoRemoveFlag}
              style={{
                background: 'transparent',
                color: theme.color.mint,
                border: 'none',
                fontFamily: 'inherit',
                fontSize: theme.font.meta,
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
