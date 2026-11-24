(()=>{
 'use strict';
 const root=document.getElementById('ip-workflow');if(!root)return;
 const stage=root.querySelector('.practice-reel-stage'),aura=root.querySelector('.practice-aura'),intro=root.querySelector('.practice-reel-copy'),cards=[...root.querySelectorAll('.practice-reel-card')],screen=root.querySelector('.practice-reel-screen'),copy=root.querySelector('.practice-step-copy'),count=root.querySelector('[data-flow-track]'),title=root.querySelector('.practice-step-title'),lead=root.querySelector('.practice-step-lead'),description=root.querySelector('.practice-step-description'),input=root.querySelector('[data-flow-input]'),output=root.querySelector('[data-flow-output]'),links=[...root.querySelectorAll('.practice-step-nav a')],anchors=[...root.querySelectorAll('.practice-flow-anchor')];
 const media=matchMedia('(prefers-reduced-motion: reduce)'),clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
 const workflowStart=.35,workflowLength=.48,nav=root.querySelector('.practice-step-nav'),footer=root.querySelector('.practice-reel-footer');
 let raf=0,current=-1,activeLink=-1,pointerX=0,pointerY=0,lastRange=-1;
 const gate=root.querySelector('.practice-reel-cards');
 const overviewStart=workflowStart+workflowLength,overviewEnd=.95;
 const disc=root.querySelector('.practice-disc-art');
 const columnIndex=root.querySelector('.practice-disc-index');
 const indexPhoto=gate.querySelector('.practice-index-preview');
 const titleLines=[...intro.querySelectorAll('.practice-reel-line')];
 const imprint=[...screen.querySelectorAll('.practice-sleeve-word')];
 const indexStart=.255;
 const indexList=columnIndex.querySelector('ol');
 cards.forEach((card,i)=>{
  const item=document.createElement('li'),link=document.createElement('a'),number=document.createElement('span');
  number.textContent=String(i+1).padStart(2,'0');
  link.href=links[i].getAttribute('href');
  link.append(number,card.dataset.title);
  item.append(link);
  indexList.append(item);
 });
 // Unequal positions and depth offsets follow the reference's successive camera fly-through.
 const flights=[[-.55,-.30,0],[.40,.48,.018],[-.72,.27,.007],[.63,-.32,.028],[-.25,-.63,.013],[.43,.66,.035],[-.58,.66,.023],[.66,.20,.042],[-.85,-.48,.047]];
 function bridge(){
  const geometry=window.orbitNarrative?.getExitGeometry?.();
  const overlap=!media.matches&&geometry?Math.max(0,geometry.end-geometry.start):0;
  root.style.marginTop=overlap?-overlap+'px':'';
  root.dataset.apertureBridge=String(Math.round(overlap));lastRange=-1;wake();
 }
 function setStep(index){
  if(index===current)return;
  current=index;
  const data=cards[index].dataset;
  count.textContent=String(index+1).padStart(2,'0');
  title.textContent=data.title;
  title.style.setProperty('--title-length',String(data.title.length));
  lead.textContent=data.lead;
  description.textContent=data.description;
  input.textContent=data.input;
  output.textContent=data.output;
 }
 function highlightStep(index){
  if(index===activeLink)return;
  activeLink=index;
  links.forEach((link,i)=>{
   link.setAttribute('aria-current',i===index?'step':'false');
   link.classList.toggle('is-complete',i<index);
  });
 }
 function labelIndex(alpha){
  columnIndex.style.opacity=String(alpha);
  columnIndex.style.visibility=alpha>0?'visible':'hidden';
  columnIndex.inert=alpha<.6;
 }
 function placePanel(el,down,visible){
  el.style.visibility=visible?'visible':'hidden';
  if(visible){
   el.style.opacity='1';
   el.style.transform=`translateY(${down*100}%)`;
  }
 }
 function drawTracks(p){
  const sequence=clamp((p-workflowStart)/workflowLength)*cards.length;
  const step=Math.min(cards.length-1,Math.floor(sequence));
  const turn=step<cards.length-1?smooth((sequence-step-.6)/.4):0;
  const opening=smooth((p-workflowStart)/.016);
  const closing=smooth((p-overviewStart)/(overviewEnd-overviewStart));
  const selected=turn>=.5?step+1:step;
  disc.style.opacity=String(1-closing);
  disc.style.removeProperty('transform');
  disc.style.setProperty('--disc-angle',(-16+6*(step+turn)+closing*18)+'deg');
  labelIndex(1-opening);
  copy.style.opacity=String(opening*(1-Math.sin(Math.PI*turn))*(1-smooth(closing/.55)));
  setStep(selected);
  highlightStep(closing>=.5?cards.length:selected);
  gate.style.opacity='1';
  placePanel(indexPhoto,opening,opening<1);
  cards.forEach((card,i)=>{
   const incoming=i===step+1&&turn>0;
   const position=incoming?turn-1:turn+closing-(1-opening);
   placePanel(card,position,(i===step||incoming)&&closing<1);
  });
  screen.style.removeProperty('clip-path');
  screen.style.setProperty('--sleeve-print','1');
  imprint.forEach(word=>word.style.removeProperty('transform'));
  screen.style.opacity=String(closing);
  screen.style.visibility=closing>0?'visible':'hidden';
  screen.style.transform=`translate(-50%,-50%) scale(${.88+.12*closing})`;
  screen.inert=closing<.99;
 }
 function drawSleeve(p,w,h){
  const fold=smooth((p-.185)/.032);
  const typeset=smooth((p-.213)/.027);
  const slide=smooth((p-indexStart)/.048);
  const titleLine=titleLines[0];
  const lineHeight=titleLine.offsetHeight;
  titleLines.slice(1).forEach((line,i)=>{
   line.style.opacity=String(1-fold);
   line.style.transform=`translateY(-${(i+1)*fold*100}%) scaleY(${1-.8*fold})`;
  });
  intro.style.transform=`translateY(${fold*lineHeight}px)`;
  intro.style.opacity=String(smooth((p-.14)/.035)*(1-smooth((p-.213)/.007)));
  screen.style.transform=`translate(-50%,-50%) translateX(${-w*.98*slide}px)`;
  screen.style.clipPath=`inset(0 ${smooth(slide/.48)*38}% 0 0)`;
  screen.style.setProperty('--sleeve-print',String(typeset));
  screen.style.opacity=String(smooth((p-.213)/.007));
  screen.style.visibility=p>=.213&&slide<1?'visible':'hidden';
  screen.inert=true;
  if(p>=.213&&typeset<1){
   // Map the original line onto the two printed word positions before the sleeve slides.
   const range=document.createRange();
   range.selectNodeContents(titleLine);
   const from=range.getBoundingClientRect();
   const size=parseFloat(getComputedStyle(titleLine).fontSize);
   imprint.forEach((word,i)=>{
    const row=word.parentElement,box=row.getBoundingClientRect();
    const dx=from.left+(i?size*1.16:0)-box.left;
    const dy=from.top+from.height/2-box.top-box.height/2;
    const scale=size/parseFloat(getComputedStyle(row).fontSize);
    word.style.transform=`translate(${dx*(1-typeset)}px,${dy*(1-typeset)}px) scale(${1+(scale-1)*(1-typeset)})`;
   });
  }else imprint.forEach(word=>word.style.removeProperty('transform'));
  const listing=smooth((p-.28)/.025);
  labelIndex(listing);
  copy.style.opacity='0';
  disc.style.opacity=String(smooth(slide/.45));
  disc.style.setProperty('--disc-angle',(-26+10*slide)+'deg');
  if(slide>0&&slide<1){
   const startX=w*.5+screen.offsetWidth*.16;
   const scale=.53*screen.offsetWidth/Math.max(1,disc.offsetWidth);
   disc.style.transform=`translate(-50%,-50%) translate(${(startX-disc.offsetLeft)*(1-slide)}px,${(h*.5-disc.offsetTop)*(1-slide)}px) scale(${scale+(1-scale)*slide})`;
  }else disc.style.removeProperty('transform');
  placePanel(indexPhoto,listing-1,listing>0);
  gate.style.opacity='1';
  highlightStep(-1);
 }
 function draw(){
  raf=0;const box=root.getBoundingClientRect(),w=stage.clientWidth,h=stage.clientHeight,reduced=media.matches;
  if(reduced){
   root.removeAttribute('data-disc-run');
   root.dataset.progress='1.000';root.dataset.phase='overview';root.dataset.inView='false';
   screen.inert=false;nav.inert=false;stage.inert=false;columnIndex.inert=true;
   screen.style.removeProperty('--sleeve-print');
   for(const el of [stage,gate,aura,intro,copy,screen,disc,columnIndex,indexPhoto,...imprint,...titleLines,nav,footer,...cards]){
    for(const prop of ['opacity','transform','visibility','clip-path'])el.style.removeProperty(prop);
   }
   stage.style.removeProperty('background-color');
   if(lastRange!==root.offsetHeight){
    anchors.forEach((anchor,i)=>{
     const target=cards[i]||(anchor.id==='ip-flow-overview'?screen:intro);
     anchor.style.top=(target.getBoundingClientRect().top-box.top)+'px';
    });
    lastRange=root.offsetHeight;
   }
   return;
  }
  // The overlapping scene stays transparent while approaching the viewport.
  // Reveal its entire pinned surface only once it can replace the previous frame in place.
  const started=box.top<=1;stage.style.opacity=started?'1':'0';root.dataset.stageActive=String(started);
  const range=Math.max(1,root.offsetHeight-h);if(range!==lastRange){anchors.forEach((a,i)=>a.style.top=(range*(a.dataset.progress?Number(a.dataset.progress):workflowStart+workflowLength*(i+.4)/9))+'px');lastRange=range}
  const inView=box.bottom>0&&box.top<h;
  root.dataset.inView=String(inView);
  stage.inert=!started||!inView;
  if(!inView)return;
  const p=clamp(-box.top/range),mobile=w<=700;
  const phase=p<.14?'scatter':p<.213?'title':p<.30?'sleeve':p<workflowStart?'index':p<overviewStart?'workflow':p<overviewEnd?'outro':'overview';
  root.dataset.progress=p.toFixed(3);root.dataset.phase=phase;
  root.toggleAttribute('data-disc-run',p>=indexStart);
  // First send every module out from the center. Reveal the name only after the center clears.
  const introIn=smooth((p-.14)/.035);
  const circleOut=smooth((p-.085)/.055);
  stage.style.backgroundColor=`rgb(${25-circleOut*20} ${25-circleOut*18} ${25-circleOut*15})`;
  aura.style.opacity=String(smooth((p-.09)/.055)*(1-smooth((p-.207)/.04)));aura.style.transform=`translate(-50%,-50%) scale(${.92+introIn*.09}) rotate(${pointerX*.12}deg)`;
  footer.style.opacity=String(smooth((p-.11)/.035));
  nav.style.opacity=String(smooth((p-.30)/.025));nav.inert=p<.30;
  if(p>=workflowStart){
   intro.style.opacity='0';
   drawTracks(p);
   return;
  }
  drawSleeve(p,w,h);
  cards.forEach((card,i)=>{
   card.style.removeProperty('clip-path');
   const flight=flights[i],time=clamp((p+.014-flight[2])/.095),projection=.5/(5.8-5.55*time),alpha=smooth((p+.014-flight[2])/.012)*(1-smooth((time-.91)/.09));
   const x=flight[0]*w*projection*(mobile?1.15:1),y=flight[1]*h*projection,scale=projection*(mobile?.82:.62);
   card.style.opacity=String(alpha);card.style.visibility=alpha<.001?'hidden':'visible';
   card.style.zIndex=String(10+Math.round(projection*100));
   card.style.transform=`translate(-50%,-50%) translate(${x+pointerX*.2}px,${y+pointerY*.2}px) scale(${scale})`;
  });
 }
 function wake(){if(!raf)raf=requestAnimationFrame(draw)}
 addEventListener('scroll',wake,{passive:true});addEventListener('resize',bridge,{passive:true});addEventListener('pageshow',bridge);media.addEventListener('change',bridge);
 stage.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const b=stage.getBoundingClientRect();pointerX=(event.clientX-b.left-wSafe(b)/2)/wSafe(b)*14;pointerY=(event.clientY-b.top-b.height/2)/Math.max(1,b.height)*10;wake()},{passive:true});stage.addEventListener('pointerleave',()=>{pointerX=pointerY=0;wake()});
 function wSafe(b){return Math.max(1,b.width)}
 new ResizeObserver(wake).observe(stage);const precedingIntro=document.querySelector('#about .orbit-intro-contents');if(precedingIntro)new ResizeObserver(bridge).observe(precedingIntro);document.fonts.ready.then(bridge);bridge();draw();
})();
