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
assert.ok(copy.includes("headline: ['从 Agent 聊天记录中，', '长出你的应用。']"));
assert.ok(copy.includes("headline: ['From agent conversations,', 'grow your applications.']"));
assert.ok(copy.includes('从 AI Gateway 到完整 AI 应用'));
assert.ok(copy.includes('From AI Gateway to complete AI applications.'));
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
const conversation = await readFile(new URL('../src/components/HeroConversation.astro',import.meta.url),'utf8');
assert.ok(home.indexOf('<HeroConversation')<home.indexOf('architecture-section')&&home.indexOf('architecture-section')<home.indexOf('<HeroFlow'),'Conversation visual precedes unchanged architecture');
assert.ok(!conversation.includes('.png'),'No embedded screenshot');
assert.ok(conversation.includes('构建示例')&&conversation.includes('sample data'));
assert.ok(!conversation.includes('+33%')&&!conversation.includes('-17%'),'No pretend trend metrics');
assert.ok(conversation.includes('prefers-reduced-motion:reduce'));
assert.ok(copy.includes("primary: '快速开始', secondary: 'GitHub'"));
assert.ok(home.includes('href="#get-started"')&&home.includes('href={SITE.repository}'));
const demoScript=conversation.match(/<script>([\s\S]*?)<\/script>/)[1];
const demoEvents={};const tabEvents=[];const tabs=Array.from({length:3},(_,i)=>({attrs:{},tabIndex:0,setAttribute(k,v){this.attrs[k]=v;},focus(){demoEvents.focus=i;},addEventListener(k,f){(tabEvents[i]??={})[k]=f;}}));
const demoPanels=Array.from({length:3},()=>({hidden:false}));const dialog={open:false,showModal(){this.open=true;},close(){this.open=false;demoEvents.close();},addEventListener(k,f){demoEvents[k]=f;},getBoundingClientRect(){return {left:0,right:100,top:0,bottom:100};}};
const trigger={focus(){demoEvents.returned=true;},addEventListener(_k,f){demoEvents.trigger=f;}};
const root={querySelectorAll:s=>s==='[data-demo-tab]'?tabs:demoPanels,querySelector:s=>s==='dialog'?dialog:trigger};
vm.runInNewContext(ts.transpileModule(demoScript,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,{document:{querySelectorAll:()=>[root]}});
tabEvents[1].click();assert.equal(tabs[1].attrs['aria-selected'],'true');assert.equal(demoPanels[1].hidden,false);assert.equal(demoPanels[0].hidden,true);
tabEvents[1].keydown({key:'ArrowRight',preventDefault(){}});assert.equal(demoEvents.focus,2);assert.equal(tabs[2].tabIndex,0);
tabEvents[2].keydown({key:'Home',preventDefault(){}});assert.equal(demoEvents.focus,0);assert.equal(demoPanels[0].hidden,false);
tabEvents[0].keydown({key:'ArrowLeft',preventDefault(){}});assert.equal(demoEvents.focus,2);
demoEvents.trigger();assert.equal(dialog.open,true);demoEvents.click({target:dialog,clientX:110,clientY:110});assert.equal(dialog.open,false);assert.equal(demoEvents.returned,true);
for(const path of ['../dist/index.html','../dist/zh/index.html']){const html=await readFile(new URL(path,import.meta.url),'utf8');assert.ok(html.includes('data-conversation-demo'));assert.equal((html.match(/data-demo-tab=/g)??[]).length,3);assert.ok(html.includes('sample-conversation'));}
console.log('PASS: selected new hero copy/CTA targets, no raster hero, explicit sample data, working tabs/keyboard/local-source dialog, reduced-motion static');
