(() => {
  const section = document.querySelector('#about');
  const stamp = section?.querySelector('.profile-stamp');
  const copy = section?.querySelector('.profile-copy');
  if (!section || !stamp || !copy || !Element.prototype.animate) return;
  const layout = copy.parentElement;
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...copy.children];
  const easing = 'cubic-bezier(.22,.8,.24,1)';
  let animations = [], layer, timer, viewFrame = 0, generation = 0;
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
    layout.style.removeProperty('height');
    root.classList.remove('profile-layout-changing');
    section.classList.remove('profile-reveal-running','profile-fragmenting','profile-heading-fragmenting','profile-text-throwing');
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
      if (opening) {
        play(part,[
          {transform:'translate(0px,0px) rotate(-5deg) scale(1)',offset:0,opacity:1},
          {transform:`translate(${dx}px,${dy}px) rotate(${rotation}deg) scale(.98)`,offset:.12,opacity:1},
          {transform:'translate(0px,0px) rotate(-5deg) scale(1.04)',offset:.28,opacity:1},
          {transform:'translate(0px,0px) rotate(-5deg) scale(1)',offset:.55,opacity:1,easing},
          {transform:`translate(${travelX}px,${travelY}px) rotate(-5deg) scale(1)`,offset:1,opacity:1}
        ],{duration:1650,delay:index*12,easing:'linear'});
      } else {
        play(part,[
          {transform:'translate(0px,0px) rotate(-5deg) scale(1)',offset:0,opacity:1},
          {transform:`translate(${dx}px,${dy}px) rotate(${rotation}deg) scale(.98)`,offset:.2,opacity:1},
          {transform:`translate(${travelX+dx*.25}px,${travelY+dy*.25}px) rotate(${rotation*.4}deg) scale(1)`,offset:.7,opacity:1},
          {transform:`translate(${travelX}px,${travelY}px) rotate(-5deg) scale(1)`,offset:1,opacity:1}
        ],{duration:1080,delay:index*15});
      }
    });
  }
  // Snapshot the actual glyph locations so the pieces reassemble on the same baselines.
  function textSnapshot() {
    return items.map((node,blockIndex) => {
      const bounds = pageRect(node), pieces = [];
      const walker = document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
      let text, order = 0;
      while ((text = walker.nextNode())) {
        if (!text.textContent.trim()) continue;
        const value = text.textContent;
        let start = 0;
        while (start < value.length) {
          const small = node.tagName === 'H2';
          const size = small ? 1 + (order%3 === 1 ? 1 : 0) : 4 + (order*7)%4;
          let end = Math.min(value.length,start+size);
          // Keep UTF-16 pairs intact if a future introduction contains emoji.
          const code = value.charCodeAt(end-1);
          if (code >= 0xd800 && code <= 0xdbff && end < value.length) end++;
          const range = document.createRange();
          range.setStart(text,start);range.setEnd(text,end);
          if (value.slice(start,end).trim()) {
            for (const rect of range.getClientRects()) {
              if (rect.width < 1 || rect.height < 1) continue;
              pieces.push({left:rect.left+scrollX,top:rect.top+scrollY,width:rect.width,height:rect.height,order});
            }
          }
          range.detach();start = end;order++;
        }
      }
      return {node,bounds,pieces,blockIndex};
    });
  }
  function throwText(snapshot,origin,opening,bounds) {
    let count = 0;
    snapshot.forEach(({node,bounds:nodeBounds,pieces,blockIndex}) => {
      pieces.forEach(piece => {
        const index = count++, landing = center(piece);
        const part = document.createElement('div');part.className = 'profile-text-chip';
        part.dataset.block = String(blockIndex);
        part.style.cssText = `left:${piece.left-bounds.left}px;top:${piece.top-bounds.top}px;width:${piece.width}px;height:${piece.height}px`;
        const wrapper = document.createElement('div');wrapper.className = 'profile-copy';
        wrapper.style.cssText = `left:${nodeBounds.left-piece.left}px;top:${nodeBounds.top-piece.top}px;width:${nodeBounds.width}px`;
        const clone = node.cloneNode(true);
        clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(child => child.removeAttribute('id'));
        clone.style.margin = '0';clone.style.opacity = '1';clone.style.transform = 'none';
        wrapper.append(clone);part.append(wrapper);layer.append(part);
        const launch = {x:origin.x+((index*11)%15)-7,y:origin.y+((index*7)%11)-5};
        const from = opening ? launch : landing, to = opening ? landing : launch;
        const ceiling = Math.max(28,piece.height*.55);
        const requestedArc = Math.max((blockIndex === 1 ? 112 : 62) + (index*17)%53,Math.abs(to.y-from.y)/4+18);
        const room = (from.y+to.y)/2-bounds.top-ceiling;
        const arc = Math.max(12,Math.min(requestedArc,room));
        const spin = ((index*43)%137)-68;
        const frames = Array.from({length:41},(_,frame) => {
          const t = frame/40;
          // Constant horizontal velocity and quadratic vertical motion form a real parabola.
          const x = from.x+(to.x-from.x)*t-landing.x;
          const y = from.y+(to.y-from.y)*t-4*arc*t*(1-t)-landing.y;
          const scale = opening ? .18+.82*Math.pow(t,.72) : 1-.84*Math.pow(t,.8);
          const rotation = opening ? spin*(1-t)*(1-t) : -spin*t*t;
          const opacity = opening ? Math.min(1,t/.08) : t>.87 ? Math.max(0,(1-t)/.13) : 1;
          return {offset:t,transform:`translate(${x}px,${y}px) rotate(${rotation}deg) scale(${scale})`,opacity};
        });
        const stagger = (piece.order%6)*21+Math.floor(piece.order/6)*10;
        play(part,frames,{duration:opening ? 800+(index*37)%170 : 660+(index*29)%120,delay:opening ? 480+blockIndex*60+stagger : blockIndex*35+stagger*.5,easing:'linear'});
      });
    });
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
    const snapshot = textSnapshot();
    makeLayer();
    section.classList.add('profile-reveal-running','profile-fragmenting','profile-text-throwing');
    stamp.setAttribute('aria-busy','true');
    layout.style.height = `${newHeight}px`;
    play(layout,[{height:`${oldHeight}px`},{height:`${newHeight}px`}],{duration:1270,delay:230});
    play(stamp,[
      {transform:`translate(${source.x-target.x}px,${source.y-target.y}px) rotate(-5deg)`,offset:0},
      {transform:`translate(${source.x-target.x}px,${source.y-target.y}px) rotate(-5deg)`,offset:.55,easing},
      {transform:'translate(0px,0px) rotate(-5deg)',offset:1}
    ],{duration:1650,easing:'linear'});
    markFragments(source,target,true,bounds);
    throwText(snapshot,source,true,bounds);
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
    const snapshot = textSnapshot();
    if (!motion.matches) root.classList.add('profile-layout-changing');
    section.classList.remove('profile-revealed');syncControl();
    if (motion.matches) return;
    const ticket = generation;
    const newHeight = layout.offsetHeight;
    const bounds = pageRect(layout);
    const target = center(pageRect(stamp));
    makeLayer();
    section.classList.add('profile-reveal-running','profile-fragmenting','profile-text-throwing');
    stamp.setAttribute('aria-busy','true');
    layout.style.height = `${newHeight}px`;
    play(layout,[{height:`${oldHeight}px`},{height:`${newHeight}px`}],{duration:1050,delay:140});
    play(stamp,[{transform:`translate(${source.x-target.x}px,${source.y-target.y}px) rotate(-5deg)`},{transform:'translate(0px,0px) rotate(-5deg)'}],{duration:1080});
    markFragments(source,target,false,bounds);
    throwText(snapshot,target,false,bounds);
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
