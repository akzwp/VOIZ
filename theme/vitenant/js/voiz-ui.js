/* VOIZ / AKZ presentation only. Does not alter requests, permissions or PBX data. */
(function () {
    'use strict';
    var doc = document, root = doc.documentElement, themeKey = 'voiz-theme';
    var menu, sidebar, drawerOpener, modalOpener, modalVisible = false;
    var uiTimer, frameStyleHref;
    function all(selector, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(selector)); }
    function closest(el, selector) { return el && el.nodeType === 1 ? el.closest(selector) : null; }
    function storageGet() { try { return localStorage.getItem(themeKey); } catch (e) { return null; } }
    function currentTheme() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
    function applyTheme(theme, persist) {
        theme = theme === 'light' ? 'light' : 'dark';
        root.setAttribute('data-theme', theme);
        if (persist !== false) { try { localStorage.setItem(themeKey, theme); } catch (e) { /* Storage can be disabled. */ } }
        all('.voiz-theme-toggle').forEach(function (button) {
            var label = theme === 'dark' ? 'فعال کردن تم روشن' : 'فعال کردن تم تیره';
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
            button.setAttribute('aria-pressed', String(theme === 'dark'));
            var icon = button.querySelector('i');
            if (icon) { icon.classList.remove('fa-moon-o', 'fa-sun-o'); icon.classList.add(theme === 'dark' ? 'fa-sun-o' : 'fa-moon-o'); }
        });
        syncFrames();
        themeCharts();
    }
    function toggleTheme() { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }
    function drawerMode() { return window.matchMedia('(max-width: 991px)').matches; }
    function focusable(container) {
        return all('a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]', container)
            .filter(function (el) { return el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden'; });
    }
    function trapTab(event, container) {
        if (event.key !== 'Tab') { return; }
        var items = focusable(container), first = items[0], last = items[items.length - 1];
        if (!first) { event.preventDefault(); container.focus(); return; }
        if (event.shiftKey && (doc.activeElement === first || !container.contains(doc.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (doc.activeElement === last || !container.contains(doc.activeElement))) { event.preventDefault(); first.focus(); }
    }
    function closeSidebar(restore) {
        doc.body.classList.remove('voiz-sidebar-open');
        all('.voiz-topbar-burger').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
        var main = doc.querySelector('.main-content');
        if (main) { main.inert = false; }
        if (sidebar) { sidebar.inert = drawerMode(); sidebar.removeAttribute('aria-modal'); sidebar.setAttribute('role', 'navigation'); }
        if (restore !== false && drawerOpener) { drawerOpener.focus(); drawerOpener = null; }
    }
    function openSidebar(button) {
        if (!sidebar || !drawerMode()) { return; }
        drawerOpener = button || doc.activeElement;
        doc.body.classList.add('voiz-sidebar-open');
        sidebar.inert = false;
        sidebar.setAttribute('role', 'dialog');
        sidebar.setAttribute('aria-modal', 'true');
        all('.voiz-topbar-burger').forEach(function (el) { el.setAttribute('aria-expanded', 'true'); });
        var main = doc.querySelector('.main-content');
        if (main) { main.inert = true; }
        var first = sidebar.querySelector('.voiz-sidebar-close') || sidebar.querySelector('a');
        if (first) { first.focus(); }
    }
    function submenuFor(li) { return all('ul', li).filter(function (el) { return el.parentNode === li; })[0]; }
    function setExpanded(li, expanded) {
        var sub = submenuFor(li), button = li.querySelector(':scope > .voiz-menu-toggle');
        if (!sub) { return; }
        li.classList.toggle('opened', expanded);
        sub.classList.toggle('visible', expanded);
        if (button) { button.setAttribute('aria-expanded', String(expanded)); }
    }
    function toggleCategory(li) {
        var open = !li.classList.contains('opened');
        if (open) {
            all(':scope > li', li.parentNode).forEach(function (sibling) { if (sibling !== li) { setExpanded(sibling, false); } });
        }
        setExpanded(li, open);
    }
    function initMenu() {
        menu = doc.getElementById('main-menu'); sidebar = doc.querySelector('.sidebar-menu');
        if (!menu || !sidebar) { return; }
        var selected = doc.getElementById('issabel_framework_module_id');
        var selectedId = selected && selected.value;
        var foundCurrent = false;
        all('li', menu).forEach(function (li, i) {
            var link = li.querySelector(':scope > a'), sub = submenuFor(li);
            if (!link) { return; }
            if (selectedId && !foundCurrent) {
                var url = new URL(link.href, window.location.href);
                if (url.searchParams.get('menu') === selectedId) { link.setAttribute('aria-current', 'page'); foundCurrent = true; }
            }
            if (!sub || !sub.querySelector('li a')) { li.classList.remove('has-sub'); return; }
            li.classList.add('has-sub');
            sub.id = sub.id || 'voiz-submenu-' + i;
            var button = doc.createElement('button');
            button.type = 'button'; button.className = 'voiz-menu-toggle';
            button.setAttribute('aria-label', 'زیرمنوی ' + link.textContent.trim());
            button.setAttribute('aria-controls', sub.id);
            li.insertBefore(button, sub);
            setExpanded(li, li.classList.contains('opened'));
        });
        var current = menu.querySelector('[aria-current="page"]') || menu.querySelector('li.active li.active > a') || menu.querySelector('li.active > a');
        if (current) {
            current.setAttribute('aria-current', 'page');
            var parent = current.parentNode;
            while (parent && parent !== menu) { if (parent.tagName === 'LI') { setExpanded(parent, true); } parent = parent.parentNode; }
        }
        // Capture precedes Neon's direct GSAP handler, avoiding double toggles.
        menu.addEventListener('click', function (event) {
            var control = closest(event.target, 'a, .voiz-menu-toggle');
            if (!control || !menu.contains(control)) { return; }
            var li = control.parentNode;
            if (submenuFor(li) && li.classList.contains('has-sub')) {
                event.preventDefault(); event.stopImmediatePropagation(); toggleCategory(li);
            } else if (drawerMode()) { closeSidebar(false); }
        }, true);
        menu.addEventListener('keydown', function (event) {
            var li = closest(event.target, 'li');
            if (!li) { return; }
            if (event.key === 'ArrowLeft' && submenuFor(li)) {
                event.preventDefault(); setExpanded(li, true);
                var first = submenuFor(li).querySelector('a'); if (first) { first.focus(); }
            } else if (event.key === 'ArrowRight') {
                var ancestor = li.parentNode.closest('li');
                if (li.classList.contains('opened')) { event.preventDefault(); setExpanded(li, false); }
                else if (ancestor) { event.preventDefault(); setExpanded(ancestor, false); ancestor.querySelector('a').focus(); }
            }
        });
        // Old sidebar controls may be triggered by Issabel's chat panel.
        window.toggle_sidebar_menu = function () { if (drawerMode()) { doc.body.classList.contains('voiz-sidebar-open') ? closeSidebar() : openSidebar(); } };
        window.show_sidebar_menu = function () { if (drawerMode()) { openSidebar(); } };
        window.hide_sidebar_menu = function () { closeSidebar(); };
        window.fit_main_content_height = function () { /* CSS owns page height. */ };
        var page = doc.querySelector('.page-container'); if (page) { page.classList.remove('sidebar-collapsed'); }
        closeSidebar(false);
        var media = window.matchMedia('(max-width: 991px)');
        if (media.addEventListener) { media.addEventListener('change', function () { closeSidebar(); }); }
        else { media.addListener(function () { closeSidebar(); }); }
    }
    function normalize(text) { return String(text).toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[\u064b-\u065f\u200c]/g, '').replace(/\s+/g, ' ').trim(); }
    function initSearch() {
        var input = doc.getElementById('search_module_issabel');
        if (!input || !menu) { return; }
        var form = input.closest('form'), box = doc.createElement('div'), status = doc.createElement('span');
        box.id = 'voiz-search-results'; box.className = 'voiz-search-results'; box.setAttribute('role', 'listbox'); box.setAttribute('aria-label', 'نتیجه جستجوی منو');
        status.className = 'voiz-sr-only'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
        form.parentNode.appendChild(box); form.parentNode.appendChild(status);
        input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-controls', box.id); input.setAttribute('aria-expanded', 'false');
        var index = [], seen = {}, matches = [], active = -1;
        all('a[href*="menu="]', menu).forEach(function (link) {
            if (seen[link.href]) { return; } seen[link.href] = true;
            var parents = [], li = link.parentNode.parentNode.closest('li');
            while (li) { var label = li.querySelector(':scope > a'); if (label) { parents.unshift(label.textContent.trim()); } li = li.parentNode.closest('li'); }
            index.push({ name: link.textContent.trim(), path: parents.join(' / '), href: link.getAttribute('href') });
        });
        function close() { box.classList.remove('voiz-open'); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
        function activate(i) {
            active = i;
            all('.voiz-search-item', box).forEach(function (item, idx) { item.classList.toggle('voiz-active', idx === i); item.setAttribute('aria-selected', String(idx === i)); });
            var option = box.querySelector('.voiz-active');
            if (option) { input.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' }); }
        }
        function render() {
            var q = normalize(input.value); box.textContent = ''; matches = []; active = -1;
            input.removeAttribute('aria-activedescendant');
            if (!q) { close(); status.textContent = ''; return; }
            matches = index.filter(function (item) { return normalize(item.name + ' ' + item.path).indexOf(q) !== -1; }).slice(0, 15);
            matches.forEach(function (item, i) {
                var a = doc.createElement('a'), label = doc.createElement('span'), path = doc.createElement('small');
                a.className = 'voiz-search-item'; a.id = 'voiz-search-opt-' + i; a.href = item.href; a.setAttribute('role', 'option'); a.setAttribute('aria-selected', 'false'); a.tabIndex = -1;
                label.textContent = item.name; path.textContent = item.path; a.appendChild(label); a.appendChild(path); box.appendChild(a);
            });
            if (!matches.length) { var empty = doc.createElement('div'); empty.className = 'voiz-search-empty'; empty.textContent = 'نتیجه‌ای یافت نشد'; box.appendChild(empty); }
            status.textContent = matches.length ? matches.length + ' نتیجه یافت شد' : 'نتیجه‌ای یافت نشد';
            input.setAttribute('aria-expanded', 'true'); box.classList.add('voiz-open');
        }
        input.addEventListener('input', render);
        input.addEventListener('focus', function () { if (input.value) { render(); } });
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') { event.preventDefault(); close(); return; }
            if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length) {
                event.preventDefault(); box.classList.add('voiz-open'); input.setAttribute('aria-expanded', 'true');
                activate(active < 0 ? (event.key === 'ArrowDown' ? 0 : matches.length - 1) : (active + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
            }
        });
        form.addEventListener('submit', function (event) { event.preventDefault(); if (matches.length) { window.location.href = matches[active < 0 ? 0 : active].href; } }, true);
        box.addEventListener('mousedown', function (event) { if (closest(event.target, 'a')) { event.preventDefault(); } });
        doc.addEventListener('click', function (event) { if (!form.parentNode.contains(event.target)) { close(); } });
        form.parentNode.addEventListener('focusout', function () { setTimeout(function () { if (!form.parentNode.contains(doc.activeElement)) { close(); } }, 0); });
    }
    function initPassword() {
        var input = doc.getElementById('input_pass');
        if (!input) { return; }
        var wrap = doc.createElement('div'), toggle = doc.createElement('button');
        wrap.className = 'voiz-password-wrap'; input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
        toggle.type = 'button'; toggle.className = 'voiz-pass-toggle'; toggle.setAttribute('aria-label', 'نمایش رمز عبور'); toggle.setAttribute('aria-pressed', 'false'); toggle.setAttribute('aria-controls', input.id);
        toggle.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>'; wrap.appendChild(toggle);
        toggle.addEventListener('click', function () {
            var visible = input.type === 'password'; input.type = visible ? 'text' : 'password';
            toggle.setAttribute('aria-pressed', String(visible)); toggle.setAttribute('aria-label', visible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'); toggle.querySelector('i').className = visible ? 'fa fa-eye-slash' : 'fa fa-eye';
        });
    }
    var dataTables = 'table.issabel-standard-table, table.tabla_listado, table.table, table.dataTable, table.listDataTable, table.table_data';
    var excludedTables = '.fc, .calendar, .ui-datepicker, .datepicker, #applet_grid, .voiz-hardware, .calendarContainer';
    function enhanceContent() {
        all(dataTables).forEach(function (table) {
            if (table.closest(excludedTables)) { return; }
            var wrapper = table.closest('.voiz-table-scroll, .voiz-table-wrap, .table-responsive, .dataTables_scrollBody, .dataTables_scrollHead');
            if (!wrapper) { wrapper = doc.createElement('div'); wrapper.className = 'voiz-table-scroll'; table.parentNode.insertBefore(wrapper, table); wrapper.appendChild(table); }
            if (!wrapper.hasAttribute('tabindex')) { wrapper.tabIndex = 0; wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-label', 'جدول اطلاعات؛ برای مشاهده ستون‌ها به طرفین پیمایش کنید'); }
        });
        all('.neo-module-content table, .neo-modal-issabel-popup-content table').forEach(function (table) {
            if (table.classList.contains('voiz-form-table') || table.closest(excludedTables) || table.matches(dataTables) || table.querySelector('thead, table, th') || table.classList.contains('tabForm')) { return; }
            // Only genuine field-layout tables; plain lists and all calendar tables retain native layout.
            if (table.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), select, textarea')) { table.classList.add('voiz-form-table'); }
        });
        // Core versions without the supplied applet template still get the same layout.
        all('#cpugauge').forEach(function (gauge) { if (gauge.parentNode.querySelector('#memgauge')) { gauge.parentNode.classList.add('voiz-gauges'); gauge.parentNode.style.height = 'auto'; } });
        all('#dashboard-applet-hd-usage').forEach(function (gauge) { gauge.parentNode.classList.add('voiz-drive'); });
        all('.neo-applet-processes-row-status-msg').forEach(function (label) {
            var original = label.style.color;
            if (/^(green|rgb\(0, ?128, ?0\)|#008000)$/i.test(original)) { label.style.color = 'var(--voiz-success)'; }
            else if (/^(red|rgb\(255, ?0, ?0\)|#ff0000)$/i.test(original)) { label.style.color = 'var(--voiz-danger)'; }
            else if (/^(blue|rgb\(0, ?0, ?255\)|#0000ff)$/i.test(original)) { label.style.color = 'var(--voiz-info)'; }
        });
        all('.neo-module-content iframe').forEach(function (frame) {
            frame.classList.add('voiz-module-frame');
            if (!frame.hasAttribute('title')) { frame.title = 'محتوای بخش انتخاب‌شده'; }
            if (!frame.dataset.voizFrame) { frame.dataset.voizFrame = 'true'; frame.addEventListener('load', syncFrames); }
        });
        syncFrames();
    }
    function syncFrames() {
        if (!frameStyleHref) { return; }
        all('.neo-module-content iframe').forEach(function (frame) {
            try {
                var page = frame.contentDocument;
                // Only same-origin module documents; cross-origin integrations retain their owner UI.
                if (!page || !page.head || frame.contentWindow.location.origin !== location.origin) { return; }
                page.documentElement.setAttribute('data-theme', currentTheme());
                if (!page.getElementById('voiz-frame-theme')) {
                    var css = page.createElement('link'); css.id = 'voiz-frame-theme'; css.rel = 'stylesheet'; css.href = frameStyleHref;
                    page.head.appendChild(css); page.body.classList.add('voiz-embedded');
                }
            } catch (e) { /* Cross-origin content cannot be themed by the parent. */ }
        });
    }
    function themeCharts() {
        // Chart.js 2 is shipped by the CDR and monitoring modules. Only presentation options change.
        if (!window.Chart || !window.Chart.instances) { return; }
        var colors = getComputedStyle(root), ink = colors.getPropertyValue('--voiz-text-soft').trim(), border = colors.getPropertyValue('--voiz-border').trim();
        Object.keys(window.Chart.instances).forEach(function (id) {
            var chart = window.Chart.instances[id];
            if (!chart || !chart.options || !chart.canvas || !doc.contains(chart.canvas)) { return; }
            var options = chart.options;
            if (options.legend && options.legend.labels) { options.legend.labels.fontColor = ink; options.legend.labels.fontFamily = 'Vazirmatn'; }
            if (options.scales) {
                ['xAxes', 'yAxes'].forEach(function (axis) { (options.scales[axis] || []).forEach(function (scale) { if (scale.ticks) { scale.ticks.fontColor = ink; scale.ticks.fontFamily = 'Vazirmatn'; } if (scale.gridLines) { scale.gridLines.color = border; scale.gridLines.zeroLineColor = border; } }); });
            }
            if (typeof chart.update === 'function') { chart.update(0); }
        });
    }
    function initModal() {
        var modal = doc.querySelector('.neo-modal-issabel-popup-box');
        if (!modal) { return; }
        var title = modal.querySelector('.neo-modal-issabel-popup-title'), close = modal.querySelector('.neo-modal-issabel-popup-close');
        modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.tabIndex = -1;
        if (title) { title.id = title.id || 'voiz-modal-title'; modal.setAttribute('aria-labelledby', title.id); }
        function sync() {
            var visible = getComputedStyle(modal).display !== 'none';
            if (visible && !modalVisible) { modalOpener = doc.activeElement; (close || modal).focus(); }
            else if (!visible && modalVisible && modalOpener && doc.contains(modalOpener)) { modalOpener.focus(); }
            modalVisible = visible;
        }
        new MutationObserver(sync).observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
        sync();
        doc.addEventListener('keydown', function (event) {
            if (!modalVisible) { return; }
            if (event.key === 'Escape' && close) { event.preventDefault(); close.click(); }
            trapTab(event, modal);
        });
    }
    function init() {
        var css = doc.querySelector('link[href*="voiz-tailwind.css"]'); frameStyleHref = css && css.href;
        initMenu(); initSearch(); initPassword(); initModal(); enhanceContent(); applyTheme(storageGet(), false);
        doc.addEventListener('click', function (event) {
            var toggle = closest(event.target, '.voiz-theme-toggle');
            if (toggle) { event.preventDefault(); toggleTheme(); }
            var burger = closest(event.target, '.voiz-topbar-burger');
            if (burger) { event.preventDefault(); openSidebar(burger); }
            if (closest(event.target, '.voiz-sidebar-close, #voiz-sidebar-overlay')) { event.preventDefault(); closeSidebar(); }
        });
        doc.addEventListener('keydown', function (event) {
            if (!doc.body.classList.contains('voiz-sidebar-open')) { return; }
            if (event.key === 'Escape') { event.preventDefault(); closeSidebar(); }
            else { trapTab(event, sidebar); }
        });
        window.addEventListener('storage', function (event) { if (event.key === themeKey) { applyTheme(event.newValue, false); } });
        var content = doc.getElementById('neo-contentbox') || doc.querySelector('.voiz-cdr-page');
        if (content && window.MutationObserver) {
            new MutationObserver(function (records) {
                if (!records.some(function (record) { return Array.prototype.some.call(record.addedNodes, function (node) { return node.nodeType === 1 && !closest(node, 'svg'); }); })) { return; }
                clearTimeout(uiTimer); uiTimer = setTimeout(enhanceContent, 60);
            }).observe(content, { childList: true, subtree: true });
        }
        if (window.jQuery) { window.jQuery(doc).on('draw.dt init.dt', function () { enhanceContent(); themeCharts(); }); }
    }
    window.VoizUI = { applyTheme: applyTheme, toggleTheme: toggleTheme, currentTheme: currentTheme, closeSidebar: closeSidebar, refresh: enhanceContent };
    if (window.jQuery) { window.jQuery(init); }
    else if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', init); }
    else { init(); }
})();