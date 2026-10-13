(() => {
  const column = document.querySelector('.resume-column');
  if (!column) return;
  const $ = selector => column.querySelector(selector);
  const $$ = selector => [...column.querySelectorAll(selector)];
  const steps = [{"title": "读稿与结构梳理", "text": "标出核心问句、概念顺序、转折与回扣。先确认观众需要哪些前置理解，再判断哪些段落可以压缩。", "check": "检查：删掉这段，下一段还能不能理解？", "code": "READ", "x": 270, "y": 270}, {"title": "分镜与素材准备", "text": "让每段旁白对应具体的画面任务。需要展示关系时用图示，需要认识对象时用实物或素材，并整理来源与署名要求。", "check": "检查：画面是在解释内容，还是只提供气氛？", "code": "STORYBOARD", "x": 580, "y": 265}, {"title": "初剪与节奏搭建", "text": "先搭建完整的解释路径，再处理段落衔接和信息密度。复杂推理之后留出消化空间，转场与重点强调服务于内容推进。", "check": "检查：观众是否知道这一段在解决什么问题？", "code": "ROUGH CUT", "x": 910, "y": 290}, {"title": "声音、字幕与精剪", "text": "整理旁白，安排音乐与音效，平衡音量；核对术语、数字及字幕对应关系，让画面与声音形成一致的解释节奏。", "check": "检查：音乐不遮住旁白，字幕不制造新的歧义。", "code": "FINE CUT", "x": 1260, "y": 268}, {"title": "反馈修改与成片交付", "text": "配合创作者处理内容反馈，逐轮检查逻辑、画面和声音。完成最终输出，并整理工程文件与素材，便于后续修改及系列内容复用。", "check": "检查：版本清晰、素材可追溯、成片播放正常。", "code": "DELIVERY", "x": 1610, "y": 270}];
  const viewport = $('#cv-journey-viewport');
  const world = $('#cv-journey-world');
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
    const cameraX = viewport.clientWidth * .48 - x * scale;
    world.style.setProperty('--scene-scale',scale);
    world.style.setProperty('--far-drift',`${-cameraX * .12 / scale}px`);
    world.style.setProperty('--near-drift',`${cameraX * .055 / scale}px`);
    world.style.transform = `translate3d(${cameraX}px,${(270-y)*scale*.22}px,0)`;
    $('#cv-journey-progress').style.transform = `scaleX(${position / 4})`;
    $$('[data-step]').forEach(node => {
      const step = steps[Number(node.dataset.step)];
      node.style.left = `${step.x * scale}px`;
      node.style.top = `${step.y * scale}px`;
    });
    select(Math.round(position));
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
  paint();
})();
