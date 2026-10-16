(() => {
  'use strict';
  const root=document.querySelector('.research-libraries');
  if(!root||!window.KelenResearchRecords||!window.KelenResearchScene)return;
  const all=window.KelenResearchRecords,scene=window.KelenResearchScene;
  const libraries=[
    {key:'life',name:'生命起源研究库',short:'生命起源',english:'ORIGIN OF LIFE',intro:'从随机化学组合，追问能跨越分裂的状态。',tags:['存留与积累','隔室与边界','局部化学','分裂与延续','框架与证据']},
    {key:'flight',name:'起飞与降落研究库',short:'起飞与降落',english:'FLIGHT & LANDING',intro:'沿着感知、控制与任务切换，拆解一次返回。',tags:['任务架构','状态估计','控制闭环','返回着陆','仿真与遥测']},
    {key:'population',name:'人口结构研究库',short:'人口结构',english:'POPULATION & SOCIETY',intro:'跟随一代人成长，观察结构与社会需求。',tags:['年龄结构','代际时间轴','住房需求','任务重组','照护支持']}
  ];
  libraries.forEach(library=>library.records=all.filter(record=>record.group===library.key));
  const $=s=>root.querySelector(s),lobby=$('.library-lobby'),room=$('.library-room'),switcher=$('.library-switch'),live=$('.library-live');
  const memories=new Map();let library=null,index=0,vault=null,hoverTimer,entryTimer,hoverCard=null;
  const hoverInput=matchMedia('(hover: hover) and (pointer: fine)'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function cancelPreview(){
    clearTimeout(hoverTimer);clearTimeout(entryTimer);
    hoverCard?.classList.remove('is-previewing','is-opening');hoverCard=null;
    lobby.classList.remove('is-entering');
  }
  function previewLibrary(button,key){
    if(root.dataset.view!=='lobby'||document.hidden)return;
    cancelPreview();hoverCard=button;button.classList.add('is-previewing');
    hoverTimer=setTimeout(()=>{
      if(hoverCard!==button||root.dataset.view!=='lobby')return;
      button.classList.add('is-opening');lobby.classList.add('is-entering');
      entryTimer=setTimeout(()=>openLibrary(key,true),reducedMotion.matches?0:280);
    },780);
  }
  function element(tag,className,content){const node=document.createElement(tag);if(className)node.className=className;if(content!==undefined)node.textContent=content;return node;}
  function updateURL(){const url=new URL(location.href);if(library){url.searchParams.set('library',library.key);url.searchParams.set('entry',String(index+1).padStart(2,'0'));}else{url.searchParams.set('library','all');url.searchParams.delete('entry');}history.replaceState(null,'',url);}
  const grid=$('.library-card-grid');
  libraries.forEach((item,i)=>{
    const button=element('button','library-card');button.type='button';button.dataset.library=item.key;button.setAttribute('aria-label',`进入${item.name}，${item.records.length}份档案`);
    const top=element('span','library-card-meta');top.append(element('span','',`LIBRARY / 0${i+1}`),element('b','',String(item.records.length).padStart(2,'0')+' NOTES'));
    const stage=element('span','library-card-stage'),cabinet=element('span','library-cabinet');
    for(let sheet=0;sheet<4;sheet++){
      const layer=element('span','library-stack-sheet');layer.style.setProperty('--sheet',sheet);layer.setAttribute('aria-hidden','true');
      layer.append(element('span','',`KELEN / ${String(sheet+1).padStart(2,'0')}`));cabinet.append(layer);
    }
    const side=element('span','library-cabinet-side'),cap=element('span','library-cabinet-top');side.setAttribute('aria-hidden','true');cap.setAttribute('aria-hidden','true');
    side.append(element('span','',item.english));
    const cover=element('span','library-cabinet-front');
    const art=element('span','library-card-art');art.innerHTML=scene(item.records[0],true);
    const copy=element('span','library-card-copy');copy.append(element('small','',item.english),element('strong','',item.short));
    const coverFoot=element('span','library-cover-foot');coverFoot.setAttribute('aria-hidden','true');coverFoot.append(element('span','','RESEARCH COLLECTION'),element('b','',`0${i+1}`));
    cover.append(top,art,copy,coverFoot);cabinet.append(side,cap,cover);stage.append(cabinet);
    const caption=element('span','library-card-caption');caption.append(element('span','library-card-description',item.intro));
    const tags=element('span','library-card-tags');item.tags.slice(0,3).forEach(tag=>tags.append(element('i','',tag)));
    const enter=element('span','library-card-enter');enter.append(element('span','',hoverInput.matches?'停留 · 进入档案库':'进入档案库'),element('b','','↗'),element('span','library-hover-progress'));
    caption.append(tags,enter);button.append(stage,caption);
    // Start only after a real pointer movement, so revealing the lobby under a
    // stationary cursor never opens a collection before the visitor chooses it.
    button.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'&&hoverInput.matches&&(event.movementX||event.movementY)&&hoverCard!==button)previewLibrary(button,item.key);});
    button.addEventListener('pointerleave',()=>{if(hoverCard===button)cancelPreview();});
    button.addEventListener('pointercancel',()=>{if(hoverCard===button)cancelPreview();});
    button.addEventListener('click',()=>openLibrary(item.key,true));grid.append(button);
  });
  function openLibrary(key,focus=false,requestedIndex){
    cancelPreview();
    library=libraries.find(item=>item.key===key);if(!library)return;
    index=Math.max(0,Math.min(library.records.length-1,requestedIndex??memories.get(key)??0));
    vault?.destroy();root.dataset.view='room';root.dataset.library=key;lobby.hidden=true;room.hidden=false;switcher.hidden=false;
    $('.library-room-name').textContent=library.name;$('.library-room-intro').textContent=library.intro;
    $('.library-room-total').textContent=String(library.records.length).padStart(2,'0')+' 份独立档案';
    switcher.setAttribute('aria-label','切换档案库，当前：'+library.short);
    const host=$('.library-vault-host');host.replaceChildren($('#research-vault-template').content.cloneNode(true));
    vault=window.createKelenResearchVault(host.querySelector('.interest-archive'),library.records,{index,onSelect(selected){index=selected;memories.set(library.key,index);updateURL();live.textContent=library.name+'，'+library.records[index].title;}});
    if(focus){$('.library-room-name').focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  }
  function openLobby(focus=true){
    cancelPreview();
    const previous=library?.key;vault?.destroy();vault=null;library=null;root.dataset.view='lobby';delete root.dataset.library;lobby.hidden=false;room.hidden=true;switcher.hidden=true;
    updateURL();live.textContent='选择研究档案库';
    if(focus){(grid.querySelector(`[data-library="${previous}"]`)||grid.querySelector('button')).focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:reducedMotion.matches?'instant':'smooth'});}
  }
  switcher.addEventListener('click',()=>openLobby());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelPreview();});
  window.addEventListener('blur',cancelPreview);
  root.addEventListener('keydown',event=>{if(event.key==='Escape')cancelPreview();});
  const params=new URL(location.href).searchParams,key=params.get('library');
  if(key==='all')openLobby(false);
  else openLibrary(libraries.some(item=>item.key===key)?key:'life',false,Math.max(0,(Number(params.get('entry'))||1)-1));
  document.fonts.ready.then(()=>{
    const align=()=>{if(location.hash==='#work')requestAnimationFrame(()=>root.scrollIntoView({block:'start',behavior:'instant'}));};
    if(!document.documentElement.classList.contains('intro-pending'))align();
    else{const observer=new MutationObserver(()=>{if(!document.documentElement.classList.contains('intro-pending')){observer.disconnect();align();}});observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});}
  });
})();
