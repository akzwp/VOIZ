const http = require('http');
const fs = require('fs');
const path = require('path');
const { page, root } = require('./preview-data.cjs');
const mime = { '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
const previewScript = `document.addEventListener('click',function(e){var b=e.target.closest('[data-preview-modal]');if(b){var m=document.querySelector('.neo-modal-issabel-popup-box');m.querySelector('.neo-modal-issabel-popup-title').textContent='بررسی تنظیمات';m.querySelector('.neo-modal-issabel-popup-content').innerHTML='<p>این یک پنجره نمونه برای بررسی نمایش پیام‌ها است.</p><label for="popup-note">یادداشت</label><textarea id="popup-note"></textarea>';m.style.display='block';document.querySelector('.neo-modal-issabel-popup-blockmask').style.display='block';}if(e.target.closest('.neo-modal-issabel-popup-close')){document.querySelector('.neo-modal-issabel-popup-box').style.display='none';document.querySelector('.neo-modal-issabel-popup-blockmask').style.display='none';}var d=e.target.closest('[data-preview-dismiss]');if(d)d.closest('.div_msg_errors').remove();});document.addEventListener('submit',function(e){if(!e.target.closest('.voiz-topbar-search'))e.preventDefault();});`;
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
