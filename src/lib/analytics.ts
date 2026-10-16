type Properties = Record<string, string | number | boolean>;
type PostHog = {
  capture: (event: string, properties: Properties, options?: { transport: 'sendBeacon' }) => void;
};

/** Full-page Astro navigation: one setup and one pageview per document. */
export function setupAnalytics() {
  const analyticsWindow = window as Window & { posthog?: PostHog; websiteAnalyticsStarted?: boolean };
  if (analyticsWindow.websiteAnalyticsStarted || !analyticsWindow.posthog) return;
  analyticsWindow.websiteAnalyticsStarted = true;
  const posthog = analyticsWindow.posthog;
  const url = new URL(location.href);
  const path = url.pathname;
  const normalizedPath = path.replace(/^\/zh(?=\/|$)/, '').replace(/\/$/, '') || '/';
  const isBlog = normalizedPath === '/blog' || normalizedPath.startsWith('/blog/');
  const isArticle = isBlog && normalizedPath !== '/blog';
  const pageType = isArticle ? 'blog_article' : isBlog ? 'blog_index' : normalizedPath === '/' ? 'home' : 'page';
  let referrerHost = '';
  try { referrerHost = new URL(document.referrer).hostname; } catch { /* Direct visit. */ }

  // Keep the entry source across this tab's internal page navigations.
  const attribution: Properties = {
    entry_path: path,
    entry_referrer_host: referrerHost,
    entry_source: url.searchParams.get('utm_source') || referrerHost || 'direct_or_unknown',
  };
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    attribution[`entry_${key}`] = url.searchParams.get(key) || '';
  }
  const attributionKey = '1flowbase.analytics.entry.v1';
  try {
    const saved = sessionStorage.getItem(attributionKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      for (const key of Object.keys(attribution)) {
        if (typeof parsed?.[key] === 'string') attribution[key] = parsed[key];
      }
    } else {
      sessionStorage.setItem(attributionKey, JSON.stringify(attribution));
    }
  } catch { /* Storage can be unavailable; current-page attribution still works. */ }

  const properties: Properties = {
    ...attribution,
    page_view_id: crypto.randomUUID(),
    page_url: url.origin + path,
    page_path: path,
    page_title: document.title,
    page_language: document.documentElement.lang,
    page_type: pageType,
    referrer_host: referrerHost,
    ...(isArticle ? { blog_slug: normalizedPath.slice('/blog/'.length) } : {}),
  };
  const capture = (event: string, extra: Properties = {}, beacon = false) => {
    try {
      posthog.capture(event, { ...properties, ...extra }, beacon ? { transport: 'sendBeacon' } : undefined);
    } catch { /* Analytics must never interrupt navigation or reading. */ }
  };

  capture('$pageview');
  if (isBlog) capture(isArticle ? 'blog_viewed' : 'blog_index_viewed');

  const trackGithub = (event: MouseEvent) => {
    if (event.type === 'auxclick' ? event.button !== 1 : event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (!(link instanceof HTMLAnchorElement)) return;
    const destination = new URL(link.href, location.href);
    if (destination.hostname !== 'github.com' || !['https:', 'http:'].includes(destination.protocol)) return;
    const segments = destination.pathname.split('/').filter(Boolean);
    const repository = segments.slice(0, 2).join('/');
    capture('github_clicked', {
      destination_url: destination.origin + destination.pathname + destination.hash,
      repository,
      is_project_repository: repository.toLowerCase() === 'taichuy/1flowbase',
      is_repository_landing: segments.length === 2,
      link_location: link.closest('header.site-header') ? 'header' : link.closest('footer') ? 'footer' : 'content',
      link_text: (link.textContent || link.getAttribute('aria-label') || '').trim().slice(0, 160),
    }, true);
  };
  document.addEventListener('click', trackGithub);
  document.addEventListener('auxclick', trackGithub);

  // Count visible time, excluding background tabs. Each event contains only
  // the new interval, so visibilitychange + pagehide cannot double-count it.
  let visibleSince: number | null = document.visibilityState === 'visible' ? performance.now() : null;
  let totalVisibleMs = 0;
  let segment = 0;
  const flush = (reason: string, resume: boolean) => {
    if (visibleSince === null) return;
    const now = performance.now();
    const duration = Math.max(0, now - visibleSince);
    visibleSince = resume ? now : null;
    if (duration < 1) return;
    totalVisibleMs += duration;
    capture('page_engagement', {
      duration_seconds: duration / 1000,
      total_visible_seconds: totalVisibleMs / 1000,
      segment_index: ++segment,
      reason,
    }, true);
  };
  window.setInterval(() => flush('heartbeat', document.visibilityState === 'visible'), 15000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush('hidden', false);
    else if (visibleSince === null) visibleSince = performance.now();
  });
  window.addEventListener('pagehide', () => flush('pagehide', false));
  window.addEventListener('pageshow', () => {
    if (document.visibilityState === 'visible' && visibleSince === null) visibleSince = performance.now();
  });
}
