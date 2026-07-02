/**
 * 根据标题生成 URL slug。
 * 优先使用英文标题（更可读），英文为空时回退到中文标题里的 ASCII 字符。
 *
 * 例：
 *   slugify('AI Growth Methodology') -> 'ai-growth-methodology'
 *   slugify('The Psychology of Wealth') -> 'the-psychology-of-wealth'
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-') // 非字母数字转连字符
    .replace(/^-+|-+$/g, '') // 去除首尾连字符
    .replace(/-{2,}/g, '-'); // 合并连续连字符
}

/**
 * 从中/英文标题派生 slug。
 * - 英文标题优先
 * - 若结果为空（如纯中文且无英文），生成带时间戳的兜底 slug
 */
export function generateSlug(titleEn: string, title: string): string {
  const fromEn = slugify(titleEn);
  if (fromEn) return fromEn;
  const fromTitle = slugify(title);
  if (fromTitle) return fromTitle;
  return `article-${Date.now().toString(36)}`;
}
