# 1flowbase Website

Official website for [1flowbase](https://github.com/taichuy/1flowbase), built with Astro and generated as a fully static site.

## Stack

- Astro 7
- Tailwind CSS 4
- Markdown / MDX content collections
- Static output for Cloudflare Pages
- English at `/` and Simplified Chinese at `/zh/`

## Local development

```bash
corepack enable
pnpm install
pnpm dev
```

The development server runs at `http://localhost:4321`.

## Build

```bash
pnpm build
pnpm preview
```

The production output is written to `dist/`.

## Cloudflare Pages

Use these project settings:

| Setting | Value |
| --- | --- |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node.js version | `24` |

Set `SITE_URL` to the production origin, for example `https://www.example.com`. It is used for canonical URLs, the sitemap, RSS, and structured data. Until configured, builds use `https://1flowbase-website.pages.dev`.

No Astro server adapter, Worker, or runtime database is required for the current site.

## Content

Blog posts live in `src/content/blog/`. Each post declares its language in frontmatter. Product documentation remains in the [GitHub Wiki](https://github.com/taichuy/1flowbase/wiki), while the website owns product positioning, use cases, comparisons, and release-oriented content.

## Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local server |
| `pnpm check` | Run Astro and TypeScript checks |
| `pnpm build` | Build the static production site |
| `pnpm preview` | Preview `dist/` locally |
