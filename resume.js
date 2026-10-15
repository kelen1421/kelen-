(() => {
  const column = document.querySelector('.resume-column');
  if (!column) return;
  const $ = selector => column.querySelector(selector);
  const $$ = selector => [...column.querySelectorAll(selector)];
  const steps = [{"title": "读稿与结构梳理", "text": "标出核心问句、概念顺序、转折与回扣。先确认观众需要哪些前置理解，再判断哪些段落可以压缩。", "check": "检查：删掉这段，下一段还能不能理解？", "code": "READ", "x": 270, "y": 254}, {"title": "分镜与素材准备", "text": "让每段旁白对应具体的画面任务。需要展示关系时用图示，需要认识对象时用实物或素材，并整理来源与署名要求。", "check": "检查：画面是在解释内容，还是只提供气氛？", "code": "STORYBOARD", "x": 580, "y": 300}, {"title": "初剪与节奏搭建", "text": "先搭建完整的解释路径，再处理段落衔接和信息密度。复杂推理之后留出消化空间，转场与重点强调服务于内容推进。", "check": "检查：观众是否知道这一段在解决什么问题？", "code": "ROUGH CUT", "x": 910, "y": 232}, {"title": "声音、字幕与精剪", "text": "整理旁白，安排音乐与音效，平衡音量；核对术语、数字及字幕对应关系，让画面与声音形成一致的解释节奏。", "check": "检查：音乐不遮住旁白，字幕不制造新的歧义。", "code": "FINE CUT", "x": 1260, "y": 302}, {"title": "反馈修改与成片交付", "text": "配合创作者处理内容反馈，逐轮检查逻辑、画面和声音。完成最终输出，并整理工程文件与素材，便于后续修改及系列内容复用。", "check": "检查：版本清晰、素材可追溯、成片播放正常。", "code": "DELIVERY", "x": 1610, "y": 260}];
  const viewport = $('#cv-journey-viewport');
  const world = $('#cv-journey-world');
  const journeyPanel=$('.journey-panel');
  journeyPanel.classList.add('journey-callout');viewport.append(journeyPanel);
  const previous = $('[data-resume-prev]');
  const next = $('[data-resume-next]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let position = 0, target = 0, current = -1, frame = 0, lastTime = 0;
  function select(index) {
    if (index === current) return;
    current = index;
    const step = steps[index], number = String(index + 1).padStart(2,'0');
    $$('[data-step]').forEach(node => {
      const active = Number(node.dataset.step) === index;
      node.classList.toggle('is-active',active);
      if (active) node.setAttribute('aria-current','step');
      else node.removeAttribute('aria-current');
    });
    $$('[data-resume-step]').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.resumeStep) === index)));
    $$('[data-mini]').forEach(dot => dot.classList.toggle('selected',Number(dot.dataset.mini) === index));
    $$('[data-segment]').forEach(path => path.classList.toggle('completed',Number(path.dataset.segment) < index));
    $('#cv-journey-code').textContent = `${number} / ${step.code}`;
    $('#cv-journey-title').textContent = step.title;
    $('#cv-journey-description').textContent = step.text;
    $('#cv-journey-check').textContent = step.check;
    window.KelenVisuals?.journey(index, step);
    $('#cv-journey-count').textContent = `${number} / 05`;
    $('#cv-journey-letter').textContent = ['R','S','E','A','F'][index];
    previous.disabled = index === 0;
    next.disabled = index === 4;
    const panel = $('.journey-panel');
    panel.classList.remove('panel-arriving');
    void panel.offsetWidth;
    panel.classList.add('panel-arriving');
  }
  function paint() {
    const scale = viewport.clientWidth < 680 ? .72 : .86;
    const low = Math.floor(position), high = Math.min(4,low + 1), mix = position - low;
    const x = steps[low].x + (steps[high].x - steps[low].x) * mix;
    const y = steps[low].y + (steps[high].y - steps[low].y) * mix;
    const cameraX = viewport.clientWidth * .29 - x * scale;
    const narrow = viewport.clientWidth < 640;
    const sceneY = (270-y)*scale*.22 + (narrow ? -70 : 0);
    world.style.setProperty('--scene-scale',scale);
    world.style.setProperty('--far-drift',`${-cameraX * .12 / scale}px`);
    world.style.setProperty('--near-drift',`${cameraX * .055 / scale}px`);
    world.style.transform = `translate3d(${cameraX}px,${sceneY}px,0)`;
    $('#cv-journey-progress').style.transform = `scaleX(${position / 4})`;
    $$('[data-step]').forEach(node => {
      const step = steps[Number(node.dataset.step)];
      node.style.left = `${step.x * scale}px`;
      node.style.top = `${step.y * scale}px`;
    });
    select(Math.round(position));
    const active=steps[Math.round(position)],panelWidth=journeyPanel.offsetWidth;
    const nodeX=active.x*scale+cameraX,nodeY=active.y*scale+sceneY-8;
    journeyPanel.style.left=`${Math.max(14,Math.min(viewport.clientWidth-panelWidth-14,nodeX+112))}px`;
    const panelTop=narrow ? Math.max(140,nodeY+35) : Math.max(24,nodeY-150);
    journeyPanel.style.top=`${Math.max(18,Math.min(viewport.clientHeight-journeyPanel.offsetHeight-18,panelTop))}px`;
  }
  function tick(time) {
    const dt = lastTime ? Math.min(50,time - lastTime) : 16;
    lastTime = time;
    position += (target - position) * (motion.matches ? 1 : 1 - Math.exp(-dt / 105));
    if (Math.abs(target - position) < .001) position = target;
    paint();
    if (position !== target) frame = requestAnimationFrame(tick);
    else { frame = 0; lastTime = 0; }
  }
  function move(value) {
    target = Math.max(0,Math.min(4,value));
    if (!frame) frame = requestAnimationFrame(tick);
  }
  $$('[data-resume-step]').forEach(button => button.addEventListener('click',() => move(Number(button.dataset.resumeStep))));
  previous.addEventListener('click',() => move(Math.round(target)-1));
  next.addEventListener('click',() => move(Math.round(target)+1));
  viewport.addEventListener('wheel',event => {
    if (event.ctrlKey) return;
    let delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    if (event.deltaMode === 2) delta *= viewport.clientHeight;
    if (Math.abs(delta) < 1 || (target <= 0 && delta < 0) || (target >= 4 && delta > 0)) return;
    event.preventDefault();
    move(target + Math.max(-250,Math.min(250,delta)) * .0038);
  },{passive:false});
  viewport.addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'Home' ? 0 : event.key === 'End' ? 4 : Math.round(target) + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1));
  });
  let touch;
  viewport.addEventListener('touchstart',event => {
    if (event.touches.length === 1) touch = {x:event.touches[0].clientX,y:event.touches[0].clientY,target};
  },{passive:true});
  viewport.addEventListener('touchmove',event => {
    if (!touch || event.touches.length !== 1) return;
    const dx = touch.x-event.touches[0].clientX, dy = touch.y-event.touches[0].clientY;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)*1.2) {
      event.preventDefault();move(touch.target + dx / 190);
    }
  },{passive:false});
  viewport.addEventListener('touchend',() => {touch = null;},{passive:true});
  viewport.addEventListener('touchcancel',() => {touch = null;},{passive:true});
  new ResizeObserver(paint).observe(viewport);
  motion.addEventListener('change',() => move(target));
  // Stagger the work surfaces on entry, then keep their own diagrams alive in view.
  const craftCards = $$('.resume-craft details');
  // Each surface lifts on hover and reveals its explanation underneath.
  craftCards.forEach(card => {
    const summary=card.querySelector('summary'),paragraph=card.querySelector('p');
    let closeTimer,pointerInside=false,pinned=false;
    card.open=false;
    function measure() {
      const lift=motion.matches?0:28,faceHeight=summary.offsetHeight;
      card.style.setProperty('--craft-face-lift',card.classList.contains('is-craft-open')?`${-lift}px`:'0px');
      paragraph.style.top=`${faceHeight-lift+13}px`;
      card.style.height=`${faceHeight+(card.classList.contains('is-craft-open')?paragraph.scrollHeight+13-lift:0)}px`;
    }
    function show() {
      clearTimeout(closeTimer);card.open=true;card.classList.add('is-craft-open');measure();
    }
    function hide(force=false) {
      if(!force&&(pinned||pointerInside||summary.matches(':focus-visible')))return;
      card.classList.remove('is-craft-open');measure();
      closeTimer=setTimeout(()=>{if(!card.classList.contains('is-craft-open'))card.open=false;},motion.matches?0:330);
    }
    card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){pointerInside=true;show();}});
    card.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'){pointerInside=false;hide();}});
    summary.addEventListener('click',event=>{
      event.preventDefault();
      if(matchMedia('(hover: none)').matches||event.detail===0){pinned=!pinned;pinned?show():hide(true);}
      else show();
    });
    card.addEventListener('focusin',()=>{if(summary.matches(':focus-visible'))show();});
    card.addEventListener('focusout',()=>setTimeout(()=>{if(!card.contains(document.activeElement))hide();},0));
    new ResizeObserver(measure).observe(summary);
    motion.addEventListener('change',measure);
    document.fonts.ready.then(measure);measure();
  });
  const animatedParts = [$('.resume-project'),$('.resume-role h3'),...$$('.resume-role>p:not(.overline)'),...craftCards];
  const visibleMotion = new Set();
  function syncCraftMotion() {
    column.classList.toggle('craft-running',visibleMotion.size > 0 && !motion.matches && !document.hidden);
  }
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (document.documentElement.classList.contains('intro-pending')) continue;
      const node = entry.target;
      node.classList.add('craft-revealed');
      if (!motion.matches) {
        const index = craftCards.indexOf(node);
        const card = index >= 0;
        node.animate([
          {opacity:0,transform:card ? `translateY(38px) rotateX(16deg) rotateZ(${index%2 ? 3 : -3}deg) scale(.94)` : 'translateX(32px) translateY(10px)'},
          {opacity:1,transform:'none'}
        ],{duration:card ? 780 : 650,delay:card ? (index%3)*95 : Math.max(0,animatedParts.indexOf(node))*80,easing:'cubic-bezier(.2,.8,.2,1)'});
      }
      reveal.unobserve(node);
    }
  },{threshold:.08,rootMargin:'0px 0px -18px 0px'});
  animatedParts.forEach(node => {if(node)reveal.observe(node);});
  column.classList.add('resume-motion-ready');
  if (document.documentElement.classList.contains('intro-pending')) {
    const arrivalWait = new MutationObserver(() => {
      if (document.documentElement.classList.contains('intro-pending')) return;
      animatedParts.forEach(node => {
        if (node && !node.classList.contains('craft-revealed')) {reveal.unobserve(node);reveal.observe(node);}
      });
      craftCards.forEach(card => {if(!manualCards.has(card)){copyReveal.unobserve(card);copyReveal.observe(card);}});
      arrivalWait.disconnect();
    });
    arrivalWait.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  }
  const activity = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting)visibleMotion.add(entry.target);else visibleMotion.delete(entry.target);
    });
    syncCraftMotion();
  },{threshold:0});
  activity.observe($('.resume-experience'));
  activity.observe($('.resume-craft'));
  document.addEventListener('visibilitychange',syncCraftMotion);
  motion.addEventListener('change',() => {
    if (motion.matches) animatedParts.forEach(node => {node.classList.add('craft-revealed');node.getAnimations().forEach(animation => animation.cancel());});
    syncCraftMotion();
  });
  craftCards.forEach(card => {
    let pointerFrame = 0, point;
    card.addEventListener('pointermove',event => {
      if (event.pointerType !== 'mouse' || motion.matches) return;
      point = {x:event.clientX,y:event.clientY};
      if(pointerFrame)return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const bounds = card.getBoundingClientRect();
        const x = Math.max(-.5,Math.min(.5,(point.x-bounds.left)/bounds.width-.5));
        const y = Math.max(-.5,Math.min(.5,(point.y-bounds.top)/bounds.height-.5));
        card.style.setProperty('--craft-tilt-x',`${-y*9}deg`);
        card.style.setProperty('--craft-tilt-y',`${x*10}deg`);
      });
    },{passive:true});
    card.addEventListener('pointerleave',() => {
      cancelAnimationFrame(pointerFrame);pointerFrame=0;
      card.style.setProperty('--craft-tilt-x','0deg');card.style.setProperty('--craft-tilt-y','0deg');
    });
  });
  paint();
})();
