import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
    generateId: ({ data, entry }) => `${String(data.lang ?? 'und')}/${String(data.slug ?? entry)}`,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    lang: z.enum(['en', 'zh']),
    slug: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const homeShowcases = defineCollection({
  loader: glob({
    base: './.cache/1flowbase-website-wiki/.website-generated/home',
    pattern: '*.json',
  }),
  schema: z.object({
    lang: z.enum(['en', 'zh']),
    slides: z
      .array(
        z.object({
          title: z.string().min(1),
          src: z.string().min(1),
          alt: z.string().min(1),
        }),
      )
      .min(1),
  }),
});

const wikiPages = defineCollection({
  loader: glob({
    base: './.cache/1flowbase-website-wiki/.website-generated/wiki-pages',
    pattern: '**/*.md',
    generateId: ({ data }) => `${String(data.lang)}/${String(data.kind)}/${String(data.slug)}`,
  }),
  schema: z.object({
    title: z.string().min(1),
    lang: z.enum(['en', 'zh']),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    kind: z.enum(['guide', 'license']),
    category: z.string().min(1),
    categoryOrder: z.number().int().nonnegative(),
    order: z.number().int().nonnegative(),
    sourceUrl: z.url(),
    alternatePath: z.string().nullable(),
  }),
});

export const collections = { blog, homeShowcases, wikiPages };
