export const SITE = {
  name: '1flowbase',
  repository: 'https://github.com/taichuy/1flowbase',
  websiteRepository: 'https://github.com/taichuy/1flowbase_website',
  wiki: 'https://github.com/taichuy/1flowbase/wiki',
  issues: 'https://github.com/taichuy/1flowbase/issues',
  license: 'Apache-2.0',
  defaultDescription:
    'Publish observable multi-model workflows as OpenAI- and Claude-compatible virtual model endpoints for local AI agents.',
} as const;

export type Locale = 'en' | 'zh';

export const localePath = (locale: Locale, path = '/') => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return locale === 'zh' ? `/zh${normalized === '/' ? '/' : normalized}` : normalized;
};
