(() => {
  const root = document.documentElement;
  const arrival = document.querySelector('.site-arrival');
  const frame = document.querySelector('.site-frame');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const tempo = Math.max(.1, parseFloat(getComputedStyle(root).getPropertyValue('--arrival-tempo')) || 1);
  const introClasses = ['intro-pending', 'intro-running', 'intro-released', 'intro-landed', 'intro-forming', 'intro-standing', 'intro-revealing', 'intro-handoff'];
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
    const speed = `${parseFloat(style.getPropertyValue('--flap-speed')) * tempo}s`;
    const phase = parseFloat(style.getPropertyValue('--flap-phase')) * tempo;
    dove.querySelectorAll('animateTransform').forEach(animation => {
      animation.setAttribute('dur', speed);
      animation.setAttribute('begin', `${phase - (animation.closest('.dove-wing-far') ? .11 * tempo : 0)}s`);
    });
  });
  template.remove();
  frame.inert = true;

  const carrier = arrival.querySelector('.intro-carrier .arrival-bird');
  const mark = arrival.querySelector('.arrival-mark');
  const ground = arrival.querySelector('.arrival-ground');
  const faces = mark.querySelector('.arrival-k-faces');
  const highlights = mark.querySelector('.arrival-k-highlights');
  const sourceDrawing = frame.querySelector('.scene-drawing');
  const tether = arrival.querySelector('.arrival-tether');
  const thread = tether.querySelector('path');
  const fields = [...arrival.querySelectorAll('.arrival-field')];
  const trails = arrival.querySelector('.arrival-trails');
  const trailPaths = [...trails.querySelectorAll('path')];
  const baseWidth = mark.clientWidth;
  const baseHeight = baseWidth * 460 / 410;
  const RELEASE = 1900, LAND = 2800, FORM = 2800, FORMED = 3600;
  const STAND = 3600, UPRIGHT = 4750, REVEAL = 3700, HANDOFF = 5480, END = 5780;
  const clamp = value => Math.min(1, Math.max(0, value));
  const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
  const mix = (from, to, p) => from + (to - from) * p;
  let finished = false;
  let animationFrame;
  let startedAt;
  let releasePoint;
  let markPosition;
  let target;
  let revealing = false;
  const entranceAnimations = [];

  // Every face moves from a flat letter to the matching face of the homepage K.
  const geometry = {
    'stem-side': [[[50,19],[50,19],[50,423],[50,423]], [[31,28],[82,46],[82,417],[31,399]]],
    'stem-front': [[[50,19],[110,19],[110,423],[50,423]], [[82,46],[132,28],[132,399],[82,417]]],
    'stem-top': [[[50,19],[80,19],[110,19],[80,19]], [[31,28],[81,9],[132,28],[82,46]]],
    'upper-side': [[[110,188],[245,19],[245,19],[110,188]], [[132,199],[241,62],[290,80],[180,217]]],
    'upper-front': [[[110,188],[166,188],[245,19],[313,19],[185,212],[163,235],[110,248]], [[132,199],[180,217],[290,80],[339,62],[228,217],[180,254],[132,236]]],
    'upper-top': [[[245,19],[275,19],[313,19],[275,19]], [[241,62],[290,43],[339,62],[290,80]]],
    'lower-side': [[[110,235],[110,235],[260,423],[260,423],[110,248]], [[132,236],[180,254],[321,405],[271,423],[132,273]]],
    'lower-front': [[[110,235],[175,222],[336,423],[260,423]], [[180,254],[228,236],[370,386],[321,405]]],
    'lower-end': [[[260,423],[336,423],[336,423],[260,423]], [[271,423],[321,405],[370,386],[321,405]]]
  };
  const faceNodes = [...mark.querySelectorAll('[data-face]')].map(node => ({node, points:geometry[node.dataset.face]}));
  const ink = [66,91,75];
  const paints = [...mark.querySelectorAll('[data-tone]')].map(node => ({
    node,
    color:node.dataset.tone.slice(1).match(/.{2}/g).map(part => parseInt(part,16)),
    alpha:Number(node.dataset.alpha || 1),
    stop:node.tagName.toLowerCase() === 'stop'
  }));
  function formK(p) {
    faceNodes.forEach(({node, points:[flat, glass]}) => {
      const path = flat.map(([x,y],i) => `${mix(x,glass[i][0],p)},${mix(y,glass[i][1],p)}`).join('L');
      node.setAttribute('d', `M${path}Z`);
      if (node.dataset.face.endsWith('side')) node.setAttribute('stroke-opacity', p * .6);
    });
    paints.forEach(({node,color,alpha,stop}) => {
      node.setAttribute(stop ? 'stop-color' : 'fill', `rgb(${color.map((end,i) => Math.round(mix(ink[i],end,p))).join(',')})`);
      if (stop) node.setAttribute('stop-opacity', mix(1,alpha,p));
    });
    faces.setAttribute('stroke-opacity', p);
    highlights.setAttribute('opacity', .7 * smooth((p - .35) / .65));
  }
  formK(0);

  // Reuse the homepage's rings and ribbon so the last opening frame joins it seamlessly.
  const orbitLines = [];
  fields.forEach((field,index) => {
    const defs = sourceDrawing.querySelector('defs').cloneNode(true);
    const references = new Map();
    defs.querySelectorAll('[id]').forEach(node => {
      const oldId = node.id;
      node.id = `arrival-field-${index}-${oldId}`;
      references.set(oldId,node.id);
    });
    field.append(defs);
    const groups = index === 0 ? ['.scene-halo','.scene-orbit'] : ['.scene-ribbon'];
    groups.forEach(selector => {
      const source = sourceDrawing.querySelector(selector);
      const clone = source.cloneNode(true);
      const style = getComputedStyle(source);
      clone.removeAttribute('class');
      clone.style.transform = style.transform;
      clone.style.transformOrigin = style.transformOrigin;
      clone.style.opacity = style.opacity;
      clone.querySelectorAll('[fill],[filter]').forEach(node => {
        ['fill','filter'].forEach(attribute => {
          const value = node.getAttribute(attribute);
          if (value?.startsWith('url(#')) {
            const id = value.slice(5,-1);
            if (references.has(id)) node.setAttribute(attribute,`url(#${references.get(id)})`);
          }
        });
      });
      clone.querySelectorAll('circle,ellipse,path').forEach(node => {
        if (node.tagName.toLowerCase() === 'circle' && Number(node.getAttribute('r')) < 10) return;
        if (index === 1 && node.getAttribute('fill')) return;
        orbitLines.push({node,dashes:node.getAttribute('stroke-dasharray') || 'none'});
        node.setAttribute('pathLength','1');
        node.style.strokeDasharray = '1 1';
        node.style.strokeDashoffset = '1';
      });
      field.append(clone);
    });
  });

  function measureTarget() {
    const vw = innerWidth, vh = innerHeight;
    let rectangle = sourceDrawing.getBoundingClientRect();
    let matrix = sourceDrawing.querySelector('.scene-glass').getScreenCTM();
    let orbitMatrix = sourceDrawing.getScreenCTM();
    if (!matrix || rectangle.bottom < 60 || rectangle.top > vh * .9) {
      const width = Math.min(vw * .96,950), height = Math.min(vh * .92,700);
      rectangle = {left:(vw-width)/2,top:(vh-height)/2,width,height};
      const scale = Math.min(width/900,height/700);
      matrix = new DOMMatrix([scale,0,0,scale,rectangle.left+(width-900*scale)/2,rectangle.top+(height-700*scale)/2]);
      orbitMatrix = matrix;
    }
    fields.forEach(field => {
      Object.assign(field.style,{left:`${rectangle.left}px`,top:`${rectangle.top}px`,width:`${rectangle.width}px`,height:`${rectangle.height}px`});
    });
    const center = new DOMPoint(525,335).matrixTransform(matrix);
    const orbit = new DOMPoint(435,334).matrixTransform(orbitMatrix);
    const scale = Math.hypot(matrix.a,matrix.b);
    const radius = 259 * Math.hypot(orbitMatrix.a,orbitMatrix.b);
    const x = orbit.x, y = orbit.y, r = radius;
    trails.setAttribute('viewBox',`0 0 ${vw} ${vh}`);
    const paths = [
      `M-80 ${vh*.4}C${vw*.22} ${vh*.07} ${x-r*1.1} ${y-r*.5} ${x-r*.72} ${y+r*.5}S${x+r*.45} ${y+r*.95} ${x+r*.8} ${y-r*.4}`,
      `M${vw+80} ${vh*.2}C${vw*.72} ${vh*.02} ${x+r*1.2} ${y+r*.6} ${x+r*.9} ${y+r*.25}S${x-r*.3} ${y-r*1.1} ${x-r*.75} ${y-r*.22}`,
      `M${vw*.45} -80C${vw*.78} ${vh*.14} ${x+r*.9} ${y-r} ${x+r*.3} ${y-r*.9}S${x-r*1.1} ${y+r*.1} ${x-r*.4} ${y+r*.8}`,
      `M${vw*.27} ${vh+80}C${vw*.07} ${vh*.7} ${x-r*.4} ${y+r*1.1} ${x-r*.1} ${y+r*.8}S${x+r*.9} ${y-r*.1} ${x+r*.35} ${y-r*.75}`
    ];
    trailPaths.forEach((path,i) => path.setAttribute('d',paths[i]));
    return {x:center.x,y:center.y,w:410*scale,h:460*scale,angle:Math.atan2(matrix.b,matrix.a)*180/Math.PI};
  }

  function drawMark(position) {
    markPosition = position;
    const radians = position.angle * Math.PI / 180;
    // The lower edge stays on the floor while the K pivots upright.
    const pivotOffset = position.h * .42;
    const correctionX = Math.sin(radians) * pivotOffset;
    const correctionY = (1 - Math.cos(radians)) * pivotOffset;
    Object.assign(mark.style,{
      width:`${position.w}px`,height:`${position.h}px`,
      transform:`translate3d(${position.x-position.w/2-correctionX}px,${position.y-position.h/2-correctionY}px,0) perspective(1100px) rotateZ(${position.angle}deg) rotateY(${position.yaw || 0}deg) rotateX(${position.tilt || 0}deg)`,
      opacity:'1'
    });
  }

  function revealPage() {
    revealing = true;
    // Animate the actual content along curved turns from all four edges.
    // Native animations leave the existing scene and hover animations intact.
    const entrances = [
      {selector:'.rail',from:'translate3d(-115%,14vh,0) rotate(-38deg)',via:'translate3d(-12%,-4vh,0) rotate(9deg)',origin:'100% 50%',delay:0},
      {selector:'.micro-head',from:'translate3d(-12vw,-40vh,0) rotate(32deg)',via:'translate3d(2vw,-5vh,0) rotate(-8deg)',origin:'80% 100%',delay:40},
      {selector:'.scene-topline',from:'translate3d(18vw,-45vh,0) rotate(-35deg)',via:'translate3d(-2vw,-4vh,0) rotate(7deg)',origin:'50% 100%',delay:100},
      {selector:'.scene-intro',from:'translate3d(-45vw,65vh,0) rotate(-62deg)',via:'translate3d(-6vw,6vh,0) rotate(12deg)',origin:'100% 0%',delay:55},
      {selector:'.scene-link:nth-child(1)',from:'translate3d(60vw,-45vh,0) rotate(78deg)',via:'translate3d(6vw,3vh,0) rotate(-12deg)',origin:'0% 100%',delay:0},
      {selector:'.scene-link:nth-child(2)',from:'translate3d(70vw,8vh,0) rotate(68deg)',via:'translate3d(7vw,-3vh,0) rotate(-10deg)',origin:'0% 50%',delay:45},
      {selector:'.scene-link:nth-child(3)',from:'translate3d(65vw,40vh,0) rotate(-62deg)',via:'translate3d(6vw,3vh,0) rotate(9deg)',origin:'0% 50%',delay:95},
      {selector:'.scene-link:nth-child(4)',from:'translate3d(28vw,65vh,0) rotate(-75deg)',via:'translate3d(-3vw,6vh,0) rotate(11deg)',origin:'0% 0%',delay:140},
      {selector:'.scene-bottomline,.hero-footer',from:'translate3d(12vw,55vh,0) rotate(-28deg)',via:'translate3d(-2vw,5vh,0) rotate(7deg)',origin:'50% 0%',delay:110},
      {selector:'.page-head,.contact-top',from:'translate3d(-12vw,-45vh,0) rotate(35deg)',via:'translate3d(2vw,-4vh,0) rotate(-7deg)',origin:'50% 100%',delay:25},
      {selector:'.profile-layout,.notes-layout',from:'translate3d(70vw,14vh,0) rotate(38deg)',via:'translate3d(7vw,-3vh,0) rotate(-8deg)',origin:'0% 50%',delay:65},
      {selector:'.interest-archive,.contact-main',from:'translate3d(-65vw,18vh,0) rotate(-34deg)',via:'translate3d(-6vw,-3vh,0) rotate(8deg)',origin:'100% 50%',delay:65},
      {selector:'.contact-bottom,footer',from:'translate3d(12vw,55vh,0) rotate(-30deg)',via:'translate3d(-2vw,4vh,0) rotate(6deg)',origin:'50% 0%',delay:110}
    ];
    entrances.forEach(({selector,from,via,origin,delay}) => {
      frame.querySelectorAll(selector).forEach(node => {
        const bounds = node.getBoundingClientRect();
        if (bounds.bottom <= 0 || bounds.top >= innerHeight || bounds.right <= 0 || bounds.left >= innerWidth) return;
        const computed = getComputedStyle(node).transform;
        const base = computed === 'none' ? '' : computed;
        entranceAnimations.push(node.animate([
          {opacity:0,transform:`${from} ${base}`,transformOrigin:origin,offset:0},
          {opacity:.9,transform:`${via} ${base}`,transformOrigin:origin,offset:.58},
          {opacity:1,transform:base || 'none',transformOrigin:origin,offset:1}
        ],{duration:1700*tempo,delay:delay*tempo,easing:'cubic-bezier(.18,.72,.24,1)',fill:'both'}));
      });
    });
    root.classList.add('intro-revealing');
  }

  function tick(now) {
    if (finished) return;
    const elapsed = (now - startedAt) / tempo;
    if (elapsed >= END) { finish(); return; }
    const vw = innerWidth, vh = innerHeight;
    if (!releasePoint) {
      const matrix = carrier.getScreenCTM();
      if (matrix) {
        const beak = new DOMPoint(33,69).matrixTransform(matrix);
        drawMark({x:beak.x+baseWidth*.85,y:beak.y+baseHeight*.55+Math.sin(elapsed/220)*5,angle:-9+Math.sin(elapsed/280)*7,w:baseWidth,h:baseHeight});
        const angle = markPosition.angle * Math.PI/180;
        const localX = (110/410-.5)*baseWidth, localY = (19/460-.5)*baseHeight;
        const anchorX = markPosition.x + localX*Math.cos(angle)-localY*Math.sin(angle);
        const anchorY = markPosition.y + localX*Math.sin(angle)+localY*Math.cos(angle);
        tether.setAttribute('viewBox',`0 0 ${vw} ${vh}`);
        thread.setAttribute('d',`M${beak.x} ${beak.y}Q${(beak.x+anchorX)/2} ${Math.max(beak.y,anchorY)+16} ${anchorX} ${anchorY}`);
        tether.style.opacity = '1';
      }
      if (elapsed >= RELEASE && markPosition) {
        releasePoint = {...markPosition};
        root.classList.add('intro-released');
      }
    }
    if (releasePoint && elapsed < LAND) {
      const p = clamp((elapsed-RELEASE)/(LAND-RELEASE));
      const drift = 1-Math.pow(1-p,2);
      const fall = p<.84 ? Math.pow(p/.84,2) : 1;
      const bounce = p<.84 ? 0 : -Math.sin((p-.84)/.16*Math.PI)*8;
      drawMark({x:mix(releasePoint.x,vw*.52,drift),y:mix(releasePoint.y,vh*.72-baseHeight*.42,fall)+bounce,angle:releasePoint.angle*(1-drift)+360*drift,tilt:76*smooth((p-.25)/.65),w:baseWidth,h:baseHeight});
    }
    if (releasePoint && elapsed >= FORM) {
      if (!target) {
        target = measureTarget();
        root.classList.add('intro-landed','intro-forming');
      }
      const form = smooth((elapsed-FORM)/(FORMED-FORM));
      const stand = smooth((elapsed-STAND)/(UPRIGHT-STAND));
      const width = mix(baseWidth,target.w,form);
      const height = mix(baseHeight,target.h,form);
      const floorX = mix(vw*.52,target.x,stand);
      const floorY = mix(vh*.72,target.y+target.h*.42,stand);
      formK(form);
      drawMark({x:floorX,y:floorY-height*.42,w:width,h:height,tilt:76*(1-stand),yaw:-360*stand,angle:mix(0,target.angle,stand)+22*Math.sin(stand*Math.PI)});
      const floorWidth = Math.min(vw*.9,Math.max(300,target.w*1.6));
      const floorHeight = floorWidth*170/600;
      Object.assign(ground.style,{left:`${floorX-floorWidth/2}px`,top:`${floorY-floorHeight*110/170}px`,width:`${floorWidth}px`,height:`${floorHeight}px`,opacity:String((1-smooth((stand-.15)/.7))*.8)});
      if (elapsed >= STAND) root.classList.add('intro-standing');
      const lineProgress = smooth((elapsed-STAND)/1000);
      fields.forEach(field => { field.style.opacity = String(lineProgress); });
      orbitLines.forEach(({node,dashes}) => {
        node.style.strokeDasharray = lineProgress > .995 ? dashes : '1 1';
        node.style.strokeDashoffset = String(1-lineProgress);
      });
      trailPaths.forEach((path,i) => { path.style.strokeDashoffset = String(1-smooth((elapsed-STAND-i*55)/850)); });
      trails.style.opacity = String(lineProgress * (1-smooth((elapsed-4700)/(HANDOFF-4700))) * .5);
    }
    if (elapsed >= REVEAL && !revealing) revealPage();
    if (elapsed >= HANDOFF) root.classList.add('intro-handoff');
    animationFrame = requestAnimationFrame(tick);
  }

  function finish(fromSkip = false) {
    if (finished) return;
    finished = true;
    clearTimeout(window.arrivalFallback);
    cancelAnimationFrame(animationFrame);
    entranceAnimations.forEach(animation => animation.cancel());
    root.classList.remove(...introClasses);
    frame.inert = false;
    arrival.remove();
    window.removeEventListener('keydown',skipWithKeyboard);
    window.removeEventListener('pagehide',onPageHide);
    window.removeEventListener('resize',onResize);
    reducedMotion.removeEventListener('change',onMotionChange);
    if (fromSkip) frame.querySelector('.identity')?.focus({preventScroll:true});
  }
  function skipWithKeyboard(event) { if (event.key === 'Escape') { event.preventDefault(); finish(true); } }
  function onMotionChange(event) { if (event.matches) finish(); }
  function onPageHide() { finish(); }
  function onResize() { if (target) finish(); }
  arrival.querySelector('.arrival-skip').addEventListener('click',() => finish(true));
  window.addEventListener('keydown',skipWithKeyboard);
  window.addEventListener('pagehide',onPageHide);
  window.addEventListener('resize',onResize);
  reducedMotion.addEventListener('change',onMotionChange);
  animationFrame = requestAnimationFrame(now => {
    startedAt = now;
    root.classList.add('intro-running');
    animationFrame = requestAnimationFrame(tick);
  });
})();
