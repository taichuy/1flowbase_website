import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const cacheRoot = path.join(repositoryRoot, '.cache');
const cachedWiki = path.join(cacheRoot, '1flowbase-wiki');
const siblingWiki = path.resolve(repositoryRoot, '../1flowbase.wiki');
const remoteWiki = 'https://github.com/taichuy/1flowbase.wiki.git';

const exists = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

const collectLocalePages = async (directory, relativeDirectory = '') => {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      pages.push(...await collectLocalePages(absolutePath, relativePath));
      continue;
    }
    if (entry.isFile() && (entry.name === 'en.md' || entry.name === 'zh.md')) {
      pages.push(relativePath);
    }
  }

  return pages;
};

const validateLocalePairs = (pages) => {
  const scenes = new Map();
  for (const page of pages) {
    const scene = path.dirname(page);
    const language = path.basename(page, '.md');
    const languages = scenes.get(scene) ?? new Set();
    languages.add(language);
    scenes.set(scene, languages);
  }

  const incompleteScenes = Array.from(scenes.entries())
    .filter(([, languages]) => !languages.has('en') || !languages.has('zh'))
    .map(([scene]) => scene);

  if (incompleteScenes.length > 0) {
    throw new Error(`Wiki homepage scenes must provide both en.md and zh.md: ${incompleteScenes.join(', ')}`);
  }
};

await mkdir(cacheRoot, { recursive: true });
const temporaryRoot = await mkdtemp(path.join(cacheRoot, 'wiki-sync-'));
const temporaryWiki = path.join(temporaryRoot, 'repository');
const configuredSource = process.env.ONEFLOWBASE_WIKI_SOURCE;
const source = configuredSource ?? (await exists(path.join(siblingWiki, '.git')) ? siblingWiki : remoteWiki);

try {
  await execFileAsync('git', ['clone', '--depth', '1', source, temporaryWiki], {
    cwd: repositoryRoot,
    maxBuffer: 10 * 1024 * 1024,
  });

  const homepageContent = path.join(temporaryWiki, '1flowbase_website', 'home');
  if (!await exists(homepageContent)) {
    throw new Error('Wiki content directory is missing: 1flowbase_website/home');
  }

  const localePages = await collectLocalePages(homepageContent);
  if (localePages.length === 0) {
    throw new Error('Wiki content directory contains no en.md or zh.md homepage scenes');
  }
  validateLocalePairs(localePages);

  await rm(cachedWiki, { recursive: true, force: true });
  await rename(temporaryWiki, cachedWiki);
  const sourceLabel = source === remoteWiki ? remoteWiki : path.relative(repositoryRoot, source);
  console.log(`[home-content] synced ${localePages.length} locale pages from ${sourceLabel}`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
