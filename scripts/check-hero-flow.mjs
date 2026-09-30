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
}
// Test actual beam setup, timing, pause/resume and resize with deterministic geometry.
const beamSource = await readFile(new URL('../src/lib/heroBeam.ts', import.meta.url), 'utf8');
const module = { exports: {} };
let resize;
const allAnimations = [];
const element = () => ({ attrs:{}, classList:{add(){}}, setAttribute(k,v){this.attrs[k]=v;}, appendChild(child){this.child=child;}, remove(){}, animate(frames,options){const a={frames,options,currentTime:0,state:'running',play(){this.state='running';},pause(){this.state='paused';},cancel(){this.state='cancelled';}};allAnimations.push(a);return a;} });
vm.runInNewContext(ts.transpileModule(beamSource, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText, {exports:module.exports,document:{createElementNS:element},ResizeObserver:class {constructor(fn){resize=fn;}observe(){}disconnect(){}}});
const { BEAM_SPEED, roundedPerimeter, beamSchedule, beamFrames, installHeroBeam } = module.exports;
assert.equal(BEAM_SPEED,260);
assert.ok(Math.abs(roundedPerimeter(100,40,7)-(280-56+14*Math.PI))<1e-9);
const panels = Array.from({length:6},(_,i)=>Array.from({length:i===0?2:1},()=>({width:475,height:42+i*2,appendChild(svg){this.svg=svg;},getBoundingClientRect(){return {width:this.width,height:this.height};}})));
const fixture = {dataset:{motion:'playing'},querySelectorAll:()=>panels.map(group=>({querySelectorAll:()=>group}))};
const beam = installHeroBeam(fixture);
let active = allAnimations.filter(a=>a.state!=='cancelled');
assert.equal(active.length,7);
const check = () => {
  const lengths=panels.map(group=>group.map(p=>roundedPerimeter(p.width-2,p.height-2)));
  const schedule=beamSchedule(lengths);
  schedule.layers.forEach((layer,i)=>{assert.equal(layer.start,i? schedule.layers[i-1].start+schedule.layers[i-1].duration:0);assert.ok(Math.abs(layer.duration-Math.max(...lengths[i])/260*1000)<1e-9);});
  assert.equal(schedule.cycle,schedule.layers.at(-1).start+schedule.layers.at(-1).duration+2000);
  let k=0;
  lengths.forEach((group,i)=>group.forEach(length=>{
    const a=active[k++]; assert.equal(a.options.duration,schedule.cycle);assert.equal(a.options.easing,'linear');assert.equal(a.options.iterations,Infinity);
    const f=beamFrames(length,schedule.layers[i].start,schedule.cycle);
    for(let j=2;j<=4;j++){const distance=Number(f[j].strokeDashoffset)-Number(f[j-1].strokeDashoffset);const seconds=(f[j].offset-f[j-1].offset)*schedule.cycle/1000;assert.ok(Math.abs(-distance/seconds-260)<1e-8,'Equal speed during fade, straight edges and turns');}
  }));
  return schedule;
};
const before=check();active.forEach(a=>a.currentTime=before.layers[2].start+before.layers[2].duration*.4);
fixture.dataset.motion='paused';beam.sync();const paused=active[0].currentTime;assert.ok(active.every(a=>a.state==='paused'));fixture.dataset.motion='playing';beam.sync();assert.equal(active[0].currentTime,paused,'Resume keeps arc position');
panels.flat().forEach(p=>{p.width=326;p.height=70;});resize();active=allAnimations.filter(a=>a.state!=='cancelled');const after=check();assert.ok(Math.abs(active[0].currentTime-(after.layers[2].start+after.layers[2].duration*.4))<1e-8,'Resize preserves layer and proportional perimeter position');
fixture.dataset.motion='static';beam.sync();assert.ok(active.every(a=>a.state==='paused'));beam.destroy();assert.ok(allAnimations.every(a=>a.state==='cancelled'));
console.log('PASS: constant 260px/s SVG arc speed, sequential geometry-based timing, resize continuity, pause/resume, switch/session, hover/focus/tooltip/offscreen/hidden/reduced-motion, preserved layout and copy');
