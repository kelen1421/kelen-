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
  const memories=new Map();let library=null,index=0,tab='overview';
  function element(tag,className,content){const node=document.createElement(tag);if(className)node.className=className;if(content!==undefined)node.textContent=content;return node;}
  function updateURL(){const url=new URL(location.href);if(library){url.searchParams.set('library',library.key);url.searchParams.set('entry',String(index+1).padStart(2,'0'));}else{url.searchParams.delete('library');url.searchParams.delete('entry');}history.replaceState(null,'',url);}
  const grid=$('.library-card-grid');
  libraries.forEach((item,i)=>{
    const button=element('button','library-card');button.type='button';button.dataset.library=item.key;button.setAttribute('aria-label',`进入${item.name}，${item.records.length}份档案`);
    const top=element('span','library-card-meta');top.append(element('span','',`LIBRARY / 0${i+1}`),element('b','',String(item.records.length).padStart(2,'0')+' NOTES'));
    const art=element('span','library-card-art');art.innerHTML=scene(item.records[0],true);
    const copy=element('span','library-card-copy');copy.append(element('small','',item.english),element('strong','',item.short),element('span','library-card-description',item.intro));
    const tags=element('span','library-card-tags');item.tags.slice(0,3).forEach(tag=>tags.append(element('i','',tag)));
    const enter=element('span','library-card-enter','进入档案库');enter.append(element('b','','↗'));
    button.append(top,art,copy,tags,enter);button.addEventListener('click',()=>openLibrary(item.key,true));grid.append(button);
  });
  function renderList(){
    const list=$('.library-entry-list'),query=$('.library-filter').value.trim().toLocaleLowerCase();list.replaceChildren();let previousChapter='';
    library.records.forEach((record,i)=>{
      if(query&&!`${record.title} ${record.english} ${record.chapter} ${record.keywords}`.toLocaleLowerCase().includes(query))return;
      if(record.chapter!==previousChapter){list.append(element('h4','library-chapter',record.chapter));previousChapter=record.chapter;}
      const button=element('button','library-entry');button.type='button';button.dataset.entry=i;button.setAttribute('aria-label',`打开${library.short}档案 ${String(i+1).padStart(2,'0')}：${record.title}`);
      button.append(element('small','',String(i+1).padStart(2,'0')),element('span','',record.title));button.addEventListener('click',()=>{index=i;tab='overview';renderRecord();});list.append(button);
    });
    if(!list.children.length)list.append(element('p','library-search-empty','本库没有匹配条目。'));
    list.querySelectorAll('button').forEach(button=>{if(Number(button.dataset.entry)===index)button.setAttribute('aria-current','true');});
  }
  function renderText(){
    const record=library.records[index],body=$('.library-reading');body.replaceChildren();
    root.querySelectorAll('[data-reading-tab]').forEach(button=>{const active=button.dataset.readingTab===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    body.setAttribute('aria-labelledby','research-reading-'+tab);
    if(tab==='focus'){const list=element('ol','library-question-list');record.focus.forEach(question=>list.append(element('li','',question)));body.append(list);}
    else body.append(element('p','',tab==='next'?record.feeling.replace(/^下一步：/,''):record.overview));
  }
  function renderRecord(writeURL=true){
    const record=library.records[index];memories.set(library.key,index);
    $('.library-entry-code').textContent=library.english+' / '+String(index+1).padStart(2,'0');
    $('.library-entry-status').textContent=record.status;
    $('.library-entry-title').textContent=record.title;
    $('.library-entry-english').textContent=record.english;
    $('.library-scene').innerHTML=scene(record);
    const legend=$('.library-scene-legend');legend.replaceChildren();record.labels.forEach((label,i)=>{const item=element('span','');item.append(element('small','',String(i+1).padStart(2,'0')),element('b','',label));legend.append(item);});
    $('.library-source').textContent='研究主线 / '+record.source;
    $('.library-record-count').textContent=String(index+1).padStart(2,'0')+' / '+String(library.records.length).padStart(2,'0');
    $('.library-previous').disabled=index===0;$('.library-next').disabled=index===library.records.length-1;
    root.querySelectorAll('.library-entry').forEach(button=>{const current=Number(button.dataset.entry)===index;if(current)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});
    renderText();if(writeURL)updateURL();live.textContent=library.name+'，'+record.title;
    const article=$('.library-article');article.classList.remove('is-changing');void article.offsetWidth;article.classList.add('is-changing');
  }
  function openLibrary(key,focus=false,requestedIndex){
    library=libraries.find(item=>item.key===key);if(!library)return;
    index=Math.max(0,Math.min(library.records.length-1,requestedIndex??memories.get(key)??0));tab='overview';
    root.dataset.view='room';root.dataset.library=key;lobby.hidden=true;room.hidden=false;switcher.hidden=false;
    $('.library-room-name').textContent=library.name;$('.library-room-intro').textContent=library.intro;
    $('.library-room-total').textContent=String(library.records.length).padStart(2,'0')+' 份独立档案';
    $('.library-filter').value='';renderList();renderRecord();if(focus){$('.library-room-name').focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  }
  function openLobby(focus=true){const previous=library?.key;library=null;root.dataset.view='lobby';delete root.dataset.library;lobby.hidden=false;room.hidden=true;switcher.hidden=true;updateURL();live.textContent='选择研究档案库';if(focus){(grid.querySelector(`[data-library="${previous}"]`)||grid.querySelector('button')).focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}
  switcher.addEventListener('click',()=>openLobby());
  $('.library-filter').addEventListener('input',renderList);
  $('.library-previous').addEventListener('click',()=>{if(index>0){index--;tab='overview';renderRecord();}});
  $('.library-next').addEventListener('click',()=>{if(index<library.records.length-1){index++;tab='overview';renderRecord();}});
  const tabs=[...root.querySelectorAll('[data-reading-tab]')];
  tabs.forEach((button,i)=>{
    button.addEventListener('click',()=>{tab=button.dataset.readingTab;renderText();});
    button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tab=tabs[next].dataset.readingTab;renderText();tabs[next].focus();});
  });
  const params=new URL(location.href).searchParams,key=params.get('library');
  if(libraries.some(item=>item.key===key))openLibrary(key,false,Math.max(0,(Number(params.get('entry'))||1)-1));else openLobby(false);
  // The profile's measured height settles after fonts load. Align deep links
  // once the opening has released the page, so a library opens at its header.
  document.fonts.ready.then(()=>{
    const align=()=>{if(location.hash==='#work')requestAnimationFrame(()=>root.scrollIntoView({block:'start',behavior:'instant'}));};
    if(!document.documentElement.classList.contains('intro-pending'))align();
    else{const observer=new MutationObserver(()=>{if(!document.documentElement.classList.contains('intro-pending')){observer.disconnect();align();}});observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});}
  });
})();
