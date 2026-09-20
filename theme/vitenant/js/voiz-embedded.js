/* VOIZ / AKZ — presentation helpers for framed (embedded) module pages.
   Display-only: keyboard niceties for IP octet fields and viewport clamping
   for map tooltips. Never changes values, names or requests. */
(function () {
    'use strict';
    if (window.__voizEmbeddedUI) { return; }
    window.__voizEmbeddedUI = true;
    var doc = document;

    function all(selector, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(selector)); }

    /* Group of >= 4 short (3-char) text inputs that look like a dotted IP. */
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

    /* DHCP / network forms: jump between octet boxes as the user types,
       support dot-to-advance, arrows and pasting a whole address. */
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

    /* GeoIP-style map tooltips must stay inside the visible frame. */
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

    /* Translate interface labels only. Input values, option values, identifiers
       and user-entered names remain under the PBX module's control. */
    var pbxLabels = {
        'Admin': 'مدیریت', 'Applications': 'برنامه‌های کاربردی', 'Connectivity': 'ارتباطات',
        'Reports': 'گزارش‌ها', 'Settings': 'تنظیمات', 'Other': 'سایر', 'User Panel': 'پنل کاربر',
        'System Admin': 'مدیریت سیستم', 'Administrators': 'مدیران', 'Module Admin': 'مدیریت ماژول‌ها',
        'Backup & Restore': 'پشتیبان‌گیری و بازیابی', 'Backup and Restore': 'پشتیبان‌گیری و بازیابی',
        'Asterisk CLI': 'خط فرمان استریسک', 'Asterisk Logfiles': 'گزارش‌های استریسک',
        'Asterisk SIP Settings': 'تنظیمات SIP استریسک', 'Asterisk IAX Settings': 'تنظیمات IAX استریسک',
        'Advanced Settings': 'تنظیمات پیشرفته', 'Feature Codes': 'کدهای دستوری',
        'Extensions': 'داخلی‌ها', 'Add Extension': 'افزودن داخلی', 'Edit Extension': 'ویرایش داخلی',
        'Users': 'کاربران', 'Devices': 'دستگاه‌ها', 'Trunks': 'ترانک‌ها', 'Add Trunk': 'افزودن ترانک',
        'Inbound Routes': 'مسیرهای ورودی', 'Outbound Routes': 'مسیرهای خروجی', 'Add Incoming Route': 'افزودن مسیر ورودی',
        'Add Outbound Route': 'افزودن مسیر خروجی', 'Ring Groups': 'گروه‌های زنگ', 'Add Ring Group': 'افزودن گروه زنگ',
        'Queues': 'صف‌ها', 'Add Queue': 'افزودن صف', 'IVR': 'منوی صوتی (IVR)', 'Add IVR': 'افزودن منوی صوتی',
        'Announcements': 'اعلان‌های صوتی', 'Add Announcement': 'افزودن اعلان صوتی',
        'Time Conditions': 'شرط‌های زمانی', 'Time Groups': 'گروه‌های زمانی', 'Follow Me': 'دنبال کردن تماس',
        'Find Me/Follow Me': 'دنبال کردن تماس', 'Call Forward': 'انتقال تماس', 'Call Recording': 'ضبط تماس',
        'System Recordings': 'فایل‌های صوتی سیستم', 'Music on Hold': 'موسیقی انتظار',
        'Conferences': 'کنفرانس‌ها', 'Voicemail': 'صندوق صوتی', 'Voicemail Admin': 'مدیریت صندوق صوتی',
        'Parking': 'پارک تماس', 'Parking Lot': 'پارک تماس', 'Paging and Intercom': 'پیجینگ و اینترکام',
        'Custom Destinations': 'مقصدهای سفارشی', 'Misc Destinations': 'مقصدهای متفرقه',
        'Misc Applications': 'برنامه‌های متفرقه', 'Blacklist': 'فهرست مسدود', 'Directory': 'دفترچه تلفن',
        'DISA': 'دسترسی مستقیم به سیستم (DISA)', 'Callback': 'تماس برگشتی', 'Call Flow Control': 'کنترل مسیر تماس',
        'CallerID Lookup Sources': 'منابع شناسایی تماس‌گیرنده', 'CID Superfecta': 'شناسایی تماس‌گیرنده',
        'IssabelPBX System Status': 'وضعیت مرکز تلفن', 'IssabelPBX Notices': 'اعلان‌های مرکز تلفن',
        'IssabelPBX Statistics': 'آمار مرکز تلفن', 'IssabelPBX Connections': 'ارتباطات مرکز تلفن',
        'System Statistics': 'آمار سیستم', 'System Status': 'وضعیت سیستم', 'Server Status': 'وضعیت سرور',
        'Processor': 'پردازنده', 'Load Average': 'میانگین بار', 'Memory': 'حافظه', 'App Memory': 'حافظهٔ برنامه‌ها',
        'Swap': 'حافظهٔ مبادله', 'Disks': 'دیسک‌ها', 'Networks': 'شبکه‌ها', 'Uptime': 'مدت کارکرد',
        'System Uptime': 'مدت کارکرد سیستم', 'Asterisk Uptime': 'مدت کارکرد استریسک', 'Last Reload': 'آخرین بارگذاری مجدد',
        'Total active calls': 'کل تماس‌های فعال', 'Internal calls': 'تماس‌های داخلی', 'External calls': 'تماس‌های خارجی',
        'Total active channels': 'کل کانال‌های فعال', 'IP Phones Online': 'گوشی‌های متصل',
        'IP Trunks Online': 'ترانک‌های متصل', 'IP Trunk Registrations': 'ثبت ترانک‌ها',
        'Web Server': 'وب‌سرور', 'SSH Server': 'سرور SSH', 'show all': 'نمایش همه', 'show new': 'نمایش جدیدها',
        'General': 'عمومی', 'General Settings': 'تنظیمات عمومی', 'Advanced': 'پیشرفته', 'Description': 'توضیحات',
        'Display Name': 'نام نمایشی', 'User Extension': 'شمارهٔ داخلی', 'Extension': 'داخلی',
        'Outbound CID': 'شناسهٔ تماس‌گیرندهٔ خروجی', 'Secret': 'رمز عبور', 'Password': 'رمز عبور',
        'Destination': 'مقصد', 'Set Destination': 'انتخاب مقصد', 'Default Destination': 'مقصد پیش‌فرض',
        'Language': 'زبان', 'Enabled': 'فعال', 'Disabled': 'غیرفعال', 'Yes': 'بله', 'No': 'خیر',
        'Submit': 'ثبت', 'Submit Changes': 'ثبت تغییرات', 'Save': 'ذخیره', 'Cancel': 'انصراف',
        'Delete': 'حذف', 'Edit': 'ویرایش', 'Add': 'افزودن', 'Reset': 'بازنشانی', 'Close': 'بستن',
        'Apply Config': 'اعمال تنظیمات', 'Search': 'جست‌وجو', 'Name': 'نام', 'Status': 'وضعیت',
        'Actions': 'عملیات', 'Type': 'نوع', 'Device': 'دستگاه', 'Default': 'پیش‌فرض',
        'Dial Patterns': 'الگوهای شماره‌گیری', 'Route Name': 'نام مسیر', 'Trunk Name': 'نام ترانک',
        'Queue Number': 'شمارهٔ صف', 'Queue Name': 'نام صف', 'Ring Strategy': 'روش زنگ‌خوردن',
        'Ring Time': 'زمان زنگ‌خوردن', 'Extension List': 'فهرست داخلی‌ها', 'Announcement': 'اعلان صوتی'
    };
    function localizeLabel(element) {
        Array.prototype.forEach.call(element.childNodes, function (node) {
            if (node.nodeType !== 3) { return; }
            var value = node.nodeValue.trim(), key = value.replace(/:\s*$/, '');
            if (Object.prototype.hasOwnProperty.call(pbxLabels, key)) {
                node.nodeValue = node.nodeValue.replace(value, pbxLabels[key] + (/:$/.test(value) ? ':' : ''));
            }
        });
    }
    function enhancePbx() {
        doc.documentElement.dir = 'rtl'; doc.documentElement.lang = 'fa';
        doc.body.classList.add('voiz-embedded', 'voiz-pbx');
        all('.navbar-link, .navbar-item, .navbar-item .scroll, #page_body h1, #page_body h2, #page_body h3, #page_body h4, #page_body h5, #page_body legend, #page_body label, #page_body th, #page_body a.info, #page_body .dataname, #page_body .rnav a, #syslog_button, #button_reload, #page_body button, #page_body .button').forEach(localizeLabel);
        var search = doc.getElementById('menusearch');
        if (search) { search.placeholder = 'جست‌وجوی تنظیمات'; search.setAttribute('aria-label', 'جست‌وجوی تنظیمات'); }
        all('#page_body table').forEach(function (table) {
            if (!table.querySelector('thead') || table.closest('.voiz-pbx-table-scroll, .ui-datepicker, .chosen-container')) { return; }
            var wrapper = doc.createElement('div'); wrapper.className = 'voiz-pbx-table-scroll';
            wrapper.tabIndex = 0; wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-label', 'جدول تنظیمات');
            table.parentNode.insertBefore(wrapper, table); wrapper.appendChild(table);
        });
    }
    function initPbx() {
        if (!/\/admin(?:\/|$)/.test(window.location.pathname)) { return; }
        enhancePbx();
        var timer;
        new MutationObserver(function (records) {
            if (!records.some(function (record) { return record.addedNodes.length; })) { return; }
            clearTimeout(timer); timer = setTimeout(enhancePbx, 60);
        }).observe(doc.body, { childList: true, subtree: true });
    }
    if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', initPbx); }
    else { initPbx(); }
    initOctets();
    initMapTooltips();
})();
