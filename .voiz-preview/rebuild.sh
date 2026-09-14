#!/usr/bin/env bash
# Rebuilds the self-contained preview files from the real theme files.
# Run from anywhere; paths are resolved relative to the repo root.
set -e
cd "$(dirname "$0")"
ROOT=..
cp "$ROOT/theme/vitenant/css/voiz-ui.css" "$ROOT/theme/vitenant/css/voiz-tw.css" "$ROOT/theme/vitenant/js/voiz-ui.js" .
node -e "
const fs = require('fs');
const b64 = f => fs.readFileSync(f).toString('base64');
const weights = {'Thin':100,'Light':300,'Regular':400,'Medium':500,'SemiBold':600,'Bold':700,'ExtraBold':800,'Black':900};
let fontcss = '';
for (const [name,w] of Object.entries(weights)) {
  fontcss += '@font-face{font-family:Vazirmatn;src:url(data:font/woff2;base64,'+b64('fonts/vazirmatn/Vazirmatn-'+name+'.woff2')+') format(woff2);font-weight:'+w+';font-style:normal;font-display:swap;}\n';
}
fontcss += '@font-face{font-family:FontAwesome;src:url(data:font/woff2;base64,'+b64('fontawesome-webfont.woff2')+') format(woff2);font-weight:normal;font-style:normal;}\n';
const tw = fs.readFileSync('voiz-tw.css','utf8');
const ui = fs.readFileSync('voiz-ui.css','utf8').replace(/@import url\([^)]*\);/, '/* tw inlined */');
fs.writeFileSync('theme-inline.css', tw + '\n' + fontcss + '\n' + fs.readFileSync('fa.css','utf8') + '\n' + fs.readFileSync('fa-local.css','utf8') + '\n' + ui);
fs.writeFileSync('js-inline.js', fs.readFileSync('voiz-ui.js','utf8'));
const imgs = JSON.parse(fs.readFileSync('imgs.json','utf8'));
const css = fs.readFileSync('theme-inline.css','utf8');
const js = fs.readFileSync('js-inline.js','utf8');
function build(src, dst){
  let h = fs.readFileSync(src,'utf8');
  h = h.replace(/<link rel=\"stylesheet\" href=\"[^\"]*\">/g, '');
  for (const [name, b] of Object.entries(imgs)) {
    h = h.split('src=\"'+name+'\"').join('src=\"data:image/png;base64,'+b+'\"');
  }
  h = h.replace('</head>', '<style>'+css+'</style>\n</head>');
  h = h.replace('<script src=\"voiz-ui.js\"></script>', '<script>'+js+'</script>');
  fs.writeFileSync(dst, h);
}
build('index.html','index-self.html');
build('login.html','login-self.html');
console.log('index-self.html + login-self.html rebuilt');
"
node build-desktop.js
