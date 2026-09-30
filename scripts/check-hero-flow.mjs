import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const source = await readFile(new URL('../src/components/HeroFlow.astro', import.meta.url), 'utf8');
const nodeSource = await readFile(new URL('../src/components/HeroFlowNode.astro', import.meta.url), 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);
assert.ok(!source.includes('data-flow-toggle'), 'No prominent in-diagram pause control');
assert.ok(source.indexOf('data-motion-control') > source.indexOf('</figure>'), 'Quiet motion switch stays outside diagram');
assert.ok(source.includes('flow-border-beam 14s linear var(--beam-delay) infinite'), '14-second repeating cycle');
assert.ok(source.includes('14.2857%,100%'), 'Two-second active beam within 14-second cycle');
assert.ok(!source.includes('<h3>') && !source.includes('<figcaption>'), 'No layer headings or bottom note');
assert.ok(nodeSource.includes('aria-describedby={id}'), 'Every node has an accessible description');
assert.ok(source.includes('prefers-reduced-motion:reduce'));
const js = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
for (const reduced of [false, true]) {
  for (const savedOff of [false, true]) {
    const events = {}; const flowEvents = {}; const buttonEvents = {}; const controlEvents = {};
    const store = new Map(savedOff ? [['1flowbase:hero-motion','off']] : []);
    let observerCallback;
    const media = { matches: reduced, addEventListener: (_event, fn) => { events.media = fn; }, removeEventListener() {} };
    const control = { checked: false, disabled: false, addEventListener: (event, fn) => { controlEvents[event] = fn; } };
    const status = { dataset: { on:'On',off:'Off',system:'System' }, textContent:'' };
    const widget = { querySelector: selector => selector === '[data-motion-control]' ? control : selector === '[data-motion-status]' ? status : { removeAttribute() {} } };
    const tip = { hidden: true, style: {}, addEventListener() {}, remove() {}, getBoundingClientRect: () => ({width:200,height:40}) };
    const button = { dataset: { description:'Explanation' }, addEventListener: (event, fn) => { buttonEvents[event] = fn; }, getBoundingClientRect: () => ({left:100,top:200,bottom:240,width:120}) };
    const flow = { dataset: {}, closest: () => widget, querySelector: () => tip, querySelectorAll: () => [button], addEventListener: (event, fn) => { flowEvents[event] = fn; }, contains: node => node === button };
    const doc = { hidden:false, activeElement:null, querySelectorAll: () => [flow], body: { appendChild() {} }, addEventListener: (event, fn) => { events[event] = fn; }, removeEventListener() {} };
    class Observer { constructor(fn) { observerCallback = fn; } observe() {} disconnect() {} }
    vm.runInNewContext(js, {
      document: doc,
      window: { innerWidth:400,innerHeight:700,matchMedia: () => media, addEventListener() {}, removeEventListener() {} },
      sessionStorage: { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) },
      IntersectionObserver: Observer, setTimeout: () => 1, clearTimeout() {},
    });
    const isOff = reduced || savedOff;
    assert.equal(flow.dataset.motion, isOff ? 'static' : 'paused');
    observerCallback([{ isIntersecting:true }]);
    assert.equal(flow.dataset.motion, isOff ? 'static' : 'playing');
    if (!isOff) {
      flowEvents.pointerenter({pointerType:'mouse'}); assert.equal(flow.dataset.motion,'paused');
      flowEvents.pointerleave(); assert.equal(flow.dataset.motion,'playing');
      flowEvents.focusin(); assert.equal(flow.dataset.motion,'paused');
      flowEvents.focusout({relatedTarget:null}); assert.equal(flow.dataset.motion,'playing');
      buttonEvents.click(); assert.equal(flow.dataset.motion,'paused'); assert.equal(tip.hidden,false);
      buttonEvents.click(); assert.equal(flow.dataset.motion,'playing'); assert.equal(tip.hidden,true);
      observerCallback([{isIntersecting:false}]); assert.equal(flow.dataset.motion,'paused');
      observerCallback([{isIntersecting:true}]); assert.equal(flow.dataset.motion,'playing');
      doc.hidden=true; events.visibilitychange(); assert.equal(flow.dataset.motion,'paused');
      doc.hidden=false; events.visibilitychange(); assert.equal(flow.dataset.motion,'playing');
    }
    media.matches=true; events.media(); assert.equal(flow.dataset.motion,'static'); assert.equal(control.disabled,true);
    media.matches=false; events.media(); assert.equal(flow.dataset.motion,savedOff?'static':'playing');
    control.checked=false; controlEvents.change(); assert.equal(store.get('1flowbase:hero-motion'),'off');
    flowEvents.pointerleave(); observerCallback([{isIntersecting:true}]);
    media.matches=true; events.media(); media.matches=false; events.media();
    assert.equal(flow.dataset.motion,'static','Hover, visibility or system preference cannot override manual off');
    control.checked=true; controlEvents.change(); assert.equal(flow.dataset.motion,'playing');
    assert.equal(store.get('1flowbase:hero-motion'),'on');
  }
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
  assert.ok(html.includes('role="switch"'));
  for (const delay of [0,2,4,6,8,10]) assert.ok(html.includes(`--beam-delay:${delay}s`));
  assert.equal((html.match(/<button\b[^>]*\bdata-flow-node/g) ?? []).length, 18, 'All nodes expose explanations');
  assert.ok(!html.includes('从你熟悉的本地 Agent 开始'));
}
console.log('PASS: 14-second loop / 2-second layer delays, quiet external switch, session preference, hover/focus/tooltip pause, offscreen/hidden pause, reduced motion, preserved layout and copy');
