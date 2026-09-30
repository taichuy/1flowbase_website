import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/components/HeroFlow.astro', import.meta.url), 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'Progressive enhancement script exists');
assert.equal((source.match(/<li>/g) ?? []).length, 5, 'Exactly five semantic layers');
assert.ok(source.includes('prefers-reduced-motion:reduce'), 'CSS reduced-motion fallback exists');
const js = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
for (const initiallyReduced of [false, true]) {
  const handlers = {};
  const media = { matches: initiallyReduced, addEventListener: (_event, fn) => { handlers.media = fn; }, removeEventListener() {} };
  const button = { hidden: true, textContent: '', dataset: { pause: 'Pause', resume: 'Play' }, addEventListener: (_event, fn) => { handlers.click = fn; } };
  const flow = { dataset: {}, querySelector: () => button };
  vm.runInNewContext(js, {
    document: { querySelectorAll: () => [flow], addEventListener() {} },
    window: { matchMedia: () => media },
  });
  assert.equal(flow.dataset.motion, initiallyReduced ? 'static' : 'running');
  assert.equal(button.hidden, initiallyReduced);
  media.matches = false; handlers.media();
  for (let i = 0; i < 4; i++) {
    handlers.click();
    assert.equal(flow.dataset.motion, i % 2 === 0 ? 'static' : 'running');
    assert.equal(button.textContent, i % 2 === 0 ? 'Play' : 'Pause');
  }
  media.matches = true; handlers.media();
  assert.equal(flow.dataset.motion, 'static');
  assert.equal(button.hidden, true);
  media.matches = false; handlers.media();
  assert.equal(flow.dataset.motion, 'running');
}
const copy = await readFile(new URL('../src/data/home.ts', import.meta.url), 'utf8');
assert.ok(copy.includes("headline: ['从 AI Gateway，', '到完整的', 'AI 应用系统。']"));
assert.ok(copy.includes("headline: ['Start with a gateway.', 'Build an entire', 'AI application.']"));
for (const path of ['../dist/index.html', '../dist/zh/index.html']) {
  const html = await readFile(new URL(path, import.meta.url), 'utf8');
  assert.ok(html.includes('data-hero-flow'), `Flow rendered at ${path}`);
  assert.ok(!html.includes('class="runtime-diagram"'), `Old diagram removed at ${path}`);
  assert.ok(html.includes('DeepSeek harness'));
  assert.ok(html.includes('data-flow-toggle'));
}
console.log('PASS: five layers, both headlines preserved, bilingual output, pause/play repeated clicks and changing reduced-motion preference');
