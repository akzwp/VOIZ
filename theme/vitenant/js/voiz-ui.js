/* VOIZ - UI layer: theme switch, mobile sidebar drawer, dropdown hygiene,
   module search, login password toggle, popup hygiene (UI only). */
(function ($) {
    'use strict';

    var THEME_KEY = 'voiz-theme';

    var get = function (key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    };
    var set = function (key, val) {
        try {
            localStorage.setItem(key, val);
        } catch (e) { /* ignored */ }
    };

    function applyTheme(theme, persist) {
        if (theme !== 'dark' && theme !== 'light') {
            theme = 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
        if (persist !== false) {
            set(THEME_KEY, theme);
        }
        syncToggleIcons(theme);
    }

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function initTheme() {
        var saved = get(THEME_KEY);
        applyTheme(saved, false);
    }

    function syncToggleIcons(theme) {
        var icon = theme === 'dark' ? 'fa-sun-o' : 'fa-moon-o';
        if (window.jQuery) {
            jQuery('.voiz-theme-toggle i, .voiz-login-theme i')
                .removeClass('fa-sun-o fa-moon-o')
                .addClass(icon);
        }
    }

    function toggleTheme() {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    }

    function closeSidebar() {
        jQuery('body').removeClass('voiz-sidebar-open');
    }

    function initSidebarDrawer() {
        var overlay = jQuery('#voiz-sidebar-overlay');
        jQuery(document).on('click', '.voiz-topbar-burger', function (e) {
            e.preventDefault();
            e.stopPropagation();
            jQuery('body').toggleClass('voiz-sidebar-open');
            return false;
        });
        overlay.on('click', closeSidebar);
        jQuery(document).on('keyup', function (e) {
            if (e.keyCode === 27) {
                closeSidebar();
            }
        });
    }

    function initOutsideClose() {
        jQuery(document).on('click', function (e) {
            var $target = jQuery(e.target);
            if (!$target.closest('.voiz-topbar-actions').length &&
                !$target.closest('.voiz-topbar-user').length &&
                !$target.closest('.voiz-topbar-search').length) {
                jQuery('.voiz-topbar-actions .open, .voiz-topbar-user .open').removeClass('open');
            }
        });
    }

    /* ------------------------------------------------------------
       Module search (topbar) - live dropdown over #main-menu
       ------------------------------------------------------------ */
    function initModuleSearch() {
        var $input = jQuery('#search_module_issabel');
        if (!$input.length) { return; }

        var $box = jQuery('#voiz-search-results');
        if (!$box.length) {
            $box = jQuery('<div id="voiz-search-results" class="voiz-search-results" role="listbox"></div>');
            $input.closest('div').append($box);
        }
        var $form = $input.closest('form');

        function close() {
            $box.removeClass('voiz-open').empty();
        }

        function render(matches, q) {
            $box.empty();
            if (!matches.length) {
                $box.append(jQuery('<div class="voiz-search-empty"></div>')
                    .text(q ? 'نتیجه‌ای یافت نشد' : 'برای جستجو تایپ کنید'));
            } else {
                $box.append(jQuery('<div class="voiz-search-group-label"></div>').text('ماژول‌ها'));
                matches.forEach(function (m, idx) {
                    var $a = jQuery('<a class="voiz-search-item" role="option"></a>')
                        .attr('href', m.href)
                        .attr('id', 'voiz-search-opt-' + idx)
                        .html('<i class="' + (m.icon || 'fa fa-th-large') + '"></i><span></span>');
                    $a.find('span').text(m.name);
                    $box.append($a);
                });
            }
            $box.addClass('voiz-open');
        }

        function collect() {
            var out = [];
            var seen = {};
            jQuery('#main-menu a[href*="index.php?menu="]').each(function () {
                var $a = jQuery(this);
                var name = jQuery.trim($a.find('span').first().text());
                var href = $a.attr('href');
                if (!name || !href || seen[href]) { return; }
                seen[href] = true;
                out.push({
                    name: name,
                    href: href,
                    icon: ($a.find('i').attr('class') || 'fa fa-th-large')
                });
            });
            return out;
        }

        var index = null;
        var deb;
        $input.on('input', function () {
            var q = jQuery.trim($input.val());
            if (!q) { close(); return; }
            if (!index) { index = collect(); }
            clearTimeout(deb);
            deb = setTimeout(function () {
                var ql = q.toLowerCase();
                var matches = index.filter(function (m) {
                    return m.name.toLowerCase().indexOf(ql) !== -1;
                }).slice(0, 12);
                render(matches, q);
            }, 120);
        });

        $input.on('keydown', function (e) {
            var $items = $box.find('a.voiz-search-item');
            if (e.keyCode === 27) { close(); return; }
            if (!$items.length) { return; }
            var $cur = $items.filter('.voiz-active');
            if (e.keyCode === 40 || e.keyCode === 38) {
                e.preventDefault();
                var next = e.keyCode === 40 ? $cur.index() + 1 : $cur.index() - 1;
                if (next < 0) { next = $items.length - 1; }
                if (next >= $items.length) { next = 0; }
                $items.removeClass('voiz-active');
                $items.eq(next).addClass('voiz-active');
            } else if (e.keyCode === 13 && $cur.length) {
                e.preventDefault();
                window.location.href = $cur.attr('href');
            }
        });

        $box.on('mousedown', 'a.voiz-search-item', function (e) {
            e.preventDefault();
            window.location.href = jQuery(this).attr('href');
        });
        $input.on('blur', function () { setTimeout(close, 180); });
        $form.on('submit', function (e) {
            var $cur = $box.find('a.voiz-search-item.voiz-active');
            if ($cur.length) {
                e.preventDefault();
                window.location.href = $cur.attr('href');
            }
        });
    }

    /* ------------------------------------------------------------
       Login page: show/hide password (UI only, RTL-aware)
       ------------------------------------------------------------ */
    function initLoginPasswordToggle() {
        var $pass = jQuery('#input_pass');
        if (!$pass.length) { return; }
        var $btn = jQuery(
            '<button type="button" class="voiz-pass-toggle" tabindex="0" ' +
            'title="نمایش/مخفی کردن رمز" aria-label="نمایش/مخفی کردن رمز">' +
            '<i class="fa fa-eye"></i></button>'
        );
        $pass.after($btn);
        $btn.on('click', function () {
            var showing = $pass.attr('type') === 'text';
            $pass.attr('type', showing ? 'password' : 'text');
            $btn.find('i').toggleClass('fa-eye fa-eye-slash');
            $pass.focus();
        });
    }

    /* ------------------------------------------------------------
       Popup hygiene: ESC closes the issabel popup box
       ------------------------------------------------------------ */
    function initPopupHygiene() {
        jQuery(document).on('keydown', function (e) {
            if (e.keyCode !== 27) { return; }
            var $box = jQuery('.neo-modal-issabel-popup-box');
            if ($box.is(':visible')) {
                var $close = $box.find('.neo-modal-issabel-popup-close');
                if ($close.length) { $close.trigger('click'); }
            }
        });
    }

    /* ------------------------------------------------------------
       Sidebar: replace neon's LTR padding animations
       ------------------------------------------------------------ */
    function isDrawerMode() {
        return window.matchMedia && window.matchMedia('(max-width: 991px)').matches;
    }

    function initSidebarOverrides() {
        jQuery('#main-menu li').each(function () {
            var $li = jQuery(this);
            if ($li.children('ul').length) { $li.addClass('has-sub'); }
        });

        if (!window.jQuery || !window.public_vars) { return; }

        window.show_sidebar_menu = function () {
            if (isDrawerMode()) { return; }
            jQuery('.page-container').removeClass('sidebar-collapsed');
        };

        window.hide_sidebar_menu = function () {
            if (isDrawerMode()) { return; }
            jQuery('.page-container').addClass('sidebar-collapsed');
            closeSidebar();
        };

        window.toggle_sidebar_menu = function () {
            if (isDrawerMode()) {
                jQuery('body').toggleClass('voiz-sidebar-open');
                return;
            }
            jQuery('.page-container').toggleClass('sidebar-collapsed');
        };

        jQuery(document).on('click', '#main-menu a[href*="index.php?menu="]', function () {
            if (isDrawerMode()) { closeSidebar(); }
        });

        if (typeof window.fit_main_content_height === 'function') {
            window.fit_main_content_height = function () { /* handled by CSS */ };
        }
    }

    /* ------------------------------------------------------------
       Responsive check: force close sidebar on resize to desktop
       ------------------------------------------------------------ */
    function initResponsiveCheck() {
        var mql = window.matchMedia && window.matchMedia('(min-width: 992px)');
        if (!mql) { return; }
        mql.addListener(function (e) {
            if (e.matches) {
                closeSidebar();
            }
        });
    }

    /* ------------------------------------------------------------
       Calendar: force Farsi language if Calendar object exists
       (overrides calendar-en.js loaded by the core system)
       ------------------------------------------------------------ */
    function initCalendarFarsi() {
        if (typeof Calendar === 'undefined') { return; }
        Calendar._DN  = ["یکشنبه","دوشنبه","سه شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه","یکشنبه"];
        Calendar._SDN = ["یک","دو","سه","چهار","پنج","جمعه","شنبه","یک"];
        Calendar._FD  = 6;
        Calendar._MN  = ["ژانویه","فوریه","مارس","آوریل","می","جون","جولای","آگوست","سپتامبر","اکتبر","نوامبر","دسامبر"];
        Calendar._SMN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        Calendar._JMN = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
        Calendar._JSMN= ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
        Calendar._NUMBERS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        Calendar._DIR = 'rtl';
        Calendar._TT = Calendar._TT || {};
        Calendar._TT["INFO"]       = "درباره تقویم";
        Calendar._TT["PREV_YEAR"]  = "سال قبل";
        Calendar._TT["PREV_MONTH"] = "ماه قبل";
        Calendar._TT["GO_TODAY"]   = "رفتن به امروز";
        Calendar._TT["NEXT_MONTH"] = "ماه بعد";
        Calendar._TT["NEXT_YEAR"]  = "سال بعد";
        Calendar._TT["SEL_DATE"]   = "انتخاب تاریخ";
        Calendar._TT["PART_TODAY"] = " (امروز)";
        Calendar._TT["DAY_FIRST"]  = "ابتدا %s نمایش داده شود";
        Calendar._TT["CLOSE"]      = "بستن";
        Calendar._TT["TODAY"]      = "امروز";
        Calendar._TT["WK"]         = "هفته";
        Calendar._TT["TIME"]       = "زمان :";
        Calendar._TT["LAM"]        = "ق.ظ.";
        Calendar._TT["AM"]         = "ق.ظ.";
        Calendar._TT["LPM"]        = "ب.ظ.";
        Calendar._TT["PM"]         = "ب.ظ.";
    }

    jQuery(function () {
        initTheme();
        initSidebarDrawer();
        initModuleSearch();
        initLoginPasswordToggle();
        initPopupHygiene();
        initSidebarOverrides();
        initOutsideClose();
        initResponsiveCheck();
        initCalendarFarsi();
    });

    window.VoizUI = {
        applyTheme: applyTheme,
        currentTheme: currentTheme,
        toggleTheme: toggleTheme,
        closeSidebar: closeSidebar
    };
})(window.jQuery);
