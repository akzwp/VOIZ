/* Small deterministic UI contract check; it does not need a running PBX. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const checks = [];

function requireText(file, text) {
  const ok = read(file).includes(text);
  checks.push({ file, text, ok });
}

requireText('theme/vitenant/css/voiz-tailwind.css', '--voiz-primary:#ea580c');
requireText('theme/vitenant/css/voiz-tailwind.css', '.tw-flex');
requireText('theme/vitenant/css/voiz-tailwind.css', '.voiz-cdr-page .neo-table-header-row');
requireText('theme/vitenant/_common/index.tpl', 'css/voiz-tailwind.css?v=6.1.0');
requireText('theme/vitenant/_common/login.tpl', 'css/voiz-tailwind.css?v=6.1.0');
requireText('theme/vitenant/_common/popup.tpl', 'css/voiz-tailwind.css?v=6.1.0');
requireText('issabelmodules/modules/cdrreport/themes/default/cel.tpl', 'css/voiz-tailwind.css?v=6.1.0');
requireText('theme/vitenant/_common/index.tpl', 'VOIPIRAN | ویپ ایران + AKZ');
requireText('theme/vitenant/_common/login.tpl', 'VOIPIRAN | ویپ ایران + AKZ');

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  for (const check of failed) console.error(`Missing ${JSON.stringify(check.text)} in ${check.file}`);
  process.exit(1);
}

console.log(`UI contract checks passed (${checks.length}).`);
