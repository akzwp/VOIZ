/* Static UI fixtures rendered through the real Smarty templates. No PBX connection. */
const fs = require('fs');
const path = require('path');
const Smart = require('jsmart');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const render = (file, data) => new Smart(read(file)).fetch(data);
const link = (Name, icon = 'fa fa-circle-o', children) => ({ Name, icon, children });
const menus = {
  system: link('سیستم', 'fa fa-desktop', {
    dashboard: link('میز کار', 'fa fa-th-large'),
    settings: link('تنظیمات سیستم', 'fa fa-sliders', { forms: link('تنظیمات شبکه و کاربران'), hardware: link('یافتن سخت‌افزار') })
  }),
  applications: link('برنامه‌های کاربردی', 'fa fa-calendar', { calendar: link('تقویم'), addressbook: link('دفترچه تلفن') }),
  email: link('ایمیل', 'fa fa-envelope-o', { mail: link('صندوق ورودی') }),
  pbx: link('مرکز تلفن', 'fa fa-phone', { pbxconfig: link('تنظیمات تلفنی'), extensions: link('داخلی‌ها') }),
  reports: link('گزارش‌گیری', 'fa fa-bar-chart', { cdrreport: link('ریز مکالمات'), monitoring: link('ضبط مکالمات'), queues: link('گزارش پیشرفته صف') }),
  extras: link('برنامه‌های جانبی', 'fa fa-puzzle-piece', { tools: link('ابزارها') }),
  addons: link('افزونه‌ها', 'fa fa-cubes', { addonlist: link('مدیریت افزونه‌ها'), licenses: link('مدیریت مجوزها') }),
  security: link('امنیت', 'fa fa-lock', { firewall: link('فایروال') })
};
const labels = { dashboard: 'میز کار', forms: 'تنظیمات شبکه و کاربران', calendar: 'تقویم', cdrreport: 'ریز مکالمات', addonlist: 'مدیریت افزونه‌ها', hardware: 'یافتن سخت‌افزار', pbxconfig: 'تنظیمات تلفنی', login: 'ورود' };
const base = {
  WEBPATH: '/', WEBCOMMON: '/libs/', THEMENAME: 'vitenant', VERSION: '5.10.0', currentyear: '2026', USER_LOGIN: 'admin', SERVER_NAME: 'localhost',
  MODULES_SEARCH: 'جستجو در منوها…', Registered: 'ثبت نرم‌افزار', VersionDetails: 'جزئیات نسخه', ABOUT_ISSABEL2: 'درباره ایزابل',
  CHANGE_PASSWORD: 'تغییر رمز عبور', LOGOUT: 'خروج', ISSABEL_LICENSED: 'مجوز نرم‌افزار', PAGE_NAME: 'ورود',
  NOTIFICATIONS: { LBL_NOTIFICATION_SYSTEM: 'اعلان‌های سیستم', LBL_NOTIFICATION_USER: 'اعلان‌های کاربر', TXT_NO_NOTIFICATIONS: 'اعلان جدیدی وجود ندارد', NOTIFICATIONS_PUBLIC: [], NOTIFICATIONS_PRIVATE: [] },
  HEADER_LIBS_JQUERY: '<script src="/themes/vitenant/js/jquery-1.11.1.min.js"></script><link rel="stylesheet" href="/modules-assets/fontawesome/css/font-awesome.min.css">',
  HEADER: '', HEADER_MODULES: '', arrMainMenu: menus, ISSABEL_PANELS: false,
  SHORTCUT: '<li><a href="#"><i class="fa fa-history"></i><span>تاریخچه</span></a><ul><li><a href="index.php?menu=dashboard"><span>میز کار</span></a></li></ul></li>'
};
function gauge(id, title, value) {
  return `<div id="${id}" style="width:140px;height:140px"><svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="${title}: ${value}%"><circle cx="70" cy="76" r="42" fill="none" stroke="var(--voiz-surface-3)" stroke-width="12"/><circle cx="70" cy="76" r="42" fill="none" stroke="var(--voiz-primary)" stroke-width="12" stroke-dasharray="${value * 2.64} 264" transform="rotate(-90 70 76)"/><text x="70" y="18" text-anchor="middle" font-size="12">${title}</text><text x="70" y="79" text-anchor="middle" font-size="25">${value}</text><text x="70" y="98" text-anchor="middle" font-size="11">%</text></svg></div>`;
}
function dashboard() {
  const data = { ...base, LABEL_LOADING: 'در حال دریافت اطلاعات', applet_col_1: [{ code: 'Applet_SystemResources', name: 'منابع سیستم' }, { code: 'Applet_HardDrives', name: 'فضای ذخیره‌سازی' }], applet_col_2: [{ code: 'Applet_ProcessesStatus', name: 'وضعیت سرویس‌ها' }, { code: 'Applet_Performance', name: 'عملکرد سیستم' }] };
  const page = new JSDOM(render('issabelmodules/modules/dashboard/themes/default/appletgrid.tpl', data));
  const doc = page.window.document;
  const resource = render('issabelmodules/modules/dashboard/applets/SystemResources/tpl/system_resources.tpl', { module_name: 'dashboard', LABEL_CPUINFO: 'پردازنده', LABEL_UPTIME: 'زمان فعال بودن سیستم', LABEL_CPUSPEED: 'سرعت پردازنده', LABEL_MEMORYUSE: 'حافظه', cpu_info: 'Intel Core i7 · 3.30 GHz', uptime: '۲ روز و ۴ ساعت', speed: '3,302 MHz', memtotal: '3,889 MB', swaptotal: '4,025 MB', cpugauge: {}, memgauge: {}, swapgauge: {} });
  doc.querySelector('#Applet_SystemResources .appletwindow_fullcontent').innerHTML = resource;
  [['cpugauge', 'CPU', 16], ['memgauge', 'RAM', 22], ['swapgauge', 'SWAP', 0]].forEach(([id, name, value]) => { doc.querySelector('#dashboard-applet-' + id).outerHTML = gauge('dashboard-applet-' + id, name, value); });
  const drives = render('issabelmodules/modules/dashboard/applets/HardDrives/tpl/harddrives.tpl', { module_name: 'dashboard', part: [{ porcentaje_usado: 19, formato_porcentaje_usado: 19, formato_porcentaje_libre: 81, sTotalGB: 43.29, punto_montaje: '/', sModelo: 'Virtual disk' }], LABEL_PERCENT_USED: 'استفاده‌شده', LABEL_PERCENT_AVAILABLE: 'آزاد', LABEL_DISK_CAPACITY: 'ظرفیت', LABEL_MOUNTPOINT: 'مسیر', LABEL_DISK_VENDOR: 'نوع دیسک', TEXT_WARNING_DIRSPACEREPORT: 'محاسبه فضای پوشه‌ها ممکن است چند لحظه طول بکشد.', FETCH_DIRSPACEREPORT: 'دریافت اطلاعات به‌روز' });
  doc.querySelector('#Applet_HardDrives .appletwindow_fullcontent').innerHTML = drives;
  doc.querySelector('#dashboard-applet-hd-usage').outerHTML = gauge('dashboard-applet-hd-usage', 'دیسک', 19);
  const services = ['سرویس تلفنی', 'پیام‌رسان', 'سرویس فکس', 'سرویس ایمیل', 'پایگاه داده', 'وب‌سرور'].map((name, i) => ({ name_service: name, icon: 'email.png', status_color: i === 2 ? 'blue' : 'green', status_desc: i === 2 ? 'نصب نشده' : 'در حال اجرا', status_service_icon: 'email.png', pointer_style: 'pointer' }));
  doc.querySelector('#Applet_ProcessesStatus .appletwindow_fullcontent').innerHTML = render('issabelmodules/modules/dashboard/applets/ProcessesStatus/tpl/process_status.tpl', { module_name: 'dashboard', services });
  doc.querySelector('#Applet_Performance .appletwindow_fullcontent').innerHTML = '<p class="text-muted">مصرف حافظه در طول روز</p><svg viewBox="0 0 440 210" role="img" aria-label="نمودار نمونه مصرف حافظه"><path d="M0 40H440 M0 90H440 M0 140H440 M0 190H440" stroke="var(--voiz-border)" fill="none"/><path d="M0 180L30 155L60 165L90 130L120 140L150 100L180 123L210 80L240 100L270 65L300 92L330 50L360 70L400 30L440 55" stroke="var(--voiz-primary-text)" stroke-width="3" fill="none"/></svg><p class="text-muted" dir="ltr">09:00　　10:00　　11:00　　12:00　　13:00</p>';
  doc.querySelectorAll('script, .appletwindow_wait').forEach(el => el.remove());
  doc.querySelectorAll('.neo-applet-processes-row-icon img, .neo-applet-processes-row-menu img').forEach(el => { el.src = '/themes/vitenant/images/logov.png'; el.alt = ''; });
  const html = doc.body.innerHTML; page.window.close(); return html;
}
function forms() {
  return `<h1>تنظیمات شبکه و کاربران</h1><p class="text-muted">نمونهٔ نمایش کنترل‌ها؛ این صفحه اطلاعاتی ذخیره نمی‌کند.</p><form id="fixture-form"><table class="tabForm"><tbody>
    <tr><td><label for="displayname">نام نمایشی</label></td><td><input id="displayname" name="displayname" value="واحد پشتیبانی" required></td><td><label for="extension">شماره داخلی</label></td><td><input id="extension" type="tel" name="extension" value="1001"></td></tr>
    <tr><td><label for="address">آدرس سرور</label></td><td><input id="address" class="voiz-ltr" name="address" value="192.0.2.10"></td><td><label for="group">گروه کاربری</label></td><td><select id="group" name="group"><option>مدیر سیستم</option><option>اپراتور</option></select></td></tr>
    <tr><td><label for="description">توضیحات</label></td><td colspan="3"><textarea id="description" name="description">نمونه متن فارسی برای بررسی راست‌چین بودن و خوانایی فرم.</textarea></td></tr>
    <tr><td><label for="disabled">فیلد غیرفعال</label></td><td><input id="disabled" disabled value="غیرفعال"></td><td><label for="readonly">شناسه</label></td><td><input id="readonly" readonly value="SERVER-001"></td></tr>
    <tr><td><label for="enabled">وضعیت حساب</label></td><td><label><input type="checkbox" id="enabled" name="enabled" checked> فعال</label></td><td>شیوه نمایش</td><td><label><input type="radio" name="view" value="standard" checked> استاندارد</label> <label><input type="radio" name="view" value="compact"> فشرده</label></td></tr>
    </tbody></table><div class="form-actions"><button type="button" class="btn btn-primary">ذخیره تغییرات</button><button type="button" class="btn btn-default">انصراف</button><button type="button" class="btn btn-default" data-preview-modal>نمایش پنجره نمونه</button></div></form>`;
}
function calendar() {
  /* Mirrors Issabel's modules/calendar/themes/default/calendar_gui.tpl:
     a tabForm row with #calendar_toolbar (create button, mini datepicker,
     iCal export) and #calendar_main (FullCalendar month view). */
  const dow = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const grid = Array.from({ length: 5 }, (_, w) => '<tr>' + dow.map((_, c) => {
    const n = w * 7 + c + 1;
    const today = n === 15;
    return `<td class="fc-day${today ? ' fc-today' : ''}"><div class="fc-day-number">${n > 30 ? n - 30 : n}</div>${n === 15 ? '<a href="#" class="fc-event"><span class="fc-event-title">جلسه تیم پشتیبانی</span></a>' : ''}</td>`;
  }).join('') + '</tr>').join('');
  const miniDays = [1, 2, 3, 8, 9, 10, 15, 16, 17];
  return `<form method="POST" style="margin-bottom:0;" name="formCalendar" id="formCalendar">
  <table class="tabForm" width="100%"><tbody><tr>
  <td id="calendar_toolbar" width="10%" align="left" valign="top">
    <div id="calendar_buttonbox" style="margin: 0px 10px 6px 10px; text-align: center;"><button type="button" class="button" id="calendar_newevent"><i class="fa fa-plus"></i>&nbsp;ایجاد رویداد جدید</button></div>
    <div id="calendar_datepick"><div class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"><div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all"><a class="ui-datepicker-prev ui-corner-all" href="#" aria-label="ماه قبل">‹</a><a class="ui-datepicker-next ui-corner-all" href="#" aria-label="ماه بعد">›</a><select class="ui-datepicker-month" aria-label="ماه"><option>سپتامبر</option></select><select class="ui-datepicker-year" aria-label="سال"><option>۲۰۲۶</option></select></div><table class="ui-datepicker-calendar"><thead><tr>${dow.map(d => `<th>${d}</th>`).join('')}</tr></thead><tbody><tr>${miniDays.map((n, i) => `<td${i === 3 ? ' class="ui-datepicker-days-cell-over"' : ''}><a href="#" class="ui-state-default${n === 15 ? ' ui-state-active ui-state-highlight' : n === 16 ? ' ui-state-highlight' : ''}">${n}</a></td>`).join('')}</tr></tbody></table></div></div>
    <div id="calendar_ical_links" class="ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"><div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all title_size">خروجی گرفتن از تقویم</div><div class="content_ical"><a href="#"><span><i class="fa fa-download"></i>&nbsp;دریافت تقویم (iCal)</span></a></div></div>
  </td>
  <td align="right" width="90%">
    <div id="calendar_main"><div class="fc fc-rtl"><table class="fc-header"><tbody><tr><td class="fc-header-left"><button class="fc-button fc-state-active" type="button">ماه</button><button class="fc-button" type="button">هفته</button><button class="fc-button" type="button">روز</button></td><td class="fc-header-center"><h2>سپتامبر ۲۰۲۶</h2></td><td class="fc-header-right"><button class="fc-button" type="button">امروز</button><button class="fc-button" type="button" aria-label="ماه قبل">‹</button><button class="fc-button" type="button" aria-label="ماه بعد">›</button></td></tr></tbody></table><div class="fc-content"><div class="fc-view fc-view-month"><table><thead><tr>${dow.map(d => `<th class="fc-day-header">${d}</th>`).join('')}</tr></thead><tbody>${grid}</tbody></table></div></div></div></div>
  </td>
  </tr></tbody></table></form>`;
}
function report() {
  const columns = ['تاریخ', 'تماس‌گیرنده', 'گروه پاسخگو', 'مقصد', 'کانال ورودی', 'صف', 'کانال مقصد', 'وضعیت', 'مدت تماس', 'شناسه', 'گزارش انتظار', 'DID', 'CEL'];
  return `<h1>ریز مکالمات</h1><div class="div_msg_errors" role="alert"><div class="div_msg_errors_content">برای استفاده از تماس داخلی، شماره داخلی خود را انتخاب کنید.</div><div class="div_msg_errors_dismiss"><button type="button" aria-label="بستن پیام" data-preview-dismiss>×</button></div></div><button class="btn btn-primary" data-toggle="collapse" data-target="#filters">نمایش فیلترها</button><div id="filters" class="collapse"><form><table class="voiz-form-table"><tbody><tr><td><label for="date_start">از تاریخ</label></td><td><input id="date_start" value="۱۴۰۵/۰۶/۲۴"></td><td><label for="status">وضعیت</label></td><td><select id="status"><option>تمام تماس‌ها</option></select></td></tr></tbody></table></form></div><p id="msgFilter">۲۴ شهریور ۱۴۰۵ · تمام تماس‌ها · تمام گروه‌های پاسخگو</p><div class="dataTables_wrapper"><div class="dt-buttons"><button class="dt-button">PDF</button><button class="dt-button">Excel</button><button class="dt-button">CSV</button><button class="btn btn-danger">حذف انتخاب‌شده‌ها</button></div><div class="dataTables_length"><label>نمایش <select><option>۱۰</option><option>۲۵</option></select> ردیف</label></div><div class="dataTables_filter"><label>جستجو <input type="search"></label></div><table id="CDRreport" class="table table-striped dataTable"><thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${[1, 2, 3].map(i => `<tr>${['۱۴۰۵/۰۶/۲۴ ۱۰:۳۰', '100' + i, 'پشتیبانی', '200', 'SIP/100' + i, '600', 'SIP/200', 'پاسخ داده‌شده', '00:02:35', '1726400000.' + i, '۰', '02100000000', 'جزئیات'].map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="dataTables_info">نمایش ۱ تا ۳ از ۳ ردیف</div><div class="dataTables_paginate"><a href="#" class="paginate_button disabled">قبلی</a><a href="#" class="paginate_button current">۱</a><a href="#" class="paginate_button">بعدی</a></div></div><div class="chart-container"><canvas id="myChart" height="220"></canvas></div>`;
}
function addons() { return '<h1>افزونه‌ها</h1><div class="flexigrid"><div class="tDiv"><label for="addon-name">نام افزونه </label><input id="addon-name" type="search"><select aria-label="وضعیت افزونه"><option>موجود</option><option>نصب‌شده</option></select></div><div class="hDiv"><strong>نام افزونه · توضیحات · نسخه</strong></div><div class="bDiv" style="min-height:180px"><p style="padding:32px;text-align:center" class="text-muted">افزونه‌ای برای نمایش وجود ندارد.</p></div><div class="pDiv">نمایش ۰ مورد</div></div>'; }
function hardware() { return render('issabelmodules/modules/hardware_detector/themes/default/listPorts.tpl', { ...base, width: '1200px', HARDWARE_DETECT: 'یافتن سخت‌افزار جدید', Advanced: 'پیشرفته', Status_ports: 'وضعیت پورت‌ها', Channel_detected_notused: 'کانال شناسایی‌شده؛ خارج از سرویس', Channel_detected_use: 'کانال فعال', Undetected_Channel: 'کانال شناسایی نشده', CHANNELS_EMPTY: 'پورت خالی', arrCards: [], arrMisdn: 'noMISDN', MODULE_NAME: 'hardware_detector', CHAN_DAHDI_REPLACE: 'جایگزینی پیکربندی DAHDI', DETECT_SANGOMA: 'شناسایی Sangoma' }); }
function pbx() { return render('issabelmodules/modules/pbxadmin/themes/default/main.tpl', { leftmenu: { 'تنظیمات تلفنی': [{ urlkey: 'extensions', name: 'داخلی‌ها' }, { urlkey: 'trunks', name: 'ترانک‌ها' }], 'مسیرهای تماس': [{ urlkey: 'routing', name: 'مسیرهای خروجی' }] }, Option: 'گزینه‌ها', Unembedded_IssabelPBX: 'باز کردن در پنجره مستقل', htmlFPBX: forms(), isissabelpbx: '1' }); }
function page(name = 'dashboard', options = {}) {
  if (!labels[name]) name = 'forms';
  const data = { ...base, ...options, BREADCRUMB: ['سیستم', labels[name]], idMainMenuSelected: Object.keys(menus).find(k => Object.keys(menus[k].children || {}).includes(name)) || 'system', idSubMenuSelected: name };
  if (name === 'login') return render('theme/vitenant/_common/login.tpl', data);
  data.MENU = render('theme/vitenant/_common/_menu.tpl', data);
  data.CONTENT = ({ dashboard, forms, calendar, cdrreport: report, addonlist: addons, hardware, pbxconfig: pbx })[name]();
  return render('theme/vitenant/_common/index.tpl', data);
}
module.exports = { root, read, render, page, labels, base };
