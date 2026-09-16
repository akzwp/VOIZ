/* DOM/interaction and build checks, not a substitute for live browser layout QA. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const postcss = require('postcss');
const { root, read, page, labels, render, base } = require('./preview-data.cjs');
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }
function eq(actual, expected, message) { assert.deepEqual(actual, expected, message); checks++; }
const runtime = read('theme/vitenant/js/voiz-ui.js');
new vm.Script(runtime);
const css = read('theme/vitenant/css/voiz-tailwind.css');
const tree = postcss.parse(css);
check(!/@(?:tailwind|apply|import)\b/.test(css), 'Compiled stylesheet must be self-contained');
check(css.includes('.tw-flex'), 'Real Tailwind utilities are generated');
check(!/https?:\/\//.test(css), 'Stylesheet must not request remote assets');
let fonts = 0;
tree.walkDecls('src', declaration => {
  for (const match of declaration.value.matchAll(/url\(["']?([^)'" ]+)/g)) {
    const font = path.resolve(root, 'theme/vitenant/css', match[1]);
    check(fs.existsSync(font), 'Local font exists: ' + match[1]);
    eq(fs.readFileSync(font).subarray(0, 4).toString(), 'wOF2', 'Font is a valid WOFF2 container');
    fonts++;
  }
});
eq(fonts, 4, 'Only necessary local font weights are loaded');
const themeTokens = {};
tree.walkRules(rule => {
  if (rule.selector === ':root,[data-theme=dark]' || rule.selector === '[data-theme=light]') {
    const name = rule.selector.includes(':root') ? 'dark' : 'light';
    themeTokens[name] = {};
    rule.walkDecls(decl => { themeTokens[name][decl.prop] = decl.value; });
  }
});
function luminance(hex) {
  hex = hex.replace('#', ''); if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
  const channels = hex.match(/../g).map(c => parseInt(c, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
for (const name of ['dark', 'light']) {
  const tokens = { ...themeTokens.dark, ...themeTokens[name] };
  check(Object.keys(tokens).length > 25, name + ': theme tokens loaded');
  for (const foreground of ['--voiz-text', '--voiz-text-soft', '--voiz-muted', '--voiz-primary-text']) {
    for (const background of ['--voiz-bg', '--voiz-surface', '--voiz-surface-2']) {
      check(contrast(tokens[foreground], tokens[background]) >= 4.5, name + ': readable ' + foreground + ' on ' + background);
    }
  }
  check(contrast(tokens['--voiz-primary'], '#fff') >= 4.5, name + ': primary button text contrast');
  check(contrast(tokens['--voiz-border-strong'], tokens['--voiz-input-bg']) >= 3, name + ': visible input borders');
}
const longText = 'شرح طولانی برای آزمایش بیرون نزدن متن و حفظ خوانایی '.repeat(8);
const identifier = 'SIP/' + 'verylongserveridentifierwithoutspaces'.repeat(12);
const doms = [];
function domFor(html, width = 1440) {
  const errors = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e));
  const dom = new JSDOM(html, { url: 'http://127.0.0.1/index.php?menu=forms', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  doms.push(dom);
  const w = dom.window;
  w.matchMedia = query => ({ matches: query.includes('max-width: 991') ? width <= 991 : false, media: query, addEventListener() {}, addListener() {} });
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.eval(runtime);
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return { dom, w, d: w.document, errors };
}
function event(w, element, type, properties = {}) { element.dispatchEvent(new w.KeyboardEvent(type, { bubbles: true, cancelable: true, ...properties })); }
async function run() {
  for (const name of Object.keys(labels)) {
    const html = page(name);
    const dom = new JSDOM(html), d = dom.window.document;
    const ids = [...d.querySelectorAll('[id]')].map(el => el.id);
    // Module-supplied status hidden fields may repeat; shell IDs must not.
    const shellIds = [...d.querySelectorAll('.voiz-topbar [id], #voiz-sidebar [id]')].map(el => el.id);
    eq(shellIds.length, new Set(shellIds).size, name + ': unique shell IDs');
    check(d.querySelector('meta[name="viewport"]'), name + ': viewport set');
    const styles = [...d.querySelectorAll('link[rel="stylesheet"]')];
    check(styles.some(el => el.href.includes('voiz-tailwind.css?v=')), name + ': compiled style connected');
    check(!styles.some(el => /voiz-(ui|tw|repair)\.css/.test(el.href)), name + ': no duplicate legacy UI layer');
    check(![...d.querySelectorAll('script[src],link[rel="stylesheet"]')].some(el => /https?:\/\//.test(el.getAttribute('src') || el.getAttribute('href'))), name + ': no CDN dependency');
    check(d.body.textContent.includes('AKZ') && d.body.textContent.includes('akzwp.com') && d.body.textContent.includes('akzwp.ir'), name + ': both AKZ sites visible');
    if (name !== 'login') {
      check(d.querySelector('.main-content > #neo-contentbox'), name + ': content remains inside main layout');
      check(!d.querySelector('#voiz-sidebar #search_module_issabel'), name + ': search outside sidebar');
    }
    dom.window.close();
  }
  const panel = domFor(page('forms'));
  const { w, d } = panel;
  eq(d.documentElement.getAttribute('data-theme'), 'dark', 'Initial dark theme');
  d.querySelector('.voiz-theme-toggle').click();
  eq(d.documentElement.getAttribute('data-theme'), 'light', 'Theme button toggles once');
  eq(w.localStorage.getItem('voiz-theme'), 'light', 'Theme preference is saved');
  check(d.querySelector('.voiz-theme-toggle').getAttribute('aria-label').includes('تیره'), 'Theme action is announced');
  w.dispatchEvent(new w.StorageEvent('storage', { key: 'voiz-theme', newValue: 'dark' }));
  eq(d.documentElement.getAttribute('data-theme'), 'dark', 'Theme syncs across windows');
  const menus = [...d.querySelectorAll('#main-menu li.has-sub')];
  menus.forEach(li => {
    eq(li.querySelectorAll(':scope > .voiz-menu-toggle').length, 1, 'One independent category button');
    check(li.querySelector(':scope > ul').id, 'Submenu has accessible ID');
  });
  const topCategories = [...d.querySelectorAll('#main-menu > li.has-sub')];
  topCategories[1].querySelector(':scope > .voiz-menu-toggle').click();
  check(topCategories[1].classList.contains('opened'), 'Category expands');
  check(!topCategories[0].classList.contains('opened'), 'Sibling category closes');
  topCategories[1].querySelector(':scope > .voiz-menu-toggle').click();
  check(!topCategories[1].classList.contains('opened'), 'Category collapses');
  const current = d.querySelectorAll('#main-menu [aria-current="page"]');
  eq(current.length, 1, 'Only current menu is highlighted');
  const search = d.querySelector('#search_module_issabel');
  search.value = 'گزارش'; search.dispatchEvent(new w.Event('input', { bubbles: true }));
  const options = [...d.querySelectorAll('.voiz-search-item')];
  check(options.length >= 2, 'Search includes menu ancestry');
  event(w, search, 'keydown', { key: 'ArrowDown' });
  eq(search.getAttribute('aria-activedescendant'), options[0].id, 'Down selects first result, without skipping');
  event(w, search, 'keydown', { key: 'ArrowDown' });
  eq(search.getAttribute('aria-activedescendant'), options[1].id, 'Down selects next result');
  event(w, search, 'keydown', { key: 'ArrowUp' });
  eq(search.getAttribute('aria-activedescendant'), options[0].id, 'Up selects previous result');
  event(w, search, 'keydown', { key: 'Escape' });
  eq(search.getAttribute('aria-expanded'), 'false', 'Escape closes search');
  search.value = 'سيستم'; search.dispatchEvent(new w.Event('input', { bubbles: true }));
  check(d.querySelectorAll('.voiz-search-item').length > 0, 'Arabic/Persian letter variants match');
  search.value = '<img src=x onerror=alert(1)>'; search.dispatchEvent(new w.Event('input', { bubbles: true }));
  check(!d.querySelector('#voiz-search-results img'), 'Search strings remain text');
  const form = d.querySelector('#fixture-form');
  const before = [...new w.FormData(form).entries()];
  w.VoizUI.refresh(); w.VoizUI.refresh();
  eq([...new w.FormData(form).entries()], before, 'UI adaptation preserves form names and values');
  const mobile = domFor(page('forms'), 360);
  const burger = mobile.d.querySelector('.voiz-topbar-burger');
  check(mobile.d.querySelector('.sidebar-menu').inert, 'Closed mobile drawer cannot be focused');
  burger.click();
  check(mobile.d.body.classList.contains('voiz-sidebar-open'), 'Mobile drawer opens');
  eq(burger.getAttribute('aria-expanded'), 'true', 'Drawer reports expanded state');
  check(mobile.d.querySelector('.main-content').inert, 'Background cannot be focused behind drawer');
  event(mobile.w, mobile.d, 'keydown', { key: 'Escape' });
  check(!mobile.d.body.classList.contains('voiz-sidebar-open'), 'Escape closes drawer');
  eq(mobile.d.activeElement, burger, 'Drawer returns focus to opener');
  check(!mobile.d.querySelector('.main-content').inert, 'Background focus restored');
  const login = domFor(page('login'));
  const password = login.d.querySelector('#input_pass'); password.value = 'fixture-only';
  const toggle = login.d.querySelector('.voiz-pass-toggle'); toggle.click();
  eq(password.type, 'text', 'Password reveal works');
  eq(password.value, 'fixture-only', 'Reveal preserves value'); toggle.click();
  eq(password.type, 'password', 'Password hides again');
  eq(login.d.querySelector('#input_user').autocomplete, 'username', 'Login supports password managers');
  const content = d.querySelector('.neo-module-content');
  content.insertAdjacentHTML('beforeend', '<div id="async-result"><table id="report" class="table"><thead><tr><th>نام</th></tr></thead><tbody><tr><td>' + identifier + '</td></tr></tbody></table></div><div class="fc"><table id="calendar-grid"><tbody><tr><td>۱۵</td></tr></tbody></table></div><p id="long-description">' + longText + '</p><pre><code>' + identifier + '</code></pre>');
  await new Promise(resolve => setTimeout(resolve, 130));
  check(d.querySelector('#report').parentNode.classList.contains('voiz-table-scroll'), 'Async report gets local scrolling');
  w.VoizUI.refresh();
  eq(d.querySelectorAll('#async-result .voiz-table-scroll').length, 1, 'Wrapping is idempotent');
  check(!d.querySelector('#calendar-grid').closest('.voiz-table-scroll'), 'Calendar is never wrapped as a report');
  eq(d.querySelector('#long-description').textContent, longText, 'Long Persian text is retained');
  eq(d.querySelector('#report td').textContent, identifier, 'Long technical identifiers are retained');
  const modal = d.querySelector('.neo-modal-issabel-popup-box'), opener = d.querySelector('[data-preview-modal]');
  const close = modal.querySelector('.neo-modal-issabel-popup-close');
  modal.style.display = 'none'; opener.focus();
  close.addEventListener('click', () => { modal.style.display = 'none'; });
  await new Promise(resolve => setTimeout(resolve, 5)); modal.style.display = 'block';
  await new Promise(resolve => setTimeout(resolve, 5));
  eq(d.activeElement, close, 'Legacy dialog focuses close control on open');
  event(w, d, 'keydown', { key: 'Escape' }); await new Promise(resolve => setTimeout(resolve, 5));
  eq(modal.style.display, 'none', 'Escape uses the existing close action');
  eq(d.activeElement, opener, 'Dialog returns focus to opener');
  const denied = new JSDOM(page('login'), { url: 'http://127.0.0.1', runScripts: 'outside-only' }); doms.push(denied);
  Object.defineProperty(denied.window, 'localStorage', { get() { throw new Error('denied'); } });
  denied.window.eval(runtime); denied.window.document.dispatchEvent(new denied.window.Event('DOMContentLoaded'));
  denied.window.VoizUI.toggleTheme();
  eq(denied.window.document.documentElement.getAttribute('data-theme'), 'light', 'Theme still works when storage is blocked');
  eq(panel.errors, [], 'No UI runtime exceptions');
  eq(mobile.errors, [], 'No mobile UI runtime exceptions');
  eq(login.errors, [], 'No login UI runtime exceptions');
  for (const file of ['install.sh', 'install - error.sh', 'install - 1307.1404.sh']) {
    const text = read(file);
    check(text.includes('Copyright (c) AKZ') && text.includes('https://akzwp.com') && text.includes('https://akzwp.ir'), file + ': installer credits both domains');
  }
  console.log(`Passed ${checks} build, contrast, template and DOM interaction checks. Pixel layout requires browser verification.`);
}
run().catch(error => { console.error(error.stack); process.exitCode = 1; }).finally(() => doms.forEach(dom => dom.window.close()));