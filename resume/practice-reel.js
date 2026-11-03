(()=>{
 'use strict';
 const root=document.getElementById('ip-workflow');if(!root)return;
 const stage=root.querySelector('.practice-reel-stage'),aura=root.querySelector('.practice-aura'),intro=root.querySelector('.practice-reel-copy'),cards=[...root.querySelectorAll('.practice-reel-card')],screen=root.querySelector('.practice-reel-screen'),label=root.querySelector('.practice-reel-play'),caption=root.querySelector('.practice-reel-caption'),copy=root.querySelector('.practice-step-copy'),count=root.querySelector('.practice-step-count'),title=root.querySelector('.practice-step-title'),lead=root.querySelector('.practice-step-lead'),description=root.querySelector('.practice-step-description'),input=root.querySelector('[data-flow-input]'),output=root.querySelector('[data-flow-output]'),links=[...root.querySelectorAll('.practice-step-nav a')],anchors=[...root.querySelectorAll('.practice-flow-anchor')];
 const media=matchMedia('(prefers-reduced-motion: reduce)'),clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
 const workflowStart=.28,workflowLength=.54,nav=root.querySelector('.practice-step-nav'),footer=root.querySelector('.practice-reel-footer');
 let raf=0,current=-1,pointerX=0,pointerY=0,lastRange=-1;
 const initialPositions=[[-550,-300],[350,500],[-800,300],[600,-300],[-300,-600],[550,690],[-500,600],[600,300],[-800,-300]];
 // Unequal positions and depth offsets follow the reference's successive camera fly-through.
 const flights=[[-.55,-.30,0],[.40,.48,.018],[-.72,.27,.007],[.63,-.32,.028],[-.25,-.63,.013],[.43,.66,.035],[-.58,.66,.023],[.66,.20,.042],[-.85,-.48,.047]];
 function bridge(){
  const geometry=window.orbitNarrative?.getExitGeometry?.();
  const overlap=!media.matches&&geometry?Math.max(0,geometry.end-geometry.start):0;
  root.style.marginTop=overlap?-overlap+'px':'';
  root.dataset.apertureBridge=String(Math.round(overlap));lastRange=-1;wake();
 }
 function setStep(index){if(index===current)return;current=index;const d=cards[index].dataset;count.textContent=String(index+1).padStart(2,'0')+' / 09';title.textContent=d.title;lead.textContent=d.lead;description.textContent=d.description;input.textContent=d.input;output.textContent=d.output;links.forEach((a,i)=>{a.setAttribute('aria-current',i===index?'step':'false');a.classList.toggle('is-complete',i<index)})}
 function draw(){
  raf=0;const box=root.getBoundingClientRect(),w=stage.clientWidth,h=stage.clientHeight,reduced=media.matches;
  if(reduced){root.dataset.progress='1.000';root.dataset.phase='overview';screen.inert=false;nav.inert=false;stage.inert=false;stage.style.removeProperty('opacity');for(const el of [aura,intro,copy,screen,label,caption,nav,footer,...cards]){el.style.removeProperty('opacity');el.style.removeProperty('transform');el.style.removeProperty('visibility')}stage.style.removeProperty('background-color');screen.style.removeProperty('width');screen.style.removeProperty('height');return}
  // The overlapping scene stays transparent while approaching the viewport.
  // Reveal its entire pinned surface only once it can replace the previous frame in place.
  const started=box.top<=1;stage.style.opacity=started?'1':'0';stage.inert=!started;root.dataset.stageActive=String(started);
  const range=Math.max(1,root.offsetHeight-h);if(range!==lastRange){anchors.forEach((a,i)=>a.style.top=(range*(a.dataset.progress?Number(a.dataset.progress):workflowStart+workflowLength*(i+.4)/9))+'px');lastRange=range}
  const p=clamp(-box.top/range),mobile=w<700,phase=p<.14?'scatter':p<workflowStart?'title':p<.84?'workflow':'overview';root.dataset.progress=p.toFixed(3);root.dataset.phase=phase;
  // First send every module out from the center. Reveal the name only after the center clears.
  const introIn=smooth((p-.14)/.035),introOut=smooth((p-.24)/.035);
  const circleOut=smooth((p-.085)/.055);
  stage.style.backgroundColor=`rgb(${25-circleOut*20} ${25-circleOut*18} ${25-circleOut*15})`;
  aura.style.opacity=String(smooth((p-.09)/.055)*(1-smooth((p-.24)/.065)));aura.style.transform=`translate(-50%,-50%) scale(${.92+introIn*.09-introOut*.15}) rotate(${pointerX*.12}deg)`;
  footer.style.opacity=String(smooth((p-.11)/.035));
  intro.style.opacity=String(introIn*(1-introOut));intro.style.transform=`translate(${pointerX*.2}px,${(1-introIn)*25-introOut*22+pointerY*.2}px)`;
  nav.style.opacity=String(smooth((p-.26)/.025));nav.inert=p<.26;
  const sequence=clamp((p-workflowStart)/workflowLength,0,.999999)*9,index=Math.floor(sequence),local=sequence-index;setStep(index);
  const entering=smooth(local/.18),leaving=smooth((local-.84)/.16),stageAlpha=smooth((p-.265)/.035)*(1-smooth((p-.81)/.045));
  copy.style.opacity=String(stageAlpha*(.65+.35*Math.min(entering,1-leaving)));copy.style.transform=mobile?`translateY(${(1-entering)*14-leaving*10}px)`:`translateY(calc(-50% + ${(1-entering)*18-leaving*12}px))`;
  cards.forEach((card,i)=>{
   if(p>=.85){card.style.opacity='0';card.style.visibility='hidden';card.style.transform='translate(-50%,-50%) scale(.1)';return}
   card.style.visibility='visible';
   if(p<workflowStart){
    const flight=flights[i],time=clamp((p+.014-flight[2])/.095),projection=.5/(5.8-5.55*time),alpha=smooth((p+.014-flight[2])/.012)*(1-smooth((time-.91)/.09));
    const x=flight[0]*w*projection*(mobile?1.15:1),y=flight[1]*h*projection,scale=projection*(mobile?.82:.62);
    card.style.opacity=String(alpha);card.style.visibility=alpha<.001?'hidden':'visible';card.style.zIndex=String(10+Math.round(projection*100));card.style.transform=`translate(-50%,-50%) translate(${x+pointerX*.2}px,${y+pointerY*.2}px) scale(${scale})`;return
   }
   const relative=sequence-i;
   if(i===index){const x=(mobile?0:w*.17)*entering-leaving*w*.9,y=(mobile?h*.16:0)*entering-leaving*h*.06,scale=.18+entering*.82+leaving*.1;card.style.opacity=String(stageAlpha*(1-leaving));card.style.zIndex='30';card.style.transform=`translate(-50%,-50%) translate(${x+pointerX*.35}px,${y+pointerY*.35}px) scale(${scale})`}
   else if(relative<0&&relative>-3){const depth=Math.abs(relative),xy=initialPositions[i],scale=.13/(depth*.2+1);card.style.opacity=String(.22*stageAlpha/(depth*.4+1));card.style.zIndex=String(20-i);card.style.transform=`translate(-50%,-50%) translate(${xy[0]*scale}px,${xy[1]*scale}px) scale(${scale})`}
   else{card.style.opacity='0';card.style.visibility='hidden';card.style.transform='translate(-50%,-50%) scale(.1)'}
  });
  const expansion=smooth((p-.835)/.14),endAlpha=smooth((p-.925)/.055),grow=.012+expansion*1.0;
  screen.style.width=(w*grow)+'px';screen.style.height=(h*grow)+'px';screen.style.visibility=p>.82?'visible':'hidden';screen.inert=p<.94;label.style.opacity=String(endAlpha);label.style.transform=`translateY(${(1-endAlpha)*20}px)`;caption.style.opacity=String(endAlpha);
 }
 function wake(){if(!raf)raf=requestAnimationFrame(draw)}
 addEventListener('scroll',wake,{passive:true});addEventListener('resize',bridge,{passive:true});addEventListener('pageshow',bridge);media.addEventListener('change',bridge);
 stage.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const b=stage.getBoundingClientRect();pointerX=(event.clientX-b.left-wSafe(b)/2)/wSafe(b)*14;pointerY=(event.clientY-b.top-b.height/2)/Math.max(1,b.height)*10;wake()},{passive:true});stage.addEventListener('pointerleave',()=>{pointerX=pointerY=0;wake()});
 function wSafe(b){return Math.max(1,b.width)}
 new ResizeObserver(wake).observe(stage);const precedingIntro=document.querySelector('#about .orbit-intro-contents');if(precedingIntro)new ResizeObserver(bridge).observe(precedingIntro);document.fonts.ready.then(bridge);bridge();draw();
})();
