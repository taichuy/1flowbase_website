import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const home = await readFile(new URL('../src/components/HomePage.astro', import.meta.url), 'utf8');
const script = home.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);
assert.match(home, /href="#get-started"/);
assert.match(home, /releases\/latest\/download\/\$\{filename\}/);
assert.doesNotMatch(home, /<dialog/);

async function scenario({ platform, userAgent, hints, maxTouchPoints = 0 }) {
  const label = { textContent: 'Local install' };
  let click;
  const install = { href: 'https://github.com/taichuy/1flowbase/releases/latest',
    querySelector: () => label, addEventListener: (_event, callback) => { click = callback; }, contains: () => false };
  const options = [
    ['windows', 'x64', 'Windows · x64', '1flowbase-windows-x64.zip'],
    ['macos', 'arm64', 'macOS · Apple Silicon (arm64)', '1flowbase-macos-arm64.tar.gz'],
    ['macos', 'x64', 'macOS · Intel (x64)', '1flowbase-macos-x64.tar.gz'],
    ['linux', 'x64', 'Linux · x64', '1flowbase-linux-x64.tar.gz'],
    ['linux', 'arm64', 'Linux · arm64', '1flowbase-linux-arm64.tar.gz'],
  ];
  const summary = { focus() {} };
  const selector = { open: false, contains: () => false, querySelector(value) {
    if (value === 'summary') return summary;
    const match = value.match(/data-download-os="(.*?)"\]\[data-download-arch="(.*?)"/);
    const option = match && options.find(([os, arch]) => os === match[1] && arch === match[2]);
    return option && { href: `https://github.com/taichuy/1flowbase/releases/latest/download/${option[3]}`, querySelector: () => ({ textContent: option[2] }) };
  } };
  const document = { querySelector(value) {
    if (value === '[data-local-install]') return install;
    if (value === '[data-download-selector]') return selector;
    if (value === '.runtime-home') return { getAttribute: () => 'en' };
    return null;
  }, querySelectorAll: () => [], addEventListener() {} };
  const navigator = { userAgent, platform, maxTouchPoints, userAgentData: hints && { platform, getHighEntropyValues: async () => hints } };
  vm.runInNewContext(ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, { document, navigator, Node: class {} });
  await new Promise(resolve => setImmediate(resolve));
  let prevented = false;
  click({ preventDefault() { prevented = true; } });
  return { install, label, selector, prevented };
}

const windows = await scenario({ platform: 'Win32', userAgent: 'Windows NT 10.0; Win64; x64' });
assert.match(windows.install.href, /latest\/download\/1flowbase-windows-x64\.zip$/);
assert.match(windows.label.textContent, /Windows/);
assert.equal(windows.prevented, false);
const armMac = await scenario({ platform: 'macOS', userAgent: 'Macintosh', hints: { architecture: 'arm', bitness: '64' } });
assert.match(armMac.install.href, /macos-arm64\.tar\.gz$/);
const mac = await scenario({ platform: 'MacIntel', userAgent: 'Macintosh' });
assert.equal(mac.prevented, true);
assert.equal(mac.selector.open, true);
assert.match(mac.label.textContent, /Choose/);
const linux = await scenario({ platform: 'Linux aarch64', userAgent: 'Linux aarch64' });
assert.match(linux.install.href, /linux-arm64\.tar\.gz$/);
const mobile = await scenario({ platform: 'Linux', userAgent: 'Android Linux' });
assert.equal(mobile.selector.open, true);
const ipad = await scenario({ platform: 'MacIntel', userAgent: 'Macintosh', maxTouchPoints: 5, hints: { architecture: 'arm', bitness: '64' } });
assert.equal(ipad.selector.open, true);
const windowsArm = await scenario({ platform: 'Win32', userAgent: 'Windows NT 10.0; ARM64' });
assert.equal(windowsArm.selector.open, true);
console.log('PASS: direct downloads, system selection and unsupported device fallback');
