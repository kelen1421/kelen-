(() => {
  const section = document.querySelector('#about');
  const stamp = section?.querySelector('.profile-stamp');
  const copy = section?.querySelector('.profile-copy');
  if (!section || !stamp || !copy || !Element.prototype.animate) return;
  const layout = copy.parentElement;
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...copy.children];
  const title = copy.querySelector('h2');
  const easing = 'cubic-bezier(.22,.8,.24,1)';
  let animations = [], layer, ghost, timer, viewFrame = 0, generation = 0;
  let visible = false, autoOpened = motion.matches;
  const polygons = [
    '0% 0%,54% 0%,44% 45%,0% 52%',
    '54% 0%,100% 0%,100% 34%,62% 48%,44% 45%',
    '0% 52%,44% 45%,48% 71%,0% 100%',
    '44% 45%,62% 48%,76% 70%,48% 71%',
    '62% 48%,100% 34%,100% 74%,76% 70%',
    '48% 71%,76% 70%,100% 74%,100% 100%,0% 100%'
  ];
  const bursts = [[-27,-33,-11],[33,-29,13],[-36,19,-9],[6,9,17],[36,12,-13],[7,36,8]];
  const center = rect => ({x:rect.left + rect.width/2,y:rect.top + rect.height/2});
  function pageRect(node) {
    const rect = node.getBoundingClientRect();
    return {left:rect.left+scrollX,top:rect.top+scrollY,width:rect.width,height:rect.height};
  }
  function preserveView(position,ticket) {
    const restore = () => {
      if (ticket !== generation) return;
      if (Math.abs(scrollY-position.y)>1 || Math.abs(scrollX-position.x)>1) window.scrollTo({left:position.x,top:position.y,behavior:'instant'});
    };
    restore();
    viewFrame = requestAnimationFrame(() => {viewFrame=0;restore();});
  }
  const hint = document.createElement('span');
  hint.className = 'profile-trigger-hint';
  hint.setAttribute('aria-hidden','true');
  stamp.append(hint);
  copy.id = 'profile-biography';
  stamp.setAttribute('aria-controls',copy.id);
  section.classList.add('profile-reveal-ready');
  if (motion.matches) section.classList.add('profile-revealed');

  function syncControl() {
    const expanded = section.classList.contains('profile-revealed');
    stamp.setAttribute('aria-expanded',String(expanded));
    stamp.setAttribute('aria-label',expanded ? '收起个人介绍，重组 K 方格' : '拆开 K 方格，展开个人介绍');
    stamp.title = expanded ? '点击 K 将介绍合回方格' : '点击 K 拆开并展开介绍';
    hint.textContent = expanded ? '点击 K · 合回方格' : '点击 K · 展开介绍';
  }
  function cancel() {
    generation++;
    clearTimeout(timer);timer = undefined;
    cancelAnimationFrame(viewFrame);viewFrame = 0;
    animations.forEach(animation => animation.cancel());animations = [];
    layer?.remove();layer = undefined;
    ghost?.remove();ghost = undefined;
    layout.style.removeProperty('height');
    root.classList.remove('profile-layout-changing');
    section.classList.remove('profile-reveal-running','profile-fragmenting','profile-heading-fragmenting');
    stamp.removeAttribute('aria-busy');
  }
  function play(node,keyframes,options) {
    const animation = node.animate(keyframes,{easing,fill:'both',...options});
    animations.push(animation);
    return animation;
  }
  function makeLayer() {
    layer = document.createElement('div');
    layer.className = 'profile-fragments';
    layer.setAttribute('aria-hidden','true');
    layer.inert = true;
    layout.append(layer);
  }
  function markFragments(from,to,opening,bounds) {
    const width = stamp.offsetWidth, height = stamp.offsetHeight;
    polygons.forEach((polygon,index) => {
      const part = document.createElement('div');
      part.className = 'profile-fragment';
      part.style.cssText = `left:${from.x-bounds.left-width/2}px;top:${from.y-bounds.top-height/2}px;width:${width}px;height:${height}px;clip-path:polygon(${polygon})`;
      const face = stamp.cloneNode(true);
      face.classList.add('profile-fragment-face');
      face.querySelector('.profile-trigger-hint')?.remove();
      face.removeAttribute('id');face.removeAttribute('aria-controls');face.removeAttribute('aria-expanded');
      face.setAttribute('aria-hidden','true');face.tabIndex = -1;
      face.style.width = `${width}px`;face.style.height = `${height}px`;
      part.append(face);layer.append(part);
      const [dx,dy,rotation] = bursts[index];
      const travelX = to.x-from.x, travelY = to.y-from.y;
      play(part,[
        {transform:'translate(0px,0px) rotate(-5deg) scale(1)',offset:0,opacity:1},
        {transform:`translate(${dx}px,${dy}px) rotate(${rotation}deg) scale(.98)`,offset:opening ? .28 : .23,opacity:1},
        {transform:`translate(${travelX+dx*.3}px,${travelY+dy*.25}px) rotate(${rotation*.4}deg) scale(1)`,offset:.68,opacity:1},
        {transform:`translate(${travelX}px,${travelY}px) rotate(-5deg) scale(1)`,offset:1,opacity:1}
      ],{duration:opening ? 1090 : 870,delay:index*22});
    });
  }
  function headingFragments(rect,mark,opening,bounds) {
    const target = center(rect);
    const x = mark.x-target.x, y = mark.y-target.y;
    const offsets = [[-18,-16,-7],[15,0,6],[-8,18,-4]];
    for (let index = 0;index < 3;index++) {
      const part = document.createElement('div');
      part.className = 'profile-copy-fragment';
      part.style.cssText = `left:${rect.left-bounds.left}px;top:${rect.top-bounds.top}px;width:${rect.width}px;height:${rect.height}px;clip-path:inset(${index*100/3}% 0 ${(2-index)*100/3}% 0)`;
      const wrapper = document.createElement('div');wrapper.className = 'profile-copy';
      const heading = title.cloneNode(true);
      heading.removeAttribute('id');wrapper.append(heading);part.append(wrapper);layer.append(part);
      const [dx,dy,angle] = offsets[index];
      const assembled = {transform:'translate(0px,0px) rotate(0deg) scale(1)',opacity:1};
      const condensed = {transform:`translate(${x+dx}px,${y+dy}px) rotate(${angle}deg) scale(.18)`,opacity:0};
      const split = {transform:`translate(${opening ? dx : x*.48+dx}px,${opening ? dy : y*.48+dy}px) rotate(${angle}deg) scale(${opening ? .92 : .65})`,opacity:1};
      play(part,opening ? [condensed,{...split,offset:.6},assembled] : [assembled,{...split,offset:.4},condensed],{duration:opening ? 800 : 650,delay:opening ? 300+index*55 : index*35});
    }
  }
  function finish(ticket) {
    Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (ticket !== generation) return;
      cancel();syncControl();
    });
  }
  function open() {
    if (section.classList.contains('profile-revealed')) return;
    autoOpened = true;
    cancel();
    const viewport = {x:scrollX,y:scrollY};
    const oldHeight = layout.offsetHeight;
    const source = center(pageRect(stamp));
    if (!motion.matches) root.classList.add('profile-layout-changing');
    section.classList.add('profile-revealed');syncControl();
    if (motion.matches) return;
    const ticket = generation;
    const newHeight = layout.offsetHeight;
    const bounds = pageRect(layout);
    const target = center(pageRect(stamp));
    const headingRect = pageRect(title);
    const poses = items.filter(node => node !== title).map((node,index) => {
      const box = pageRect(node), point = center(box);
      return {node,index,x:source.x-point.x,y:source.y-point.y};
    });
    makeLayer();
    section.classList.add('profile-reveal-running','profile-fragmenting','profile-heading-fragmenting');
    stamp.setAttribute('aria-busy','true');
    layout.style.height = `${newHeight}px`;
    play(layout,[{height:`${oldHeight}px`},{height:`${newHeight}px`}],{duration:1050});
    // The real button travels underneath its fragments, retaining one accessible control.
    play(stamp,[{transform:`translate(${source.x-target.x}px,${source.y-target.y}px) rotate(-5deg)`},{transform:'translate(0px,0px) rotate(-5deg)'}],{duration:1090});
    markFragments(source,target,true,bounds);
    headingFragments(headingRect,source,true,bounds);
    poses.forEach(({node,index,x,y}) => play(node,[
      {transform:`translate(${x*.75}px,${y*.6}px) scale(.3)`,opacity:0,clipPath:'inset(0 70% 0 0)'},
      {transform:'translate(9px,6px) scale(.98)',opacity:.8,clipPath:'inset(0 8% 0 0)',offset:.68},
      {transform:'none',opacity:1,clipPath:'inset(0 0 0 0)'}
    ],{duration:760,delay:350+index*85}));
    preserveView(viewport,ticket);
    finish(ticket);
  }
  function close() {
    if (!section.classList.contains('profile-revealed')) return;
    autoOpened = true;
    cancel();
    const viewport = {x:scrollX,y:scrollY};
    const oldHeight = layout.offsetHeight;
    const source = center(pageRect(stamp));
    const copyRect = pageRect(copy);
    const headingRect = pageRect(title);
    const oldItems = items.map(node => ({rect:pageRect(node)}));
    ghost = copy.cloneNode(true);
    ghost.classList.add('profile-copy-ghost');ghost.removeAttribute('id');
    ghost.setAttribute('aria-hidden','true');ghost.inert = true;
    ghost.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    if (!motion.matches) root.classList.add('profile-layout-changing');
    section.classList.remove('profile-revealed');syncControl();
    if (motion.matches) {ghost = undefined;return;}
    const ticket = generation;
    const newHeight = layout.offsetHeight;
    const bounds = pageRect(layout);
    const target = center(pageRect(stamp));
    ghost.style.cssText = `left:${copyRect.left-bounds.left}px;top:${copyRect.top-bounds.top}px;width:${copyRect.width}px`;
    layout.append(ghost);makeLayer();
    section.classList.add('profile-reveal-running','profile-fragmenting');
    stamp.setAttribute('aria-busy','true');
    layout.style.height = `${newHeight}px`;
    play(layout,[{height:`${oldHeight}px`},{height:`${newHeight}px`}],{duration:980});
    play(stamp,[{transform:`translate(${source.x-target.x}px,${source.y-target.y}px) rotate(-5deg)`},{transform:'translate(0px,0px) rotate(-5deg)'}],{duration:870});
    markFragments(source,target,false,bounds);
    headingFragments(headingRect,target,false,bounds);
    [...ghost.children].forEach((node,index) => {
      if (node.tagName === 'H2') {node.style.opacity = '0';return;}
      const point = center(oldItems[index].rect);
      play(node,[
        {transform:'none',opacity:1,clipPath:'inset(0 0 0 0)'},
        {transform:`translate(${(target.x-point.x)*.8}px,${(target.y-point.y)*.8}px) scale(.25)`,opacity:.55,clipPath:'inset(0 18% 0 0)',offset:.75},
        {transform:`translate(${target.x-point.x}px,${target.y-point.y}px) scale(.12)`,opacity:0,clipPath:'inset(0 100% 0 0)'}
      ],{duration:640,delay:index*45});
    });
    preserveView(viewport,ticket);
    finish(ticket);
  }
  function autoOpen() {
    if (!visible || autoOpened || timer || root.classList.contains('intro-pending') || root.classList.contains('vortex-open')) return;
    timer = setTimeout(() => {timer = undefined;if(visible && !autoOpened)open();},430);
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .35;
    if (visible) autoOpen();
    else {clearTimeout(timer);timer = undefined;}
  },{threshold:[0,.35],rootMargin:'-8% 0px -10% 0px'});
  observer.observe(layout);
  stamp.addEventListener('click',() => {
    if (animations.length) return;
    if (section.classList.contains('profile-revealed')) close();else open();
  });
  new MutationObserver(autoOpen).observe(root,{attributes:true,attributeFilter:['class']});
  motion.addEventListener('change',() => {
    cancel();autoOpened = true;section.classList.add('profile-revealed');syncControl();
  });
  addEventListener('resize',() => {if(animations.length)cancel();},{passive:true});
  syncControl();
})();
