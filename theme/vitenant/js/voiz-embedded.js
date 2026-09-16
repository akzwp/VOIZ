/* VOIZ / AKZ — presentation helpers for framed (embedded) module pages.
   Display-only: keyboard niceties for IP octet fields and viewport clamping
   for map tooltips. Never changes values, names or requests. */
(function () {
    'use strict';
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
        var selector = '.jvectormap-tip, .jvectormap-label, .ammap-tooltip, .map-tooltip, .maptooltip, ' +
            '[class*="tooltip"]:not(script):not(style):not(input):not(.tw-tooltip)';
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

    initOctets();
    initMapTooltips();
})();
