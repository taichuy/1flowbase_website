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

Set `SITE_URL` to the production origin, for example `https://www.example.com`. It is used for canonical URLs, the sitemap, RSS, and structured data. The production default is `https://1flowbase.taichuy.com`.

No Astro server adapter, Worker runtime code, or runtime database is required for the current site.

## Content

Blog posts live in `src/content/blog/`. Each post declares its language in frontmatter.

The `1flowbase_website` Wiki is the editable website directory and homepage showcase source. Its `Home` page manages blog and documentation links, including links to content hosted in the main `1flowbase` Wiki.

Legacy showcase content remains synchronized from one readable Wiki page per language:

```text
Website-Home-Showcase.md       # English slides
Website-Home-Showcase-CN.md    # Chinese slides
assets/home/**/*               # repository-hosted screenshots
```

Each `## Slide title` must be followed by exactly one Markdown image. The redesigned homepage uses an explicit three-tab product viewer with the repository screenshots in `src/assets/product/`; it does not auto-advance. The legacy Wiki showcase remains available to the content collection for future use. `pnpm content:sync`, `pnpm dev`, `pnpm check`, and `pnpm build` clone the Wiki content into the ignored `.cache/1flowbase-website-wiki/` directory. A sibling clone at `../1flowbase_website.wiki` is preferred for local development; otherwise the public Wiki Git repository is used. The sync step parses both language pages into static carousel data and copies repository-hosted images into the deployment.

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

## Homepage redesign

- Bilingual positioning and copy: `src/data/home.ts`
- Homepage sections and progressive-enhancement interactions: `src/components/HomePage.astro`
- Responsive visual system: `src/styles/home.css`
- Primary CTA: local installation section; secondary CTA: project repository
- Three operating-system tabs offer the official deployment commands; copying never executes them.
- Templates and reduced-source-context Agent building remain explicitly labeled as in progress.
- PostHog tracks page views and interactions through `src/components/posthog.astro`, included in the shared layout. Session recording is disabled. Analytics is disabled unless a build-time `PUBLIC_POSTHOG_KEY` is configured; `PUBLIC_POSTHOG_HOST` defaults to the US ingestion endpoint. No project token is stored in source. These public ingestion settings are embedded in the static output and are not personal API credentials. Local visits also send events, so filter localhost out of production reports.

Publication is consequential: pushing or merging to `main` triggers production deployment. Scheduled, `repository_dispatch`, and manual workflow runs also deploy the `main` content. Review on a separate branch before merging.

## Website analytics

Configure `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` under GitHub repository
**Settings → Environments → production → Environment variables**. The deploy
workflow passes these variables to the build. Updating variables requires a
new build/deployment; Cloudflare runtime variables cannot change static output.
These are public ingestion settings, so GitHub Variables are sufficient. Keep
Cloudflare deployment credentials in Secrets.

For local analytics, copy `.env.example` to `.env.local`, fill in the public
project key, and restart the dev server. `.env.local` is ignored by Git. Leave
the key empty to disable the SDK and event listeners. Do not use a personal API
key. A public project key is visible in the built website even when configured
through environment variables.

`src/lib/analytics.ts` emits the following events through PostHog. Automatic
pageview/pageleave capture is disabled so each full-page navigation sends only
one explicit `$pageview`. Session recording remains disabled.

| Event | Meaning / useful properties |
| --- | --- |
| `$pageview` | Page visit: `page_url`, `page_path`, `page_title`, `page_language`, `page_type` |
| `blog_index_viewed` | Blog listing opened |
| `blog_viewed` | Blog article opened, with `blog_slug` (not proof of a completed read) |
| `github_clicked` | GitHub outbound link activated, with `destination_url`, `repository`, `is_project_repository`, `is_repository_landing`, `link_location` |
| `page_engagement` | Visible-time increment in `duration_seconds`, plus cumulative `total_visible_seconds`, `page_view_id`, `segment_index` and `reason` |

All events include `entry_source`, `entry_referrer_host`, `entry_path`, and
`entry_utm_source`, `entry_utm_medium`, `entry_utm_campaign`, `entry_utm_content`,
`entry_utm_term`. Entry attribution is retained in sessionStorage for the tab's
session, so internal navigation does not replace the original source. Without
storage, it falls back to the current page. Referrers may be missing because of
browser policies; `direct_or_unknown` does not necessarily mean a typed URL.
PostHog also attaches its standard URL, referrer, campaign and session fields.

Use UTM-tagged promotion links, for example
`https://1flowbase.taichuy.com/zh/?utm_source=github&utm_medium=readme&utm_campaign=launch`.
In Product analytics, break down `$pageview` by `entry_source` / `page_path`.
Create a funnel from `$pageview` to `github_clicked`, filtering the latter by
`is_project_repository = true` and `is_repository_landing = true` to measure
project repository visits rather than unrelated GitHub links. This measures
outbound click intent, not a confirmed GitHub page load, Star, or installation.

Visible time is flushed every 15 seconds and when the document is hidden or
left, using beacon transport. Background-tab time is excluded; visible time
does not prove the visitor is actively reading. Sum `duration_seconds` per
`page_view_id` to calculate each visit's recorded duration, then average those
visit totals for average time per page. Do not sum `total_visible_seconds` or
average individual heartbeat events. Network failures or abrupt browser exits
can lose the final interval; some visits may have no duration event.

Filter by the production hostname in reports to exclude localhost testing.
The local site emits these events immediately; production requires deploying
the updated build. Check Activity for `$pageview`, `blog_viewed`,
`github_clicked`, and `page_engagement` after browsing and switching tabs.

## Blog publishing and reading paths

The header and footer link to the native blog at `/blog/` or `/zh/blog/`.
`src/data/blog.ts` defines the task-based reading paths and their documentation
next steps. Published posts declare a `topic` in frontmatter (`gateway`,
`workflows`, `observability`, or `field-notes`). The homepage guide cards are
shown only when their featured article exists in the current language.

The article layout builds its table of contents from real Markdown headings,
estimates reading time from the article body, and suggests other published
articles in the same language. It exposes the existing RSS feed without an
email signup or new visitor tracking. Keep `publishedAt` as the original
publication date; add `updatedAt` only when the article content is materially
revised. Template or navigation changes alone should not make an old article
look newly published.
