// CSS pixels per second, independent of a panel's aspect ratio or screen width.
export const BEAM_SPEED = 520;
export const BEAM_GAP = 2000;
export const roundedPerimeter = (width: number, height: number, radius = 7) => {
  const r = Math.min(radius, width / 2, height / 2);
  return 2 * (width + height - 4 * r) + 2 * Math.PI * r;
};
export function beamSchedule(lengths: number[][]) {
  let start = 0;
  const layers = lengths.map(paths => {
    const duration = Math.max(...paths) / BEAM_SPEED * 1000;
    const layer = { start, duration };
    start += duration;
    return layer;
  });
  return { layers, cycle: start + BEAM_GAP };
}
export function beamFrames(length: number, start: number, cycle: number) {
  const begin = start / cycle;
  const end = (start + length / BEAM_SPEED * 1000) / cycle;
  const fade = Math.min(180 / cycle, (end - begin) / 4);
  // The dash moves a real arc length. Opacity fades independently, never easing position.
  return [
    { offset: 0, strokeDashoffset: '0', opacity: 0 },
    { offset: begin, strokeDashoffset: '0', opacity: 0 },
    { offset: begin + fade, strokeDashoffset: `${-BEAM_SPEED * fade * cycle / 1000}`, opacity: .65 },
    { offset: end - fade, strokeDashoffset: `${-length + BEAM_SPEED * fade * cycle / 1000}`, opacity: .65 },
    { offset: end, strokeDashoffset: `${-length}`, opacity: 0 },
    { offset: 1, strokeDashoffset: `${-length}`, opacity: 0 },
  ];
}
export function installHeroBeam(flow: HTMLElement) {
  const ns = 'http://www.w3.org/2000/svg';
  const layers = Array.from(flow.querySelectorAll<HTMLElement>('.hero-flow-layers > li'));
  const panels = layers.map(layer => Array.from(layer.querySelectorAll<HTMLElement>('.flow-layer-panel')).map(panel => {
    const svg = document.createElementNS(ns, 'svg');
    svg.classList.add('hero-edge-beam');
    svg.setAttribute('aria-hidden', 'true');
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', '1'); rect.setAttribute('y', '1'); rect.setAttribute('rx', '7');
    svg.appendChild(rect); panel.appendChild(svg);
    return { panel, svg, rect };
  }));
  let animations: Animation[] = [];
  let schedule = beamSchedule([[1]]);
  let signature = '';
  const sync = () => animations.forEach(animation => {
    if (flow.dataset.motion === 'playing') animation.play(); else animation.pause();
  });
  const resize = () => {
    const sizes = panels.map(group => group.map(({ panel }) => (() => { const { width, height } = panel.getBoundingClientRect(); return { width, height }; })()));
    const nextSignature = JSON.stringify(sizes);
    if (signature === nextSignature) return;
    signature = nextSignature;
    const oldTime = Number(animations[0]?.currentTime ?? 0) % schedule.cycle;
    const oldIndex = schedule.layers.findIndex(layer => oldTime < layer.start + layer.duration);
    const oldLayer = schedule.layers[oldIndex];
    const fraction = oldLayer ? Math.max(0, (oldTime - oldLayer.start) / oldLayer.duration) : (oldTime - schedule.cycle + BEAM_GAP) / BEAM_GAP;
    animations.forEach(animation => animation.cancel());
    const lengths = sizes.map(group => group.map(({ width, height }) => roundedPerimeter(Math.max(1, width - 2), Math.max(1, height - 2))));
    schedule = beamSchedule(lengths);
    const nextLayer = schedule.layers[oldIndex];
    const time = nextLayer ? nextLayer.start + fraction * nextLayer.duration : schedule.cycle - BEAM_GAP + fraction * BEAM_GAP;
    animations = panels.flatMap((group, i) => group.map(({ svg, rect }, j) => {
      const { width, height } = sizes[i][j];
      const length = lengths[i][j];
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      rect.setAttribute('width', `${Math.max(1, width - 2)}`);
      rect.setAttribute('height', `${Math.max(1, height - 2)}`);
      const dash = Math.min(76, length * .12);
      rect.setAttribute('stroke-dasharray', `${dash} ${length - dash}`);
      const animation = rect.animate(beamFrames(length, schedule.layers[i].start, schedule.cycle), { duration: schedule.cycle, iterations: Infinity, easing: 'linear' });
      animation.pause(); animation.currentTime = time;
      return animation;
    }));
    sync();
  };
  const observer = new ResizeObserver(resize);
  panels.flat().forEach(({ panel }) => observer.observe(panel));
  resize();
  return { sync, destroy: () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); panels.flat().forEach(({ svg }) => svg.remove()); } };
}
