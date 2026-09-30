// CSS pixels per second, independent of a panel's aspect ratio or screen width.
export const BEAM_SPEED = 260;
export const BEAM_GAP = 2000;
export const roundedPerimeter = (width: number, height: number, radius = 5) => {
  const r = Math.min(radius, width / 2, height / 2);
  return 2 * (width + height - 4 * r) + 2 * Math.PI * r;
};
// Start at the upper-right tangent, travel clockwise, and close at exactly that point.
export function roundedPath(width: number, height: number, radius = 5) {
  const right = Math.max(2, width - 1), bottom = Math.max(2, height - 1);
  const r = Math.min(radius, (right - 1) / 2, (bottom - 1) / 2);
  return `M ${right-r} 1 A ${r} ${r} 0 0 1 ${right} ${1+r} V ${bottom-r} A ${r} ${r} 0 0 1 ${right-r} ${bottom} H ${1+r} A ${r} ${r} 0 0 1 1 ${bottom-r} V ${1+r} A ${r} ${r} 0 0 1 ${1+r} 1 H ${right-r} Z`;
}
export function beamSchedule(lengths: number[]) {
  let start = 0;
  const cards = lengths.map(length => {
    const duration = length / BEAM_SPEED * 1000;
    const card = { start, duration };
    start += duration;
    return card;
  });
  return { cards, cycle: start + BEAM_GAP };
}
export function beamFrames(length: number, start: number, cycle: number, dash = 0) {
  const begin = start / cycle;
  const end = (start + length / BEAM_SPEED * 1000) / cycle;
  const fade = Math.min(180 / cycle, (end - begin) / 4);
  // The dash moves a real arc length. Opacity fades independently, never easing position.
  return [
    { offset: 0, strokeDashoffset: `${dash}`, opacity: 0 },
    { offset: begin, strokeDashoffset: `${dash}`, opacity: 0 },
    { offset: begin + fade, strokeDashoffset: `${dash - BEAM_SPEED * fade * cycle / 1000}`, opacity: .65 },
    { offset: end - fade, strokeDashoffset: `${dash - length + BEAM_SPEED * fade * cycle / 1000}`, opacity: .65 },
    { offset: end, strokeDashoffset: `${dash - length}`, opacity: 0 },
    { offset: 1, strokeDashoffset: `${dash - length}`, opacity: 0 },
  ];
}
export function installHeroBeam(flow: HTMLElement) {
  const ns = 'http://www.w3.org/2000/svg';
  // DOM order is row-major at both desktop and narrow grid breakpoints.
  const panels = Array.from(flow.querySelectorAll<HTMLElement>('[data-flow-node]')).map(panel => {
    const svg = document.createElementNS(ns, 'svg');
    svg.classList.add('hero-edge-beam');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(ns, 'path');
    svg.appendChild(path); panel.appendChild(svg);
    return { panel, svg, path };
  });
  let animations: Animation[] = [];
  let schedule = beamSchedule([1]);
  let signature = '';
  const sync = () => animations.forEach(animation => {
    if (flow.dataset.motion === 'playing') animation.play(); else animation.pause();
  });
  const resize = () => {
    const sizes = panels.map(({ panel }) => { const { width, height } = panel.getBoundingClientRect(); return { width, height }; });
    const nextSignature = JSON.stringify(sizes);
    if (signature === nextSignature) return;
    signature = nextSignature;
    const oldTime = Number(animations[0]?.currentTime ?? 0) % schedule.cycle;
    const oldIndex = schedule.cards.findIndex(layer => oldTime < layer.start + layer.duration);
    const oldLayer = schedule.cards[oldIndex];
    const fraction = oldLayer ? Math.max(0, (oldTime - oldLayer.start) / oldLayer.duration) : (oldTime - schedule.cycle + BEAM_GAP) / BEAM_GAP;
    animations.forEach(animation => animation.cancel());
    const lengths = sizes.map(({ width, height }) => roundedPerimeter(Math.max(1, width - 2), Math.max(1, height - 2)));
    schedule = beamSchedule(lengths);
    const nextLayer = schedule.cards[oldIndex];
    const time = nextLayer ? nextLayer.start + fraction * nextLayer.duration : schedule.cycle - BEAM_GAP + fraction * BEAM_GAP;
    animations = panels.map(({ svg, path }, i) => {
      const { width, height } = sizes[i];
      const length = lengths[i];
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      path.setAttribute('d', roundedPath(width, height));
      const dash = Math.min(54, length * .12);
      path.setAttribute('stroke-dasharray', `${dash} ${length - dash}`);
      const animation = path.animate(beamFrames(length, schedule.cards[i].start, schedule.cycle, dash), { duration: schedule.cycle, iterations: Infinity, easing: 'linear' });
      animation.pause(); animation.currentTime = time;
      return animation;
    });
    sync();
  };
  const observer = new ResizeObserver(resize);
  panels.forEach(({ panel }) => observer.observe(panel));
  resize();
  return { sync, destroy: () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); panels.forEach(({ svg }) => svg.remove()); } };
}
