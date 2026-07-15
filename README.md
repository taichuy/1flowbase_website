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
the `production` environment secrets `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` for authentication and account selection. Only `main`
is allowed to deploy to the production environment.

To replace the Cloudflare credentials without using the CLI:

1. Open the repository's **Settings → Environments → production** page.
2. Edit the environment secret `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_ACCOUNT_ID`, paste the new value, and save it.
3. Open **Actions → Deploy Website**, select **Run workflow**, and run `main`.

Environment secret values cannot be viewed after saving and are masked in
workflow logs. Deployment behavior, Wrangler version, Worker name, and static
asset settings are versioned in the workflow and `wrangler.jsonc`.

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

The homepage showcase is sourced from the `1flowbase_website` Wiki repository. Pages are flat so they can be opened and edited in the GitHub Wiki UI:

```text
Website-Home-<Scene>.md       # English
Website-Home-<Scene>-CN.md    # Chinese
assets/home/<scene>/*         # repository-hosted screenshots
```

`pnpm content:sync`, `pnpm dev`, `pnpm check`, and `pnpm build` clone the Wiki content into the ignored `.cache/1flowbase-website-wiki/` directory. A sibling clone at `../1flowbase_website.wiki` is preferred for local development; otherwise the public Wiki Git repository is used. The sync step parses each readable Wiki page into static homepage data, copies repository-hosted images into the deployment, and fails when a scene does not provide both English and Chinese pages.

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
