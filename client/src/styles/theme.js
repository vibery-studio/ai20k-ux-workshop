export const theme = {
  color: {
    mint: '#A7E8BD',
    mintDeep: '#6FCF97',
    peach: '#FFD4B8',
    peachDeep: '#F4A582',
    cream: '#FFF9F0',
    ink: '#2D3142',
    coral: '#F47B7B',
    muted: '#8A8D98',
    border: '#E8E4D8',
    white: '#FFFFFF',
    yellow: '#F5C84B',
    green: '#6FCF97',
    red: '#F47B7B',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 },
  space: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48],
  font: {
    base: 16,
    chat: 17,
    meta: 13,
    small: 12,
    h2: 20,
    family: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  shadow: {
    card: '0 1px 2px rgba(45, 49, 66, 0.04)',
  },
};

export function confidenceColor(score) {
  if (score >= 70) return theme.color.green;
  if (score >= 40) return theme.color.yellow;
  return theme.color.red;
}

export function confidenceLabel(score) {
  if (score >= 80) return 'Rất chắc chắn';
  if (score >= 60) return 'Khá chắc chắn';
  if (score >= 40) return 'Tương đối';
  return 'Chưa chắc — học sinh nên đối chiếu thêm';
}
