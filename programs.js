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
  const projects=window.KelenProgramProjects||[];
  const total=String(cards.length).padStart(2,'0');
  let available=cards.map((_,index)=>index);
  const number=index=>String(index+1).padStart(2,'0');
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
  (archive.querySelector('.hall-catalog')||archive.querySelector('.plugin-vault-top')).after(workspace);
  workspace.append(viewport,inspector);
  viewport.append(overview,stage);
  inspector.append(overviewCopy,archive.querySelector('.program-grid'));
  const controls = document.createElement('div');
  controls.className = 'plugin-scene-controls';
  controls.innerHTML = '<span>悬停探索 · 点击读取</span><div><button type="button" data-program-prev aria-label="上一个程序">←</button><output aria-live="polite">01 / 04</output><button type="button" data-program-next aria-label="下一个程序">→</button></div>';
  viewport.append(controls);
  const hallTitle=document.createElement('h3');hallTitle.className='plugin-hall-title';
  const hallLink=document.createElement('a');hallLink.className='program-primary plugin-hall-primary';hallLink.hidden=true;
  const hallDetails=document.createElement('button');hallDetails.type='button';hallDetails.className='program-primary plugin-hall-primary';hallDetails.textContent='功能与状态 ↗';hallDetails.hidden=true;
  viewport.append(hallTitle,hallLink,hallDetails);
  const projectCopy=document.createElement('section');projectCopy.className='hall-project-copy';projectCopy.setAttribute('aria-label','所选项目说明');archive.append(projectCopy);
  let lastActionRect;
  const activeAction=()=>cards[current].querySelector('a.program-primary') ? hallLink : hallDetails;
  hallDetails.addEventListener('click',()=>{const details=projectCopy.querySelector('details');details.open=true;details.scrollIntoView({block:'nearest',behavior:motion.matches?'instant':'smooth'});details.querySelector('summary').focus({preventScroll:true});});
  function syncHallAction(index) {
    const source=cards[index].querySelector('.program-primary');
    if(source.tagName==='A'){
      hallLink.href=source.href;hallLink.innerHTML=source.innerHTML;
      ['download','target','rel'].forEach(attribute=>{if(source.hasAttribute(attribute))hallLink.setAttribute(attribute,source.getAttribute(attribute));else hallLink.removeAttribute(attribute);});
      hallLink.setAttribute('aria-label',source.textContent.trim()+' · '+names[index]);
      hallLink.title=cards[index].querySelector('.program-platform').textContent+' · '+cards[index].querySelector('.program-version').textContent;
    }
    hallDetails.setAttribute('aria-label','查看'+names[index]+'功能与状态');
    hallTitle.textContent=names[index]+' · 功能演示';hallTitle.hidden=archive.dataset.view!=='records';
    hallLink.hidden=hallDetails.hidden=true;if(lastActionRect)placeHallAction(lastActionRect);
    const p=projects[index];
    projectCopy.replaceChildren();if(!p)return;
    const heading=document.createElement('div');heading.className='hall-project-heading';
    const name=document.createElement('h3');name.textContent=p.name;
    const state=document.createElement('span');state.textContent=p.status+' / '+p.platform;heading.append(name,state);
    const intro=document.createElement('p');intro.textContent=p.intro;
    const flow=document.createElement('ol');flow.className='hall-project-flow';p.steps.forEach((text,i)=>{const li=document.createElement('li'),no=document.createElement('small');no.textContent=String(i+1).padStart(2,'0');li.append(no,text);flow.append(li);});
    const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='功能与当前状态 ＋';details.append(summary);
    const list=document.createElement('ul');p.features.forEach(text=>{const li=document.createElement('li');li.textContent=text;list.append(li);});
    const note=document.createElement('p');note.textContent=p.note;details.append(list,note);projectCopy.append(heading,intro,flow,details);
  }
  function placeHallAction(rect) {
    lastActionRect=rect;const action=activeAction();hallLink.hidden=hallDetails.hidden=true;
    action.hidden=!rect.visible||archive.dataset.view!=='records';if(action.hidden)return;
    Object.assign(action.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
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
    hallLink.hidden=hallDetails.hidden=true;
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
      card.hidden = archive.classList.contains('is-enhanced') ? i!==current : false;
      if (i !== current) card.querySelector('details').open = false;
    });
    archive.querySelector('.plugin-active-number').textContent = `PROJECT / ${number(current)} — ${total}`;
    archive.querySelector('.plugin-active-title').textContent = names[current];
    archive.querySelector('.plugin-active-description').textContent = descriptions[current];
    read.setAttribute('aria-label',`读取${names[current]}档案`);
    syncHallAction(current);
    overviewCopy.hidden = archive.dataset.view === 'records';
    controls.querySelector('output').textContent = `${number(current)} / ${total}`;
    controls.querySelector('span').textContent = archive.dataset.view === 'records' ? '弧形档案 · 左右切换' : archive.dataset.preview==='active' ? '点击展示牌 · 打开档案' : '悬停展台 · 标牌升起';
    demoToggle.hidden=(archive.dataset.view!=='records' && archive.dataset.preview!=='active') || !depth || motion.matches;
    window.KelenProgramCatalog?.select(current);
    depth?.setState(current,archive.dataset.view);
    if(archive.dataset.view==='records'){const url=new URL(location.href);url.searchParams.set('program',projects[current]?.id||String(current));history.replaceState(null,'',url);}
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
      const action=activeAction(),destination=action.hidden ? back : action;
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
  function stepSelection(direction){if(!available.length)return;const at=available.indexOf(current);select(available[(at+direction+available.length)%available.length]);}
  controls.querySelector('[data-program-prev]').addEventListener('click',() => stepSelection(-1));
  controls.querySelector('[data-program-next]').addEventListener('click',() => stepSelection(1));
  let swipe;
  let swiped=false;
  viewport.addEventListener('pointerdown',event => {if(event.pointerType !== 'mouse')swipe={x:event.clientX,y:event.clientY};});
  viewport.addEventListener('pointerup',event => {
    if(!swipe)return;
    const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;
    if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.4){swiped=true;stepSelection(dx<0 ? 1 : -1);}
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
    (depth ? controls.querySelector('[data-program-next]') : stations[current])?.focus({preventScroll:true});
  }
  back.addEventListener('click',showOverview);
  archive.addEventListener('kelen-program-open',event => {
    const index=Number(event.detail?.index);
    if(!Number.isInteger(index) || index<0 || index>=cards.length)return;
    open(index);
    viewport.scrollIntoView({behavior:motion.matches ? 'instant' : 'smooth',block:'center'});
  });
  archive.addEventListener('kelen-program-select',event=>{const index=Number(event.detail?.index);if(Number.isInteger(index)&&index>=0&&index<cards.length)select(index);});
  archive.addEventListener('kelen-program-filter',event=>{available=event.detail.indices;});
  archive.addEventListener('keydown',event => {
    if (event.target.closest('details,a,input,textarea,select,[contenteditable]')) return;
    if (event.key === 'Escape' && archive.dataset.view === 'records') {
      event.preventDefault();showOverview();
    } else if(event.key==='Escape' && archive.dataset.preview==='active') {
      event.preventDefault();depth?.setPreview(-1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();stepSelection(event.key === 'ArrowRight' ? 1 : -1);
      const destination = depth ? controls.querySelector(event.key === 'ArrowRight' ? '[data-program-next]' : '[data-program-prev]') : (archive.dataset.view === 'records' ? leaves : stations)[current];
      destination?.focus({preventScroll:true});
    }
  });
  archive.classList.add('is-enhanced');
  motion.addEventListener('change',() => select(current));
  try {
    depth = window.createProgramDepth?.(archive,{onSelect:select,onPreview:syncPreview,onOpen:open,onUnavailable:useStaticArchive,onActionLayout:placeHallAction,onAction:index=>{
      select(index);activeAction().click();
    }});
    if (!depth) useStaticArchive();
  } catch (error) {
    useStaticArchive();
    console.warn('Program gallery unavailable; using the accessible archive.',error);
  }
  const requested=new URL(location.href).searchParams.get('program');
  const initial=projects.findIndex(p=>p.id===(requested||'voice'));
  select(initial>=0?initial:0);if(requested&&initial>=0)open(initial);
})();
