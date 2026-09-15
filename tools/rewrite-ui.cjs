// One-off migration helper for this source tree. It never touches PBX runtime data.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function edit(file, fn) {
  const p = path.join(root, file);
  const before = fs.readFileSync(p, 'utf8');
  const after = fn(before);
  if (before !== after) fs.writeFileSync(p, after.replace(/\r\n/g, '\n'));
}
for (const file of ['index.tpl', 'login.tpl', 'popup.tpl', 'login000.tpl']) {
  edit('theme/vitenant/_common/' + file, s => s
    .replace(/^.*<link[^>]+css\/voiz-(?:ui|tw)\.css[^>]*>.*\r?\n/gm, '')
    .replace(/css\/voiz-tailwind\.css\?v=[\d.]+/g, 'css/voiz-tailwind.css?v=7.0.0')
    .replace(/js\/voiz-ui\.js(?!\?)/g, 'js/voiz-ui.js?v=7.0.0')
    .replace(/\s*<!--\[if lt IE 9\]>[\s\S]*?<!\[endif\]-->/g, '')
    .replace(/^.*<link[^>]+fonts\.googleapis\.com[^>]*>.*\r?\n/gm, ''));
}
edit('issabelmodules/modules/cdrreport/themes/default/cel.tpl', s => s
  .replace(/^.*<link[^>]+css\/voiz-(?:ui|tw)\.css[^>]*>.*\r?\n/gm, '')
  .replace(/css\/voiz-tailwind\.css\?v=[\d.]+/g, 'css/voiz-tailwind.css?v=7.0.0')
  .replace(/js\/voiz-ui\.js(?!\?)/g, 'js/voiz-ui.js?v=7.0.0'));
// Old public asset names remain valid, but never load a second conflicting design.
for (const file of ['voiz-ui.css', 'voiz-repair.css', 'voiz-tw.css']) {
  fs.writeFileSync(path.join(root, 'theme/vitenant/css', file), '/* Compatibility entry; edit ui/*.css and run npm run build:css. */\n@import url("voiz-tailwind.css?v=7.0.0");\n');
}
edit('theme/vitenant/_common/_menu.tpl', s => {
  const start = s.indexOf('<div class="sidebar-menu');
  const end = s.indexOf('    <ul id="main-menu"', start);
  s = s.slice(0, start) + `<nav id="voiz-sidebar" class="sidebar-menu tw-flex tw-flex-col" aria-label="منوی اصلی">
    <header class="logo-env">
        <a href="index.php" class="voiz-brand">
            <img src="{$WEBPATH}themes/{$THEMENAME}/images/logov.png" width="32" height="38" alt="" />
            <span><strong dir="ltr">VOIZ</strong><small>پنل مدیریت ارتباطات</small></span>
        </a>
        <button type="button" class="voiz-sidebar-close voiz-icon-button" aria-label="بستن منو"><i class="fa fa-times" aria-hidden="true"></i></button>
    </header>
    <div class="voiz-sidebar-label">دسترسی به بخش‌ها</div>
` + s.slice(end);
  s = s.replace('</ul>\n</div>\n<!-- fin', '</ul>\n    <div class="voiz-sidebar-credit">طراحی رابط کاربری · <a href="https://akzwp.com" target="_blank" rel="noopener">AKZ</a></div>\n</nav>\n<!-- fin');
  // CRLF input uses the same markup boundary.
  s = s.replace('</ul>\r\n</div>\r\n<!-- fin', '</ul>\n    <div class="voiz-sidebar-credit">طراحی رابط کاربری · <a href="https://akzwp.com" target="_blank" rel="noopener">AKZ</a></div>\n</nav>\n<!-- fin');
  s = s.replace('class="active opened active"', 'class="active opened"').replace(/class="active opened active"/g, 'class="active opened"');
  s = s.replace('<a href="#" class="voiz-topbar-burger"><i class="fa fa-bars"></i></a>', '<button type="button" class="voiz-topbar-burger" aria-controls="voiz-sidebar" aria-expanded="false" aria-label="باز کردن منو"><i class="fa fa-bars" aria-hidden="true"></i></button>');
  s = s.replace('<button type="submit"><i class="entypo-search"></i></button>', '<button type="submit" aria-label="جستجو در منوها"><i class="fa fa-arrow-left" aria-hidden="true"></i></button>');
  s = s.replace('name="search_module_issabel" placeholder=', 'name="search_module_issabel" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="voiz-search-results" placeholder=');
  s = s.replace(/<li id="header_notification_bar" class="dropdown top-bar-downloads">/, '<li id="header_downloads_bar" class="dropdown top-bar-downloads">');
  s = s.replace(/<li id="header_notification_bar" class="dropdown top-bar-info">/, '<li id="header_info_bar" class="dropdown top-bar-info">');
  s = s.replace('class="" href="#">\n                    <i class="fa fa-info-circle"', 'class="" href="#" aria-label="اطلاعات و سازندگان" title="اطلاعات و سازندگان">\n                    <i class="fa fa-info-circle"');
  s = s.replace('class="" href="#">\r\n                    <i class="fa fa-info-circle"', 'class="" href="#" aria-label="اطلاعات و سازندگان" title="اطلاعات و سازندگان">\r\n                    <i class="fa fa-info-circle"');
  s = s.replace(/(<a data-toggle="dropdown" class="" href="#")>(\s*<i id="notibell")/, '$1 aria-label="اعلان‌ها" title="اعلان‌ها">$2');
  s = s.replace(/<a href="#" class="voiz-theme-toggle"[^>]*>([\s\S]*?)<\/a>/, '<button type="button" class="voiz-theme-toggle" aria-label="تغییر تم روشن و تیره" aria-pressed="false">$1</button>');
  s = s.replace('id="neo-contentbox">', 'id="neo-contentbox" role="main" tabindex="-1">');
  return s;
});
edit('theme/vitenant/_common/index.tpl', s => s
  .replace('<div class="page-container">', '<a class="voiz-skip-link" href="#neo-contentbox">رفتن به محتوای اصلی</a>\n    <div class="page-container">')
  .replace('class="div_msg_errors" id="message_error"', 'class="div_msg_errors" id="message_error" role="alert"')
  .replace('<i class="fa fa-lg fa-remove" onclick="hide_message_error();"></i>', '<button type="button" aria-label="بستن پیام خطا" onclick="hide_message_error();"><i class="fa fa-times" aria-hidden="true"></i></button>')
  .replace('VOIPIRAN | ویپ ایران + AKZ</a>', 'VOIPIRAN | ویپ ایران</a>')
  .replace('rel="noopener">AKZ</a>', 'rel="noopener">© AKZ · akzwp.com</a>')
  .replace('class="neo-modal-issabel-popup-box">', 'class="neo-modal-issabel-popup-box" role="dialog" aria-modal="true" aria-labelledby="voiz-modal-title" tabindex="-1">')
  .replace('class="neo-modal-issabel-popup-title">', 'class="neo-modal-issabel-popup-title" id="voiz-modal-title">')
  .replace('<div class="neo-modal-issabel-popup-close"></div>', '<button type="button" class="neo-modal-issabel-popup-close" aria-label="بستن پنجره"></button>'));
