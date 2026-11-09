(()=>{
'use strict';
const root=document.getElementById('cases');if(!root?.classList.contains('original-card-stack'))return;
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cards=$$('[data-project-card]',root),select=$('#project-page-select',root);
const gallery=$('.work-orbit-gallery'),galleryImages=$$('.work-orbit-image',gallery),phrase=$('.work-orbit-phrase',gallery),store=$('#project-store'),dialog=$('#project-detail-dialog');
let active=-1,raf=0,dirty=true,geometry={},current=null,previousFocus=null,returnY=0,returnHash='#cases',closing=false,flipFrame=0;
const projects=new Map();
for(const card of cards){
 const id=card.dataset.projectCard,article=document.getElementById(id);
 if(article)projects.set(id,{article,heading:$('.visual-heading',article),image:card.dataset.cover,static:article.dataset.static==='true'});
}
function measure(){
 const r=root.getBoundingClientRect(),g=gallery.getBoundingClientRect();
 geometry={top:r.top+scrollY,height:r.height,galleryTop:g.top+scrollY,galleryHeight:g.height,pages:cards.map(card=>{
  const marker=card.previousElementSibling;
  const inset=parseFloat(getComputedStyle(card).getPropertyValue('--stack-top'))||96;
  return marker.getBoundingClientRect().top+scrollY-inset;
 })};
 dirty=true;wake();
}
function wake(){if(!raf)raf=requestAnimationFrame(tick)}
function tick(){
 raf=0;const vh=innerHeight,sy=scrollY,gTop=geometry.galleryTop-sy;
 if(dirty){
  active=0;
  for(let i=1;i<cards.length;i++)if(sy>=geometry.pages[i]-12)active=i;
  select.value=String(active);
  dirty=false;
 }
 const galleryShown=gTop<vh&&gTop+geometry.galleryHeight>0;
 if(!reduced&&galleryShown){
  const p=clamp(-gTop/Math.max(1,geometry.galleryHeight-vh)),range=1+.13*(galleryImages.length-1),radius=Math.min(innerWidth*.34,740),depth=innerWidth<700?250:500,tilt=innerWidth<700?80:150;
  galleryImages.forEach((image,i)=>{const t=p*range-i*.13;if(t<=0||t>=1){image.style.opacity='0';image.style.pointerEvents='none';image.inert=true;return}image.inert=false;const alpha=Math.min(1,t/.06,(1-t)/.06);let x,y,z,rot;if(t<.12){const q=t/.12;x=-innerWidth*.85*(1-q);y=tilt;z=depth*q;rot=0}else if(t<.88){const q=(t-.12)/.76,angle=Math.PI/2-q*Math.PI*2;x=Math.cos(angle)*radius;z=Math.sin(angle)*depth;y=z/depth*tilt;rot=q*360}else{const q=(t-.88)/.12;x=innerWidth*.85*q;y=tilt;z=depth*(1-q);rot=360}image.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${rot.toFixed(1)}deg)`;image.style.opacity=String(alpha);image.style.zIndex=String(Math.round(z+600));image.style.pointerEvents=alpha>.25?'auto':'none'});
  phrase.style.opacity=String(clamp((p-.12)/.16)*clamp((.92-p)/.15));
 }

}
const springRate=16; // Natural frequency of a critically damped spring (ζ = 1).
const edgeTravel=44;
const restitution=.55;

function settle(position,velocity,draw,finish,edge=0){
 const started=performance.now();
 let previous=started,id;
 function frame(now){
  if(now-started>=800){draw(0);finish?.();return}
  let remaining=(now-previous)/1000;
  previous=now;
  // Small time steps at the boundary keep the collision stable on slow frames.
  while(remaining>0){
   const dt=edge?Math.min(remaining,1/240):remaining;
   remaining-=dt;
   const slope=velocity+springRate*position,decay=Math.exp(-springRate*dt);
   position=(position+slope*dt)*decay;
   velocity=(velocity-springRate*slope*dt)*decay;
   if(edge*position>=edgeTravel){
    position=edge*edgeTravel;
    if(edge*velocity>0)velocity*=-restitution;
   }
  }
  if(Math.abs(position)<.35&&Math.abs(velocity)<5){draw(0);finish?.();return}
  draw(position);
  id=requestAnimationFrame(frame);
 }
 id=requestAnimationFrame(frame);
 return ()=>cancelAnimationFrame(id);
}
let stopFlip=null;
function cancelFlip(){stopFlip?.();stopFlip=null}
function moveTo(index,velocity=0,focusStep=0){
 cancelFlip();
 const start=scrollY,target=Math.max(0,Math.min(geometry.pages[index],document.documentElement.scrollHeight-innerHeight)),offset=start-target;
 const draw=value=>window.scrollTo({top:target+value,behavior:'instant'});
 const finish=()=>{
  flipFrame=0;
  select.value=String(index);
  if(focusStep){
   const button=$('[data-project-step="'+focusStep+'"]',cards[index]);
   (button.disabled?$('.project-page-image',cards[index]):button).focus({preventScroll:true});
  }
 };
 if(reduced||Math.abs(offset)<1){draw(0);finish();return}
 flipFrame=1;
 const speed=clamp(velocity,-Math.abs(offset)*15,Math.abs(offset)*15);
 stopFlip=settle(offset,speed,draw,finish);
}
select.addEventListener('change',()=>moveTo(Number(select.value)));
for(const [index,card] of cards.entries()){
 for(const button of $$('[data-project-step]',card)){
  const step=Number(button.dataset.projectStep);
  button.addEventListener('click',()=>moveTo(index+step,0,step));
 }
 if(reduced)continue;
 const surface=$('.project-page-surface',card),link=$('.project-page-image',card);
 const edge=index===0?1:index===cards.length-1?-1:0;
 let gesture=null,stopSettle=null;
 const tilt=value=>{
  surface.style.setProperty('--page-drag',value.toFixed(2)+'px');
  surface.style.setProperty('--page-tilt',(value/18).toFixed(2)+'deg');
 };
 link.addEventListener('dragstart',event=>event.preventDefault());
 link.addEventListener('pointerdown',event=>{
  if(event.button!==0||!event.isPrimary||event.metaKey||event.ctrlKey||event.shiftKey)return;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,time:event.timeStamp,dx:0,velocity:0,offset:0,startOffset:0,dragging:false};
 });
 link.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.dragging){
   if(Math.abs(dy)>9&&Math.abs(dy)>Math.abs(dx)){gesture=null;return}
   if(Math.abs(dx)<9||Math.abs(dx)<=Math.abs(dy))return;
   stopSettle?.();cancelFlip();flipFrame=0;
   gesture.startOffset=parseFloat(surface.style.getPropertyValue('--page-drag'))||0;
   link.setPointerCapture(event.pointerId);gesture.dragging=true;
  }
  const outward=edge*dx>0;
  gesture.velocity=.45*gesture.velocity+.55*(event.clientX-gesture.lastX)*1000/Math.max(8,event.timeStamp-gesture.time);
  gesture.dx=dx;gesture.lastX=event.clientX;gesture.time=event.timeStamp;
  gesture.offset=clamp(gesture.startOffset+dx*(outward?.17:.35),edge===-1?-edgeTravel:-90,edge===1?edgeTravel:90);
  tilt(gesture.offset);
 });
 function endGesture(event){
  if(!gesture||gesture.id!==event.pointerId)return;
  const released=gesture;gesture=null;
  if(!released.dragging)return;
  link.dataset.swiped=String(performance.now());
  const velocity=event.type==='pointerup'&&event.timeStamp-released.time<95?released.velocity:0;
  const intent=released.dx+clamp(velocity,-1100,1100)*.09;
  const next=index+(intent<0?1:-1);
  const pageTurn=event.type==='pointerup'&&Math.abs(intent)>52&&next>=0&&next<cards.length;
  const speed=clamp(velocity*(edge*released.dx>0?.17:.35),-300,300);
  stopSettle=settle(released.offset,speed,value=>tilt(
   edge?value:released.offset<0?Math.min(value,0):Math.max(value,0)
  ),undefined,edge);
  if(pageTurn)moveTo(next,-velocity*1.3);
 }
 link.addEventListener('pointerup',endGesture);
 link.addEventListener('pointercancel',endGesture);
 link.addEventListener('lostpointercapture',endGesture);
 link.addEventListener('pointerleave',()=>{if(gesture&&!gesture.dragging)gesture=null});

}
addEventListener('wheel',()=>{cancelFlip();flipFrame=0},{passive:true});
addEventListener('keydown',event=>{
 if(flipFrame&&['PageDown','PageUp','Home','End','ArrowUp','ArrowDown',' '].includes(event.key)){cancelFlip();flipFrame=0}
});
function openProject(id,updateHistory=true,origin=null){
 const project=projects.get(id);if(!project||closing)return;measure();
 if(current){if(current===project)return;closeProject(false,true)}
 cancelFlip();flipFrame=0;current=project;previousFocus=document.activeElement;returnY=scrollY;const fromWorkflow=origin?.closest('#ip-workflow');returnHash=fromWorkflow?'#ip-workflow':'#cases';if(!fromWorkflow&&returnY<geometry.top-innerHeight){const index=cards.findIndex(el=>el.dataset.projectCard===id);returnY=index<0?geometry.top:Math.max(0,geometry.pages[index])}
 const copy=$('.project-detail-copy',dialog),body=$('.project-live-body',dialog),image=$('.project-detail-cover>img',dialog),jump=$('.project-detail-jump',dialog);
 copy.replaceChildren(project.heading);image.src=project.image;image.alt=$('h2',project.heading)?.textContent+'项目预览';
 body.replaceChildren(project.article);jump.textContent=project.static?'查看截图 ↘':id==='reel'?'观看作品 ↘':'体验项目 ↘';
 if(project.static)body.dataset.static='true';else delete body.dataset.static;
 if(id==='reel'&&!$('video',body)){const video=document.createElement('video');video.src='workbench/assets/toolkit-intro.mp4';video.controls=true;video.playsInline=true;video.preload='metadata';video.className='project-detail-reel';body.prepend(video)}
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
 if(event.defaultPrevented)return;
 if(event.detail&&performance.now()-Number(link.dataset.swiped)<500){event.preventDefault();return}
 event.preventDefault();event.stopImmediatePropagation();
 openProject(id,true,link);
},true);
addEventListener('popstate',()=>{const id=location.hash.slice(1);if(projects.has(id))openProject(id,false);else closeProject(false,true)});
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(projects.has(id)&&!current)openProject(id,false)});
addEventListener('scroll',()=>{dirty=true;wake()},{passive:true});
addEventListener('resize',measure);addEventListener('load',measure,{once:true});const layoutObserver=new ResizeObserver(measure);layoutObserver.observe(root);const main=document.getElementById('main');if(main)layoutObserver.observe(main);document.fonts.ready.then(measure);
if(!reduced)for(const image of galleryImages){const img=$('img',image);if(!img)continue;image.classList.add('has-slices');for(let i=0;i<7;i++){const slice=document.createElement('span');slice.className='work-orbit-slice';slice.style.cssText=`left:${i/7*100}%;width:calc(100% / 7 + .6px);background-image:url("${img.getAttribute('src')}");background-position:${i/6*100}% center;transform:rotateY(${(i-3)*8}deg) translateZ(${(9-(i-3)**2)*.8}px)`;image.append(slice)}}
measure();
const deepLink=location.hash.slice(1);if(projects.has(deepLink)){const coverLayer=$('.page-cover');if(coverLayer?.dataset.ready==='true')openProject(deepLink,false);else if(coverLayer){const observer=new MutationObserver(()=>{if(coverLayer.dataset.ready==='true'){observer.disconnect();openProject(deepLink,false)}});observer.observe(coverLayer,{attributes:true,attributeFilter:['data-ready']})}}
})();
