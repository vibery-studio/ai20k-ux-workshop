import { theme } from '../../styles/theme.js';
import { FIXED_TOPICS } from '../../utils/validate.js';

const chipBase = {
  padding: `${theme.space[2]}px ${theme.space[4]}px`,
  borderRadius: theme.radius.full,
  fontSize: theme.font.meta,
  fontWeight: 500,
  cursor: 'pointer',
  border: `1px solid ${theme.color.border}`,
  background: theme.color.white,
  color: theme.color.ink,
  whiteSpace: 'nowrap',
};

const chipActive = {
  ...chipBase,
  background: theme.color.ink,
  color: theme.color.white,
  borderColor: theme.color.ink,
};

export default function FilterToolbar({
  topicFilter, onTopicChange,
  flagFilter, onFlagChange,
  search, onSearchChange,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.space[3],
        padding: `${theme.space[4]}px ${theme.space[6]}px`,
        borderBottom: `1px solid ${theme.color.border}`,
        background: theme.color.cream,
      }}
    >
      <div style={{ display: 'flex', gap: theme.space[2], flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onTopicChange('all')}
          style={topicFilter === 'all' ? chipActive : chipBase}
        >
          Tất cả
        </button>
        {FIXED_TOPICS.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => onTopicChange(t)}
            style={topicFilter === t ? chipActive : chipBase}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: theme.space[3], alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: theme.space[2], alignItems: 'center', fontSize: theme.font.meta, color: theme.color.ink }}>
          <span>Trạng thái:</span>
          <select
            value={flagFilter}
            onChange={e => onFlagChange(e.target.value)}
            style={{
              padding: `${theme.space[1]}px ${theme.space[3]}px`,
              borderRadius: theme.radius.sm,
              border: `1px solid ${theme.color.border}`,
              background: theme.color.white,
              fontSize: theme.font.meta,
              fontFamily: 'inherit',
              color: theme.color.ink,
            }}
          >
            <option value="all">Tất cả</option>
            <option value="flagged">Đã flag</option>
            <option value="unflagged">Chưa flag</option>
          </select>
        </label>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Tìm trong câu hỏi…"
          style={{
            flex: 1,
            minWidth: 200,
            padding: `${theme.space[2]}px ${theme.space[3]}px`,
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.color.border}`,
            background: theme.color.white,
            fontSize: theme.font.meta,
            fontFamily: 'inherit',
            color: theme.color.ink,
          }}
        />
      </div>
    </div>
  );
}
