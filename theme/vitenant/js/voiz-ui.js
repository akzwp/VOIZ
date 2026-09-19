/* VOIZ / AKZ presentation only. Does not alter requests, permissions or PBX data. */
(function () {
    'use strict';
    var doc = document, root = doc.documentElement, themeKey = 'voiz-theme';
    var menu, sidebar, drawerOpener, modalOpener, modalVisible = false;
    var uiTimer, frameStyleHref, plotObserver;
    /* Persian locale for the calendar stack (FullCalendar + jQuery-UI datepicker).
       Runs at script-eval time — before the module's own $(document).ready
       initialises its widgets — so module code keeps working unchanged while
       every widget renders Persian. */
    var faLocale = {
        monthNames: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
        dayNames: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
        dayNamesShort: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
        buttonText: { today: 'امروز', month: 'ماه', week: 'هفته', day: 'روز' },
        allDayText: 'تمام روز',
        firstDay: 1,
        isRTL: true
    };
    function installCalendarLocale() {
        var $ = window.jQuery;
        if (!$) { return; }
        if ($.datepicker && $.datepicker.regional) {
            $.datepicker.regional.fa = {
                closeText: 'تأیید', prevText: '‹', nextText: '›', currentText: 'امروز',
                monthNames: faLocale.monthNames, monthNamesShort: faLocale.monthNames,
                dayNames: faLocale.dayNames, dayNamesShort: faLocale.dayNamesShort, dayNamesMin: faLocale.dayNamesShort,
                weekHeader: 'ه', dateFormat: 'yy-mm-dd', firstDay: 1, isRTL: true, showMonthAfterYear: false, yearSuffix: ''
            };
            $.datepicker.setDefaults($.datepicker.regional.fa);
        }
        if ($.fn && $.fn.fullCalendar && $.fn.fullCalendar.defaults) {
            var d = $.fn.fullCalendar.defaults;
            d.monthNames = faLocale.monthNames; d.monthNamesShort = faLocale.monthNames;
            d.dayNames = faLocale.dayNames; d.dayNamesShort = faLocale.dayNamesShort;
            d.buttonText = faLocale.buttonText; d.allDayText = faLocale.allDayText;
            d.firstDay = 1; d.isRTL = true;
        }
    }
    installCalendarLocale();
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
        themePlots();
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
        // Capture precedes Neon's direct GSAP handlers, avoiding double toggles.
        // Category rows toggle; leaf links must still navigate, so legacy bubble
        // handlers (which call preventDefault and kill navigation) are cut off
        // with stopPropagation from this capture listener.
        menu.addEventListener('click', function (event) {
            var control = closest(event.target, 'a, .voiz-menu-toggle');
            if (!control || !menu.contains(control)) { return; }
            var li = control.parentNode;
            if (submenuFor(li) && li.classList.contains('has-sub')) {
                event.preventDefault(); event.stopImmediatePropagation(); toggleCategory(li);
                return;
            }
            if (control.tagName === 'A') {
                event.stopPropagation(); /* navigation stays enabled, legacy handlers are silenced */
                if (drawerMode()) { closeSidebar(false); }
            }
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
        /* Belt and braces: whatever opens the drawer, an open drawer must never
           stay inert (the reported "dead menu" symptom). */
        if (window.MutationObserver) {
            new MutationObserver(function () {
                if (doc.body.classList.contains('voiz-sidebar-open') && sidebar && sidebar.inert) { sidebar.inert = false; }
            }).observe(doc.body, { attributes: true, attributeFilter: ['class'] });
        }
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
    var excludedTables = '.fc, .calendar, .ui-datepicker, .datepicker, #applet_grid, .voiz-hardware, .calendarContainer, #calendar_eventdialog';
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
        initPlotResize();
    }
    function themePlots() {
        if (!window.jQuery) { return; }
        all('#dashboard-applet-performancegraph').forEach(function (element) {
            var plot = window.jQuery(element).data('plot');
            if (!plot || typeof plot.getOptions !== 'function') { return; }
            var options = plot.getOptions(), colors = getComputedStyle(root);
            options.grid.tickColor = colors.getPropertyValue('--voiz-border').trim();
            options.legend.backgroundColor = colors.getPropertyValue('--voiz-surface').trim();
            if (typeof plot.setupGrid === 'function') { plot.setupGrid(); }
            if (typeof plot.draw === 'function') { plot.draw(); }
        });
    }
    function initPlotResize() {
        if (!window.ResizeObserver || !window.jQuery) { return; }
        if (!plotObserver) {
            plotObserver = new ResizeObserver(function (entries) {
                entries.forEach(function (entry) {
                    var element = entry.target, width = Math.round(entry.contentRect.width);
                    if (!width || element.dataset.voizPlotWidth === String(width)) { return; }
                    element.dataset.voizPlotWidth = String(width);
                    var plot = window.jQuery(element).data('plot');
                    if (plot && typeof plot.resize === 'function') { plot.resize(); plot.setupGrid(); plot.draw(); }
                });
            });
        }
        all('#dashboard-applet-performancegraph').forEach(function (element) {
            if (!element.dataset.voizPlotObserved) { element.dataset.voizPlotObserved = 'true'; plotObserver.observe(element); }
        });
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
    /* Issue 3: the framework modal (change-password popup) is repositioned by
       legacy scripts with absolute pixel offsets. Recentre it whenever shown. */
    function patchModalCentering() {
        var modal = doc.querySelector('.neo-modal-issabel-popup-box');
        if (!modal || modal.__voizCentered) { return; }
        modal.__voizCentered = true;
        var syncing = false;
        function center() {
            if (syncing || getComputedStyle(modal).display === 'none') { return; }
            syncing = true;
            window.requestAnimationFrame(function () { syncing = false; });
            modal.style.setProperty('left', '50%', 'important');
            modal.style.setProperty('top', '50%', 'important');
            modal.style.setProperty('right', 'auto', 'important');
            modal.style.setProperty('bottom', 'auto', 'important');
            modal.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
            modal.style.setProperty('height', 'auto', 'important');
            modal.style.setProperty('min-height', '140px', 'important');
            modal.style.setProperty('max-height', 'min(640px, calc(100vh - 48px))', 'important');
            modal.style.setProperty('overflow-y', 'auto', 'important');
            modal.style.setProperty('width', 'min(600px, calc(100vw - 24px))', 'important');
            modal.style.setProperty('padding', '0', 'important');
            var inner = modal.querySelector('.neo-modal-issabel-popup-content');
            if (inner) { inner.style.maxHeight = 'none'; inner.style.overflow = 'visible'; }
            var field = modal.querySelector('input[type="password"], input[type="text"]');
            if (field && !modal.contains(doc.activeElement)) { setTimeout(function () { try { field.focus(); } catch (e) { /* Focusing can fail. */ } }, 40); }
        }
        new MutationObserver(center).observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
        /* Clicking the dark mask must close the popup (same legacy close call,
           so any pending state is cleaned up exactly as before). */
        var mask = doc.querySelector('.neo-modal-issabel-popup-blockmask');
        if (mask) {
            mask.addEventListener('click', function () {
                if (getComputedStyle(modal).display !== 'none' && typeof window.hideModalPopUP === 'function') { window.hideModalPopUP(); }
            });
        }
    }
    /* Issue: the admin dropdown (change password / logout) must open with its
       own robust toggle, anchored so it never escapes the viewport, and be
       closable by outside clicks and Escape. */
    function initUserMenu() {
        var user = doc.querySelector('.voiz-topbar-user');
        var link = user && user.querySelector('.voiz-user-link');
        if (!user || !link || user.__voizUserMenu) { return; }
        user.__voizUserMenu = true;
        link.setAttribute('aria-haspopup', 'true');
        function close() {
            user.classList.remove('voiz-open');
            link.setAttribute('aria-expanded', 'false');
        }
        function toggle(event) {
            event.preventDefault(); event.stopImmediatePropagation();
            var open = !user.classList.contains('voiz-open');
            user.classList.toggle('voiz-open', open);
            link.setAttribute('aria-expanded', String(open));
        }
        link.addEventListener('click', toggle, true);
        doc.addEventListener('click', function (event) {
            if (user.classList.contains('voiz-open') && !user.contains(event.target)) { close(); }
        });
        doc.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && user.classList.contains('voiz-open')) { close(); link.focus(); }
        });
        var panel = user.querySelector('.dropdown-menu');
        if (panel) { all('a', panel).forEach(function (item) { item.addEventListener('click', function () { close(); }); }); }
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
    /* Issue 6: dotted-quad octet fields (DHCP server). Move focus between the
       boxes as the user types; values and field names are untouched. */
    function findOctetGroup(input) {
        var container = input.closest('tr') || input.closest('form') || input.parentElement;
        while (container && container !== doc.body) {
            var group = all('input[type="text"], input:not([type])', container).filter(function (el) { return el.maxLength === 3; });
            var ipish = group.length >= 4 && group.some(function (el) {
                return /ip|dns|gateway|wins|pxe|netmask|subnet|network/i.test(el.name + ' ' + el.id);
            });
            if (ipish) { return group; }
            container = container.parentElement;
        }
        return null;
    }
    function initOctets() {
        doc.addEventListener('input', function (event) {
            var input = event.target;
            if (!input || input.tagName !== 'INPUT') { return; }
            var group = findOctetGroup(input);
            if (!group || group.indexOf(input) === -1) { return; }
            input.value = input.value.replace(/[^\d]/g, '');
            if (input.value.length >= input.maxLength) {
                var next = group[group.indexOf(input) + 1];
                if (next) { next.focus(); if (next.select) { next.select(); } }
            }
        });
        doc.addEventListener('keydown', function (event) {
            var input = event.target;
            if (!input || input.tagName !== 'INPUT') { return; }
            var group = findOctetGroup(input);
            if (!group) { return; }
            var index = group.indexOf(input);
            if (index < 0) { return; }
            if (event.key === '.' || event.key === ',') {
                event.preventDefault();
                var next = group[index + 1];
                if (next) { next.focus(); if (next.select) { next.select(); } }
            } else if (event.key === 'ArrowRight' && input.selectionStart === input.value.length) {
                var prev = group[index - 1];
                if (prev && doc.documentElement.dir === 'rtl') { event.preventDefault(); prev.focus(); if (prev.select) { prev.select(); } }
            } else if (event.key === 'ArrowLeft' && input.selectionStart === 0) {
                var nxt = group[index + 1];
                if (nxt) { event.preventDefault(); nxt.focus(); if (nxt.select) { nxt.select(); } }
            }
        });
        doc.addEventListener('paste', function (event) {
            var input = event.target;
            if (!input || input.tagName !== 'INPUT') { return; }
            var group = findOctetGroup(input);
            if (!group || group.indexOf(input) === -1) { return; }
            var match = String(event.clipboardData ? event.clipboardData.getData('text') : '').match(/\d{1,3}/g);
            if (match && match.length >= group.length) {
                event.preventDefault();
                group.forEach(function (el, i) { el.value = match[i]; });
                var last = group[group.length - 1];
                if (last) { last.focus(); }
            }
        });
    }
    /* Issue 4: map tooltips (GeoIP Map) can escape the viewport. Nudge any
       visible tooltip back inside the visible frame. */
    function initMapTooltips() {
        var pending = false;
        var selector = '.jvectormap-tip, .jvectormap-label, .ammap-tooltip, .map-tooltip, .maptooltip, ' +
            '[class*="tooltip"]:not(script):not(style):not(input)';
        function clamp() {
            pending = false;
            all(selector).forEach(function (tip) {
                if (!tip.getClientRects().length) { return; }
                var rect = tip.getBoundingClientRect(), pad = 8, dx = 0, dy = 0;
                if (rect.left < pad) { dx = pad - rect.left; }
                else if (rect.right > window.innerWidth - pad) { dx = window.innerWidth - pad - rect.right; }
                if (rect.top < pad) { dy = pad - rect.top; }
                else if (rect.bottom > window.innerHeight - pad) { dy = window.innerHeight - pad - rect.bottom; }
                if (dx || dy) {
                    if (tip.style.left || tip.style.top) {
                        tip.style.left = ((parseFloat(tip.style.left) || 0) + dx) + 'px';
                        tip.style.top = ((parseFloat(tip.style.top) || 0) + dy) + 'px';
                    } else {
                        tip.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
                    }
                }
            });
        }
        doc.addEventListener('mousemove', function () {
            if (pending) { return; }
            pending = true;
            window.requestAnimationFrame(clamp);
        }, { passive: true });
    }
    /* Calendar dates stay local; the original Issabel fields remain Gregorian
       yyyy-mm-dd HH:mm, as required by datehhmm()/saveEventDialog(). */
    var jalaliMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    var calendarDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    var persianDateFormatter;
    function toFa(value) { return String(value).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
    function toEn(value) { return String(value).replace(/[۰-۹٠-٩]/g, function (d) { var n = '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); return n < 0 ? '٠١٢٣٤٥٦٧٨٩'.indexOf(d) : n; }); }
    function datePad(n) { return ('0' + n).slice(-2); }
    function dateOnly(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12); }
    function addCalendarDays(date, days) { var copy = dateOnly(date); copy.setDate(copy.getDate() + days); return copy; }
    function gregorianText(date) { return date.getFullYear() + '-' + datePad(date.getMonth() + 1) + '-' + datePad(date.getDate()); }
    function jalaliParts(date) {
        try {
            if (!persianDateFormatter) { persianDateFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian', { day: 'numeric', month: 'numeric', year: 'numeric' }); }
            if (persianDateFormatter.resolvedOptions().calendar !== 'persian') { return null; }
            var parts = {};
            persianDateFormatter.formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
            return { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day) };
        } catch (e) { return null; }
    }
    function jalaliToGregorian(y, m, d) {
        if (m < 1 || m > 12 || d < 1 || d > 31) { return null; }
        // Binary search against Intl's Persian calendar also handles leap years.
        var low = Date.UTC(y + 621, 0, 1) / 86400000, high = Date.UTC(y + 622, 11, 31) / 86400000;
        while (low <= high) {
            var middle = Math.floor((low + high) / 2), utc = new Date(middle * 86400000);
            var date = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 12), j = jalaliParts(date);
            if (!j) { return null; }
            var diff = (y - j.y) || (m - j.m) || (d - j.d);
            if (!diff) { return date; }
            if (diff > 0) { low = middle + 1; } else { high = middle - 1; }
        }
        return null;
    }
    function jalaliText(date) { var j = jalaliParts(date); return j ? toFa(j.y + '/' + datePad(j.m) + '/' + datePad(j.d)) : ''; }
    function parseCalendarField(value) {
        var m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?: (\d{2}):(\d{2}))?$/.exec(toEn(value).trim());
        if (!m || Number(m[1]) < 1000 || Number(m[4] || 0) > 23 || Number(m[5] || 0) > 59) { return null; }
        var date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0));
        return date.getFullYear() === Number(m[1]) && date.getMonth() === Number(m[2]) - 1 && date.getDate() === Number(m[3]) ? date : null;
    }
    /* Issue 9: Jalali companion calendar rendered beside the module calendar.
       Display-only: it never touches the module's own data, forms or events.
       Issabel's calendar_gui.tpl hosts everything in the #calendar_toolbar
       column (create button, mini datepicker, iCal export). */
    function initJalali() {
        if (doc.querySelector('.voiz-jalali-card')) { return; }
        var host = doc.querySelector('#calendar_toolbar')
            || doc.querySelector('.calendar-env .calendar-sidebar')
            || doc.querySelector('.calendar-env');
        if (!host) { return; }
        var monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
        var dowNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
        var today = jalaliParts(new Date()) || { y: 1405, m: 1, d: 1 };
        var view = { y: today.y, m: today.m };
        var card = doc.createElement('div');
        card.className = 'voiz-jalali-card';
        card.setAttribute('aria-label', 'تقویم جلالی');
        function toFa(value) { return String(value).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
        /* The mini datepicker is re-rendered on every month change by jQuery
           UI; repersianize after each redraw through the AjaxComplete hook and
           an initial pass. */
        function persianizeMini() {
            var map = { su: 'ی', mo: 'د', tu: 'س', we: 'چ', th: 'پ', fr: 'ج', sa: 'ش' };
            all('#calendar_datepick .ui-datepicker-calendar thead th').forEach(function (th) {
                var key = th.textContent.trim().toLowerCase().slice(0, 2);
                if (map[key]) { th.textContent = map[key]; }
            });
            all('#calendar_datepick .ui-datepicker-calendar td a').forEach(function (a) {
                if (/^\d{1,2}$/.test(a.textContent.trim())) { a.textContent = toFa(a.textContent); }
            });
            all('#calendar_datepick select.ui-datepicker-month option').forEach(function (option, index) {
                if (faLocale.monthNames[index]) { option.textContent = faLocale.monthNames[index]; }
            });
            all('#calendar_datepick select.ui-datepicker-year option').forEach(function (option) {
                if (/^\d{4}$/.test(option.textContent.trim())) { option.textContent = toFa(option.textContent.trim()); }
            });
        }
        /* Live-only pass for FullCalendar headers that were rendered before the
           locale patch (navigation redraws) — the fixture already ships Persian. */
        var fcDayMap = { sun: 'ی', mon: 'د', tue: 'س', wed: 'چ', thu: 'پ', fri: 'ج', sat: 'ش' };
        function persianizeFullCalendar() {
            all('#calendar_main .fc-day-header').forEach(function (th) {
                var key = th.textContent.trim().toLowerCase().slice(0, 3);
                if (fcDayMap[key]) { th.textContent = fcDayMap[key]; }
            });
            all('#calendar_main .fc-header h2').forEach(function (title) {
                var match = /^([A-Za-z]+)\s+(\d{4})$/.exec(title.textContent.trim());
                if (match) {
                    var index = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(match[1].toLowerCase());
                    if (index >= 0) { title.textContent = faLocale.monthNames[index] + ' ' + toFa(match[2]); }
                }
            });
            all('#calendar_main .fc-header .fc-button').forEach(function (button) {
                var text = button.textContent.trim().toLowerCase();
                if (faLocale.buttonText[text]) { button.textContent = faLocale.buttonText[text]; }
            });
        }
        if (window.jQuery) {
            window.jQuery(doc).ajaxComplete(function () { persianizeMini(); persianizeFullCalendar(); });
        }
        function render() {
            var first = jalaliToGregorian(view.y, view.m, 1);
            var nextMonth = view.m === 12 ? jalaliToGregorian(view.y + 1, 1, 1) : jalaliToGregorian(view.y, view.m + 1, 1);
            var monthLength = Math.round((nextMonth - first) / 86400000);
            var startCol = (first.getDay() + 1) % 7; /* Persian week starts on Saturday. */
            var html = '<div class="voiz-jalali-head"><div class="voiz-jalali-title">' + monthNames[view.m - 1] + ' ' + toFa(view.y) +
                '</div><div class="voiz-jalali-nav">' +
                '<button type="button" data-voiz-jalali="today" title="امروز">امروز</button>' +
                '<button type="button" data-voiz-jalali="next" title="ماه بعد" aria-label="ماه بعد">‹</button>' +
                '<button type="button" data-voiz-jalali="prev" title="ماه قبل" aria-label="ماه قبل">›</button>' +
                '</div></div><div class="voiz-jalali-grid">';
            dowNames.forEach(function (name) { html += '<div class="voiz-jalali-dow">' + name + '</div>'; });
            for (var i = 0; i < startCol; i++) { html += '<div class="voiz-jalali-day voiz-jalali-out"></div>'; }
            for (var day = 1; day <= monthLength; day++) {
                var date = new Date(first.getTime() + (day - 1) * 86400000);
                var classes = 'voiz-jalali-day';
                if (date.getDay() === 5) { classes += ' voiz-jalali-holiday'; }
                if (view.y === today.y && view.m === today.m && day === today.d) { classes += ' voiz-jalali-today'; }
                html += '<div class="' + classes + '">' + toFa(day) + '</div>';
            }
            html += '</div><div class="voiz-jalali-foot">تقویم هجری شمسی</div>';
            card.innerHTML = html;
        }
        card.addEventListener('click', function (event) {
            var action = closest(event.target, '[data-voiz-jalali]');
            if (!action) { return; }
            event.preventDefault();
            var what = action.getAttribute('data-voiz-jalali');
            if (what === 'prev') { view.m--; if (view.m < 1) { view.m = 12; view.y--; } }
            else if (what === 'next') { view.m++; if (view.m > 12) { view.m = 1; view.y++; } }
            else { view = { y: today.y, m: today.m }; }
            render();
        });
        render();
        host.appendChild(card);
        persianizeMini();
        persianizeFullCalendar();
    }
    function initEventDatePickers() {
        var dialog = doc.querySelector('#calendar_eventdialog');
        if (!dialog || dialog.dataset.voizDates) { return; }
        dialog.dataset.voizDates = 'true';
        var hasJalali = !!jalaliParts(new Date()), controllers = [], activePicker = null;
        var table = dialog.querySelector('table');
        if (table) { table.classList.add('voiz-event-fields'); table.classList.remove('voiz-form-table'); }
        // Associate Issabel's existing field captions without replacing its controls.
        all('input:not([type="hidden"]), select, textarea', dialog).forEach(function (field, index) {
            var row = closest(field, 'tr'), caption = row && row.querySelector('b');
            if (!field.id) { field.id = 'voiz-event-field-' + index; }
            if (caption && !field.labels.length) {
                if (!caption.id) { caption.id = field.id + '-label'; }
                field.setAttribute('aria-labelledby', caption.id);
            }
        });
        var error = doc.createElement('p');
        error.id = 'voiz-event-date-error'; error.className = 'voiz-date-error'; error.hidden = true;
        error.setAttribute('role', 'alert');
        var endRow = closest(dialog.querySelector('input[name="to"]'), 'tr');
        if (endRow) { endRow.lastElementChild.appendChild(error); }
        function validateRange() {
            var start = dialog.querySelector('input[name="date"]'), end = dialog.querySelector('input[name="to"]');
            var from = start && parseCalendarField(start.value), to = end && parseCalendarField(end.value);
            var invalid = controllers.some(function (c) { return c.invalid(); });
            var message = invalid || !from || !to ? 'تاریخ و ساعت معتبر وارد کنید.' : from > to ? 'تاریخ و ساعت پایان باید برابر یا بعد از شروع باشد.' : '';
            error.textContent = message; error.hidden = !message;
            controllers.forEach(function (c) { c.markRange(!!message); });
            return !message;
        }
        all('input[name="date"], input[name="to"]', dialog).forEach(function (input) {
            var endpoint = input.name === 'date' ? 'شروع' : 'پایان';
            var wrap = doc.createElement('div'); wrap.className = 'voiz-jdate-wrap';
            input.parentNode.insertBefore(wrap, input);
            // Hide the module's datetimepicker input and its trigger together.
            // Its name, id and value remain available to existing module code.
            input.hidden = true; input.tabIndex = -1; wrap.appendChild(input);
            var nativeTrigger = wrap.nextElementSibling;
            if (nativeTrigger && nativeTrigger.matches('.ui-datepicker-trigger, .datepicker-button')) { nativeTrigger.hidden = true; }
            function fieldBox(kind, labelText, type) {
                var box = doc.createElement('div'); box.className = 'voiz-jdate-' + kind;
                var label = doc.createElement('label'), field = doc.createElement('input');
                field.id = 'voiz-' + input.name + '-' + kind; field.type = type || 'text'; field.autocomplete = 'off';
                field.dir = 'ltr'; label.htmlFor = field.id; label.textContent = labelText;
                field.setAttribute('aria-label', labelText + ' ' + endpoint);
                field.setAttribute('aria-describedby', error.id);
                box.appendChild(label); box.appendChild(field); wrap.appendChild(box);
                return field;
            }
            var jalali = hasJalali ? fieldBox('jalali', 'شمسی') : null;
            var gregorian = fieldBox('gregorian', 'میلادی');
            var time = fieldBox('time', 'ساعت', 'time'); time.step = '60';
            gregorian.placeholder = 'YYYY-MM-DD';
            if (jalali) { jalali.placeholder = 'سال/ماه/روز'; }
            var toggle = doc.createElement('button'); toggle.type = 'button'; toggle.className = 'voiz-jdate-toggle';
            toggle.innerHTML = '<i class="fa fa-calendar" aria-hidden="true"></i><span>انتخاب تاریخ</span>';
            toggle.setAttribute('aria-label', 'انتخاب تاریخ ' + endpoint); toggle.setAttribute('aria-expanded', 'false');
            var pop = doc.createElement('div'); pop.id = 'voiz-date-picker-' + input.name;
            pop.className = 'voiz-jdate-pop'; pop.hidden = true; pop.setAttribute('role', 'group'); pop.setAttribute('aria-label', 'تقویم انتخاب تاریخ ' + endpoint);
            toggle.setAttribute('aria-controls', pop.id); wrap.appendChild(toggle); wrap.appendChild(pop);
            var mode = hasJalali ? 'jalali' : 'gregorian', viewDate = dateOnly(new Date()), selected = null, sourceValue;
            var controls = [jalali, gregorian, time].filter(Boolean);
            function invalid() { return controls.some(function (field) { return !!field.validationMessage; }); }
            function sync() {
                var date = parseCalendarField(input.value); sourceValue = input.value;
                selected = date ? dateOnly(date) : null;
                gregorian.value = date ? gregorianText(date) : '';
                if (jalali) { jalali.value = date ? jalaliText(date) : ''; }
                time.value = date ? datePad(date.getHours()) + ':' + datePad(date.getMinutes()) : '';
                controls.forEach(function (field) { field.setCustomValidity(''); field.removeAttribute('aria-invalid'); });
                if (selected) { viewDate = selected; }
            }
            function writeDate(date) {
                var old = parseCalendarField(input.value);
                var hhmm = time.value || (old ? datePad(old.getHours()) + ':' + datePad(old.getMinutes()) : '00:00');
                input.value = gregorianText(date) + ' ' + hhmm;
                sync(); input.dispatchEvent(new Event('change', { bubbles: true })); validateRange();
            }
            function commitField(field) {
                var date;
                if (field === jalali) {
                    var m = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(toEn(field.value).trim());
                    date = m && jalaliToGregorian(Number(m[1]), Number(m[2]), Number(m[3]));
                } else { date = parseCalendarField(gregorian.value); }
                var validTime = /^\d{2}:\d{2}$/.test(time.value);
                if (!date || !validTime) {
                    field.setCustomValidity('تاریخ و ساعت معتبر وارد کنید.'); field.setAttribute('aria-invalid', 'true'); validateRange(); return;
                }
                field.setCustomValidity(''); writeDate(date);
            }
            function close(returnFocus) {
                pop.hidden = true; toggle.setAttribute('aria-expanded', 'false');
                if (activePicker === controller) { activePicker = null; }
                if (returnFocus) { toggle.focus(); }
            }
            function viewParts() { return mode === 'jalali' ? jalaliParts(viewDate) : { y: viewDate.getFullYear(), m: viewDate.getMonth() + 1, d: viewDate.getDate() }; }
            function monthStart(y, m) { return mode === 'jalali' ? jalaliToGregorian(y, m, 1) : new Date(y, m - 1, 1, 12); }
            function moveMonth(step) {
                var parts = viewParts(), index = parts.y * 12 + parts.m - 1 + step;
                viewDate = monthStart(Math.floor(index / 12), index % 12 + 1); render();
            }
            function render() {
                var parts = viewParts(), first = monthStart(parts.y, parts.m);
                var next = monthStart(parts.m === 12 ? parts.y + 1 : parts.y, parts.m === 12 ? 1 : parts.m + 1);
                var count = Math.round((next - first) / 86400000), offset = (first.getDay() + 1) % 7;
                var names = mode === 'jalali' ? jalaliMonths : faLocale.monthNames;
                var start = parseCalendarField(dialog.querySelector('input[name="date"]').value);
                var end = parseCalendarField(dialog.querySelector('input[name="to"]').value);
                var today = gregorianText(new Date());
                var html = '<div class="voiz-date-modes" role="group" aria-label="نوع تقویم">';
                if (hasJalali) { html += '<button type="button" data-calendar-mode="jalali" aria-pressed="' + (mode === 'jalali') + '">شمسی</button>'; }
                html += '<button type="button" data-calendar-mode="gregorian" aria-pressed="' + (mode === 'gregorian') + '">میلادی</button></div>';
                html += '<div class="voiz-jalali-head"><button type="button" data-voiz-jdate="prev" aria-label="ماه قبل">›</button><select data-date-month aria-label="ماه">';
                names.forEach(function (name, index) { html += '<option value="' + (index + 1) + '"' + (parts.m === index + 1 ? ' selected' : '') + '>' + name + '</option>'; });
                html += '</select><select data-date-year aria-label="سال">';
                for (var y = parts.y - 100; y <= parts.y + 100; y++) { html += '<option value="' + y + '"' + (y === parts.y ? ' selected' : '') + '>' + toFa(y) + '</option>'; }
                html += '</select><button type="button" data-voiz-jdate="next" aria-label="ماه بعد">‹</button></div><div class="voiz-jalali-grid" role="group" aria-label="روزهای ماه">';
                calendarDays.forEach(function (day) { html += '<span class="voiz-jalali-dow">' + day + '</span>'; });
                for (var empty = 0; empty < offset; empty++) { html += '<span aria-hidden="true"></span>'; }
                for (var day = 1; day <= count; day++) {
                    var date = addCalendarDays(first, day - 1), key = gregorianText(date);
                    var isSelected = !!selected && key === gregorianText(selected), inRange = start && end && date >= dateOnly(start) && date <= dateOnly(end);
                    var disabled = input.name === 'to' && start && date < dateOnly(start);
                    var classes = 'voiz-jalali-day' + (inRange ? ' voiz-date-in-range' : '') + (isSelected ? ' voiz-jalali-selected' : '') + (key === today ? ' voiz-jalali-today' : '') + (date.getDay() === 5 ? ' voiz-jalali-holiday' : '');
                    var caption = (hasJalali ? jalaliText(date) + '، ' : '') + gregorianText(date);
                    html += '<button type="button" class="' + classes + '" data-voiz-jdate="pick" data-date="' + key + '" data-day="' + day + '" aria-label="' + caption + '" aria-pressed="' + isSelected + '"' + (key === today ? ' aria-current="date"' : '') + (disabled ? ' disabled' : '') + ' tabindex="-1">' + toFa(day) + '</button>';
                }
                html += '</div><div class="voiz-jdate-foot"><span>با انتخاب روز، تاریخ ثبت می‌شود.</span><button type="button" data-voiz-jdate="today">امروز</button><button type="button" data-voiz-jdate="close">بستن</button></div>';
                pop.innerHTML = html;
                var focusDay = pop.querySelector('.voiz-jalali-selected:not(:disabled)') || pop.querySelector('[data-voiz-jdate="pick"]:not(:disabled)');
                if (focusDay) { focusDay.tabIndex = 0; }
            }
            function open() {
                if (activePicker && activePicker !== controller) { activePicker.close(false); }
                if (sourceValue !== input.value) { sync(); }
                viewDate = selected || dateOnly(new Date());
                if (input.name === 'to') {
                    var start = parseCalendarField(dialog.querySelector('input[name="date"]').value);
                    if (start && viewDate < dateOnly(start)) { viewDate = dateOnly(start); }
                }
                render(); pop.hidden = false; activePicker = controller; toggle.setAttribute('aria-expanded', 'true');
                var first = pop.querySelector('[tabindex="0"]'); if (first) { first.focus(); }
            }
            var controller = { close: close, sync: sync, invalid: invalid, markRange: function (bad) { wrap.classList.toggle('voiz-date-invalid', bad); } };
            controllers.push(controller);
            toggle.addEventListener('click', function () { pop.hidden ? open() : close(true); });
            pop.addEventListener('click', function (event) {
                var action = closest(event.target, '[data-voiz-jdate], [data-calendar-mode]'); if (!action) { return; }
                var modeValue = action.getAttribute('data-calendar-mode'), what = action.getAttribute('data-voiz-jdate');
                if (modeValue) { mode = modeValue; render(); pop.querySelector('[data-calendar-mode="' + mode + '"]').focus(); }
                else if (what === 'prev' || what === 'next') { moveMonth(what === 'prev' ? -1 : 1); pop.querySelector('[data-voiz-jdate="' + what + '"]').focus(); }
                else if (what === 'today') { viewDate = dateOnly(new Date()); render(); }
                else if (what === 'close') { close(true); }
                else if (what === 'pick') { writeDate(parseCalendarField(action.getAttribute('data-date'))); close(true); }
            });
            pop.addEventListener('change', function (event) {
                if (!event.target.matches('[data-date-month], [data-date-year]')) { return; }
                var selector = event.target.hasAttribute('data-date-month') ? '[data-date-month]' : '[data-date-year]';
                viewDate = monthStart(Number(pop.querySelector('[data-date-year]').value), Number(pop.querySelector('[data-date-month]').value));
                render(); pop.querySelector(selector).focus();
            });
            pop.addEventListener('keydown', function (event) {
                var button = closest(event.target, '[data-date]'); if (!button) { return; }
                var date = parseCalendarField(button.getAttribute('data-date')), delta = { ArrowRight: -1, ArrowLeft: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
                if (event.key === 'Home') { delta = -((date.getDay() + 1) % 7); }
                if (event.key === 'End') { delta = 6 - ((date.getDay() + 1) % 7); }
                if (delta === undefined && event.key !== 'PageUp' && event.key !== 'PageDown') { return; }
                event.preventDefault();
                if (delta !== undefined) { viewDate = addCalendarDays(date, delta); render(); }
                else { moveMonth(event.key === 'PageUp' ? -1 : 1); }
                var target = pop.querySelector('[data-date="' + gregorianText(viewDate) + '"]:not(:disabled)') || pop.querySelector('[data-date]:not(:disabled)');
                if (target) { all('[data-date]', pop).forEach(function (day) { day.tabIndex = -1; }); target.tabIndex = 0; target.focus(); }
            });
            controls.forEach(function (field) { field.addEventListener('change', function () { commitField(field); }); });
            input.addEventListener('change', function () { sync(); });
            sync();
        });
        function syncDialog() { controllers.forEach(function (c) { c.close(false); c.sync(); }); error.hidden = true; controllers.forEach(function (c) { c.markRange(false); }); }
        if (window.jQuery) {
            window.jQuery(dialog).on('dialogopen.voizCalendar', function () {
                syncDialog();
                var frame = closest(dialog, '.ui-dialog');
                if (frame) { frame.setAttribute('aria-modal', 'true'); }
                var name = dialog.querySelector('input[name="event"]'); if (name) { name.focus(); }
            }).on('dialogclose.voizCalendar', syncDialog);
        }
        dialog.addEventListener('voiz:calendar-open', syncDialog);
        // Capture Escape before jQuery UI so closing a picker keeps the event open.
        doc.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && activePicker) { event.preventDefault(); event.stopImmediatePropagation(); activePicker.close(true); }
        }, true);
        doc.addEventListener('click', function (event) {
            if (activePicker && !closest(event.target, '.voiz-jdate-wrap')) { activePicker.close(false); }
            var frame = closest(dialog, '.ui-dialog'), save = frame && frame.querySelector('.ui-dialog-buttonset button');
            if (save && (event.target === save || save.contains(event.target)) && !validateRange()) {
                event.preventDefault(); event.stopImmediatePropagation();
                var invalidField = dialog.querySelector('.voiz-jdate-wrap [aria-invalid="true"]') || dialog.querySelector('#voiz-to-gregorian');
                if (invalidField) { invalidField.focus(); }
            }
        }, true);
    }
    function init() {
        var css = doc.querySelector('link[href*="voiz-tailwind.css"]'); frameStyleHref = css && css.href;
        installCalendarLocale();
        initMenu(); initSearch(); initPassword(); initUserMenu(); patchModalCentering(); initModal(); enhanceContent(); applyTheme(storageGet(), false);
        initOctets(); initMapTooltips(); initJalali(); initEventDatePickers();
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
    window.VoizUI = { applyTheme: applyTheme, toggleTheme: toggleTheme, currentTheme: currentTheme, closeSidebar: closeSidebar, refresh: enhanceContent, fcLocale: faLocale };
    if (window.jQuery) { window.jQuery(init); }
    else if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', init); }
    else { init(); }
})();
