const fs = require('fs');
let inner = fs.readFileSync('index-self.html', 'utf8');
// Base64-encode the whole page: no HTML parsing hazards at all (textarea, script tags...)
const b64 = Buffer.from(inner, 'utf8').toString('base64');
const html = '<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>VOIZ Desktop 1440</title>\n'
  + '<style>html,body{margin:0;padding:0;background:#0e0f12;overflow:hidden;}#wrap{width:1440px;transform-origin:top left;transform:scale(0.382);}</style>\n'
  + '</head><body>\n<div id="wrap"><iframe id="f" style="width:1440px;height:2600px;border:0;"></iframe></div>\n'
  + '<script>var P="' + b64 + '";'
  + 'document.getElementById("f").srcdoc=decodeURIComponent(escape(atob(P)));</script>\n'
  + '</body></html>';
fs.writeFileSync('desktop-all.html', html);
console.log('written', html.length);
