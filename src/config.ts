export const SITE = {
  name: '1flowbase',
  repository: 'https://github.com/taichuy/1flowbase',
  websiteRepository: 'https://github.com/taichuy/1flowbase_website',
  websiteDirectory: 'https://github.com/taichuy/1flowbase_website/wiki',
  blogDirectory: 'https://github.com/taichuy/1flowbase_website/wiki#blog-directory',
  docsDirectory: '/docs/',
  docsSourceDirectory: 'https://github.com/taichuy/1flowbase_website/wiki/Documentation-Directory',
  wiki: 'https://github.com/taichuy/1flowbase/wiki',
  issues: 'https://github.com/taichuy/1flowbase/issues',
  license: 'Apache-2.0',
  defaultDescription:
    'An open-source, self-hosted AI Gateway and application runtime. Compose models, retain conversation data, and build workflows, APIs and React apps.',
} as const;

export type Locale = 'en' | 'zh';

export const localePath = (locale: Locale, path = '/') => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return locale === 'zh' ? `/zh${normalized === '/' ? '/' : normalized}` : normalized;
};
