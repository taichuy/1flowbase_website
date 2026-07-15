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

Every push to `main` is built and deployed automatically by GitHub Actions.
The workflow reads the build and Worker settings from this repository and uses
the repository-level `CLOUDFLARE_API_TOKEN` Actions Variable for
authentication. The Cloudflare Account ID is written directly in
`.github/workflows/deploy.yml`.

To replace the Cloudflare token without using the CLI:

1. Open the repository's **Settings → Secrets and variables → Actions → Variables** page.
2. Edit the repository variable `CLOUDFLARE_API_TOKEN`, paste the new token, and save it.
3. Open **Actions → Deploy Website**, select **Run workflow**, and run `main`.

Repository variables are visible to repository administrators and are not
automatically masked if a workflow prints them. Do not echo
`CLOUDFLARE_API_TOKEN` in workflow commands. Deployment behavior, account ID,
Wrangler version, Worker name, and static asset settings are versioned in the
workflow and `wrangler.jsonc`.

To merge the remote `taichuy/dev` branch into `main` and push `main` in one
command, which triggers the deployment workflow:

```bash
pnpm release
```

To run the same branch and build checks without merging or pushing:

```bash
pnpm release:check
```

The release command requires a clean working tree. To release another remote
branch, pass it after `--`:

```bash
pnpm release -- feature/my-branch
```

Set `SITE_URL` to the production origin, for example `https://www.example.com`. It is used for canonical URLs, the sitemap, RSS, and structured data. Until configured, builds use `https://1flowbase-website.taichu2021.workers.dev`.

No Astro server adapter, Worker runtime code, or runtime database is required for the current site.

## Content

Blog posts live in `src/content/blog/`. Each post declares its language in frontmatter.

The homepage showcase is sourced from the `1flowbase` Wiki repository:

```text
1flowbase_website/home/<scene>/en.md
1flowbase_website/home/<scene>/zh.md
1flowbase_website/home/<scene>/assets/*
```

`pnpm content:sync`, `pnpm dev`, `pnpm check`, and `pnpm build` clone the Wiki content into the ignored `.cache/1flowbase-wiki/` directory. A sibling clone at `../1flowbase.wiki` is preferred for local development; otherwise the public Wiki Git repository is used. The build fails when a scene does not provide both `en.md` and `zh.md`.

Wiki content updates are picked up by the scheduled deployment workflow within 30 minutes. The **Deploy Website** workflow can also be run manually for an immediate refresh.

## Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local server |
| `pnpm check` | Run Astro and TypeScript checks |
| `pnpm build` | Build the static production site |
| `pnpm preview` | Preview `dist/` locally |
| `pnpm release` | Merge `origin/taichuy/dev` into `main` and push; GitHub Actions deploys production |
| `pnpm release:check` | Validate branch and build prerequisites without changing remote state |
