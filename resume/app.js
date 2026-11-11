(()=>{'use strict';
 const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
 const {LensSlideshow,OrbitDisc,MovieWall,loadImage,clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value))}=window.ResumeEffects||{};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const KEY='kelen-reference-v2';
 const flat=(obj,prefix='',out={})=>{for(const [key,value] of Object.entries(obj)){const path=prefix?prefix+'.'+key:key;if(value&&typeof value==='object')flat(value,path,out);else out[path]=String(value??'')}return out};
 const defaults=flat(window.RESUME_DEFAULTS);
 const capabilityNames=['专业能力','创意方向','使用工具','工作方法','合作方式','其他能力'];
 const processNames=['需求沟通','资料研究','概念方向','设计执行','反馈调整','最终交付'];
 const faqNames=['可合作的项目类型','使用的工具与方法','其他想了解的信息'];
 for(let i=0;i<6;i++){defaults['capabilities.'+i+'.title']??=capabilityNames[i];defaults['capabilities.'+i+'.text']??='';defaults['process.'+i+'.title']??=processNames[i];defaults['process.'+i+'.text']??=''}
 for(let i=0;i<3;i++){defaults['faq.'+i+'.question']=faqNames[i];defaults['faq.'+i+'.answer']=''}
 for(const key of ['practice','more','extraProject.description'])defaults[key]='';defaults['extraProject.title']='PROJECT FOUR';
 const state={version:1,contentRevision:3,fields:{...defaults}};
 function merge(data){if(!data||data.version!==1||!data.fields||typeof data.fields!=='object')return false;for(const key of Object.keys(defaults)){const value=data.fields[key];if(typeof value==='string'&&value.length<(key.endsWith('.image')?6000000:12000)){if(key.endsWith('.image')&&!/^data:image\/(png|jpeg|webp);base64,/.test(value)&&!/^assets\//.test(value))continue;state.fields[key]=value}}return true}
 try{const stored=localStorage.getItem(KEY);if(stored){const previous=JSON.parse(stored);merge(previous);if(!previous.contentRevision){const placeholders=new Set(['YOUR PROFESSION','YOUR NAME','所在城市','PROJECT FOUR','VOLCANO','SEASIDE','BLACK HOLE','视觉场景','项目角色','专业能力','创意方向','使用工具','工作方法','个人介绍待补充\n在此填写你的创作方向与经历']);for(const key of Object.keys(defaults)){if(state.fields[key]===''||placeholders.has(state.fields[key]))state.fields[key]=defaults[key]}}}}catch{}
 if(state.fields.experience==='[公司／机构]｜[岗位]｜[起止时间]\n待补充实际职责、代表项目及可核实成果。')state.fields.experience=defaults.experience;
 if(state.fields.closingStatement==='AI 把重复的工作带走，\n让人重新回到最需要人的地方。')state.fields.closingStatement=defaults.closingStatement;
 const fieldUpgrades={"profession":["AI 操盘手"],"direction":["AI 应用落地与内容生产"],"bio":["AI 应用落地与内容生产\n把需求拆成步骤把创意推进到交付"],"education":["[学校]｜[专业]｜[学历]｜[起止时间]"],"legalName":["姓名待补充"],"email":["邮箱待补充"],"phone":["手机待补充"],"closingStatement":["AI 把重复的工作带走\n让人重新回到最需要人的地方"],"career.2.period":["2026年—2026.08"],"career.2.category":["团队经历"],"career.2.title":["IP 团队","AI 知识类 IP 转型"],"career.2.role":["IP 整体结构完善"],"career.2.summary":["2026年初开始研究 AI，随后加入 IP 团队，参与完善 IP 整体结构。"],"career.2.detail":["2026年8月离职。入职月份、团队名称、正式岗位及具体职责成果后续补充。"],"projects.3.title":["AI 资讯多渠道内容"],"projects.3.category":["内容流程 渠道适配"],"projects.3.role":["选题要求 渠道适配与 AI 协作整理"],"projects.3.description":["一份经过核对的资料两种适合渠道的表达"],"projects.3.detail":["围绕 AIHOT 资讯建立资料检索、来源核对、主题筛选、写作和文稿交付流程。\n将同一主题分别整理为微信公众号长文与小红书分页文案，适配不同渠道的信息密度和表达结构。\n积累可编辑文稿与内容结构模板，强调事实依据、信息时效及内容价值，依据当日资料决定是否成稿。"]};for(const [key,old] of Object.entries(fieldUpgrades))if(old.includes(state.fields[key]))state.fields[key]=defaults[key];
 let editing=false,saveTimer,toastTimer,lens,orbit,movieWall,slideIndex=0,activeUpload=0,scrollTarget=window.scrollY,scrollAnimating=false;
 const images=()=>[0,1,2].map(i=>state.fields['projects.'+i+'.image']);
 const previousSlidePaths=['assets/seaside.png','assets/blackhole.png'];
 previousSlidePaths.forEach((path,i)=>{
  const key='projects.'+(i+1)+'.image';
  if(state.fields[key]===path)state.fields[key]=defaults[key];
 });
 let firstSlideLoad,beginBackgroundSlides;
 function toast(text){$('.toast').textContent=text;$('.toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('show'),3200)}
 function persist(){clearTimeout(saveTimer);try{localStorage.setItem(KEY,JSON.stringify(state));$('.edit-status').textContent='已保存到此浏览器'}catch{$('.edit-status').textContent='请保存资料副本，保留当前修改'}}
 function fitTitles(){for(const el of $$('.title-name')){el.style.fontSize='';const size=parseFloat(getComputedStyle(el).fontSize),r=document.createRange();r.selectNodeContents(el);const w=r.getBoundingClientRect().width,available=el.clientWidth-4;if(w>available)el.style.fontSize=Math.max(26,size*available/w)+'px'}}
 function cleanHeadingText(value){return value.replace(/[,，。!?！？:：;；]/g,'').replace(/[、·•｜|/×↗↘→《》“”‘’「」『』（）()]/g,' ').replace(/\./g,(mark,i,text)=>/\d/.test(text[i-1]||'')&&/\d/.test(text[i+1]||'')?mark:'').replace(/(^|\s)[—–](?=\s|$)/g,'$1').replace(/[ \t]{2,}/g,' ')}
 function formatDisplayHeadings(){if(editing)return;for(const el of $$('main h1,main h2,main h3,main h4,.visual-eyebrow,.visual-lead,.visual-role,.career-role,.career-intro,.hero-description,[data-active-project-category],.reel-note,#closing p')){const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){const next=cleanHeadingText(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next}}}
 function updateBindings(){for(const el of $$('[data-bind]'))el.textContent=state.fields[el.dataset.bind]||'';document.title=(document.body.classList.contains('is-detail')?'个人简历':'作品集')+' '+(state.fields.name||'YOUR NAME');fitTitles();formatDisplayHeadings()}
 function applyFields(){for(const el of $$('[data-field]')){const value=state.fields[el.dataset.field];if(value!==undefined)el.textContent=value}for(const el of $$('[data-image]')){const src=state.fields[el.dataset.image];if(src)el.src=src}updateBindings()}
 function fieldLabel(key){const labels={name:'姓名',profession:'职业方向',city:'所在城市',email:'电子邮箱',phone:'联系电话',bio:'个人介绍',intro:'首页简介',experience:'工作经历',education:'教育背景',skills:'专业能力',practice:'个人实践',awards:'奖项证书',collaborations:'合作活动',notes:'随笔记录',more:'更多内容',closingStatement:'收尾文案'};if(labels[key])return labels[key];const match=key.match(/^(projects|capabilities|process|faq|career)\.(\d)\.(.+)$/);if(match){const group={projects:'项目',capabilities:'能力',process:'流程',faq:'常见问题',career:'经历'}[match[1]],type={title:'名称',category:'类别',role:'角色',description:'介绍',text:'内容',question:'问题',answer:'回答',period:'时间',category:'类型',summary:'概述',detail:'职责详情'}[match[3]]||'内容';return '第'+(Number(match[2])+1)+'个'+group+type}return '预留内容'}
 function editFields(){for(const el of $$('[data-field]')){if(editing){el.setAttribute('contenteditable','true');el.setAttribute('role','textbox');el.setAttribute('aria-label',fieldLabel(el.dataset.field));el.spellcheck=false}else{el.removeAttribute('contenteditable');el.removeAttribute('role');el.removeAttribute('aria-label')}}}
 function setEditing(value){editing=value;document.body.classList.toggle('editing',value);editFields();if(lens)lens.paused=value||reduced;if(!value){persist();updateBindings()}else{$('.edit-status').textContent='点击文字填写，图片可单独更换';toast('空白处也可以填写；修改只保存在当前浏览器')}}
 document.addEventListener('input',event=>{const el=event.target.closest('[data-field]');if(!el)return;state.fields[el.dataset.field]=el.innerText;for(const other of $$('[data-field="'+el.dataset.field+'"]'))if(other!==el)other.textContent=el.innerText;updateBindings();clearTimeout(saveTimer);saveTimer=setTimeout(persist,400)});
 document.addEventListener('paste',event=>{if(!event.target.closest('[data-field]'))return;event.preventDefault();const text=event.clipboardData.getData('text/plain');const selection=window.getSelection();if(!selection?.rangeCount)return;const range=selection.getRangeAt(0);range.deleteContents();const node=document.createTextNode(text);range.insertNode(node);range.setStartAfter(node);range.collapse(true);selection.removeAllRanges();selection.addRange(range);event.target.dispatchEvent(new Event('input',{bubbles:true}))});
 $$('[data-edit-toggle]').forEach(button=>button.addEventListener('click',()=>setEditing(!editing)));
 $('[data-edit-finish]').addEventListener('click',()=>setEditing(false));
 $('[data-backup]').addEventListener('click',()=>{persist();const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(state.fields.name||'我的简历').replace(/[\\/:*?"<>|]/g,'-')+'-简历资料.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('资料副本已保存')});
 $('[data-import]').addEventListener('click',()=>$('[data-import-input]').click());
 $('[data-import-input]').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;if(file.size>19000000){toast('资料文件过大，请选择简历资料 JSON');return}try{const data=JSON.parse(await file.text());if(!merge(data))throw Error('invalid');persist();applyFields();toast('资料已导入');if(lens||orbit)location.reload()}catch{toast('这不是有效的简历资料文件')}});
 const imageInput=document.createElement('input');imageInput.type='file';imageInput.accept='image/png,image/jpeg,image/webp';imageInput.hidden=true;imageInput.setAttribute('aria-label','选择作品图片');document.body.append(imageInput);
 $$('[data-upload]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();activeUpload=Number(button.dataset.upload);imageInput.click()}));
 imageInput.addEventListener('change',async()=>{const file=imageInput.files[0];imageInput.value='';if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15000000){toast('请选择 15 MB 以下的 JPG、PNG 或 WebP 图片');return}try{const bitmap=await createImageBitmap(file),ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);const context=canvas.getContext('2d');context.fillStyle='#222';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();state.fields['projects.'+activeUpload+'.image']=canvas.toDataURL('image/jpeg',.88);persist();applyFields();await Promise.all([lens?.setImages(images()),orbit?.setImages(images())]);toast('图片已更新')}catch{toast('图片读取失败，请换一张重试')}});
 document.addEventListener('click',event=>{if(editing&&event.target.closest('a')&&event.target.closest('[data-field]'))event.preventDefault()});
 function goTo(hash,smooth=true){scrollAnimating=false;const target=document.querySelector('.project-scroll-anchor[data-for="'+hash.replace('#','')+'"]')||document.getElementById(hash.replace('#',''));if(!target||target.closest('#project-store'))return;const anchorCard=target.dataset.for&&document.getElementById(target.dataset.for);const inset=anchorCard?(parseFloat(getComputedStyle(anchorCard).top)||(innerWidth<=700?83:110)):(target.matches(".career-row,.career-account-data,.career-ai-visual .ai-duty")?(innerWidth<=700?83:110):0);const top=target.getBoundingClientRect().top+window.scrollY-inset;scrollTarget=Math.max(0,Math.min(top,document.documentElement.scrollHeight-innerHeight));window.scrollTo({top:scrollTarget,behavior:smooth&&!reduced?'smooth':'instant'});history.replaceState(null,'',hash)}
 $$('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const hash=link.getAttribute('href');if(hash.length>1&&document.getElementById(hash.slice(1))){event.preventDefault();goTo(hash)}}));
 const stackCards=$$('.stack-card'),cardStack=$('.original-card-stack');
 let stackDirty=true;
 function layoutStack(){
  stackCards.forEach((card,i)=>{card.style.setProperty('--stack-top',((innerWidth<=700?82:96)+Math.min(i,5)*6)+'px')});
  stackDirty=true;
 }
 layoutStack();
 window.addEventListener('scroll',()=>{stackDirty=true},{passive:true});
 function drawStack(){
  if(reduced||!stackCards.length||!stackDirty)return;
  stackDirty=false;
  const bounds=cardStack.getBoundingClientRect();
  if(bounds.top>=innerHeight||bounds.bottom<=0)return;
  const positions=stackCards.map(card=>card.getBoundingClientRect().top);
  stackCards.forEach((card,i)=>{
   const next=positions[i+1];
   const scale=next===undefined?1:1-clamp((innerHeight-next)/Math.max(1,innerHeight-96))*.045;
   const value='scale('+scale.toFixed(5)+')';
   if(card.style.transform!==value)card.style.transform=value;
  });
 }
 // Interactive card scenes use native scrolling so embedded app scrolling never fights page inertia.
 if(!reduced&&matchMedia('(pointer:fine)').matches){window.addEventListener('wheel',event=>{if(event.ctrlKey||editing||$('.media-dialog').open||$('.project-detail-dialog')?.open||event.target.closest('.detail-menu.open')||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;if(cardStack){const r=cardStack.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0){scrollAnimating=false;scrollTarget=window.scrollY;return}}event.preventDefault();if(!scrollAnimating)scrollTarget=window.scrollY;scrollTarget=clamp(scrollTarget+event.deltaY,0,document.documentElement.scrollHeight-innerHeight);scrollAnimating=true},{passive:false});window.addEventListener('keydown',event=>{if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(event.key)&&!editing){scrollAnimating=false;scrollTarget=window.scrollY}});window.addEventListener('pointerdown',()=>{scrollAnimating=false})}
 function activeProject(index){slideIndex=index;const box=$('.project-info');box.classList.add('changing');setTimeout(()=>{const name=$('[data-active-project-title]'),category=$('[data-active-project-category]');name.textContent=state.fields['projects.'+index+'.title'];name.dataset.field='projects.'+index+'.title';category.textContent=state.fields['projects.'+index+'.category'];category.dataset.field='projects.'+index+'.category';editFields();formatDisplayHeadings();box.classList.remove('changing')},350);for(const button of $$('[data-slide]'))button.setAttribute('aria-current',String(Number(button.dataset.slide)===index))}
 if(LensSlideshow&&$('.lens-canvas')){
  const sources=images();
  const entryFinished=new Promise(resolve=>{beginBackgroundSlides=resolve});
  const slideLoads=sources.map((src,index)=>index===0?loadImage(src):entryFinished.then(()=>loadImage(src)));
  firstSlideLoad=slideLoads[0];
  lens=new LensSlideshow($('.lens-canvas'),sources,activeProject,slideLoads);
  if($('.orbit-canvas'))orbit=new OrbitDisc($('.orbit-canvas'),sources,slideLoads);
  activeProject(0);$$('[data-slide]').forEach(button=>button.addEventListener('click',()=>lens.go(Number(button.dataset.slide))));$('.pause').addEventListener('click',event=>{lens.paused=!lens.paused;event.currentTarget.textContent=lens.paused?'▷':'Ⅱ';event.currentTarget.setAttribute('aria-pressed',String(lens.paused));event.currentTarget.setAttribute('aria-label',lens.paused?'恢复自动轮播':'暂停自动轮播')})}

 if(MovieWall&&$('.movie-wall'))movieWall=new MovieWall($('.movie-wall'),$('.movie-source'),images());
 const menu=$('.detail-menu');
 function toggleMenu(value){if(!menu)return;menu.classList.toggle('open',value);$('.menu-toggle').setAttribute('aria-expanded',String(value));$('#detail-nav').inert=!value}
 if(menu){$('.menu-toggle').addEventListener('click',()=>toggleMenu(!menu.classList.contains('open')));menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>toggleMenu(false)));document.addEventListener('pointerdown',event=>{if(!menu.contains(event.target))toggleMenu(false)});menu.addEventListener('keydown',event=>{if(event.key==='Escape'){toggleMenu(false);$('.menu-toggle').focus()}})}
 const mobileTrigger=$('.mobile-menu-trigger');
 if(mobileTrigger){const panel=document.createElement('nav');panel.className='home-mobile-nav';panel.setAttribute('aria-label','手机导航');panel.inert=true;panel.innerHTML='<button type="button" class="mobile-close" aria-label="关闭菜单">×</button>'+[['WORKS','cases'],['ABOUT','about'],['EXPERIENCE','experience'],['EDUCATION','education'],['CONTACT','contact']].map(([label,id])=>'<a href="#'+id+'">'+label+'</a>').join('');document.body.append(panel);const toggle=value=>{panel.classList.toggle('open',value);panel.inert=!value;mobileTrigger.setAttribute('aria-expanded',String(value));document.body.classList.toggle('mobile-menu-open',value)};mobileTrigger.addEventListener('click',()=>toggle(true));$('.mobile-close',panel).addEventListener('click',()=>toggle(false));panel.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link){event.preventDefault();toggle(false);goTo(link.hash)}});panel.addEventListener('keydown',event=>{if(event.key==='Escape'){toggle(false);mobileTrigger.focus()}})}
 for(const button of $$('.skill-row>button'))button.addEventListener('click',()=>{const row=button.closest('.skill-row'),open=!row.classList.contains('open');row.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open))});
 const dialog=$('.media-dialog'),dialogVideo=$('video',dialog);
 $('.play-reel')?.addEventListener('click',()=>{dialog.showModal();dialogVideo.play().catch(()=>{})});
 $('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});dialog.addEventListener('close',()=>dialogVideo.pause());
 $('[data-contact]')?.addEventListener('click',async()=>{const email=(state.fields.email||'').trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setEditing(true);$('[data-field="email"]').focus();toast('在这里填写联系邮箱');return}try{await navigator.clipboard.writeText(email);toast('邮箱地址已复制')}catch{location.href='mailto:'+encodeURIComponent(email)}});
 $$('[data-print]').forEach(button=>button.addEventListener('click',()=>{setEditing(false);$$('.section-title,.reveal').forEach(el=>el.classList.add('in'));window.print()}));
 const projectId=Number(new URLSearchParams(location.search).get('project'));
 if(document.body.classList.contains('is-project')&&projectId>=0&&projectId<3){if(lens){lens.index=projectId;lens.next=projectId;activeProject(projectId)}}
 $$('.roll').forEach(link=>link.setAttribute('aria-label',link.textContent.trim()));
 applyFields();
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}},{threshold:.08});
 for(const el of $$('.section-title,.reveal')){if(el.classList.contains('reveal')&&!reduced)el.classList.add('observe');observer.observe(el)}document.documentElement.classList.add('motion-ready');
 const videoObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&!reduced)entry.target.play().catch(()=>{});else entry.target.pause()}},{rootMargin:'200px'});$$('video:not(.movie-source)').filter(el=>!el.closest('dialog')).forEach(video=>videoObserver.observe(video));
 function progress(el){const rect=el.getBoundingClientRect(),range=el.offsetHeight-innerHeight;return clamp(-rect.top/Math.max(1,range))}
 function visible(el){const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}
 const gallery=$('.grid-stage'),collage=$('.collage-grid'),gallerySlides=$$('.gallery-slide'),stageHeading=$('.stage-heading'),stageCounter=$('.stage-counter'),stageCaption=$('.stage-caption'),process=$('.process-section'),track=$('.process-track'),reel=$('.reel-section'),header=$('.site-header');
 let lastDraw=0;
 function tick(time){requestAnimationFrame(tick);if($('.project-detail-dialog')?.open)scrollAnimating=false;if(scrollAnimating){const delta=scrollTarget-window.scrollY;if(Math.abs(delta)<.6){scrollAnimating=false;window.scrollTo(0,scrollTarget)}else window.scrollTo(0,window.scrollY+delta*.105)}drawStack();if(time-lastDraw<1000/40)return;lastDraw=time;
  if(lens&&visible($('.home-hero')))lens.draw(time);
  if(orbit&&visible($('.orbit-section')))orbit.draw(time);
  window.orbitNarrative?.update();
  if(movieWall&&visible($('.content-hero')))movieWall.draw(time,Math.min(innerHeight,window.scrollY));if($('.film-wall')&&visible($('.content-hero'))){const t=reduced?0:time/1000;$$('.film-row').forEach((row,index)=>{row.style.transform='translateX('+(Math.sin(t*.075)*innerWidth*.08*(index%2?1:-1))+'px)'})}
  if(gallery&&visible(gallery)){const p=progress(gallery),start=clamp(p/.23),focus=clamp((p-.15)/.25);collage.style.transform='scale('+(1.45-start*.45)+')';collage.style.opacity=String(1-focus);$('.gallery-slides').style.opacity=String(focus);for(let i=0;i<3;i++){const wipe=clamp((p-(.38+i*.24))/.2);gallerySlides[i].style.zIndex=String(3-i);gallerySlides[i].style.clipPath=i<2?'inset(0 0 '+wipe*100+'% 0)':'inset(0)';gallerySlides[i].style.transform='scale('+(1.12-.12*focus)+') rotate('+(1-focus)*6+'deg)'}const index=p<.58?0:p<.82?1:2;stageHeading.style.opacity=String(focus);stageCounter.style.opacity=String(focus);stageCaption.style.opacity=String(focus);$('span',stageCounter).textContent='0'+(index+1);$('h3',stageCaption).textContent=state.fields['projects.'+index+'.title'];$('p',stageCaption).textContent=state.fields['projects.'+index+'.description']||'作品内容待补充'}
  if(reel&&visible(reel))$('.reel-video').style.transform='scale('+(.85+progress(reel)*.15)+')';
  if(process&&visible(process)){const p=progress(process),distance=Math.max(0,track.scrollWidth-(innerWidth-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--edge'))*2));track.style.transform='translateX('+(-distance*p)+'px)';$('.process-progress span').style.transform='scaleX('+p+')'}
  if(document.body.classList.contains('is-detail')&&!document.body.classList.contains('single-page')){const light=$$('.content-section,.process-section,.marquee,.resume-overview,.original-card-stack,.hueform-project,.ab-project,.newsroom-project,.resume-method,.resume-background,.resume-reserved').some(el=>{const r=el.getBoundingClientRect();return r.top<=70&&r.bottom>70});header.classList.toggle('light',light)}
 }
 requestAnimationFrame(tick);
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{lens?.resize();orbit?.resize();movieWall?.resize();fitTitles();layoutStack()},80)});
 window.addEventListener('keydown',event=>{if(event.key==='Escape'&&editing)setEditing(false)});
 const cover=$('.page-cover');let internalNavigation=false;try{internalNavigation=sessionStorage.getItem('kelen-internal-navigation')==='1';sessionStorage.removeItem('kelen-internal-navigation')}catch{}
 function finishEntry(){
  cover.classList.add('hidden');
  cover.dataset.ready='true';
  document.body.classList.remove('entry-loading');
  document.body.classList.add('entry-complete');
  beginBackgroundSlides?.();
  if(location.hash)goTo(location.hash,false);
 }
 function revealEntry(){
  if(cover.dataset.ready==='true')return;
  const started=performance.now();
  document.body.classList.add('entry-revealing');
  function frame(now){
   if(cover.dataset.ready==='true')return;
   const progress=clamp((now-started)/1500);
   const eased=progress<.5?8*progress**4:1-(-2*progress+2)**4/2;
   const radius=eased*105;
   const mask=`radial-gradient(circle at center,transparent ${radius}%,#000 ${radius}%)`;
   cover.style.maskImage=mask;
   cover.style.webkitMaskImage=mask;
   if(progress<1)requestAnimationFrame(frame);
   else finishEntry();
  }
  requestAnimationFrame(frame);
 }
 const entryTasks=[firstSlideLoad,lens?.ready].filter(Boolean);
 const resources=Promise.allSettled(entryTasks);
 if(reduced||cover.dataset.ready==='true'){
  finishEntry();
 }else if(internalNavigation){
  cover.classList.add('internal-entry');
  setTimeout(revealEntry,150);
 }else{
  document.body.classList.add('entry-loading');
  const ring=$('.entry-progress-front',cover);
  const ringLength=Number(ring.getAttribute('stroke-dashoffset'));
  let completed=0,showingProgress=false;
  function updateProgress(){
   if(showingProgress&&cover.dataset.ready!=='true'){
    const remaining=entryTasks.length?1-completed/entryTasks.length:0;
    ring.style.strokeDashoffset=String(ringLength*remaining);
   }
  }
  function completeTask(){
   completed++;
   updateProgress();
  }
  for(const task of entryTasks)task.then(completeTask,completeTask);
  function showProgress(){
   if(cover.dataset.ready==='true')return;
   showingProgress=true;
   cover.classList.add('entry-progress-visible');
   updateProgress();
   resources.then(()=>setTimeout(revealEntry,500));
  }
  const intro=$('.entry-identity',cover).getAnimations?.()[0];
  if(intro)intro.finished.then(showProgress,showProgress);
  else showProgress();
 }
 cover.dataset.entryManaged='true';
 document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link||event.defaultPrevented||editing||link.target==='_blank'||event.metaKey||event.ctrlKey||event.shiftKey)return;const url=new URL(link.href,location.href);if(url.origin!==location.origin||!/\/(index|profile|project)\.html$/.test(url.pathname))return;if(url.pathname===location.pathname&&url.search===location.search){if(url.hash){event.preventDefault();goTo(url.hash)}return;}event.preventDefault();try{sessionStorage.setItem('kelen-internal-navigation','1')}catch{}cover.style.maskImage='none';cover.style.webkitMaskImage='none';cover.removeAttribute('data-ready');cover.classList.add('leaving');cover.classList.remove('hidden');setTimeout(()=>location.assign(url.href),reduced?0:450)});
 window.addEventListener('hashchange',()=>{if(location.hash)goTo(location.hash,false)});
 if(new URLSearchParams(location.search).has('print'))setTimeout(()=>{setEditing(false);window.print()},1200);
})();
