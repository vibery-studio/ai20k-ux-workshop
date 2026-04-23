import { theme } from '../styles/theme.js';

export default function TopicTag({ label }) {
  return (
    <span
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
      {label}
    </span>
  );
}
