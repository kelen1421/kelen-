(() => {
  const scene = document.querySelector('.archive-scene');
  const sidebarLinks = [...document.querySelectorAll('.side-nav a')];
  const sceneLinks = [...document.querySelectorAll('.scene-link')];
  const sections = [...document.querySelectorAll('.page-section, .contact')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('.scene-motion');
  const sceneHint = document.querySelector('.scene-hint');
  const defaultHint = sceneHint.textContent;
  let userPaused = reducedMotion.matches;
  let sceneVisible = true;
  let navigationTimer;
  let cameraFrame;

  function resetCamera() {
    scene.style.setProperty('--pointer-x', '0px');
    scene.style.setProperty('--pointer-y', '0px');
  }

  function updateMotion() {
    scene.classList.toggle('is-paused', userPaused || !sceneVisible || document.hidden);
    motionButton.setAttribute('aria-pressed', String(userPaused));
    motionButton.querySelector('.motion-label').textContent = userPaused ? '开启动效' : '暂停动效';
    motionButton.firstElementChild.textContent = userPaused ? '▷' : 'Ⅱ';
    if (userPaused || !sceneVisible || document.hidden) {
      cancelAnimationFrame(cameraFrame);
      cameraFrame = undefined;
      resetCamera();
    }
  }

  motionButton.addEventListener('click', () => {
    userPaused = !userPaused;
    updateMotion();
  });
  reducedMotion.addEventListener('change', event => {
    userPaused = event.matches;
    updateMotion();
  });
  document.addEventListener('visibilitychange', updateMotion);
  new IntersectionObserver(([entry]) => {
    sceneVisible = entry.isIntersecting;
    updateMotion();
  }).observe(scene);
  updateMotion();

  scene.addEventListener('pointermove', event => {
    if (userPaused || !sceneVisible || reducedMotion.matches || event.pointerType === 'touch' || cameraFrame) return;
    const bounds = scene.getBoundingClientRect();
    const x = Math.max(-16, Math.min(16, ((event.clientX - bounds.left) / bounds.width - .5) * 32));
    const y = Math.max(-12, Math.min(12, ((event.clientY - bounds.top) / bounds.height - .5) * 24));
    cameraFrame = requestAnimationFrame(() => {
      scene.style.setProperty('--pointer-x', `${x}px`);
      scene.style.setProperty('--pointer-y', `${y}px`);
      cameraFrame = undefined;
    });
  });
  scene.addEventListener('pointerleave', resetCamera);

  function previewChapter(link) {
    scene.dataset.focus = link.dataset.module;
    sceneHint.textContent = link.dataset.summary;
  }
  function resetChapterPreview() {
    scene.dataset.focus = 'overview';
    sceneHint.textContent = defaultHint;
  }
  sceneLinks.forEach(link => {
    link.addEventListener('pointerenter', () => previewChapter(link));
    link.addEventListener('focus', () => previewChapter(link));
    link.addEventListener('pointerleave', resetChapterPreview);
    link.addEventListener('blur', resetChapterPreview);
  });

  function markActiveChapter(id) {
    [...sidebarLinks, ...sceneLinks].forEach(link => {
      const active = link.hash === `#${id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting);
    if (visible.length) markActiveChapter(visible[visible.length - 1].target.id);
  }, { rootMargin: '-20% 0px -45% 0px' });
  sections.forEach(section => sectionObserver.observe(section));

  function enterChapter(hash, sourceLink, updateHistory = true) {
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    clearTimeout(navigationTimer);
    const animatedEntrance = sourceLink?.classList.contains('scene-link') && !reducedMotion.matches && !userPaused;
    sceneLinks.forEach(link => link.classList.toggle('is-selected', link === sourceLink));
    scene.classList.toggle('is-entering', animatedEntrance);

    const navigate = () => {
      if (updateHistory && window.location.hash !== hash) history.pushState(null, '', hash);
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      const heading = target.querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      markActiveChapter(target.id);
      target.classList.add('is-arriving');
      window.setTimeout(() => {
        target.classList.remove('is-arriving');
        scene.classList.remove('is-entering');
      }, 750);
    };
    if (animatedEntrance) navigationTimer = window.setTimeout(navigate, 220);
    else navigate();
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!document.getElementById(link.hash.slice(1))) return;
    event.preventDefault();
    enterChapter(link.hash, link);
  });
  window.addEventListener('popstate', () => enterChapter(window.location.hash || '#home', null, false));
})();
