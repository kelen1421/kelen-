(() => {
  window.createProgramFunctionMap = (index, options = {}) => {
    const project = window.KelenProgramProjects?.[index];
    const demo = window.createProgramDemo?.(index);
    if (!project || !demo) return null;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    const element = document.createElement('figure');
    element.className = 'hall-function-map';
    const header = document.createElement('div');
    header.className = 'hall-function-header';
    const caption = document.createElement('figcaption');
    caption.textContent = '功能图 / ' + project.name;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    header.append(caption, toggle);
    demo.canvas.setAttribute('aria-hidden', 'true');
    const visual = document.createElement('div');visual.className = 'hall-function-visual';visual.append(demo.canvas);
    const flow = document.createElement('ol');
    flow.className = 'hall-project-flow';
    project.steps.forEach((value, i) => {
      const item = document.createElement('li');
      const number = document.createElement('small');
      number.textContent = String(i + 1).padStart(2, '0');
      item.append(number, value);flow.append(item);
    });
    element.append(header, visual, flow);
    let paused = !!options.paused, visible = false, disposed = false;
    let time = 2.4, raf, previous, painted = -Infinity, activeStep = -1;
    const duration = demo.duration || 9.6;
    const items = [...flow.children];
    function paint() {
      demo.paint(time);
      const step = Math.min(2, Math.floor((time % duration) / duration * 3));
      if (step !== activeStep) {
        items.forEach((item, i) => {
          item.classList.toggle('is-active', i === step);
          if(i === step)item.setAttribute('aria-current', 'step');else item.removeAttribute('aria-current');
        });
        activeStep = step;
      }
    }
    function ready() {
      return visible && !disposed && !paused && !motion.matches && !document.hidden &&
        !root.classList.contains('intro-pending') && !root.classList.contains('vortex-open');
    }
    function update() {
      toggle.textContent = paused ? '播放功能图' : '暂停功能图';
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', (paused ? '播放' : '暂停') + project.name + '功能图');
      toggle.hidden = motion.matches;
      if (!ready()) { cancelAnimationFrame(raf);raf = undefined;previous = undefined;return; }
      if (!raf) raf = requestAnimationFrame(draw);
    }
    function draw(now) {
      raf = undefined;if (!ready()) { previous = undefined;return; }
      time += Math.min(.1, (now - (previous ?? now)) / 1000);previous = now;
      if(now - painted >= 1000 / 24) { paint();painted = now; }
      raf = requestAnimationFrame(draw);
    }
    function setPaused(value) { paused = !!value;update(); }
    toggle.addEventListener('click', () => options.onToggle ? options.onToggle() : setPaused(!paused));
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting;update(); }, {threshold:.05});
    observer.observe(element);
    const blocker = new MutationObserver(update);
    blocker.observe(root, {attributes:true, attributeFilter:['class']});
    function onMotion() { paint();update(); }
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', onMotion);
    paint();update();
    return {element, setPaused, dispose() {
      disposed = true;cancelAnimationFrame(raf);observer.disconnect();blocker.disconnect();
      document.removeEventListener('visibilitychange', update);motion.removeEventListener('change', onMotion);
    }};
  };
})();
