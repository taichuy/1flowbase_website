import { execFile } from 'node:child_process';
import { access, cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const cacheRoot = path.join(repositoryRoot, '.cache');
const cachedWiki = path.join(cacheRoot, '1flowbase-website-wiki');
const generatedAssets = path.join(repositoryRoot, 'public', '.wiki-content');
const siblingWebsiteWiki = path.resolve(repositoryRoot, '../1flowbase_website.wiki');
const siblingMainWiki = path.resolve(repositoryRoot, '../1flowbase.wiki');
const remoteWebsiteWiki = 'https://github.com/taichuy/1flowbase_website.wiki.git';
const remoteMainWiki = 'https://github.com/taichuy/1flowbase.wiki.git';
const mainWikiWeb = 'https://github.com/taichuy/1flowbase/wiki';
const showcasePages = [
  { fileName: 'Website-Home-Showcase.md', lang: 'en' },
  { fileName: 'Website-Home-Showcase-CN.md', lang: 'zh' },
];

const exists = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

const readShowcaseSections = (source, fileName) => {
  if (!/^#\s+.+$/m.test(source)) throw new Error(`${fileName} must contain one level-one page title`);

  const headings = Array.from(source.matchAll(/^##\s+(.+?)\s*$/gm));
  if (headings.length === 0) throw new Error(`${fileName} must contain at least one level-two slide title`);

  return headings.map((heading, index) => {
    const sectionStart = (heading.index ?? 0) + heading[0].length;
    const sectionEnd = headings[index + 1]?.index ?? source.length;
    const section = source.slice(sectionStart, sectionEnd);
    const images = Array.from(section.matchAll(/!\[([^\]]+)\]\((\S+?)(?:\s+"[^"]*")?\)/g));
    if (images.length !== 1) {
      throw new Error(`${fileName} slide "${heading[1].trim()}" must contain exactly one image`);
    }
    return {
      title: heading[1].trim(),
      alt: images[0][1].trim(),
      source: images[0][2].trim(),
    };
  });
};

const toPublishedImage = async (slide, wikiRoot) => {
  if (/^https:\/\//.test(slide.source)) {
    return { title: slide.title, src: slide.source, alt: slide.alt };
  }
  if (/^http:\/\//.test(slide.source)) throw new Error(`Showcase images must use HTTPS: ${slide.source}`);

  const normalized = path.posix.normalize(slide.source.replace(/^\.\//, '').replace(/^\//, ''));
  if (normalized.startsWith('../') || !normalized.startsWith('assets/')) {
    throw new Error(`Local Wiki images must stay under assets/: ${slide.source}`);
  }
  if (!await exists(path.join(wikiRoot, normalized))) {
    throw new Error(`Wiki image does not exist: ${normalized}`);
  }
  return { title: slide.title, src: `/.wiki-content/${normalized}`, alt: slide.alt };
};

const parseShowcasePage = async (wikiRoot, { fileName, lang }) => {
  const filePath = path.join(wikiRoot, fileName);
  if (!await exists(filePath)) throw new Error(`Website Wiki is missing required page: ${fileName}`);

  const source = await readFile(filePath, 'utf8');
  const parsedSlides = readShowcaseSections(source, fileName);
  const slides = [];
  for (const slide of parsedSlides) slides.push(await toPublishedImage(slide, wikiRoot));
  return { lang, slides };
};

const splitTableRow = (line) => line.trim().slice(1, -1).split('|').map((cell) => cell.trim());

const parseWikiLink = (cell, label) => {
  if (cell === '—' || cell === '-') return undefined;
  const match = cell.match(/^\[([^\]]+)\]\((https:\/\/github\.com\/taichuy\/1flowbase\/wiki\/[^)]+)\)$/);
  if (!match) throw new Error(`${label} must be a Markdown link to the taichuy/1flowbase Wiki, or —`);

  const url = new URL(match[2]);
  const encodedPage = url.pathname.slice('/taichuy/1flowbase/wiki/'.length);
  const sourcePage = decodeURIComponent(encodedPage);
  if (!sourcePage || sourcePage.includes('/') || sourcePage.includes('..')) {
    throw new Error(`${label} has an invalid Wiki page name: ${sourcePage}`);
  }
  return { directoryTitle: match[1].trim(), sourcePage, sourceUrl: match[2] };
};

const parseDocumentationDirectory = (source) => {
  const pages = [];
  const categoryCounts = new Map();
  let section;
  let category;
  let categoryOrder = -1;
  let licenseFound = false;

  for (const line of source.split(/\r?\n/)) {
    const sectionMatch = line.match(/^##\s+(Tutorials|License)\s*$/);
    if (sectionMatch) {
      section = sectionMatch[1].toLowerCase();
      category = undefined;
      continue;
    }

    if (section === 'tutorials') {
      const categoryMatch = line.match(/^###\s+(.+?)\s+\|\s+(.+?)\s*$/);
      if (categoryMatch) {
        categoryOrder += 1;
        category = { en: categoryMatch[1].trim(), zh: categoryMatch[2].trim() };
        categoryCounts.set(categoryOrder, 0);
        continue;
      }

      if (!category || !/^\|\s*`[^`]+`\s*\|/.test(line)) continue;
      const [rawSlug, zhCell, enCell] = splitTableRow(line);
      const slug = rawSlug.replace(/^`|`$/g, '');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid documentation slug: ${slug}`);
      if (pages.some((page) => page.kind === 'guide' && page.slug === slug)) throw new Error(`Duplicate documentation slug: ${slug}`);

      const categoryItemOrder = categoryCounts.get(categoryOrder) ?? 0;
      categoryCounts.set(categoryOrder, categoryItemOrder + 1);
      for (const [lang, cell] of [['zh', zhCell], ['en', enCell]]) {
        const link = parseWikiLink(cell, `${slug} ${lang}`);
        if (link) pages.push({
          ...link,
          kind: 'guide',
          lang,
          slug,
          category: category[lang],
          categoryOrder,
          order: categoryItemOrder,
        });
      }
    }

    if (section === 'license' && /^\|\s*\[[^\]]+\]/.test(line)) {
      if (licenseFound) throw new Error('Documentation-Directory.md must contain exactly one license row');
      const [zhCell, enCell] = splitTableRow(line);
      for (const [lang, cell] of [['zh', zhCell], ['en', enCell]]) {
        const link = parseWikiLink(cell, `license ${lang}`);
        if (!link) throw new Error(`The ${lang} license link is required`);
        pages.push({ ...link, kind: 'license', lang, slug: 'license', category: 'License', categoryOrder: 0, order: 0 });
      }
      licenseFound = true;
    }
  }

  if (!pages.some((page) => page.kind === 'guide')) throw new Error('Documentation-Directory.md contains no tutorial rows');
  if (!licenseFound) throw new Error('Documentation-Directory.md is missing its license row');
  return pages;
};

const routeForPage = (page, anchor = '') => {
  const localePrefix = page.lang === 'zh' ? '/zh' : '';
  const route = page.kind === 'license' ? `${localePrefix}/license/` : `${localePrefix}/docs/${page.slug}/`;
  return `${route}${anchor}`;
};

const rewriteWikiMarkdown = (source, pageBySource) => source.replace(
  /(!?\[[^\]]*\]\()([^\s)]+)(\))/g,
  (match, prefix, destination, suffix) => {
    if (/^(?:https?:|mailto:|#)/.test(destination)) return match;

    const isImage = prefix.startsWith('!');
    const [rawPage, rawAnchor] = destination.split('#', 2);
    if (isImage && rawPage.startsWith('assets/')) {
      const normalized = path.posix.normalize(rawPage);
      if (normalized.startsWith('../')) throw new Error(`Wiki image escapes assets/: ${destination}`);
      return `${prefix}/.wiki-content/docs/${normalized}${rawAnchor ? `#${rawAnchor}` : ''}${suffix}`;
    }

    const sourcePage = decodeURIComponent(rawPage);
    const importedPage = pageBySource.get(sourcePage);
    if (importedPage) return `${prefix}${routeForPage(importedPage, rawAnchor ? `#${rawAnchor}` : '')}${suffix}`;
    return `${prefix}${mainWikiWeb}/${rawPage}${rawAnchor ? `#${rawAnchor}` : ''}${suffix}`;
  },
);

const prepareWikiPages = async (websiteWikiRoot, mainWikiRoot) => {
  const directoryFile = path.join(websiteWikiRoot, 'Documentation-Directory.md');
  if (!await exists(directoryFile)) throw new Error('Website Wiki is missing required page: Documentation-Directory.md');
  const pages = parseDocumentationDirectory(await readFile(directoryFile, 'utf8'));
  const pageBySource = new Map(pages.map((page) => [page.sourcePage, page]));
  const generatedRoot = path.join(websiteWikiRoot, '.website-generated', 'wiki-pages');

  for (const page of pages) {
    const sourceFile = path.join(mainWikiRoot, `${page.sourcePage}.md`);
    if (!await exists(sourceFile)) throw new Error(`Main Wiki is missing linked page: ${page.sourcePage}.md`);
    const source = await readFile(sourceFile, 'utf8');
    const titleMatch = source.match(/^#\s+(.+?)\s*$/m);
    if (!titleMatch) throw new Error(`${page.sourcePage}.md must contain one level-one page title`);
    const body = rewriteWikiMarkdown(source.replace(/^#\s+.+?\s*\r?\n+/, ''), pageBySource);
    const alternate = pages.find((candidate) => candidate.kind === page.kind && candidate.slug === page.slug && candidate.lang !== page.lang);
    const frontmatter = {
      title: titleMatch[1].trim(),
      lang: page.lang,
      slug: page.slug,
      kind: page.kind,
      category: page.category,
      categoryOrder: page.categoryOrder,
      order: page.order,
      sourceUrl: page.sourceUrl,
      alternatePath: alternate ? routeForPage(alternate) : null,
    };
    const outputDirectory = path.join(generatedRoot, page.lang);
    await mkdir(outputDirectory, { recursive: true });
    const metadata = Object.entries(frontmatter).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
    await writeFile(path.join(outputDirectory, `${page.slug}.md`), `---\n${metadata}\n---\n\n${body.trim()}\n`);
  }

  return pages;
};

const materializeWiki = async (source, destination) => {
  if (await exists(path.join(source, '.git'))) {
    await cp(source, destination, { recursive: true });
    return;
  }
  await execFileAsync('git', ['clone', '--depth', '1', source, destination], {
    cwd: repositoryRoot,
    maxBuffer: 10 * 1024 * 1024,
  });
};

await mkdir(cacheRoot, { recursive: true });
const temporaryRoot = await mkdtemp(path.join(cacheRoot, 'website-wiki-sync-'));
const temporaryWebsiteWiki = path.join(temporaryRoot, 'website-wiki');
const temporaryMainWiki = path.join(temporaryRoot, 'main-wiki');
const temporaryAssets = path.join(temporaryRoot, 'public-assets');
const configuredWebsiteSource = process.env.ONEFLOWBASE_WEBSITE_WIKI_SOURCE;
const configuredMainSource = process.env.ONEFLOWBASE_WIKI_SOURCE;
const websiteSource = configuredWebsiteSource ?? (await exists(path.join(siblingWebsiteWiki, '.git')) ? siblingWebsiteWiki : remoteWebsiteWiki);
const mainSource = configuredMainSource ?? (await exists(path.join(siblingMainWiki, '.git')) ? siblingMainWiki : remoteMainWiki);

try {
  await Promise.all([
    materializeWiki(websiteSource, temporaryWebsiteWiki),
    materializeWiki(mainSource, temporaryMainWiki),
  ]);

  const showcases = [];
  for (const page of showcasePages) showcases.push(await parseShowcasePage(temporaryWebsiteWiki, page));
  const wikiPages = await prepareWikiPages(temporaryWebsiteWiki, temporaryMainWiki);

  const generatedHome = path.join(temporaryWebsiteWiki, '.website-generated', 'home');
  await mkdir(generatedHome, { recursive: true });
  for (const showcase of showcases) {
    await writeFile(path.join(generatedHome, `showcase-${showcase.lang}.json`), `${JSON.stringify(showcase, null, 2)}\n`);
  }

  await mkdir(temporaryAssets, { recursive: true });
  const websiteAssets = path.join(temporaryWebsiteWiki, 'assets');
  if (await exists(websiteAssets)) await cp(websiteAssets, path.join(temporaryAssets, 'assets'), { recursive: true });
  const docsAssets = path.join(temporaryMainWiki, 'assets');
  if (await exists(docsAssets)) await cp(docsAssets, path.join(temporaryAssets, 'docs', 'assets'), { recursive: true });

  await rm(cachedWiki, { recursive: true, force: true });
  await rename(temporaryWebsiteWiki, cachedWiki);
  await rm(generatedAssets, { recursive: true, force: true });
  await rename(temporaryAssets, generatedAssets);

  const websiteLabel = websiteSource === remoteWebsiteWiki ? remoteWebsiteWiki : path.relative(repositoryRoot, websiteSource);
  const mainLabel = mainSource === remoteMainWiki ? remoteMainWiki : path.relative(repositoryRoot, mainSource);
  console.log(`[website-content] synced ${showcases.reduce((count, item) => count + item.slides.length, 0)} showcase slides from ${websiteLabel}`);
  console.log(`[website-content] synced ${wikiPages.length} documentation and license pages from ${mainLabel}`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
