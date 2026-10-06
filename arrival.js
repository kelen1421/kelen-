(() => {
  const root = document.documentElement;
  const arrival = document.querySelector('.site-arrival');
  const frame = document.querySelector('.site-frame');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const introClasses = ['intro-pending', 'intro-running', 'intro-released', 'intro-landed', 'intro-opening', 'intro-letter', 'intro-unfolding'];
  if (!arrival || !frame) return;

  if (!root.classList.contains('intro-pending') || reducedMotion.matches) {
    clearTimeout(window.arrivalFallback);
    root.classList.remove(...introClasses);
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

  const carrier = arrival.querySelector('.intro-carrier .arrival-bird');
  const mail = arrival.querySelector('.arrival-mail');
  const letter = arrival.querySelector('.arrival-letter');
  const tether = arrival.querySelector('.arrival-tether');
  const thread = tether.querySelector('path');
  const RELEASE = 1900;
  const LAND = 2800;
  const OPEN = 3020;
  const LETTER = 3330;
  const UNFOLD = 4100;
  const END = 5780;
  const cssVariables = [];
  let finished = false;
  let animationFrame;
  let startedAt;
  let releasePoint;
  let mailPosition;
  let unfolding = false;

  function setVariable(name, value) {
    root.style.setProperty(name, `${value}px`);
    cssVariables.push(name);
  }

  function drawMail(position) {
    const {width, height} = mail.getBoundingClientRect();
    // offsetWidth/Height stay stable while the envelope rotates.
    const w = mail.offsetWidth || width;
    const h = mail.offsetHeight || height;
    mail.style.transform = `translate3d(${position.x - w / 2}px,${position.y - h / 2}px,0) rotate(${position.angle}deg)`;
    return {w, h};
  }

  function unfoldPage() {
    unfolding = true;
    const paper = letter.getBoundingClientRect();
    const page = frame.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setVariable('--paper-left', paper.left);
    setVariable('--paper-top', paper.top);
    setVariable('--paper-width', paper.width);
    setVariable('--paper-height', paper.height);
    // Clip the real page to the sheet, including when entering a deep link.
    const regions = {
      sheet: {left:paper.left, top:paper.top, right:paper.right, bottom:paper.bottom},
      unfold: {left:vw * .04, top:vh * .1, right:vw * .96, bottom:vh * .9},
      viewport: {left:0, top:0, right:vw, bottom:vh}
    };
    Object.entries(regions).forEach(([name, region]) => {
      setVariable(`--${name}-left`, Math.max(0, region.left - page.left));
      setVariable(`--${name}-right`, Math.max(0, page.right - region.right));
      setVariable(`--${name}-top`, Math.max(0, region.top - page.top));
      setVariable(`--${name}-bottom`, Math.min(page.height, region.bottom - page.top));
    });
    root.classList.add('intro-unfolding');
  }

  function tick(now) {
    if (finished) return;
    const elapsed = now - startedAt;
    if (elapsed >= END) { finish(); return; }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = mail.offsetWidth;
    const h = mail.offsetHeight;
    if (!releasePoint) {
      // The SVG matrix keeps the string tied to the beak during flapping and banking.
      const matrix = carrier.getScreenCTM();
      if (matrix) {
        const beak = new DOMPoint(33, 69).matrixTransform(matrix);
        mailPosition = {
          x:beak.x + w * .95,
          y:beak.y + h * .78 + Math.sin(elapsed / 220) * 5,
          angle:-9 + Math.sin(elapsed / 280) * 7
        };
        drawMail(mailPosition);
        mail.style.opacity = '1';
        tether.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
        const radians = mailPosition.angle * Math.PI / 180;
        const anchorX = mailPosition.x + Math.sin(radians) * h * .5;
        const anchorY = mailPosition.y - Math.cos(radians) * h * .5;
        thread.setAttribute('d', `M${beak.x} ${beak.y} Q${(beak.x + anchorX) / 2} ${Math.max(beak.y, anchorY) + 16} ${anchorX} ${anchorY}`);
        tether.style.opacity = '1';
      }
      if (elapsed >= RELEASE && mailPosition) {
        releasePoint = {...mailPosition};
        root.classList.add('intro-released');
      }
    }
    if (releasePoint && elapsed < LAND) {
      const p = Math.min(1, (elapsed - RELEASE) / (LAND - RELEASE));
      const drift = 1 - Math.pow(1 - p, 2);
      const fall = p < .84 ? Math.pow(p / .84, 2) : 1;
      const bounce = p < .84 ? 0 : -Math.sin((p - .84) / .16 * Math.PI) * 8;
      mailPosition = {
        x:releasePoint.x + (vw * .52 - releasePoint.x) * drift,
        y:releasePoint.y + (vh * .63 - releasePoint.y) * fall + bounce,
        angle:releasePoint.angle * (1 - drift) + Math.sin(p * Math.PI * 2) * 16 * (1 - p)
      };
      drawMail(mailPosition);
    } else if (releasePoint && !unfolding) {
      drawMail({x:vw * .52, y:vh * .63, angle:0});
      root.classList.add('intro-landed');
    }
    if (elapsed >= OPEN) root.classList.add('intro-opening');
    if (elapsed >= LETTER) root.classList.add('intro-letter');
    if (elapsed >= UNFOLD && !unfolding) unfoldPage();
    animationFrame = requestAnimationFrame(tick);
  }

  function finish(fromSkip = false) {
    if (finished) return;
    finished = true;
    clearTimeout(window.arrivalFallback);
    cancelAnimationFrame(animationFrame);
    root.classList.remove(...introClasses);
    cssVariables.forEach(name => root.style.removeProperty(name));
    frame.inert = false;
    arrival.remove();
    window.removeEventListener('keydown', skipWithKeyboard);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('resize', onResize);
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
  function onResize() { if (unfolding) finish(); }

  arrival.querySelector('.arrival-skip').addEventListener('click', () => finish(true));
  window.addEventListener('keydown', skipWithKeyboard);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('resize', onResize);
  reducedMotion.addEventListener('change', onMotionChange);
  animationFrame = requestAnimationFrame(now => {
    startedAt = now;
    root.classList.add('intro-running');
    animationFrame = requestAnimationFrame(tick);
  });
})();
