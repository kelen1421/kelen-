(()=>{
'use strict';
const root=document.getElementById('cases');if(!root?.classList.contains('project-directory'))return;
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const items=$$('.directory-item',root),preview=$('.directory-preview-button',root),cover=$('img',preview),date=$('time',preview),mask=$('#project-gold-reveal'),flow=$('.project-gold-flow'),glow=$('.project-gold-glow');
const ribbonLength=mask.getTotalLength();for(const path of [mask,glow]){path.setAttribute('stroke-dasharray',ribbonLength+' '+ribbonLength);path.setAttribute('stroke-dashoffset',String(reduced?0:ribbonLength))}flow.setAttribute('stroke-dasharray',(ribbonLength*.045)+' '+(ribbonLength*.955));
const gallery=$('.work-orbit-gallery'),galleryImages=$$('.work-orbit-image',gallery),phrase=$('.work-orbit-phrase',gallery),store=$('#project-store'),dialog=$('#project-detail-dialog');
let active=-1,manual=-1,raf=0,dirty=true,geometry={},targetRX=0,targetRY=0,rx=0,ry=0,progress=0,lastTime=0,swapTimer=0,current=null,previousFocus=null,returnY=0,returnHash='#cases',closing=false;
const projects=new Map();
for(const item of items){const article=document.getElementById(item.dataset.project);if(article)projects.set(item.dataset.project,{item,article,heading:$('.visual-heading',article),image:item.dataset.cover,date:item.dataset.date,static:article.dataset.static==='true'})}
// Keep the two original content scenes reachable through existing links.
for(const id of ['reel','newsroom'])if(!projects.has(id)){const article=document.getElementById(id);if(article)projects.set(id,{article,heading:$('.visual-heading',article),image:'assets/projects/'+id+'.png',date:'2026.10',static:false})}
function measure(){
 const r=root.getBoundingClientRect(),g=gallery.getBoundingClientRect();
 geometry={top:r.top+scrollY,height:r.height,galleryTop:g.top+scrollY,galleryHeight:g.height,centers:items.map(item=>{const b=item.getBoundingClientRect();return b.top+scrollY+b.height/2})};dirty=true;wake();
}
function activate(index){
 if(index<0||index===active)return;active=index;
 items.forEach((el,i)=>{el.classList.toggle('active',i===index);el.setAttribute('aria-current',String(i===index))});
 const item=items[index];preview.setAttribute('aria-label','查看'+item.textContent.trim());
 const swap=()=>{cover.src=item.dataset.cover;cover.alt=item.textContent.trim()+'项目预览';date.textContent=item.dataset.date;preview.classList.remove('changing')};
 clearTimeout(swapTimer);if(reduced||!cover.complete)swap();else{preview.classList.add('changing');swapTimer=setTimeout(swap,120)}
}
function wake(){if(!raf)raf=requestAnimationFrame(tick)}
function tick(time){
 raf=0;const vh=innerHeight,sy=scrollY,rTop=geometry.top-sy,gTop=geometry.galleryTop-sy;
 const shown=rTop<vh*.8&&rTop+geometry.height>vh*.2;
 root.classList.toggle('is-project-visible',shown);
 if(shown){
  if(dirty){let closest=0,best=Infinity;geometry.centers.forEach((center,i)=>{const distance=Math.abs(center-sy-vh/2);if(distance<best){best=distance;closest=i}if(!reduced)items[i].style.transform=`translateX(${(Math.min(distance/(vh*.5),1)*(innerWidth<700?0:60)).toFixed(1)}px)`});activate(manual>=0?manual:closest);dirty=false}
  const target=clamp((vh*.7-rTop)/(geometry.height+vh*.5));
  progress=reduced?1:progress+(target-progress)*Math.min(.25,(time-lastTime)/110||.12);
  const ribbonOffset=String(reduced?0:(1-progress)*ribbonLength);mask.setAttribute('stroke-dashoffset',ribbonOffset);glow.setAttribute('stroke-dashoffset',ribbonOffset);
  if(!reduced){const position=(time*.000055)%Math.max(progress,.001);flow.setAttribute('stroke-dashoffset',String(-position*ribbonLength));rx+=(targetRX-rx)*.1;ry+=(targetRY-ry)*.1;preview.style.transform=`rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`}
 }
 const galleryShown=gTop<vh&&gTop+geometry.galleryHeight>0;
 if(!reduced&&galleryShown){
  const p=clamp(-gTop/Math.max(1,geometry.galleryHeight-vh)),range=1+.13*(galleryImages.length-1),radius=Math.min(innerWidth*.34,740),depth=innerWidth<700?250:500,tilt=innerWidth<700?80:150;
  galleryImages.forEach((image,i)=>{const t=p*range-i*.13;if(t<=0||t>=1){image.style.opacity='0';image.style.pointerEvents='none';image.inert=true;return}image.inert=false;const alpha=Math.min(1,t/.06,(1-t)/.06);let x,y,z,rot;if(t<.12){const q=t/.12;x=-innerWidth*.85*(1-q);y=tilt;z=depth*q;rot=0}else if(t<.88){const q=(t-.12)/.76,angle=Math.PI/2-q*Math.PI*2;x=Math.cos(angle)*radius;z=Math.sin(angle)*depth;y=z/depth*tilt;rot=q*360}else{const q=(t-.88)/.12;x=innerWidth*.85*q;y=tilt;z=depth*(1-q);rot=360}image.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${rot.toFixed(1)}deg)`;image.style.opacity=String(alpha);image.style.zIndex=String(Math.round(z+600));image.style.pointerEvents=alpha>.25?'auto':'none'});
  phrase.style.opacity=String(clamp((p-.12)/.16)*clamp((.92-p)/.15));
 }
 lastTime=time;if(!reduced&&(shown||galleryShown))wake();
}
items.forEach((item,i)=>{item.addEventListener('pointerenter',()=>{manual=i;dirty=true;wake()});item.addEventListener('pointerleave',()=>{manual=-1;dirty=true;wake()});item.addEventListener('focus',()=>{manual=i;dirty=true;wake()})});
root.addEventListener('pointermove',event=>{if(reduced)return;const b=preview.getBoundingClientRect();targetRY=clamp((event.clientX-b.left-b.width/2)/(b.width/2),-1,1)*6;targetRX=-clamp((event.clientY-b.top-b.height/2)/(b.height/2),-1,1)*5;wake()});
root.addEventListener('pointerleave',()=>{targetRX=targetRY=0});
preview.addEventListener('click',()=>{if(active>=0)openProject(items[active].dataset.project)});
function openProject(id,updateHistory=true,origin=null){
 const project=projects.get(id);if(!project||closing)return;measure();
 if(current){if(current===project)return;closeProject(false,true)}
 current=project;previousFocus=document.activeElement;returnY=scrollY;const fromWorkflow=origin?.closest('#ip-workflow');returnHash=fromWorkflow?'#ip-workflow':'#cases';if(!fromWorkflow&&returnY<geometry.top-innerHeight){const index=items.findIndex(el=>el.dataset.project===id);returnY=index<0?geometry.top:Math.max(0,geometry.centers[index]-innerHeight/2)}
 const copy=$('.project-detail-copy',dialog),body=$('.project-live-body',dialog),image=$('.project-detail-cover>img',dialog),jump=$('.project-detail-jump',dialog);
 copy.replaceChildren(project.heading);image.src=project.image;image.alt=$('h2',project.heading)?.textContent+'项目预览';
 body.replaceChildren(project.article);jump.textContent=project.static?'查看截图 ↘':id==='reel'?'观看作品 ↘':'体验项目 ↘';
 if(project.static)body.dataset.static='true';else delete body.dataset.static;
 if(id==='reel'){const video=document.createElement('video');video.src='workbench/assets/toolkit-intro.mp4';video.controls=true;video.playsInline=true;video.preload='metadata';video.className='project-detail-reel';body.prepend(video)}
 document.body.classList.add('project-detail-open');dialog.classList.remove('is-leaving');dialog.showModal();dialog.scrollTop=0;
 if(updateHistory)history.pushState({kelenProject:id},'','#'+id);
 $('[data-project-close]',dialog).focus({preventScroll:true});
}
function closeProject(updateHistory=true,immediate=false){
 if(!current||closing)return;closing=true;const saved=current;
 const finish=()=>{for(const video of $$('video',dialog))video.pause();saved.article.prepend(saved.heading);store.append(saved.article);$('.project-detail-copy',dialog).replaceChildren();$('.project-live-body',dialog).replaceChildren();dialog.close();dialog.classList.remove('is-leaving');document.body.classList.remove('project-detail-open');current=null;closing=false;window.scrollTo({top:returnY,behavior:'instant'});previousFocus?.focus({preventScroll:true});if(updateHistory)history.replaceState(null,'',returnHash);dirty=true;wake()};
 if(reduced||immediate)finish();else{dialog.classList.add('is-leaving');setTimeout(finish,220)}
}
$('[data-project-close]',dialog).addEventListener('click',()=>closeProject());
dialog.addEventListener('cancel',event=>{event.preventDefault();closeProject()});
$('.project-detail-jump',dialog).addEventListener('click',()=>$('.project-live-body',dialog).scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'}));
$('[data-project-contact]',dialog).addEventListener('click',event=>{event.preventDefault();closeProject(false,true);history.replaceState(null,'','#contact');document.getElementById('contact').scrollIntoView({behavior:reduced?'instant':'smooth'})});
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href]');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||link.target==='_blank')return;
 const url=new URL(link.href,location.href),id=url.hash.slice(1);if(url.origin!==location.origin||!projects.has(id))return;
 event.preventDefault();event.stopImmediatePropagation();const itemIndex=items.findIndex(item=>item===link);
 if(itemIndex>=0&&active!==itemIndex&&event.detail>0&&innerWidth>700){manual=itemIndex;activate(itemIndex);items[itemIndex].scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});return}
 openProject(id,true,link);
},true);
addEventListener('popstate',()=>{const id=location.hash.slice(1);if(projects.has(id))openProject(id,false);else closeProject(false,true)});
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(projects.has(id)&&!current)openProject(id,false)});
addEventListener('scroll',()=>{dirty=true;manual=-1;wake()},{passive:true});
addEventListener('resize',measure);addEventListener('load',measure,{once:true});const layoutObserver=new ResizeObserver(measure);layoutObserver.observe(root);const main=document.getElementById('main');if(main)layoutObserver.observe(main);document.fonts.ready.then(measure);
if(!reduced)for(const image of galleryImages){const img=$('img',image);if(!img)continue;image.classList.add('has-slices');for(let i=0;i<7;i++){const slice=document.createElement('span');slice.className='work-orbit-slice';slice.style.cssText=`left:${i/7*100}%;width:calc(100% / 7 + .6px);background-image:url("${img.getAttribute('src')}");background-position:${i/6*100}% center;transform:rotateY(${(i-3)*8}deg) translateZ(${(9-(i-3)**2)*.8}px)`;image.append(slice)}}
if(reduced)mask.setAttribute('stroke-dashoffset','0');
measure();activate(0);
const deepLink=location.hash.slice(1);if(projects.has(deepLink)){const coverLayer=$('.page-cover');if(coverLayer?.dataset.ready==='true')openProject(deepLink,false);else if(coverLayer){const observer=new MutationObserver(()=>{if(coverLayer.dataset.ready==='true'){observer.disconnect();openProject(deepLink,false)}});observer.observe(coverLayer,{attributes:true,attributeFilter:['data-ready']})}}
})();
