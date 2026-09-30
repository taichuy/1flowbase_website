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
assert.ok(!source.includes('conic-gradient'), 'No angular projection speed changes');
assert.ok(source.includes('installHeroBeam'), 'Geometry-based beam installed');
assert.ok(!source.includes('<h3>') && !source.includes('<figcaption>'), 'No layer headings or bottom note');
assert.ok(nodeSource.includes('aria-describedby={id}'), 'Every node has an accessible description');
assert.ok(source.includes('prefers-reduced-motion:reduce'));
const js = ts.transpileModule(script.replace(/import \{ installHeroBeam \} from '[^']+';/, ''), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
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
      installHeroBeam: () => ({ sync() {}, destroy() {} }),
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
  assert.equal((html.match(/class="hero-flow-layers"[^>]*>[\s\S]*?<\/ol>/)?.[0].match(/<li\b/g) ?? []).length, 6, 'Six layers');
  assert.equal((html.match(/class="hero-flow-client"/g) ?? []).length, 3, 'Three independent client columns');
  for (const label of ['DB', 'CRUD API', 'Workflow API', 'React Block']) assert.ok(html.includes(label));
  assert.ok(!html.includes('data-flow-toggle'));
  assert.ok(html.includes('data-flow-tooltip'));
  assert.ok(html.includes('role="switch"'));

  assert.equal((html.match(/<button\b[^>]*\bdata-flow-node/g) ?? []).length, 18, 'All nodes expose explanations');
  assert.ok(!html.includes('从你熟悉的本地 Agent 开始'));
  const labels=Array.from(html.matchAll(/<button\b[^>]*data-flow-node[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/g),m=>m[1]);
  const expected=path.includes('/zh/')?['Codex','Claude Code','DeepSeek harness','1flowbase 网关 · Chat','Agent 对话记录','业务数据','DB','CRUD API','Workflow API','React Block','Token 用量','知识库','业务管理','报表','GUI 图形界面','MCP 工具接口','用户','Agent']:['Codex','Claude Code','DeepSeek harness','1flowbase Gateway · Chat','Agent conversations','Business data','DB','CRUD API','Workflow API','React Block','Token usage','Knowledge base','Business tools','Reports','GUI interface','MCP tools','People','Agents'];
  assert.deepEqual(labels,expected,'Row-major card order including gateway');
}
// Test actual beam setup, timing, pause/resume and resize with deterministic geometry.
const beamSource = await readFile(new URL('../src/lib/heroBeam.ts', import.meta.url), 'utf8');
const module = { exports: {} };
let resize;
const allAnimations = [];
const element = () => ({ attrs:{}, classList:{add(){}}, setAttribute(k,v){this.attrs[k]=v;}, appendChild(child){this.child=child;}, remove(){}, animate(frames,options){const a={frames,options,currentTime:0,state:'running',play(){this.state='running';},pause(){this.state='paused';},cancel(){this.state='cancelled';}};allAnimations.push(a);return a;} });
vm.runInNewContext(ts.transpileModule(beamSource, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText, {exports:module.exports,document:{createElementNS:element},ResizeObserver:class {constructor(fn){resize=fn;}observe(){}disconnect(){}}});
const { BEAM_SPEED, roundedPerimeter, roundedPath, beamSchedule, beamFrames, installHeroBeam } = module.exports;
assert.equal(BEAM_SPEED,260);
assert.ok(Math.abs(roundedPerimeter(100,40,7)-(280-56+14*Math.PI))<1e-9);
assert.equal(roundedPath(100,40), 'M 94 1 A 5 5 0 0 1 99 6 V 34 A 5 5 0 0 1 94 39 H 6 A 5 5 0 0 1 1 34 V 6 A 5 5 0 0 1 6 1 H 94 Z', 'Clockwise loop starts and ends at the upper-right tangent');
const panels = Array.from({length:18},(_,i)=>({width:i===3?475:140+i*2,height:40,appendChild(svg){this.svg=svg;},getBoundingClientRect(){return {width:this.width,height:this.height};}}));
const fixture = {dataset:{motion:'playing'},querySelectorAll:selector=>{assert.equal(selector,'[data-flow-node]');return panels;}};
const beam = installHeroBeam(fixture);
let active = allAnimations.filter(a=>a.state!=='cancelled');
assert.equal(active.length,18,'Exactly one path per actual card');
const check = () => {
  const lengths=panels.map(p=>roundedPerimeter(p.width-2,p.height-2));
  const schedule=beamSchedule(lengths);
  schedule.cards.forEach((card,i)=>{assert.equal(card.start,i? schedule.cards[i-1].start+schedule.cards[i-1].duration:0);assert.ok(Math.abs(card.duration-lengths[i]/260*1000)<1e-9);});
  assert.equal(schedule.cycle,schedule.cards.at(-1).start+schedule.cards.at(-1).duration+2000);
  lengths.forEach((length,i)=>{
    const a=active[i]; assert.equal(a.options.duration,schedule.cycle);assert.equal(a.options.easing,'linear');assert.equal(a.options.iterations,Infinity);
    const dash=Math.min(54,length*.12); const f=beamFrames(length,schedule.cards[i].start,schedule.cycle,dash);
    assert.deepEqual(a.frames,f);
    assert.equal(Number(f[1].strokeDashoffset),dash,'Head begins at path origin');
    assert.ok(Math.abs(dash-Number(f[4].strokeDashoffset)-length)<1e-9,'Head completes exactly one perimeter before next card');
    assert.equal(panels[i].svg.child.attrs.d,roundedPath(panels[i].width,panels[i].height));
    for(let j=2;j<=4;j++){const distance=Number(f[j].strokeDashoffset)-Number(f[j-1].strokeDashoffset);const seconds=(f[j].offset-f[j-1].offset)*schedule.cycle/1000;assert.ok(Math.abs(-distance/seconds-260)<1e-8,'Equal speed during fade, straight edges and turns');}
  });
  for(let time=0;time<schedule.cycle;time+=17){assert.ok(schedule.cards.filter(c=>time>c.start&&time<c.start+c.duration).length<=1,'Never two active cards');}
  return schedule;
};
const before=check();active.forEach(a=>a.currentTime=before.cards[7].start+before.cards[7].duration*.4);
fixture.dataset.motion='paused';beam.sync();const paused=active[0].currentTime;assert.ok(active.every(a=>a.state==='paused'));fixture.dataset.motion='playing';beam.sync();assert.equal(active[0].currentTime,paused,'Resume keeps card and arc position');
panels.forEach((p,i)=>{p.width=i===3?326:155;p.height=70;});resize();active=allAnimations.filter(a=>a.state!=='cancelled');const after=check();assert.ok(Math.abs(active[0].currentTime-(after.cards[7].start+after.cards[7].duration*.4))<1e-8,'Resize preserves card and proportional perimeter position');
fixture.dataset.motion='static';beam.sync();assert.ok(active.every(a=>a.state==='paused'));beam.destroy();assert.ok(allAnimations.every(a=>a.state==='cancelled'));
console.log('PASS: constant 260px/s SVG arc speed, 18 clockwise card loops from upper-right, single-card order, resize continuity, pause/resume, switch/session, hover/focus/tooltip/offscreen/hidden/reduced-motion, preserved layout and copy');

const home = await readFile(new URL('../src/components/HomePage.astro',import.meta.url),'utf8');
const value = await readFile(new URL('../src/components/HeroValue.astro',import.meta.url),'utf8');
assert.ok(home.indexOf('<HeroValue')<home.indexOf('architecture-section')&&home.indexOf('architecture-section')<home.indexOf('<HeroFlow'),'Native value visual in hero; architecture follows in its own section');
assert.ok(!value.includes('<img')&&!value.includes('.png'),'Reference is recreated as native markup');
assert.ok(value.includes('概念说明')&&value.includes('Concept note'));
assert.ok(value.includes('需配置兼容的模型接口')&&value.includes('Configure a compatible model endpoint'));
assert.ok(value.includes('value-feedback')&&value.includes('value-charts'));
console.log('PASS: native value-cycle visual, explicit concept boundary, architecture relocated below hero');

assert.ok(home.includes('hero-stack'));
assert.ok(value.includes('value-stages')&&value.includes('grid-template-columns:minmax(0,1fr) 58px minmax(0,1.35fr) 58px minmax(0,1fr)'));
console.log('PASS: stacked page hero with wide left-to-right concept stages and mobile vertical reflow');

for (const label of ['Claude Code','Codex','OpenClaw','DeepSeek harness','AionUi','更多 Agent']) assert.ok(value.includes(label));
assert.ok(value.includes('从聊天记录中长出 AI 应用')&&value.includes('Grow AI applications from chat history'));
assert.ok(value.includes('聊天 · 沉淀 · 记忆 · Agent 自进化')&&value.includes('Chat · Capture · Memory · Agent evolution'));
assert.ok(value.includes('不代表自动训练模型')&&value.includes('automatic model training'));
console.log('PASS: familiar client examples, revised bilingual copy and accessible configuration/concept notes');
