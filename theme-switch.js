/* Switch the existing archive's paper, ink and materials in place. */
(() => {
  'use strict';
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-set-theme]')];
  const valid = theme => theme === 'classic' || theme === 'colors';
  function applyTheme(theme, remember = false) {
    if (!valid(theme)) return;
    root.dataset.theme = theme;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme)));
    document.querySelector('meta[name="theme-color"]').content = theme === 'colors' ? '#f2f5fb' : '#eeede8';
    if (remember) {
      try { localStorage.setItem('kelen-theme', theme); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('theme', theme);
      history.replaceState(null, '', url);
      document.querySelector('#theme-status').textContent = theme === 'colors' ? '已切换为光谱风格' : '已切换为原版风格';
    }
    window.dispatchEvent(new CustomEvent('kelen-theme-change', {detail: {theme}}));
  }
  buttons.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.setTheme, true)));
  window.addEventListener('kelen-vortex-return', event => {
    if (event.detail?.source === 'bottom') applyTheme(root.dataset.theme === 'colors' ? 'classic' : 'colors', true);
  });
  window.addEventListener('popstate', () => {
    const requested = new URL(location.href).searchParams.get('theme');
    if (valid(requested)) applyTheme(requested);
  });
  applyTheme(root.dataset.theme || 'classic');
  const requested = new URL(location.href).searchParams.get('theme');
  if (valid(requested)) {
    try { localStorage.setItem('kelen-theme', requested); } catch (_) {}
  }
})();
