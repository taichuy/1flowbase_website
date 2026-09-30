// A bilingual estimate, not a measurement of reader behavior. No client tracking.
export function readingMinutes(body = ''): number {
  const prose = body.replace(/```[\s\S]*?```/g, '').replace(/\[[^\]]*\]\([^)]*\)/g, match => match.slice(1, match.indexOf(']')));
  const chineseCharacters = (prose.match(/[\u3400-\u9fff]/g) ?? []).length;
  const words = prose.replace(/[\u3400-\u9fff]/g, ' ').match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(chineseCharacters / 400 + words / 220));
}

export function formatPostDate(date: Date, lang: 'en' | 'zh'): string {
  return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}
