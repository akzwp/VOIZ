# VOIZ Theme — Live Preview (harness)

This workspace is a PHP/Smarty panel theme (no npm server). The live preview is a
**static, self-contained HTML harness** that renders the theme in a browser so UI
changes can be verified without an Issabel install.

## How to reproduce the artifacts

Run **one command** from the repo root (Git Bash). It copies the real theme
files into the harness and rebuilds the single-file previews:

```bash
bash .voiz-preview/rebuild.sh
```

That script does, in order:
1. `cp theme/vitenant/css/voiz-ui.css theme/vitenant/css/voiz-tw.css theme/vitenant/js/voiz-ui.js .voiz-preview/`
2. Inlines Vazirmatn + FontAwesome as data-URI fonts, `voiz-tw.css` + `voiz-ui.css`, and `voiz-ui.js` into the harness HTML files (`index.html`, `login.html` are the editable sources)
3. Regenerates `index-self.html`, `login-self.html` (single-file, mobile/tablet viewport) and `desktop-all.html` (1440px iframe wrapper via `build-desktop.js`)
   ```

## How to run (register) the preview

No server needed — register the self-contained file directly:

- Mobile/tablet viewport (390px): register `.voiz-preview/index-self.html`
- Desktop 1440px (scaled iframe wrapper): register `.voiz-preview/desktop-all.html`
- Login page: register `.voiz-preview/login-self.html`

Only one can be registered at a time (register with `replace: true` to switch).

## Files

- `index.html` — editable harness source (topbar, sidebar, table, form, applet grid, calendar)
- `login.html` — login page harness source
- `fa-local.css` — entypo glyph stand-ins + harness-only display rules
- `theme-inline.css` / `js-inline.js` / `imgs.json` — generated inline bundles (do not edit)
- `index-self.html` / `login-self.html` / `desktop-all.html` — generated single-file previews (do not edit)

## Theme files under test (real product files)

- `theme/vitenant/css/voiz-tw.css` — internal Tailwind-style engine (no CDN)
- `theme/vitenant/css/voiz-ui.css` — redesign layer (imports voiz-tw)
- `theme/vitenant/js/voiz-ui.js` — theme switch, drawer, search, password toggle
- `theme/vitenant/_common/*.tpl` — panel/login/menu/popup markup
- `issabelmodules/modules/dashboard/themes/default/appletgrid.tpl` — fluid applet grid
- `issabelmodules/modules/cdrreport/themes/default/cel.tpl` — CDR popup (RTL stack)
