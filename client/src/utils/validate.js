export const FIXED_TOPICS = [
  'Thơ cách mạng',
  'Văn học dân gian',
  'Nghị luận xã hội',
  'Nhân vật và tác phẩm',
  'Thể loại và phong cách',
  'Ngữ pháp và viết',
];

export function sanitizeTopics(topics) {
  if (!Array.isArray(topics)) return [];
  return topics.filter(t => FIXED_TOPICS.includes(t)).slice(0, 4);
}
