import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site?: URL }) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
  return rss({
    title: '1flowbase Blog',
    description: 'Workflow-backed virtual models, multi-model orchestration, local agents, and observability.',
    site: context.site ?? 'https://1flowbase-website.pages.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: post.data.lang === 'zh' ? `/zh/blog/${post.data.slug}/` : `/blog/${post.data.slug}/`,
      categories: post.data.tags,
    })),
  });
}
