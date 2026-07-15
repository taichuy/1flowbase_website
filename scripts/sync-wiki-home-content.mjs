import { execFile } from 'node:child_process';
import { access, cp, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const cacheRoot = path.join(repositoryRoot, '.cache');
const cachedWiki = path.join(cacheRoot, '1flowbase-website-wiki');
const generatedAssets = path.join(repositoryRoot, 'public', '.wiki-content');
const siblingWiki = path.resolve(repositoryRoot, '../1flowbase_website.wiki');
const remoteWiki = 'https://github.com/taichuy/1flowbase_website.wiki.git';
const homepagePattern = /^Website-Home-.+\.md$/;

const exists = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

const parseScalar = (value) => {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const parseFrontmatter = (source, fileName) => {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error(`${fileName} must start with a YAML frontmatter block`);

  const data = {};
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    data[key] = parseScalar(value);
  }
  return { data, body: match[2].trim() };
};

const readSection = (body, heading) => {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingMatch = body.match(new RegExp(`^##\\s+${escapedHeading}\\s*$`, 'm'));
  if (!headingMatch || headingMatch.index === undefined) return '';

  const sectionStart = headingMatch.index + headingMatch[0].length;
  const remainingBody = body.slice(sectionStart);
  const nextHeading = remainingBody.search(/^##\\s+/m);
  return (nextHeading >= 0 ? remainingBody.slice(0, nextHeading) : remainingBody).trim();
};

const parseHomepageBody = (body, fileName) => {
  const titleMatch = body.match(/^#\s+(.+)$/m);
  if (!titleMatch) throw new Error(`${fileName} must contain one level-one title`);

  const titleEnd = titleMatch.index + titleMatch[0].length;
  const firstSection = body.slice(titleEnd).search(/^##\s+/m);
  const descriptionSource = firstSection >= 0
    ? body.slice(titleEnd, titleEnd + firstSection)
    : body.slice(titleEnd);
  const description = descriptionSource
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');
  if (!description) throw new Error(`${fileName} must contain a description below its title`);

  const highlights = Array.from(readSection(body, 'Highlights').matchAll(/^-\s+(.+)$/gm))
    .map((match) => match[1].trim());
  if (highlights.length === 0) throw new Error(`${fileName} must contain a Highlights list`);

  const images = Array.from(readSection(body, 'Gallery').matchAll(/!\[([^\]]+)\]\((\S+?)(?:\s+"([^"]+)")?\)/g))
    .map((match) => ({ alt: match[1].trim(), source: match[2].trim(), caption: match[3]?.trim() ?? match[1].trim() }));
  if (images.length === 0) throw new Error(`${fileName} must contain at least one Gallery image`);

  return { title: titleMatch[1].trim(), description, highlights, images };
};

const toPublishedImage = async (image, wikiRoot) => {
  if (/^https?:\/\//.test(image.source)) {
    return { src: image.source, alt: image.alt, caption: image.caption };
  }

  const normalized = path.posix.normalize(image.source.replace(/^\.\//, '').replace(/^\//, ''));
  if (normalized.startsWith('../') || !normalized.startsWith('assets/')) {
    throw new Error(`Local Wiki images must stay under assets/: ${image.source}`);
  }
  if (!await exists(path.join(wikiRoot, normalized))) {
    throw new Error(`Wiki image does not exist: ${normalized}`);
  }
  return { src: `/.wiki-content/${normalized}`, alt: image.alt, caption: image.caption };
};

const parseHomepagePage = async (wikiRoot, fileName) => {
  const source = await readFile(path.join(wikiRoot, fileName), 'utf8');
  const { data, body } = parseFrontmatter(source, fileName);
  const parsedBody = parseHomepageBody(body, fileName);
  const requiredFields = ['scene', 'lang', 'order', 'eyebrow'];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === '') throw new Error(`${fileName} is missing frontmatter field: ${field}`);
  }
  if (data.lang !== 'en' && data.lang !== 'zh') throw new Error(`${fileName} lang must be en or zh`);
  const shouldBeChinese = fileName.endsWith('-CN.md');
  if ((data.lang === 'zh') !== shouldBeChinese) throw new Error(`${fileName} suffix and lang do not match`);

  const images = [];
  for (const image of parsedBody.images) images.push(await toPublishedImage(image, wikiRoot));

  return {
    scene: data.scene,
    lang: data.lang,
    order: data.order,
    eyebrow: data.eyebrow,
    enabled: data.enabled ?? true,
    detailUrl: data.detailUrl || undefined,
    detailLabel: data.detailLabel || undefined,
    ...parsedBody,
    images,
  };
};

const validateLocalePairs = (pages) => {
  const scenes = new Map();
  for (const page of pages) {
    const languages = scenes.get(page.scene) ?? new Set();
    if (languages.has(page.lang)) throw new Error(`Duplicate ${page.lang} homepage page for scene: ${page.scene}`);
    languages.add(page.lang);
    scenes.set(page.scene, languages);
  }
  const incompleteScenes = Array.from(scenes.entries())
    .filter(([, languages]) => !languages.has('en') || !languages.has('zh'))
    .map(([scene]) => scene);
  if (incompleteScenes.length > 0) {
    throw new Error(`Wiki homepage scenes must provide English and Chinese pages: ${incompleteScenes.join(', ')}`);
  }
};

await mkdir(cacheRoot, { recursive: true });
const temporaryRoot = await mkdtemp(path.join(cacheRoot, 'website-wiki-sync-'));
const temporaryWiki = path.join(temporaryRoot, 'repository');
const temporaryAssets = path.join(temporaryRoot, 'public-assets');
const configuredSource = process.env.ONEFLOWBASE_WEBSITE_WIKI_SOURCE;
const source = configuredSource ?? (await exists(path.join(siblingWiki, '.git')) ? siblingWiki : remoteWiki);

try {
  await execFileAsync('git', ['clone', '--depth', '1', source, temporaryWiki], {
    cwd: repositoryRoot,
    maxBuffer: 10 * 1024 * 1024,
  });

  const fileNames = (await readdir(temporaryWiki)).filter((name) => homepagePattern.test(name)).sort();
  if (fileNames.length === 0) throw new Error('Website Wiki contains no Website-Home-*.md pages');

  const pages = [];
  for (const fileName of fileNames) pages.push(await parseHomepagePage(temporaryWiki, fileName));
  validateLocalePairs(pages);

  const generatedHome = path.join(temporaryWiki, '.website-generated', 'home');
  await mkdir(generatedHome, { recursive: true });
  for (const page of pages) {
    await writeFile(path.join(generatedHome, `${page.scene}-${page.lang}.json`), `${JSON.stringify(page, null, 2)}\n`);
  }

  const wikiAssets = path.join(temporaryWiki, 'assets');
  await mkdir(temporaryAssets, { recursive: true });
  if (await exists(wikiAssets)) await cp(wikiAssets, path.join(temporaryAssets, 'assets'), { recursive: true });

  await rm(cachedWiki, { recursive: true, force: true });
  await rename(temporaryWiki, cachedWiki);
  await rm(generatedAssets, { recursive: true, force: true });
  await rename(temporaryAssets, generatedAssets);

  const sourceLabel = source === remoteWiki ? remoteWiki : path.relative(repositoryRoot, source);
  console.log(`[website-content] synced ${pages.length} homepage pages from ${sourceLabel}`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
