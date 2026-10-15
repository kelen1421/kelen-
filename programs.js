(() => {
  const archive = document.querySelector('.program-archive');
  if (!archive) return;
  const cards = [...archive.querySelectorAll('.program-card')];
  const stations = [...archive.querySelectorAll('.plugin-station')];
  const leaves = [...archive.querySelectorAll('.plugin-leaf')];
  const overview = archive.querySelector('.plugin-overview');
  const stage = archive.querySelector('.plugin-panel-stage');
  const back = archive.querySelector('.plugin-overview-back');
  const read = archive.querySelector('.plugin-read');
  const names = cards.map(card => card.querySelector('h3').textContent);
  const descriptions = cards.map(card => card.querySelector('.program-copy p').textContent);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const workspace = document.createElement('div');
  workspace.className = 'plugin-workspace';
  const viewport = document.createElement('div');
  viewport.className = 'plugin-viewport';
  const inspector = document.createElement('div');
  inspector.className = 'plugin-inspector';
  const overviewCopy = archive.querySelector('.plugin-overview-copy');
  archive.querySelector('.plugin-vault-top').after(workspace);
  workspace.append(viewport,inspector);
  viewport.append(overview,stage);
  inspector.append(overviewCopy,archive.querySelector('.program-grid'));
  const controls = document.createElement('div');
  controls.className = 'plugin-scene-controls';
  controls.innerHTML = '<span>悬停探索 · 点击读取</span><div><button type="button" data-program-prev aria-label="上一个程序">←</button><output aria-live="polite">01 / 04</output><button type="button" data-program-next aria-label="下一个程序">→</button></div>';
  viewport.append(controls);
  const hallTitle=document.createElement('h3');hallTitle.className='plugin-hall-title';
  const hallLink=document.createElement('a');hallLink.className='program-primary plugin-hall-primary';hallLink.hidden=true;
  viewport.append(hallTitle,hallLink);
  function syncHallAction(index) {
    const source=cards[index].querySelector('.program-primary');
    hallLink.href=source.href;hallLink.innerHTML=source.innerHTML;
    ['download','target','rel'].forEach(attribute=>{
      if(source.hasAttribute(attribute))hallLink.setAttribute(attribute,source.getAttribute(attribute));
      else hallLink.removeAttribute(attribute);
    });
    hallLink.setAttribute('aria-label',index===0 ? '打开物理模型网页版' : `下载${names[index]} Mac 版`);
    hallLink.title=`${cards[index].querySelector('.program-platform').textContent} · ${cards[index].querySelector('.program-version').textContent}`;
    hallTitle.textContent=`${names[index]} · 功能演示`;
    hallTitle.hidden=archive.dataset.view!=='records';
    if(archive.dataset.view!=='records')hallLink.hidden=true;
  }
  function placeHallAction(rect) {
    hallLink.hidden=!rect.visible || archive.dataset.view!=='records';
    if(hallLink.hidden)return;
    Object.assign(hallLink.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});
  }
  const demoToggle = document.createElement('button');
  demoToggle.className='plugin-demo-toggle';demoToggle.type='button';
  demoToggle.textContent='暂停演示';demoToggle.setAttribute('aria-pressed','false');demoToggle.hidden=true;
  archive.querySelector('.plugin-vault-top').append(demoToggle);
  let demoPaused=false;
  demoToggle.addEventListener('click',() => {
    demoPaused=!demoPaused;demoToggle.setAttribute('aria-pressed',String(demoPaused));
    demoToggle.textContent=demoPaused ? '播放演示' : '暂停演示';depth?.setDemoPaused(demoPaused);
  });
  let current = 0, focusTimer, depth;
  archive.dataset.preview='idle';
  function syncPreview(index) {
    archive.dataset.preview=index>=0 ? 'active' : 'idle';
    controls.querySelector('span').textContent=archive.dataset.view==='records' ? '弧形档案 · 左右切换' : index>=0 ? '点击展示牌 · 打开档案' : '悬停展台 · 标牌升起';
    demoToggle.hidden=(archive.dataset.view!=='records' && index<0) || motion.matches;
  }

  function useStaticArchive() {
    depth = null;
    archive.querySelector('.plugin-depth-stage')?.remove();
    archive.classList.remove('is-enhanced','has-depth','program-opening');
    cards.forEach(card => {card.hidden = false;});
    demoToggle.hidden=true;
    hallLink.hidden=true;
    cards.forEach((card,index) => {
      if(card.querySelector('.program-demo-preview') || !window.createProgramDemo)return;
      const demo=window.createProgramDemo(index),figure=document.createElement('figure'),caption=document.createElement('figcaption');
      figure.className='program-demo-preview';caption.textContent=`功能演示 · ${demo.caption}`;
      demo.canvas.setAttribute('aria-hidden','true');figure.append(demo.canvas,caption);
      card.querySelector('.program-art').replaceWith(figure);
    });
  }

  function select(index) {
    current = (index + cards.length) % cards.length;
    archive.dataset.selected = String(current);
    stations.forEach((station,i) => station.classList.toggle('is-selected',i === current));
    leaves.forEach((leaf,i) => {
      const angle = (i-current)*25;
      const radians = angle*Math.PI/180;
      leaf.style.setProperty('--leaf-x',`${Math.sin(radians)*420}px`);
      leaf.style.setProperty('--leaf-z',`${(Math.cos(radians)-1)*420}px`);
      leaf.style.setProperty('--leaf-angle',`${-angle*.8}deg`);
      leaf.classList.toggle('is-selected',i === current);
      leaf.setAttribute('aria-pressed',String(i === current));
    });
    cards.forEach((card,i) => {
      card.hidden = archive.classList.contains('is-enhanced');
      if (i !== current) card.querySelector('details').open = false;
    });
    archive.querySelector('.plugin-active-number').textContent = `PROGRAM / 0${current+1} — 04`;
    archive.querySelector('.plugin-active-title').textContent = names[current];
    archive.querySelector('.plugin-active-description').textContent = descriptions[current];
    read.setAttribute('aria-label',`读取${names[current]}档案`);
    syncHallAction(current);
    overviewCopy.hidden = archive.dataset.view === 'records';
    controls.querySelector('output').textContent = `0${current+1} / 04`;
    controls.querySelector('span').textContent = archive.dataset.view === 'records' ? '弧形档案 · 左右切换' : archive.dataset.preview==='active' ? '点击展示牌 · 打开档案' : '悬停展台 · 标牌升起';
    demoToggle.hidden=(archive.dataset.view!=='records' && archive.dataset.preview!=='active') || !depth || motion.matches;
    depth?.setState(current,archive.dataset.view);
  }

  function open(index) {
    clearTimeout(focusTimer);
    const entering = archive.dataset.view !== 'records';
    archive.dataset.view = 'records';
    overview.hidden = true;
    stage.hidden = false;
    back.hidden = false;
    select(index);
    if (entering && archive.getBoundingClientRect().top < 0) archive.scrollIntoView({behavior:motion.matches ? 'instant' : 'smooth',block:'start'});
    focusTimer = setTimeout(() => {
      const destination=hallLink.hidden ? back : hallLink;
      destination.focus({preventScroll:true});
    },motion.matches ? 0 : 450);
  }

  stations.forEach((button,i) => {
    button.addEventListener('pointerenter',() => select(i));
    button.addEventListener('focus',() => select(i));
    button.addEventListener('click',() => open(i));
  });
  leaves.forEach((button,i) => button.addEventListener('click',() => select(i)));
  read.addEventListener('click',() => open(current));
  controls.querySelector('[data-program-prev]').addEventListener('click',() => select(current-1));
  controls.querySelector('[data-program-next]').addEventListener('click',() => select(current+1));
  let swipe;
  let swiped=false;
  viewport.addEventListener('pointerdown',event => {if(event.pointerType !== 'mouse')swipe={x:event.clientX,y:event.clientY};});
  viewport.addEventListener('pointerup',event => {
    if(!swipe)return;
    const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;
    if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.4){swiped=true;select(current+(dx<0 ? 1 : -1));}
  });
  viewport.addEventListener('click',event => {if(swiped){swiped=false;event.preventDefault();event.stopPropagation();}},{capture:true});
  viewport.addEventListener('pointercancel',() => {swipe=null;});
  function showOverview() {
    clearTimeout(focusTimer);
    archive.dataset.view = 'overview';
    overview.hidden = false;
    stage.hidden = true;
    back.hidden = true;
    select(current);
    (depth ? read : stations[current])?.focus({preventScroll:true});
  }
  back.addEventListener('click',showOverview);
  archive.addEventListener('keydown',event => {
    if (event.target.closest('details,a')) return;
    if (event.key === 'Escape' && archive.dataset.view === 'records') {
      event.preventDefault();showOverview();
    } else if(event.key==='Escape' && archive.dataset.preview==='active') {
      event.preventDefault();depth?.setPreview(-1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();select(current + (event.key === 'ArrowRight' ? 1 : -1));
      const destination = depth ? controls.querySelector(event.key === 'ArrowRight' ? '[data-program-next]' : '[data-program-prev]') : (archive.dataset.view === 'records' ? leaves : stations)[current];
      destination?.focus({preventScroll:true});
    }
  });
  archive.classList.add('is-enhanced');
  motion.addEventListener('change',() => select(current));
  try {
    depth = window.createProgramDepth?.(archive,{onSelect:select,onPreview:syncPreview,onOpen:open,onUnavailable:useStaticArchive,onActionLayout:placeHallAction,onAction:index=>{
      select(index);hallLink.click();
    }});
    if (!depth) useStaticArchive();
  } catch (error) {
    useStaticArchive();
    console.warn('Program gallery unavailable; using the accessible archive.',error);
  }
  select(0);
})();
