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

export const collections = { blog, homeShowcases };
