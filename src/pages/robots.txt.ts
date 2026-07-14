export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://1flowbase-website.pages.dev');
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', origin)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
