/** Build-time only; preserve the framework's existing widgets. */
module.exports = {
  content: ['./ui/**/*.css', '../../framework/html/themes/akz/_common/*.tpl', '../../framework/html/themes/akz/js/akz-*.js'],
  prefix: 'tw-',
  corePlugins: { preflight: false },
  theme: { extend: { fontFamily: { sans: ['system-ui', 'Arial', 'sans-serif'] }, colors: { surface: 'var(--akz-surface)', ink: 'var(--akz-text)', brand: 'var(--akz-primary)' } } },
  plugins: []
};
