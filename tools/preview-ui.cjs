const http = require('http');
const fs = require('fs');
const path = require('path');
const { page, root } = require('./preview-data.cjs');
const mime = { '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
const previewScript = `document.addEventListener('click',function(e){var b=e.target.closest('[data-preview-modal]');if(b){var m=document.querySelector('.neo-modal-issabel-popup-box');m.querySelector('.neo-modal-issabel-popup-title').textContent='بررسی تنظیمات';m.querySelector('.neo-modal-issabel-popup-content').innerHTML='<p>این یک پنجره نمونه برای بررسی نمایش پیام‌ها است.</p><label for="popup-note">یادداشت</label><textarea id="popup-note"></textarea>';m.style.display='block';document.querySelector('.neo-modal-issabel-popup-blockmask').style.display='block';}if(e.target.closest('.neo-modal-issabel-popup-close')){document.querySelector('.neo-modal-issabel-popup-box').style.display='none';document.querySelector('.neo-modal-issabel-popup-blockmask').style.display='none';}var d=e.target.closest('[data-preview-dismiss]');if(d)d.closest('.div_msg_errors').remove();var ev=e.target.closest('[data-preview-event-dialog]');if(ev){var dlg=document.querySelector('#calendar_eventdialog');var mask=document.querySelector('.voiz-dialog-mask');if(dlg){if(!mask){mask=document.createElement('div');mask.className='voiz-dialog-mask';document.body.appendChild(mask);}mask.style.display='block';dlg.style.display='block';var bar=dlg.querySelector('.ui-dialog-titlebar');if(!bar){bar=document.createElement('div');bar.className='ui-dialog-titlebar ui-widget-header';bar.innerHTML='<span class="ui-dialog-title">ایجاد رویداد جدید</span><button type="button" class="ui-dialog-titlebar-close" aria-label="بستن پنجره"><span class="ui-icon ui-icon-closethick">close</span></button>';dlg.insertBefore(bar,dlg.firstChild);}dlg.classList.add('ui-dialog','ui-widget','ui-widget-content','ui-corner-all');var pane=dlg.querySelector('.ui-dialog-buttonpane');if(!pane){pane=document.createElement('div');pane.className='ui-dialog-buttonpane ui-widget-content';pane.innerHTML='<div class="ui-dialog-buttonset"><button type="button" class="btn btn-primary">ذخیره</button><button type="button" class="btn btn-default">انصراف</button></div>';dlg.appendChild(pane);pane.addEventListener('click',function(pe){if(pe.target.closest('button')){dlg.style.display='none';mask.style.display='none';}});}bar.querySelector('.ui-dialog-titlebar-close').addEventListener('click',function(){dlg.style.display='none';mask.style.display='none';});}}});document.addEventListener('keydown',function(e){if(e.key==='Escape'){var dlg=document.querySelector('#calendar_eventdialog');if(dlg&&dlg.style.display==='block'){dlg.style.display='none';var m=document.querySelector('.voiz-dialog-mask');if(m)m.style.display='none';}}});document.addEventListener('submit',function(e){if(!e.target.closest('.voiz-topbar-search'))e.preventDefault();});`;
const stub = 'function hide_message_error(){var el=document.getElementById("message_error");if(el)el.hidden=true;} function popUp(){}';
http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end('Read-only UI preview'); }
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname === '/' || url.pathname === '/index.php') {
    try {
      const html = page(url.searchParams.get('menu') || 'dashboard').replace('</body>', '<script>' + previewScript + '</script></body>');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(html);
    } catch (error) { res.writeHead(500); return res.end(error.message); }
  }
  if (url.pathname.startsWith('/libs/js/')) { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(stub); }
  let relative;
  if (url.pathname.startsWith('/themes/')) relative = 'theme/' + url.pathname.slice(8);
  else if (url.pathname.startsWith('/modules-assets/fontawesome/')) relative = 'issabelmodules/mylib/dpik/css/fontawesome/' + url.pathname.slice(27);
  else if (url.pathname.startsWith('/modules/')) relative = 'issabelmodules/modules/' + url.pathname.slice(9);
  const file = relative && path.resolve(root, relative);
  const ext = file && path.extname(file).toLowerCase();
  if (!file || !file.startsWith(root + path.sep) || !mime[ext] || !fs.existsSync(file)) { res.writeHead(404); return res.end('Asset unavailable in this repository'); }
  res.writeHead(200, { 'Content-Type': mime[ext], 'Cache-Control': 'no-store' }); fs.createReadStream(file).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Static VOIZ preview: http://127.0.0.1:4173 — fixtures only; no PBX requests or saved changes.'));
