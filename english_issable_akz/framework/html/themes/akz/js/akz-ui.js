/* Issabel / AKZ presentation only. Does not alter requests, permissions or PBX data. */
(function () {
    'use strict';
    var doc = document, root = doc.documentElement, themeKey = 'akz-theme';
    var menu, sidebar, drawerOpener, modalOpener, modalVisible = false;
    var uiTimer, frameStyleHref, plotObserver;
    /* English locale for stock Gregorian calendar widgets. */
    var enLocale = {
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        buttonText: { today: 'Today', month: 'Month', week: 'Week', day: 'Day' },
        allDayText: 'All day', firstDay: 0, isRTL: false
    };
    function installCalendarLocale() {
        var $ = window.jQuery;
        if (!$) { return; }
        if ($.datepicker && $.datepicker.regional) {
            $.datepicker.regional.en = {
                closeText: 'Done', prevText: 'Previous', nextText: 'Next', currentText: 'Today',
                monthNames: enLocale.monthNames, monthNamesShort: enLocale.monthNamesShort,
                dayNames: enLocale.dayNames, dayNamesShort: enLocale.dayNamesShort,
                dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                weekHeader: 'Wk', dateFormat: 'yy-mm-dd', firstDay: 0, isRTL: false,
                showMonthAfterYear: false, yearSuffix: ''
            };
            $.datepicker.setDefaults($.datepicker.regional.en);
        }
        if ($.fn && $.fn.fullCalendar && $.fn.fullCalendar.defaults) {
            $.extend($.fn.fullCalendar.defaults, enLocale);
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
        all('.akz-theme-toggle').forEach(function (button) {
            var label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
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
        doc.body.classList.remove('akz-sidebar-open');
        all('.akz-topbar-burger').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
        var main = doc.querySelector('.main-content');
        if (main) { main.inert = false; }
        if (sidebar) { sidebar.inert = drawerMode(); sidebar.removeAttribute('aria-modal'); sidebar.setAttribute('role', 'navigation'); }
        if (restore !== false && drawerOpener) { drawerOpener.focus(); drawerOpener = null; }
    }
    function openSidebar(button) {
        if (!sidebar || !drawerMode()) { return; }
        drawerOpener = button || doc.activeElement;
        doc.body.classList.add('akz-sidebar-open');
        sidebar.inert = false;
        sidebar.setAttribute('role', 'dialog');
        sidebar.setAttribute('aria-modal', 'true');
        all('.akz-topbar-burger').forEach(function (el) { el.setAttribute('aria-expanded', 'true'); });
        var main = doc.querySelector('.main-content');
        if (main) { main.inert = true; }
        var first = sidebar.querySelector('.akz-sidebar-close') || sidebar.querySelector('a');
        if (first) { first.focus(); }
    }
    function submenuFor(li) { return all('ul', li).filter(function (el) { return el.parentNode === li; })[0]; }
    function setExpanded(li, expanded) {
        var sub = submenuFor(li), button = li.querySelector(':scope > .akz-menu-toggle');
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
            sub.id = sub.id || 'akz-submenu-' + i;
            var button = doc.createElement('button');
            button.type = 'button'; button.className = 'akz-menu-toggle';
            button.setAttribute('aria-label', 'Submenu: ' + link.textContent.trim());
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
            var control = closest(event.target, 'a, .akz-menu-toggle');
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
            if (event.key === 'ArrowRight' && submenuFor(li)) {
                event.preventDefault(); setExpanded(li, true);
                var first = submenuFor(li).querySelector('a'); if (first) { first.focus(); }
            } else if (event.key === 'ArrowLeft') {
                var ancestor = li.parentNode.closest('li');
                if (li.classList.contains('opened')) { event.preventDefault(); setExpanded(li, false); }
                else if (ancestor) { event.preventDefault(); setExpanded(ancestor, false); ancestor.querySelector('a').focus(); }
            }
        });
        // Old sidebar controls may be triggered by Issabel's chat panel.
        window.toggle_sidebar_menu = function () { if (drawerMode()) { doc.body.classList.contains('akz-sidebar-open') ? closeSidebar() : openSidebar(); } };
        window.show_sidebar_menu = function () { if (drawerMode()) { openSidebar(); } };
        window.hide_sidebar_menu = function () { closeSidebar(); };
        window.fit_main_content_height = function () { /* CSS owns page height. */ };
        var page = doc.querySelector('.page-container'); if (page) { page.classList.remove('sidebar-collapsed'); }
        closeSidebar(false);
        /* Belt and braces: whatever opens the drawer, an open drawer must never
           stay inert (the reported "dead menu" symptom). */
        if (window.MutationObserver) {
            new MutationObserver(function () {
                if (doc.body.classList.contains('akz-sidebar-open') && sidebar && sidebar.inert) { sidebar.inert = false; }
            }).observe(doc.body, { attributes: true, attributeFilter: ['class'] });
        }
        var media = window.matchMedia('(max-width: 991px)');
        if (media.addEventListener) { media.addEventListener('change', function () { closeSidebar(); }); }
        else { media.addListener(function () { closeSidebar(); }); }
    }
    function normalize(text) { return String(text).toLowerCase().replace(/\s+/g, ' ').trim(); }
    function initSearch() {
        var input = doc.getElementById('search_module_issabel');
        if (!input || !menu) { return; }
        var form = input.closest('form'), box = doc.createElement('div'), status = doc.createElement('span');
        box.id = 'akz-search-results'; box.className = 'akz-search-results'; box.setAttribute('role', 'listbox'); box.setAttribute('aria-label', 'Navigation search results');
        status.className = 'akz-sr-only'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
        form.parentNode.appendChild(box); form.parentNode.appendChild(status);
        input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-controls', box.id); input.setAttribute('aria-expanded', 'false');
        var index = [], seen = {}, matches = [], active = -1;
        all('a[href*="menu="]', menu).forEach(function (link) {
            if (seen[link.href]) { return; } seen[link.href] = true;
            var parents = [], li = link.parentNode.parentNode.closest('li');
            while (li) { var label = li.querySelector(':scope > a'); if (label) { parents.unshift(label.textContent.trim()); } li = li.parentNode.closest('li'); }
            index.push({ name: link.textContent.trim(), path: parents.join(' / '), href: link.getAttribute('href') });
        });
        function close() { box.classList.remove('akz-open'); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
        function activate(i) {
            active = i;
            all('.akz-search-item', box).forEach(function (item, idx) { item.classList.toggle('akz-active', idx === i); item.setAttribute('aria-selected', String(idx === i)); });
            var option = box.querySelector('.akz-active');
            if (option) { input.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' }); }
        }
        function render() {
            var q = normalize(input.value); box.textContent = ''; matches = []; active = -1;
            input.removeAttribute('aria-activedescendant');
            if (!q) { close(); status.textContent = ''; return; }
            matches = index.filter(function (item) { return normalize(item.name + ' ' + item.path).indexOf(q) !== -1; }).slice(0, 15);
            matches.forEach(function (item, i) {
                var a = doc.createElement('a'), label = doc.createElement('span'), path = doc.createElement('small');
                a.className = 'akz-search-item'; a.id = 'akz-search-opt-' + i; a.href = item.href; a.setAttribute('role', 'option'); a.setAttribute('aria-selected', 'false'); a.tabIndex = -1;
                label.textContent = item.name; path.textContent = item.path; a.appendChild(label); a.appendChild(path); box.appendChild(a);
            });
            if (!matches.length) { var empty = doc.createElement('div'); empty.className = 'akz-search-empty'; empty.textContent = 'No results found'; box.appendChild(empty); }
            status.textContent = matches.length ? matches.length + ' results found' : 'No results found';
            input.setAttribute('aria-expanded', 'true'); box.classList.add('akz-open');
        }
        input.addEventListener('input', render);
        input.addEventListener('focus', function () { if (input.value) { render(); } });
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') { event.preventDefault(); close(); return; }
            if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length) {
                event.preventDefault(); box.classList.add('akz-open'); input.setAttribute('aria-expanded', 'true');
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
        wrap.className = 'akz-password-wrap'; input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
        toggle.type = 'button'; toggle.className = 'akz-pass-toggle'; toggle.setAttribute('aria-label', 'Show password'); toggle.setAttribute('aria-pressed', 'false'); toggle.setAttribute('aria-controls', input.id);
        toggle.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>'; wrap.appendChild(toggle);
        toggle.addEventListener('click', function () {
            var visible = input.type === 'password'; input.type = visible ? 'text' : 'password';
            toggle.setAttribute('aria-pressed', String(visible)); toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password'); toggle.querySelector('i').className = visible ? 'fa fa-eye-slash' : 'fa fa-eye';
        });
    }
    var dataTables = 'table.issabel-standard-table, table.tabla_listado, table.table, table.dataTable, table.listDataTable, table.table_data';
    var excludedTables = '.fc, .calendar, .ui-datepicker, .datepicker, #applet_grid, .akz-hardware, .akz-contact-form, #endpointConfigApplication, .calendarContainer, #calendar_eventdialog';
    function enhanceMessages() {
        var headings = {
            'MESSAGE': ['Message', 'info'], 'INFORMATION': ['Information', 'info'], 'INFO': ['Information', 'info'],
            'ERROR': ['Error', 'error'], 'WARNING': ['Warning', 'warning'], 'SUCCESS': ['Success', 'success']
        };
        all('.div_msg_errors').forEach(function (message) {
            // Older modules, including Beta Channel, emit unclassed children.
            // Add presentation hooks without replacing their content or callbacks.
            if (!message.querySelector('.div_msg_errors_content')) {
                var parts = message.children;
                if (parts.length === 3 && parts[1].querySelector('[onclick*="hide_message_error"]')) {
                    parts[0].classList.add('div_msg_errors_title');
                    parts[1].classList.add('div_msg_errors_dismiss');
                    parts[2].classList.add('div_msg_errors_content');
                }
            }
            var title = message.querySelector('.div_msg_errors_title');
            var heading = title && headings[title.textContent.trim().replace(/[:：]\s*$/, '').toUpperCase()];
            var type = heading ? heading[1] : 'error';
            if (heading) {
                var caption = title.querySelector('b') || title;
                if (caption.textContent.trim() !== heading[0]) { caption.textContent = heading[0]; }
            }
            message.setAttribute('data-akz-message-type', type);
            message.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
            all('.div_msg_errors_dismiss button, .div_msg_errors_dismiss input[type="button"]', message).forEach(function (button) {
                button.setAttribute('aria-label', 'Dismiss message');
                button.setAttribute('title', 'Dismiss message');
            });
        });
    }
    function enhanceContent() {
        enhanceNetworkControls();
        enhanceMessages();
        var eventTable = doc.querySelector('#calendar_eventdialog > table');
        if (eventTable) { eventTable.classList.add('akz-event-fields'); }
        var selectedModule = doc.getElementById('issabel_framework_module_id');
        var moduleId = selectedModule ? selectedModule.value : new URL(window.location.href).searchParams.get('menu');
        var moduleContent = doc.querySelector('.neo-module-content');
        if (moduleContent && /^(address_book|hardware_detector|monitoring)$/.test(moduleId)) {
            moduleContent.classList.add('akz-module-' + moduleId);
        }
        all('#endpointConfigApplication .neo-table-action').forEach(function (button) {
            var caption = button.title || (button.parentNode && button.parentNode.title);
            if (caption) { button.setAttribute('aria-label', caption); button.setAttribute('data-akz-caption', caption); }
        });
        var qrTemplate = doc.getElementById('template');
        if (qrTemplate && qrTemplate.form && qrTemplate.form.querySelector('#asteriskip')) { qrTemplate.form.classList.add('akz-qr-config'); }
        all('.akz-report-scroll').forEach(function (region) {
            if (!region.hasAttribute('tabindex')) {
                region.tabIndex = 0; region.setAttribute('role', 'region');
                region.setAttribute('aria-label', 'Call table; scroll horizontally to view all columns');
            }
        });
        all(dataTables).forEach(function (table) {
            // CDR and recordings create their own table-only scroll region.
            if (table.id === 'CDRreport' || table.closest(excludedTables)) { return; }
            var wrapper = table.closest('.akz-table-scroll, .akz-table-wrap, .table-responsive, .dataTables_scrollBody, .dataTables_scrollHead');
            if (!wrapper) { wrapper = doc.createElement('div'); wrapper.className = 'akz-table-scroll'; table.parentNode.insertBefore(wrapper, table); wrapper.appendChild(table); }
            if (!wrapper.hasAttribute('tabindex')) { wrapper.tabIndex = 0; wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-label', 'Data table; scroll horizontally to view all columns'); }
        });
        all('.neo-module-content table, .neo-modal-issabel-popup-content table').forEach(function (table) {
            if (table.classList.contains('akz-form-table') || table.closest(excludedTables) || table.matches(dataTables) || table.querySelector('thead, table, th') || table.classList.contains('tabForm')) { return; }
            // Only genuine field-layout tables; plain lists and all calendar tables retain native layout.
            if (table.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), select, textarea')) { table.classList.add('akz-form-table'); }
        });
        // Core versions without the supplied applet template still get the same layout.
        all('#cpugauge').forEach(function (gauge) { if (gauge.parentNode.querySelector('#memgauge')) { gauge.parentNode.classList.add('akz-gauges'); gauge.parentNode.style.height = 'auto'; } });
        all('#dashboard-applet-hd-usage').forEach(function (gauge) { gauge.parentNode.classList.add('akz-drive'); });
        all('.neo-applet-processes-row-status-msg').forEach(function (label) {
            var original = label.style.color;
            if (/^(green|rgb\(0, ?128, ?0\)|#008000)$/i.test(original)) { label.style.color = 'var(--akz-success)'; }
            else if (/^(red|rgb\(255, ?0, ?0\)|#ff0000)$/i.test(original)) { label.style.color = 'var(--akz-danger)'; }
            else if (/^(blue|rgb\(0, ?0, ?255\)|#0000ff)$/i.test(original)) { label.style.color = 'var(--akz-info)'; }
        });
        all('.neo-module-content iframe').forEach(function (frame) {
            frame.classList.add('akz-module-frame');
            if (!frame.hasAttribute('title')) { frame.title = 'Selected module content'; }
            if (!frame.dataset.akzFrame) { frame.dataset.akzFrame = 'true'; frame.addEventListener('load', syncFrames); }
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
            options.grid.tickColor = colors.getPropertyValue('--akz-border').trim();
            options.legend.backgroundColor = colors.getPropertyValue('--akz-surface').trim();
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
                    if (!width || element.dataset.akzPlotWidth === String(width)) { return; }
                    element.dataset.akzPlotWidth = String(width);
                    var plot = window.jQuery(element).data('plot');
                    if (plot && typeof plot.resize === 'function') { plot.resize(); plot.setupGrid(); plot.draw(); }
                });
            });
        }
        all('#dashboard-applet-performancegraph').forEach(function (element) {
            if (!element.dataset.akzPlotObserved) { element.dataset.akzPlotObserved = 'true'; plotObserver.observe(element); }
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
                if (!page.getElementById('akz-frame-theme')) {
                    var css = page.createElement('link'); css.id = 'akz-frame-theme'; css.rel = 'stylesheet'; css.href = frameStyleHref;
                    page.head.appendChild(css); page.body.classList.add('akz-embedded');
                }
                // PBX navigation may replace its content without reloading the frame.
                if (/\/admin(?:\/|$)/.test(frame.contentWindow.location.pathname)) {
                    page.body.classList.add('akz-pbx');
                    page.documentElement.dir = 'ltr'; page.documentElement.lang = 'en';
                    if (!page.getElementById('akz-pbx-ui')) {
                        var script = page.createElement('script'); script.id = 'akz-pbx-ui';
                        script.src = frameStyleHref.replace(/css\/akz-tailwind\.css/, 'js/akz-embedded.js');
                        page.head.appendChild(script);
                    }
                }
            } catch (e) { /* Cross-origin content cannot be themed by the parent. */ }
        });
    }
    function themeCharts() {
        // Chart.js 2 is shipped by the CDR and monitoring modules. Only presentation options change.
        if (!window.Chart || !window.Chart.instances) { return; }
        var colors = getComputedStyle(root), ink = colors.getPropertyValue('--akz-text-soft').trim(), border = colors.getPropertyValue('--akz-border').trim();
        Object.keys(window.Chart.instances).forEach(function (id) {
            var chart = window.Chart.instances[id];
            if (!chart || !chart.options || !chart.canvas || !doc.contains(chart.canvas)) { return; }
            var options = chart.options;
            if (options.legend && options.legend.labels) { options.legend.labels.fontColor = ink; options.legend.labels.fontFamily = 'Arial'; }
            if (options.scales) {
                ['xAxes', 'yAxes'].forEach(function (axis) { (options.scales[axis] || []).forEach(function (scale) { if (scale.ticks) { scale.ticks.fontColor = ink; scale.ticks.fontFamily = 'Arial'; } if (scale.gridLines) { scale.gridLines.color = border; scale.gridLines.zeroLineColor = border; } }); });
            }
            if (typeof chart.update === 'function') { chart.update(0); }
        });
    }
    /* Issue 3: the framework modal (change-password popup) is repositioned by
       legacy scripts with absolute pixel offsets. Recentre it whenever shown. */
    function patchModalCentering() {
        var modal = doc.querySelector('.neo-modal-issabel-popup-box');
        if (!modal || modal.__akzCentered) { return; }
        modal.__akzCentered = true;
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
            modal.style.setProperty('min-height', '0', 'important');
            modal.style.setProperty('max-height', 'calc(100vh - 48px)', 'important');
            if (window.CSS && window.CSS.supports('height', '100dvh')) {
                modal.style.setProperty('max-height', 'calc(100dvh - 48px)', 'important');
            }
            modal.style.setProperty('overflow-y', 'auto', 'important');
            modal.style.setProperty('width', 'min(600px, calc(100vw - 24px))', 'important');
            modal.style.setProperty('padding', '0', 'important');
            var inner = modal.querySelector('.neo-modal-issabel-popup-content');
            if (inner) { inner.style.maxHeight = 'none'; inner.style.overflow = 'visible'; }
            all('#curr_pass, #curr_pass_new, #curr_pass_renew', modal).forEach(function (input) {
                input.setAttribute('autocomplete', input.id === 'curr_pass' ? 'current-password' : 'new-password');
                var row = input.closest('tr'), label = row && row.querySelector('td:first-child b');
                if (label) {
                    label.id = label.id || input.id + '-label';
                    input.setAttribute('aria-labelledby', label.id);
                }
            });
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
        var user = doc.querySelector('.akz-topbar-user');
        var link = user && user.querySelector('.akz-user-link');
        if (!user || !link || user.__akzUserMenu) { return; }
        user.__akzUserMenu = true;
        link.setAttribute('aria-haspopup', 'true');
        function close() {
            user.classList.remove('akz-open');
            link.setAttribute('aria-expanded', 'false');
        }
        function toggle(event) {
            event.preventDefault(); event.stopImmediatePropagation();
            var open = !user.classList.contains('akz-open');
            user.classList.toggle('akz-open', open);
            link.setAttribute('aria-expanded', String(open));
        }
        link.addEventListener('click', toggle, true);
        doc.addEventListener('click', function (event) {
            if (user.classList.contains('akz-open') && !user.contains(event.target)) { close(); }
        });
        doc.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && user.classList.contains('akz-open')) { close(); link.focus(); }
        });
        var panel = user.querySelector('.dropdown-menu');
        if (panel) { all('a', panel).forEach(function (item) { item.addEventListener('click', function () { close(); }); }); }
    }
    function initModal() {
        var modal = doc.querySelector('.neo-modal-issabel-popup-box');
        if (!modal) { return; }
        var title = modal.querySelector('.neo-modal-issabel-popup-title'), close = modal.querySelector('.neo-modal-issabel-popup-close');
        modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.tabIndex = -1;
        if (title) { title.id = title.id || 'akz-modal-title'; modal.setAttribute('aria-labelledby', title.id); }
        function sync() {
            var visible = getComputedStyle(modal).display !== 'none';
            if (visible && !modalVisible) {
                modalOpener = doc.activeElement;
                (modal.querySelector('input[type="password"], input[type="text"]') || close || modal).focus();
            }
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
    function enhanceNetworkControls() {
        all('input[name^="in_"][name$="_1"]').forEach(function (first) {
            if (!/^in_(ip_ini|ip_fin|dns1|dns2|wins|gw|gwm|next)_1$/.test(first.name) || first.closest('.akz-ip-group')) { return; }
            var cell = first.closest('td'), prefix = first.name.slice(0, -1);
            if (!cell) { return; }
            var fields = [1, 2, 3, 4].map(function (n) { return cell.querySelector('input[name="' + prefix + n + '"]'); });
            if (fields.some(function (field) { return !field || field.parentNode !== first.parentNode; })) { return; }
            var row = cell.parentNode, caption = row.cells && row.cells[0] !== cell ? row.cells[0].textContent.replace(/\*/g, '').trim() : '';
            var group = doc.createElement('span');
            group.className = 'akz-ip-group'; group.dir = 'ltr'; group.setAttribute('role', 'group');
            if (caption) { group.setAttribute('aria-label', caption); }
            first.parentNode.insertBefore(group, first);
            // Move the original inputs and separators, preserving values and listeners.
            var node = first;
            while (node) {
                var next = node.nextSibling; group.appendChild(node);
                if (node === fields[3]) { break; }
                node = next;
            }
            fields.forEach(function (field, index) {
                field.classList.add('akz-ip-octet'); field.dir = 'ltr'; field.setAttribute('inputmode', 'numeric');
                if (!field.hasAttribute('aria-label') && !field.hasAttribute('aria-labelledby')) {
                    field.setAttribute('aria-label', (caption || 'IP') + ' ' + (index + 1));
                }
            });
        });
        all('.ibutton-container > input[type="checkbox"]').forEach(function (input) {
            input.setAttribute('role', 'switch');
            if (input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby') || (input.labels && input.labels.length)) { return; }
            var cell = input.closest('td'), label = cell && cell.previousElementSibling;
            if (label && label.textContent.trim()) { input.setAttribute('aria-label', label.textContent.trim()); }
        });
    }
    /* Issue 6: dotted-quad octet fields (DHCP server). Move focus between the
       boxes as the user types; values and field names are untouched. */
    function findOctetGroup(input) {
        var address = input.closest('.akz-ip-group');
        if (address) { return all('input.akz-ip-octet', address); }
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
                var right = group[index + 1];
                if (right) { event.preventDefault(); right.focus(); if (right.select) { right.select(); } }
            } else if (event.key === 'ArrowLeft' && input.selectionStart === 0) {
                var left = group[index - 1];
                if (left) { event.preventDefault(); left.focus(); if (left.select) { left.select(); } }
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
        var selector = '.jvectormap-tip, .jvectormap-label, .ammap-tooltip, .map-tooltip, .maptooltip, .country-tooltip, .leaflet-tooltip';
        function clamp() {
            pending = false;
            all(selector).forEach(function (tip) {
                // SVG tooltip geometry belongs to the chart renderer.
                if (tip.namespaceURI !== 'http://www.w3.org/1999/xhtml' || tip.closest('svg') || !tip.getClientRects().length) { return; }
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
    function init() {
        var css = doc.querySelector('link[href*="akz-tailwind.css"]'); frameStyleHref = css && css.href;
        installCalendarLocale();
        initMenu(); initSearch(); initPassword(); initUserMenu(); patchModalCentering(); initModal(); enhanceContent(); applyTheme(storageGet(), false);
        initOctets(); initMapTooltips();
        doc.addEventListener('click', function (event) {
            var toggle = closest(event.target, '.akz-theme-toggle');
            if (toggle) { event.preventDefault(); toggleTheme(); }
            var burger = closest(event.target, '.akz-topbar-burger');
            if (burger) { event.preventDefault(); openSidebar(burger); }
            if (closest(event.target, '.akz-sidebar-close, #akz-sidebar-overlay')) { event.preventDefault(); closeSidebar(); }
        });
        doc.addEventListener('keydown', function (event) {
            if (!doc.body.classList.contains('akz-sidebar-open')) { return; }
            if (event.key === 'Escape') { event.preventDefault(); closeSidebar(); }
            else { trapTab(event, sidebar); }
        });
        window.addEventListener('storage', function (event) { if (event.key === themeKey) { applyTheme(event.newValue, false); } });
        var content = doc.getElementById('neo-contentbox') || doc.querySelector('.akz-cdr-page');
        if (content && window.MutationObserver) {
            new MutationObserver(function (records) {
                if (!records.some(function (record) { return Array.prototype.some.call(record.addedNodes, function (node) { return node.nodeType === 1 && !closest(node, 'svg'); }); })) { return; }
                clearTimeout(uiTimer); uiTimer = setTimeout(enhanceContent, 60);
            }).observe(content, { childList: true, subtree: true });
        }
        if (window.jQuery) { window.jQuery(doc).on('draw.dt init.dt', function () { enhanceContent(); themeCharts(); }); }
    }
    window.AkzUI = { applyTheme: applyTheme, toggleTheme: toggleTheme, currentTheme: currentTheme, closeSidebar: closeSidebar, refresh: enhanceContent, fcLocale: enLocale };
    if (window.jQuery) { window.jQuery(init); }
    else if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', init); }
    else { init(); }
})();
