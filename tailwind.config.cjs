/** Build-time only. Preflight is disabled for Issabel's legacy widgets. */
module.exports = {
  content: ['./theme/vitenant/_common/*.tpl', './issabelmodules/modules/**/themes/default/*.tpl', './theme/vitenant/js/voiz-ui.js', './ui/**/*.css', './tools/fixtures/*.html'],
  prefix: 'tw-',
  corePlugins: { preflight: false },
  theme: {
    extend: {
      fontFamily: { sans: ['Vazirmatn', 'Tahoma', 'sans-serif'] },
      colors: { surface: 'var(--voiz-surface)', ink: 'var(--voiz-text)', brand: 'var(--voiz-primary)' }
    }
  },
  plugins: []
};
