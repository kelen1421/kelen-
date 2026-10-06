(() => {
  const root = document.documentElement;
  const arrival = document.querySelector('.site-arrival');
  const frame = document.querySelector('.site-frame');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!arrival || !frame) return;

  if (!root.classList.contains('intro-pending') || reducedMotion.matches) {
    clearTimeout(window.arrivalFallback);
    root.classList.remove('intro-pending', 'intro-running');
    arrival.remove();
    return;
  }

  const template = document.querySelector('#arrival-dove');
  arrival.querySelectorAll('[data-dove]').forEach(dove => {
    dove.append(template.content.cloneNode(true));
    const style = getComputedStyle(dove);
    const speed = style.getPropertyValue('--flap-speed').trim();
    const phase = parseFloat(style.getPropertyValue('--flap-phase'));
    dove.querySelectorAll('animateTransform').forEach(animation => {
      const farWing = animation.closest('.dove-wing-far');
      animation.setAttribute('dur', speed);
      animation.setAttribute('begin', `${phase - (farWing ? .11 : 0)}s`);
    });
  });
  template.remove();
  frame.inert = true;
  let finished = false;
  let finishTimer;
  let startFrame;

  function finish(fromSkip = false) {
    if (finished) return;
    finished = true;
    clearTimeout(finishTimer);
    clearTimeout(window.arrivalFallback);
    cancelAnimationFrame(startFrame);
    root.classList.remove('intro-pending', 'intro-running');
    frame.inert = false;
    arrival.remove();
    window.removeEventListener('keydown', skipWithKeyboard);
    window.removeEventListener('pagehide', onPageHide);
    reducedMotion.removeEventListener('change', onMotionChange);
    if (fromSkip) frame.querySelector('.identity')?.focus({preventScroll:true});
  }

  function skipWithKeyboard(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      finish(true);
    }
  }
  function onMotionChange(event) { if (event.matches) finish(); }
  function onPageHide() { finish(); }

  arrival.querySelector('.arrival-skip').addEventListener('click', () => finish(true));
  window.addEventListener('keydown', skipWithKeyboard);
  window.addEventListener('pagehide', onPageHide);
  reducedMotion.addEventListener('change', onMotionChange);
  startFrame = requestAnimationFrame(() => {
    root.classList.add('intro-running');
    finishTimer = setTimeout(finish, 4150);
  });
})();
