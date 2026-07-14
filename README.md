# 1flowbase Website

Official website for [1flowbase](https://github.com/taichuy/1flowbase), built with Astro and generated as a fully static site.

## Stack

- Astro 7
- Tailwind CSS 4
- Markdown / MDX content collections
- Static output for Cloudflare Workers Static Assets
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

## Cloudflare Workers

The site deploys to the `1flowbase-website` Worker as static assets. Wrangler
reads the deployment settings from `wrangler.jsonc`.

```bash
pnpm deploy
```

To merge the remote `taichuy/dev` branch into `main`, push `main`, and deploy
the same commit to Cloudflare in one command:

```bash
pnpm release
```

To run the same preflight, build, and Cloudflare dry-run checks without
merging, pushing, or deploying:

```bash
pnpm release:check
```

The release command requires a clean working tree and reads
`CLOUDFLARE_API_TOKEN` from the environment or
`~/.config/cloudflare/wrangler.env`. To release another remote branch, pass it
after `--`:

```bash
pnpm release -- feature/my-branch
```

Set `SITE_URL` to the production origin, for example `https://www.example.com`. It is used for canonical URLs, the sitemap, RSS, and structured data. Until configured, builds use `https://1flowbase-website.taichu2021.workers.dev`.

No Astro server adapter, Worker runtime code, or runtime database is required for the current site.

## Content

Blog posts live in `src/content/blog/`. Each post declares its language in frontmatter. Product documentation remains in the [GitHub Wiki](https://github.com/taichuy/1flowbase/wiki), while the website owns product positioning, use cases, comparisons, and release-oriented content.

## Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local server |
| `pnpm check` | Run Astro and TypeScript checks |
| `pnpm build` | Build the static production site |
| `pnpm preview` | Preview `dist/` locally |
| `pnpm release` | Merge `origin/taichuy/dev` into `main`, push, deploy, and verify production |
| `pnpm release:check` | Validate release prerequisites and upload bundle without changing remote state |
