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
    base: './home',
    pattern: '**/index.{md,mdx}',
  }),
  schema: ({ image }) =>
    z.object({
      scene: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      lang: z.enum(['en', 'zh']),
      order: z.number().int().nonnegative(),
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
      highlights: z.array(z.string()).max(4).default([]),
      detailUrl: z.url().optional(),
      detailLabel: z.string().optional(),
      enabled: z.boolean().default(true),
      images: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .min(1),
    }),
});

export const collections = { blog, homeShowcases };
