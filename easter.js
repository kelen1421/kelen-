(() => {
  const frame = document.querySelector('.site-frame');
  if (!frame) return;
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  const ABSORPTION_MS = 1540;
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const ease = n => { const p = clamp(n); return p * p * (3 - 2 * p); };
  const mix = (a, b, p) => a + (b - a) * p;
  let samples = [], lastPoint, gestureFrame, triggered = false, active;

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
      if (hole) { openPortal(); return; }
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
    if (triggered || active || event.pointerType !== 'mouse' || document.hidden || root.classList.contains('intro-pending') ||
        document.querySelector('dialog[open]')) return;
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

  function openPortal() {
    if (active || triggered) return;
    // A new page visit gets one discovery; Escape never rearms the gesture.
    triggered = true;
    resetGesture();
    const hole = {x:innerWidth*.5,y:innerHeight*.48};
    const previousFocus = document.activeElement;
    const wasInert = frame.inert;
    const scrollPosition = {left:scrollX, top:scrollY, behavior:'instant'};
    const portal = document.createElement('section');
    portal.className = 'vortex-portal';
    portal.setAttribute('role', 'dialog'); portal.setAttribute('aria-modal', 'true');
    portal.setAttribute('aria-label', '隐藏彩蛋：公式与黑洞。按 Escape 返回个人档案。');
    portal.innerHTML = '<svg class="vortex-liquid-defs" width="0" height="0" aria-hidden="true"><defs><filter id="vortex-liquid-filter" x="-50%" y="-100%" width="200%" height="300%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".008 .013" numOctaves="2" seed="11" result="flow"/><feDisplacementMap in="SourceGraphic" in2="flow" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg><canvas class="vortex-canvas" aria-hidden="true"></canvas><div class="vortex-caption">KELEN / EVENT HORIZON<span>SECRET ARCHIVE · 002</span></div><button class="vortex-exit" type="button" aria-label="退出彩蛋，返回网页"><kbd>ESC</kbd> 返回档案 ↗</button><div class="vortex-note">你找到了另一个宇宙。<small>移动鼠标，拨动水面 · ESC 返回档案</small></div>';
    document.body.append(portal);
    frame.inert = true; root.classList.add('vortex-open');
    const exit = portal.querySelector('.vortex-exit');
    const animations = [];
    const liquidFields = [];
    const started = performance.now();
    let liquidFrame;
    active = {portal, animations};
    const scene = createUniverse(portal.querySelector('canvas'), started, motion.matches);
    const duration = motion.matches ? 180 : ABSORPTION_MS;

    if (!motion.matches) {
      const parts = frame.querySelectorAll('.identity,.rail-rule,.rail-meta,.side-nav a,.rail-bottom,.micro-head,.scene-topline,.scene-visual,.scene-intro,.scene-link,.scene-bottomline,.hero-footer,.page-head,.profile-stamp,.profile-copy,.archive-topbar,.archive-stage,.archive-footer,.notes-layout,.contact-top,.contact-main,.contact-bottom,footer');
      const baseFilter = portal.querySelector('#vortex-liquid-filter');
      let index = 0;
      for (const node of parts) {
        const r = node.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
        const dx = hole.x - r.left - r.width / 2, dy = hole.y - r.top - r.height / 2;
        const base = getComputedStyle(node).transform;
        const original = base === 'none' ? '' : base;
        const bend = Math.random()*2-1;
        const spin = 300+Math.random()*220;
        const stretch = 1.1+Math.random()*.65;
        const compress = .4+Math.random()*.4;
        const delay = Math.random()*70;
        const partDuration = 1250+Math.random()*120;
        const direction = Math.atan2(dy,dx) * 180 / Math.PI;
        const priorFilter = getComputedStyle(node).filter;
        const filter = baseFilter.cloneNode(true);
        filter.id = `vortex-liquid-part-${index}`;
        const turbulence = filter.querySelector('feTurbulence');
        const displacement = filter.querySelector('feDisplacementMap');
        const erosion = document.createElementNS('http://www.w3.org/2000/svg','feMorphology');
        erosion.setAttribute('in','SourceGraphic'); erosion.setAttribute('operator','erode');
        erosion.setAttribute('radius','0'); erosion.setAttribute('result','melt');
        filter.insertBefore(erosion,displacement); displacement.setAttribute('in','melt');
        displacement.setAttribute('yChannelSelector','B');
        turbulence.setAttribute('seed',String(1+Math.floor(Math.random()*1000)));
        baseFilter.parentNode.append(filter);
        liquidFields.push({turbulence,displacement,erosion,delay,duration:partDuration,amount:90+Math.random()*130,fx:.006+Math.random()*.008,fy:.009+Math.random()*.013,phase:Math.random()*TAU,erode:.35+Math.random()*.9});
        const liquid = `url(#${filter.id}) ${priorFilter === 'none' ? '' : priorFilter}`;
        animations.push(node.animate([
          {transform:original || 'none', filter:`${liquid} blur(0px)`, opacity:1, offset:0},
          {transform:`translate(${dx * .025}px,${dy * .025}px) rotate(${direction}deg) scale(1.08,.97) rotate(${-direction}deg) ${original}`, filter:`${liquid} blur(.15px)`, opacity:1, offset:.22},
          {transform:`translate(${dx * .2 - dy * .18 * bend}px,${dy * .2 + dx * .18 * bend}px) rotate(${10+bend*27}deg) rotate(${direction}deg) scale(${stretch},${compress}) skew(${bend*31}deg,${bend*8}deg) rotate(${-direction}deg) ${original}`, filter:`${liquid} blur(.35px)`, opacity:1, offset:.46+Math.random()*.08},
          {transform:`translate(${dx * .66 - dy * .14 * bend}px,${dy * .66 + dx * .14 * bend}px) rotate(${100+bend*85}deg) rotate(${direction}deg) scale(${.45+Math.random()*.7},${.05+Math.random()*.16}) skewX(${bend*43}deg) rotate(${-direction}deg) ${original}`, filter:`${liquid} blur(.7px)`, opacity:.65+Math.random()*.2, offset:.76+Math.random()*.08},
          {transform:`translate(${dx}px,${dy}px) rotate(${spin}deg) scale(.001) ${original}`, filter:`${liquid} blur(1px)`, opacity:0, offset:1}
        ], {duration:partDuration,delay,easing:'cubic-bezier(.4,.06,.76,.48)',fill:'both'}));
        index++;
      }
      function liquefy(now) {
        for (const field of liquidFields) {
          const t = clamp((now-started-field.delay)/field.duration);
          field.displacement.setAttribute('scale',String(field.amount*ease(t)*(.85+.15*Math.sin(t*Math.PI))));
          field.turbulence.setAttribute('baseFrequency',`${field.fx*(1+.18*Math.sin(t*5+field.phase))} ${field.fy*(1+.16*Math.cos(t*4+field.phase))}`);
          field.erosion.setAttribute('radius',String(field.erode*ease((t-.4)/.6)));
        }
        if (now-started < duration) liquidFrame = requestAnimationFrame(liquefy);
      }
      liquidFrame = requestAnimationFrame(liquefy);
    }
    const bounds = frame.getBoundingClientRect();
    const origin = `${hole.x - bounds.left}px ${hole.y - bounds.top}px`;
    animations.push(frame.animate(motion.matches ? [{opacity:1},{opacity:0}] : [
      {transform:'none', transformOrigin:origin, opacity:1, offset:0},
      {transform:'none', transformOrigin:origin, opacity:1, offset:.34},
      {transform:'rotate(8deg) scale(.98)', transformOrigin:origin, opacity:1, offset:.58},
      {transform:'rotate(38deg) scale(.65)', transformOrigin:origin, opacity:.65, offset:.8},
      {transform:'rotate(75deg) scale(.002)', transformOrigin:origin, opacity:0, offset:1}
    ], {duration, easing:'cubic-bezier(.55,.03,.77,.43)', fill:'both'}));
    const readyTimer = setTimeout(() => { portal.classList.add('vortex-ready'); exit.focus({preventScroll:true}); }, duration);

    function closePortal(restoreFocus = true) {
      if (!active) return;
      clearTimeout(readyTimer); cancelAnimationFrame(liquidFrame); scene.dispose();
      animations.forEach(a => a.cancel());
      frame.inert = wasInert; root.classList.remove('vortex-open');
      portal.remove(); active = undefined;
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

  function createWaterSurface(source) {
    // A local depression bends the scene without storing a wake behind the cursor.
    const context = source.getContext('2d');
    const output = document.createElement('canvas');
    const gl = output.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:true});
    const fallback = {
      canvas:source,context,refracts:false,
      resize(w,h,ratio) { source.width=Math.round(w*ratio); source.height=Math.round(h*ratio); context.setTransform(ratio,0,0,ratio,0,0); },
      render() {},dispose() {}
    };
    if (!gl) return fallback;
    const vertexSource = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
    const fragmentSource = `
      precision highp float;
      varying vec2 uv;
      uniform sampler2D scene;
      uniform vec2 dimensions,pointer;
      uniform float strength,coreRadius;
      void main(){
        vec2 distance=(uv-pointer)*dimensions;
        float contactRadius=clamp(min(dimensions.x,dimensions.y)*.12,64.,92.);
        float pressure=exp(-dot(distance,distance)/(2.*contactRadius*contactRadius))*strength;
        vec2 push=distance/dimensions*pressure*.36;
        float freeSurface=smoothstep(coreRadius*.96,coreRadius*1.4,length((uv-vec2(.5,.52))*dimensions));
        vec2 refraction=-push*freeSurface;
        vec4 color=texture2D(scene,clamp(uv+refraction,vec2(.001),vec2(.999)));
        gl_FragColor=color;
      }`;
    let program;
    function shader(type,code) {
      const value=gl.createShader(type); gl.shaderSource(value,code); gl.compileShader(value);
      if (!gl.getShaderParameter(value,gl.COMPILE_STATUS)) { gl.deleteShader(value); throw new Error('Water shader unavailable'); }
      return value;
    }
    try {
      const vertex=shader(gl.VERTEX_SHADER,vertexSource),fragment=shader(gl.FRAGMENT_SHADER,fragmentSource);
      program=gl.createProgram(); gl.attachShader(program,vertex); gl.attachShader(program,fragment); gl.linkProgram(program);
      gl.deleteShader(vertex); gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Water surface unavailable');
    } catch (_) { if (program) gl.deleteProgram(program); return fallback; }
    gl.useProgram(program);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    function texture(unit,name) {
      const value=gl.createTexture(); gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,value);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(program,name),unit); return value;
    }
    const sceneTexture=texture(0,'scene');
    const dimensions=gl.getUniformLocation(program,'dimensions'),cursor=gl.getUniformLocation(program,'pointer');
    const strength=gl.getUniformLocation(program,'strength'),coreRadius=gl.getUniformLocation(program,'coreRadius');
    let width,height;
    output.className=source.className+' vortex-water-surface'; output.setAttribute('aria-hidden','true'); source.replaceWith(output);
    return {
      canvas:output,context,refracts:true,
      resize(w,h,ratio) {
        width=w; height=h; source.width=output.width=Math.round(w*ratio); source.height=output.height=Math.round(h*ratio);
        context.setTransform(ratio,0,0,ratio,0,0); gl.viewport(0,0,output.width,output.height);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,sceneTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,source.width,source.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
        gl.uniform2f(dimensions,w,h);
      },
      render(now,pointer,radius) {
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,sceneTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
        gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,source);
        gl.uniform2f(cursor,pointer.x/width,1-pointer.y/height); gl.uniform1f(strength,pointer.strength); gl.uniform1f(coreRadius,radius);
        gl.drawArrays(gl.TRIANGLES,0,6);
      },
      dispose() {gl.deleteTexture(sceneTexture);gl.deleteBuffer(buffer);gl.deleteProgram(program);}
    };
  }

  function createUniverse(canvas, started, reduced) {
    const surface = createWaterSurface(canvas);
    canvas = surface.canvas;
    const ctx = surface.context;
    let width, height, ratio, raf, disposed = false, lastDraw;
    const pointer = {x:0,y:0,strength:0};
    const targetPointer = {x:0,y:0,moved:-Infinity};
    let pointerSeen = false;
    let seed = 1421;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const stars = Array.from({length:205}, () => ({x:random(),y:random(),size:.3+random()*1.3,alpha:.15+random()*.7,phase:random()*TAU}));
    const strands = Array.from({length:260}, () => ({angle:random()*TAU,start:1.09+random()*.45,end:3+random()*5,phase:random()*TAU,alpha:.025+random()*.07,thickness:.25+random()*.65}));
    const formulas = ['E = mc²','iℏ ∂ψ/∂t = Ĥψ','Rμν − ½Rgμν = 8πG Tμν / c⁴','S = kB A / 4ℓp²','rₛ = 2GM / c²','∇ · E = ρ / ε₀','Gμν + Λgμν = 8πG Tμν','P(B|A) = P(A|B) P(B) / P(A)','∫ e⁻ˣ² dx = √π','Δx Δp ≥ ℏ / 2','∂²ψ/∂t² = c²∇²ψ','∮ B · dl = μ₀I','F = Gm₁m₂ / r²','eⁱπ + 1 = 0','dτ² = dt² − dx²/c²'];
    const symbols = Array.from({length:150}, () => ({outer:4.2+random()*3.6,offset:random(),duration:44+random()*24,angle:random()*TAU,text:formulas[Math.floor(random()*formulas.length)],alpha:.14+random()*.45,size:8+random()*9,phase:random()*TAU}));

    function resize() {
      width = innerWidth; height = innerHeight; ratio = Math.min(devicePixelRatio || 1, 1.65);
      surface.resize(width,height,ratio);
      if (reduced) draw(performance.now());
    }
    function onPointer(event) {
      if (reduced || event.pointerType !== 'mouse') return;
      const now = performance.now();
      targetPointer.x = event.clientX; targetPointer.y = event.clientY;
      targetPointer.moved = now;
      if (!pointerSeen) { pointer.x = targetPointer.x; pointer.y = targetPointer.y; pointerSeen = true; }
    }
    function releasePointer() {
      targetPointer.moved = -Infinity;
      pointerSeen = false;
    }
    function draw(now) {
      if (disposed) return;
      const elapsed = now - started;
      const seconds = reduced ? 2 : elapsed / 1000;
      const delta = Math.min(64,now-(lastDraw ?? now)); lastDraw = now;
      const follow = 1-Math.exp(-delta/24);
      pointer.x = mix(pointer.x,targetPointer.x,follow); pointer.y = mix(pointer.y,targetPointer.y,follow);
      const pressure = ease(1-(now-targetPointer.moved)/300);
      pointer.strength = mix(pointer.strength,pressure,1-Math.exp(-delta/40));
      // The core and its axis stay anchored; only the surrounding matter moves.
      const cx = width*.5, cy = height*.48;
      const fullRadius = Math.min(width,height)*.137;
      const radius = reduced ? fullRadius : Math.max(.1,fullRadius*ease(elapsed/380)*mix(.58,1,ease(elapsed/1160)));
      const visible = reduced ? 1 : ease(elapsed / 1500);
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = `rgba(0,0,0,${reduced ? 1 : ease((elapsed - 680) / (ABSORPTION_MS - 680))})`; ctx.fillRect(0,0,width,height);
      for (const star of stars) {
        const glint = .77 + Math.sin(seconds * .6 + star.phase) * .23;
        ctx.fillStyle = `rgba(235,230,209,${star.alpha * visible * glint})`;
        ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.size,0,TAU); ctx.fill();
      }
      const yaw = seconds * .018;
      const tilt = .43;
      const roll = -.32;
      const cr = Math.cos(roll), sr = Math.sin(roll), ct = Math.cos(tilt), st = Math.sin(tilt);
      function disturb(p) {
        if (surface.refracts || pointer.strength < .005) return p;
        const dx = p.x-pointer.x, dy = p.y-pointer.y;
        const distance = Math.hypot(dx,dy);
        const outsideCore = ease((Math.hypot(p.x-cx,p.y-cy)-radius*1.08)/(radius*.65));
        const contactRadius = clamp(Math.min(width,height)*.12,64,92);
        const falloff = Math.exp(-distance*distance/(2*contactRadius*contactRadius))*outsideCore*pointer.strength;
        return {...p,x:p.x + dx*falloff*.36,y:p.y + dy*falloff*.36};
      }
      function project(r, angle, lift = 0) {
        const a = angle + yaw, x = Math.cos(a) * r * radius, z = Math.sin(a) * r * radius;
        const y = lift * radius, depth = z * ct - y * st;
        const perspective = 11 * radius / (11 * radius - depth);
        const px = x * perspective, py = (z * st + y * ct) * perspective;
        return disturb({x:cx + px * cr - py * sr,y:cy + px * sr + py * cr,depth,scale:perspective});
      }
      const projected = strands.map(s => {
        const points = [];
        for (let i = 0; i < 32; i++) {
          const r = mix(s.start,s.end,i/31);
          const a = s.angle + Math.log(r) * 2.1 - seconds * .07;
          points.push(project(r,a,Math.sin(a * 3 + s.phase) * .024 / r));
        }
        return {strand:s,points};
      });
      // Each formula follows an inward spiral, then fades before returning at the outer edge.
      const flowingSymbols = symbols.map(symbol => {
        const progress = (symbol.offset + seconds / symbol.duration) % 1;
        const r = Math.pow(mix(Math.pow(symbol.outer,1.5),Math.pow(.38,1.5),progress),2/3);
        const angle = symbol.angle + Math.log(r) * 2.1 - seconds * .07;
        const lift = Math.sin(symbol.phase + seconds * .06) * .025;
        const p = project(r,angle,lift);
        const nextR = r * .994;
        const tangent = project(nextR,angle + Math.log(nextR/r) * 2.1,lift);
        let rotation = Math.atan2(tangent.y-p.y,tangent.x-p.x);
        if (Math.cos(rotation) < 0) rotation += Math.PI;
        const fade = ease(progress/.07) * ease((r-.38)/1.05);
        const shrink = .22 + .78 * Math.pow(r/symbol.outer,.65);
        return {symbol,p,rotation,fade,shrink};
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
        for (const {symbol,p,rotation,fade,shrink} of flowingSymbols) {
          if ((p.depth > 0) !== front || p.x < -200 || p.x > width + 200 || p.y < -100 || p.y > height + 100) continue;
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(rotation);
          ctx.scale(p.scale * shrink,p.scale * shrink * (.52 + tilt));
          ctx.font = `${symbol.size}px Georgia,serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(231,217,173,${symbol.alpha * visible * fade})`;
          ctx.fillText(symbol.text,0,0); ctx.restore();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      drawDisk(false);
      // The photon ring stays visible above the far side of the accretion disk.
      ctx.save(); ctx.translate(cx,cy);
      const oval = .96;
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
      surface.render(now,pointer,radius);
      if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
    }
    function visibility() { cancelAnimationFrame(raf); releasePointer(); if (!document.hidden) draw(performance.now()); }
    resize(); draw(performance.now());
    window.addEventListener('resize',resize); document.addEventListener('visibilitychange',visibility);
    canvas.addEventListener('pointermove',onPointer,{passive:true});
    canvas.addEventListener('pointerleave',releasePointer);
    window.addEventListener('blur',releasePointer);
    return {
      setReduced(value) { reduced = value; cancelAnimationFrame(raf); draw(performance.now()); },
      dispose() {
        disposed = true; cancelAnimationFrame(raf);
        window.removeEventListener('resize',resize); document.removeEventListener('visibilitychange',visibility);
        canvas.removeEventListener('pointermove',onPointer);
        canvas.removeEventListener('pointerleave',releasePointer);
        window.removeEventListener('blur',releasePointer);
        surface.dispose();
      }
    };
  }
})();
