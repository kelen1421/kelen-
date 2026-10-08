(() => {
  const frame = document.querySelector('.site-frame');
  if (!frame) return;
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const ease = n => { const p = clamp(n); return p * p * (3 - 2 * p); };
  const mix = (a, b, p) => a + (b - a) * p;
  let samples = [], lastPoint, gestureFrame, coolingUntil = 0, active;

  function resetGesture() {
    samples = []; lastPoint = undefined;
    cancelAnimationFrame(gestureFrame); gestureFrame = undefined;
  }

  // Fit the circle the visitor actually draws, wherever it is on the page.
  // A consistent radius, two full turns and very little reverse travel are required.
  function recognizeCircle() {
    gestureFrame = undefined;
    if (samples.length < 30) return;
    // Ignore an earlier straight mouse movement before the circular gesture.
    const step = Math.max(1, Math.floor(samples.length / 36));
    for (let start = 0; start <= samples.length - 30; start += step) {
      const hole = circleCandidate(samples.slice(start));
      if (hole) { openPortal(hole); return; }
    }
  }

  function circleCandidate(points) {
    const n = points.length;
    const mx = points.reduce((sum, p) => sum + p.x, 0) / n;
    const my = points.reduce((sum, p) => sum + p.y, 0) / n;
    let xx = 0, xy = 0, yy = 0, xr = 0, yr = 0;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      const x = p.x - mx, y = p.y - my, r = x * x + y * y;
      xx += x * x; xy += x * y; yy += y * y; xr += x * r; yr += y * r;
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    if (maxX - minX < 64 || maxY - minY < 64) return;
    const determinant = xx * yy - xy * xy;
    if (determinant < 1) return;
    const cx = mx + (xr * yy - yr * xy) / determinant / 2;
    const cy = my + (yr * xx - xr * xy) / determinant / 2;
    const radii = points.map(p => Math.hypot(p.x - cx, p.y - cy));
    const radius = radii.reduce((sum, r) => sum + r, 0) / n;
    const error = Math.sqrt(radii.reduce((sum, r) => sum + (r - radius) ** 2, 0) / n);
    if (radius < 32 || error > radius * .24 || radii.some(r => r < radius * .5 || r > radius * 1.65)) return;
    let clockwise = 0, reverse = 0, previous;
    for (const p of points) {
      const angle = Math.atan2(p.y - cy, p.x - cx);
      if (previous !== undefined) {
        let delta = angle - previous;
        if (delta > Math.PI) delta -= TAU;
        if (delta < -Math.PI) delta += TAU;
        if (delta > 0) clockwise += delta; else reverse -= delta;
      }
      previous = angle;
    }
    if (clockwise - reverse >= TAU * 2 - .10 && reverse < .65) {
      return {x:clamp(cx, 0, innerWidth), y:clamp(cy, 0, innerHeight)};
    }
  }

  document.addEventListener('pointermove', event => {
    if (active || event.pointerType !== 'mouse' || document.hidden || root.classList.contains('intro-pending') ||
        performance.now() < coolingUntil || document.querySelector('dialog[open]')) return;
    const now = performance.now();
    if (lastPoint && now - lastPoint.t > 1100) resetGesture();
    const point = {x:event.clientX, y:event.clientY, t:now};
    if (lastPoint && Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) < 3) return;
    samples.push(point); lastPoint = point;
    while (samples.length > 1200 || samples[0].t < now - 12000) samples.shift();
    if (!gestureFrame) gestureFrame = requestAnimationFrame(recognizeCircle);
  }, {passive:true});
  window.addEventListener('blur', () => { if (!active) resetGesture(); });
  window.addEventListener('scroll', () => { if (!active) resetGesture(); }, {passive:true});

  function openPortal(hole) {
    if (active) return;
    resetGesture();
    const previousFocus = document.activeElement;
    const wasInert = frame.inert;
    const scrollPosition = {left:scrollX, top:scrollY, behavior:'instant'};
    const portal = document.createElement('section');
    portal.className = 'vortex-portal';
    portal.setAttribute('role', 'dialog'); portal.setAttribute('aria-modal', 'true');
    portal.setAttribute('aria-label', '隐藏彩蛋：公式与黑洞。按 Escape 返回个人档案。');
    portal.innerHTML = '<canvas class="vortex-canvas" aria-hidden="true"></canvas><div class="vortex-caption">KELEN / EVENT HORIZON<span>SECRET ARCHIVE · 002</span></div><button class="vortex-exit" type="button" aria-label="退出彩蛋，返回网页"><kbd>ESC</kbd> 返回档案 ↗</button><div class="vortex-note">你找到了另一个宇宙。<small>STAY CURIOUS. THE UNKNOWN IS STILL OPEN.</small></div>';
    document.body.append(portal);
    frame.inert = true; root.classList.add('vortex-open');
    const exit = portal.querySelector('.vortex-exit');
    const animations = [];
    const started = performance.now();
    active = {portal, animations};
    const scene = createUniverse(portal.querySelector('canvas'), hole, started, motion.matches);
    const duration = motion.matches ? 180 : 1460;

    if (!motion.matches) {
      const parts = frame.querySelectorAll('.identity,.rail-rule,.rail-meta,.side-nav a,.rail-bottom,.micro-head,.scene-topline,.scene-visual,.scene-intro,.scene-link,.scene-bottomline,.hero-footer,.page-head,.profile-stamp,.profile-copy,.archive-topbar,.archive-stage,.archive-footer,.notes-layout,.contact-top,.contact-main,.contact-bottom,footer');
      let index = 0;
      for (const node of parts) {
        const r = node.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
        const dx = hole.x - r.left - r.width / 2, dy = hole.y - r.top - r.height / 2;
        const base = getComputedStyle(node).transform;
        const original = base === 'none' ? '' : base;
        const bend = index % 2 ? 1 : -1;
        animations.push(node.animate([
          {transform:original || 'none', opacity:1, offset:0},
          {transform:`translate(${dx * .2 - dy * .18 * bend}px,${dy * .2 + dx * .18 * bend}px) rotate(38deg) scale(.82) ${original}`, opacity:1, offset:.36},
          {transform:`translate(${dx}px,${dy}px) rotate(${460 + index * 19}deg) scale(.001) ${original}`, opacity:0, offset:1}
        ], {duration:1120, delay:Math.min(index * 17, 180), easing:'cubic-bezier(.55,.03,.77,.43)', fill:'both'}));
        index++;
      }
    }
    const bounds = frame.getBoundingClientRect();
    const origin = `${hole.x - bounds.left}px ${hole.y - bounds.top}px`;
    animations.push(frame.animate(motion.matches ? [{opacity:1},{opacity:0}] : [
      {transform:'none', transformOrigin:origin, opacity:1, offset:0},
      {transform:'rotate(12deg) scale(.97)', transformOrigin:origin, opacity:1, offset:.35},
      {transform:'rotate(420deg) scale(.002)', transformOrigin:origin, opacity:0, offset:1}
    ], {duration, easing:'cubic-bezier(.55,.03,.77,.43)', fill:'both'}));
    const readyTimer = setTimeout(() => { portal.classList.add('vortex-ready'); exit.focus({preventScroll:true}); }, duration);

    function closePortal(restoreFocus = true) {
      if (!active) return;
      clearTimeout(readyTimer); scene.dispose();
      animations.forEach(a => a.cancel());
      frame.inert = wasInert; root.classList.remove('vortex-open');
      portal.remove(); active = undefined; coolingUntil = performance.now() + 1300;
      window.scrollTo(scrollPosition);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pagehide', onHide);
      motion.removeEventListener('change', onMotion);
      resetGesture();
      if (restoreFocus && previousFocus?.isConnected && previousFocus !== document.body) previousFocus.focus({preventScroll:true});
    }
    function onKey(event) {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closePortal(); }
      else if (event.key === 'Tab') { event.preventDefault(); exit.focus({preventScroll:true}); }
    }
    function onHide() { closePortal(false); }
    function onMotion() { scene.setReduced(motion.matches); }
    exit.addEventListener('click', () => closePortal());
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('pagehide', onHide);
    motion.addEventListener('change', onMotion);
  }

  function createUniverse(canvas, initial, started, reduced) {
    const ctx = canvas.getContext('2d');
    let width, height, ratio, raf, disposed = false, pointer = {x:0,y:0};
    let seed = 1421;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const stars = Array.from({length:205}, () => ({x:random(),y:random(),size:.3+random()*1.3,alpha:.15+random()*.7,phase:random()*TAU}));
    const strands = Array.from({length:260}, () => ({angle:random()*TAU,start:1.09+random()*.45,end:3+random()*5,phase:random()*TAU,alpha:.025+random()*.07,thickness:.25+random()*.65}));
    const formulas = ['E = mc²','iℏ ∂ψ/∂t = Ĥψ','Rμν − ½Rgμν = 8πG Tμν / c⁴','S = kB A / 4ℓp²','rₛ = 2GM / c²','∇ · E = ρ / ε₀','Gμν + Λgμν = 8πG Tμν','P(B|A) = P(A|B) P(B) / P(A)','∫ e⁻ˣ² dx = √π','Δx Δp ≥ ℏ / 2','∂²ψ/∂t² = c²∇²ψ','∮ B · dl = μ₀I','F = Gm₁m₂ / r²','eⁱπ + 1 = 0','dτ² = dt² − dx²/c²'];
    const symbols = Array.from({length:150}, () => ({r:1.45+random()*5.8,angle:random()*TAU,text:formulas[Math.floor(random()*formulas.length)],alpha:.14+random()*.45,size:8+random()*9,phase:random()*TAU}));

    function resize() {
      width = innerWidth; height = innerHeight; ratio = Math.min(devicePixelRatio || 1, 1.65);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio,0,0,ratio,0,0);
      if (reduced) draw(performance.now());
    }
    function onPointer(event) {
      pointer.x = (event.clientX / width - .5) * 2;
      pointer.y = (event.clientY / height - .5) * 2;
    }
    function draw(now) {
      if (disposed) return;
      const elapsed = now - started;
      const seconds = reduced ? 2 : elapsed / 1000;
      const arrival = reduced ? 1 : ease(elapsed / 1460);
      const settle = reduced ? 1 : ease((elapsed - 1150) / 1100);
      const cx = mix(initial.x, width * .52, settle), cy = mix(initial.y, height * .47, settle);
      const radius = mix(7, Math.min(width,height) * .137, arrival);
      const visible = reduced ? 1 : ease((elapsed - 900) / 1100);
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = `rgba(0,0,0,${reduced ? 1 : ease((elapsed - 350) / 1000)})`; ctx.fillRect(0,0,width,height);
      for (const star of stars) {
        const glint = .77 + Math.sin(seconds * .6 + star.phase) * .23;
        ctx.fillStyle = `rgba(235,230,209,${star.alpha * visible * glint})`;
        ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.size,0,TAU); ctx.fill();
      }
      const yaw = seconds * .105 + pointer.x * .14;
      const tilt = .22 + (Math.sin(seconds * .28) + 1) * .16 + pointer.y * .08;
      const roll = -.3 + Math.sin(seconds * .19) * .47 + pointer.x * .08;
      const cr = Math.cos(roll), sr = Math.sin(roll), ct = Math.cos(tilt), st = Math.sin(tilt);
      function project(r, angle, lift = 0) {
        const a = angle + yaw, x = Math.cos(a) * r * radius, z = Math.sin(a) * r * radius;
        const y = lift * radius, depth = z * ct - y * st;
        const perspective = 11 * radius / (11 * radius - depth);
        const px = x * perspective, py = (z * st + y * ct) * perspective;
        return {x:cx + px * cr - py * sr,y:cy + px * sr + py * cr,depth,scale:perspective};
      }
      const projected = strands.map(s => {
        const points = [];
        for (let i = 0; i < 32; i++) {
          const r = mix(s.start,s.end,i/31);
          const a = s.angle + Math.log(r) * 2.1 - seconds * .36 / Math.sqrt(r);
          points.push(project(r,a,Math.sin(a * 3 + s.phase) * .024 / r));
        }
        return {strand:s,points};
      });
      function drawDisk(front) {
        ctx.globalCompositeOperation = 'screen';
        for (const {strand:s,points} of projected) {
          ctx.strokeStyle = `rgba(197,168,104,${s.alpha * visible})`; ctx.lineWidth = s.thickness;
          ctx.beginPath(); let joined = false;
          for (const p of points) {
            if ((p.depth > 0) !== front) { joined = false; continue; }
            if (joined) ctx.lineTo(p.x,p.y); else ctx.moveTo(p.x,p.y);
            joined = true;
          }
          ctx.stroke();
        }
        for (const symbol of symbols) {
          const angle = symbol.angle + Math.log(symbol.r) * 1.9 - seconds * .3 / Math.sqrt(symbol.r);
          const p = project(symbol.r,angle,Math.sin(symbol.phase+seconds*.2)*.025);
          if ((p.depth > 0) !== front || p.x < -200 || p.x > width + 200 || p.y < -100 || p.y > height + 100) continue;
          const tangent = project(symbol.r,angle + .008);
          let rotation = Math.atan2(tangent.y-p.y,tangent.x-p.x);
          if (Math.cos(rotation) < 0) rotation += Math.PI;
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(rotation);
          ctx.scale(p.scale,p.scale * (.52 + tilt));
          ctx.font = `${symbol.size}px Georgia,serif`;
          ctx.fillStyle = `rgba(231,217,173,${symbol.alpha * visible})`;
          ctx.fillText(symbol.text,0,0); ctx.restore();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      drawDisk(false);
      // The photon ring stays visible above the far side of the accretion disk.
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(roll * .34);
      const oval = .92 + Math.sin(seconds * .24) * .045;
      ctx.scale(1,oval);
      const glow = ctx.createRadialGradient(0,0,radius*.85,0,0,radius*1.65);
      glow.addColorStop(0,'rgba(255,250,229,0)'); glow.addColorStop(.18,'rgba(255,244,204,.9)');
      glow.addColorStop(.32,'rgba(223,194,125,.4)'); glow.addColorStop(.57,'rgba(131,97,43,.12)'); glow.addColorStop(1,'rgba(105,78,26,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0,0,radius*1.65,0,TAU); ctx.fill();
      for (let i = 0; i < 26; i++) {
        ctx.beginPath();
        for (let j = 0; j <= 100; j++) {
          const a = j/100*TAU;
          const ripple = Math.sin(a*6+seconds*.9+i*.44)*.007 + Math.sin(a*13-seconds*.4)*.004;
          const r = radius*(1.014+i*.009+ripple);
          const x = Math.cos(a)*r, y = Math.sin(a)*r;
          if (j===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.strokeStyle = `rgba(239,214,156,${.22*(1-i/30)})`; ctx.lineWidth = .55+i*.04; ctx.stroke();
      }
      ctx.shadowColor = '#f4dfac'; ctx.shadowBlur = radius*.065;
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0,0,radius*.975,0,TAU); ctx.fill();
      ctx.strokeStyle = '#fff7dd'; ctx.lineWidth = Math.max(1,radius*.017); ctx.stroke();
      ctx.restore();
      drawDisk(true);
      // Bright, thin foreground arcs travel across the dark core, as in the reference.
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(roll);
      ctx.scale(1,Math.max(.11,tilt*.56));
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 18; i++) {
        ctx.beginPath(); ctx.ellipse(0,radius*.55,radius*(1.15+i*.055),radius*(.73+i*.027),0,0,Math.PI);
        ctx.strokeStyle = `rgba(250,234,191,${visible * .065 * (1-i/22)})`; ctx.lineWidth = .75; ctx.stroke();
      }
      ctx.restore();
      if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
    }
    function visibility() { cancelAnimationFrame(raf); if (!document.hidden) draw(performance.now()); }
    resize(); draw(performance.now());
    window.addEventListener('resize',resize); document.addEventListener('visibilitychange',visibility);
    canvas.addEventListener('pointermove',onPointer,{passive:true});
    return {
      setReduced(value) { reduced = value; cancelAnimationFrame(raf); draw(performance.now()); },
      dispose() {
        disposed = true; cancelAnimationFrame(raf);
        window.removeEventListener('resize',resize); document.removeEventListener('visibilitychange',visibility);
        canvas.removeEventListener('pointermove',onPointer);
      }
    };
  }
})();