edit('theme/vitenant/_common/login.tpl', s => s
  .replace(/<div class="voiz-login-theme">[\s\S]*?<\/div>/, '<div class="voiz-login-theme"><button type="button" class="voiz-theme-toggle voiz-icon-button" aria-label="تغییر تم روشن و تیره" aria-pressed="false"><i class="fa fa-moon-o" aria-hidden="true"></i></button></div>')
  .replace('<!-- فرم لاگین -->', '<div class="voiz-login-intro"><h1>ورود به پنل مدیریت</h1><p>برای مدیریت ارتباطات، وارد حساب خود شوید.</p></div>\n            <!-- فرم لاگین -->')
  .replace('id="login-error">', 'id="login-error" role="alert">')
  .replace('placeholder="نام کاربری" autocomplete="off"', 'placeholder="نام کاربری" autocomplete="username" autocapitalize="none" spellcheck="false" required')
  .replace('placeholder="رمز عبور" autocomplete="off"', 'placeholder="رمز عبور" autocomplete="current-password" required')
  .replace(/Copyrights © 2017-2026 All Rights Reserved by /, '© VOIZ · ')
  .replace('VOIPIRAN | ویپ ایران + AKZ</a>', 'VOIPIRAN | ویپ ایران</a>')
  .replace('Powered by <a', 'طراحی رابط کاربری © <a')
  .replace('rel="noopener">AKZ</a>', 'rel="noopener">AKZ · akzwp.com</a>'));
edit('theme/vitenant/_common/popup.tpl', s => '<!DOCTYPE html>\n' + s.replace('<body leftmargin=', '<body class="voiz-popup-page" leftmargin='));
edit('theme/vitenant/_common/login000.tpl', s => s.replace('</head>', '<link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/voiz-tailwind.css?v=7.0.0">\n</head>'));
edit('issabelmodules/modules/dashboard/applets/SystemResources/tpl/system_resources.tpl', s => s.replace("<div style='height:165px; position:relative; text-align:center;'>", '<div class="voiz-gauges">'));
edit('issabelmodules/modules/dashboard/applets/HardDrives/tpl/harddrives.tpl', s => s.replace('{foreach from=$part item=particion}\n<div>', '{foreach from=$part item=particion}\n<div class="voiz-drive">').replace('{foreach from=$part item=particion}\r\n<div>', '{foreach from=$part item=particion}\n<div class="voiz-drive">'));
edit('issabelmodules/modules/dashboard/applets/ProcessesStatus/tpl/process_status.tpl', s => s.replace(/<style>[\s\S]*?<\/style>/, '{* Visual styling is owned by the local VOIZ Tailwind bundle. *}'));
edit('issabelmodules/modules/dashboard/themes/default/appletgrid.tpl', s => s.replace(/<a class='appletrefresh[^']*'>/g, '<button type="button" class="appletrefresh" aria-label="{$applet.name|escape:html} — {$LABEL_LOADING|escape:html}">').replace(/<\/a>/g, '</button>'));
edit('issabelmodules/modules/hardware_detector/themes/default/listPorts.tpl', s => s.replace('<table width="{$width}"', '<table class="voiz-hardware" width="{$width}"'));
edit('issabelmodules/modules/hardware_detector/themes/default/form.tpl', s => s
  .replace('<table class="tabForm" style="font-size: 16px;" width="100%" >\n    <input type="hidden" name="idCard" value="{$DESC_ID}" />', '<input type="hidden" name="idCard" value="{$DESC_ID}" />\n<table class="tabForm" width="100%">')
  .replace(/<div id="form" style='background-color:yellow'>/, '')
  .replace(/    <\/div>\r?\n<\/table>/, '</table>'));
// Report headers and chart colours are scoped in modules.css.
for (const module of ['cdrreport', 'monitoring']) {
  edit('issabelmodules/modules/' + module + '/themes/default/datatables.tpl', s => s.replace(/<style>[\s\S]*?<\/style>/g, ''));
}
console.log('Presentation templates migrated.');
