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
const siblingWiki = path.resolve(repositoryRoot, '../1flowbase_website.wiki');
const remoteWiki = 'https://github.com/taichuy/1flowbase_website.wiki.git';
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

  const showcases = [];
  for (const page of showcasePages) showcases.push(await parseShowcasePage(temporaryWiki, page));

  const generatedHome = path.join(temporaryWiki, '.website-generated', 'home');
  await mkdir(generatedHome, { recursive: true });
  for (const showcase of showcases) {
    await writeFile(path.join(generatedHome, `showcase-${showcase.lang}.json`), `${JSON.stringify(showcase, null, 2)}\n`);
  }

  const wikiAssets = path.join(temporaryWiki, 'assets');
  await mkdir(temporaryAssets, { recursive: true });
  if (await exists(wikiAssets)) await cp(wikiAssets, path.join(temporaryAssets, 'assets'), { recursive: true });

  await rm(cachedWiki, { recursive: true, force: true });
  await rename(temporaryWiki, cachedWiki);
  await rm(generatedAssets, { recursive: true, force: true });
  await rename(temporaryAssets, generatedAssets);

  const sourceLabel = source === remoteWiki ? remoteWiki : path.relative(repositoryRoot, source);
  console.log(`[website-content] synced ${showcases.reduce((count, item) => count + item.slides.length, 0)} showcase slides from ${sourceLabel}`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
