import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const source = await readFile(new URL('../src/components/HeroFlow.astro', import.meta.url), 'utf8');
const nodeSource = await readFile(new URL('../src/components/HeroFlowNode.astro', import.meta.url), 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);
assert.ok(!source.includes('data-flow-toggle'), 'No pause control');
assert.ok(!source.includes('infinite'), 'No looping animation');
assert.ok(!source.includes('<h3>') && !source.includes('<figcaption>'), 'No layer headings or bottom note');
assert.ok(nodeSource.includes('aria-describedby={id}'), 'Every node has an accessible description');
assert.ok(source.includes('prefers-reduced-motion:reduce'));
const js = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
for (const reduced of [false, true]) {
  const events = {}; const timers = new Map(); let nextTimer = 0; let observerCallback;
  const media = { matches: reduced, addEventListener: (_event, fn) => { events.media = fn; }, removeEventListener() {} };
  const tip = { hidden: true, style: {}, addEventListener() {}, remove() {} };
  const flow = { dataset: {}, querySelector: () => tip, querySelectorAll: () => [] };
  class Observer { constructor(fn) { observerCallback = fn; } observe() {} disconnect() {} }
  vm.runInNewContext(js, {
    document: { querySelectorAll: () => [flow], body: { appendChild() {} }, addEventListener() {}, removeEventListener() {} },
    window: { matchMedia: () => media, addEventListener() {}, removeEventListener() {} },
    IntersectionObserver: Observer,
    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  assert.equal(flow.dataset.motion, reduced ? 'complete' : 'ready');
  observerCallback([{ isIntersecting: true }]);
  if (!reduced) {
    assert.equal(flow.dataset.motion, 'playing');
    assert.equal(timers.size, 1);
    const timer = [...timers.values()][0];
    assert.ok(timer.delay <= 5000, 'Cycle ends within five seconds');
    timer.fn();
  }
  assert.equal(flow.dataset.motion, 'complete');
  observerCallback([{ isIntersecting: false }]); observerCallback([{ isIntersecting: true }]);
  assert.equal(flow.dataset.motion, 'complete', 'Scroll does not replay');
  media.matches = true; events.media(); media.matches = false; events.media();
  assert.equal(flow.dataset.motion, 'complete', 'Preference changes never restart animation');
}
const copy = await readFile(new URL('../src/data/home.ts', import.meta.url), 'utf8');
assert.ok(copy.includes("headline: ['从 AI Gateway，', '到完整的', 'AI 应用系统。']"));
assert.ok(copy.includes("headline: ['Start with a gateway.', 'Build an entire', 'AI application.']"));
assert.ok(copy.includes('让 AI 对话长出可复用、可管理、持续沉淀的知识库与业务系统。'));
assert.ok(copy.includes('Grow reusable, manageable knowledge bases and business systems from your AI conversations.'));
for (const path of ['../dist/index.html', '../dist/zh/index.html']) {
  const html = await readFile(new URL(path, import.meta.url), 'utf8');
  assert.equal((html.match(/<li style="--beam-delay:/g) ?? []).length, 6, 'Six layers');
  assert.equal((html.match(/class="hero-flow-client"/g) ?? []).length, 3, 'Three independent client columns');
  for (const label of ['DB', 'CRUD API', 'Workflow API', 'React Block']) assert.ok(html.includes(label));
  assert.ok(!html.includes('data-flow-toggle'));
  assert.ok(html.includes('data-flow-tooltip'));
  assert.equal((html.match(/<button\b[^>]*\bdata-flow-node/g) ?? []).length, 18, 'All nodes expose explanations');
  assert.ok(!html.includes('从你熟悉的本地 Agent 开始'));
}
console.log('PASS: clean six-layer markup, 18 accessible explanations, preserved copy, one-shot motion under 5s, no scroll replay, reduced-motion static');
