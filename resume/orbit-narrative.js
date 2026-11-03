/* Scroll choreography measured from the LENZ introductory/orbital section. */
(()=>{
 'use strict';
 const section=document.querySelector('.orbit-narrative');if(!section)return;
 const intro=section.querySelector('.orbit-intro-contents');
 const visual=section.querySelector('.orbit-visual');
 const tone=section.querySelector('.orbit-tone');
 const clamp=x=>Math.max(0,Math.min(1,x));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const cover=document.createElement('div');cover.className='orbit-exit-cover';cover.setAttribute('aria-hidden','true');document.body.append(cover);
 const header=document.querySelector('.site-header');
 let fade=0,mask=0,metrics={},lastY=scrollY;
 const measure=()=>{const sr=section.getBoundingClientRect(),ir=intro.getBoundingClientRect();metrics={width:innerWidth,height:innerHeight,top:sr.top+scrollY,introTop:ir.top-sr.top,introHeight:ir.height,end:sr.top+scrollY+section.offsetHeight}};
 new ResizeObserver(measure).observe(intro);window.addEventListener('resize',measure);document.fonts.ready.then(measure);measure();
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)section.classList.toggle('orbit-copy-visible',entry.isIntersecting)}, {threshold:0,rootMargin:'0px 0px -12% 0px'});observer.observe(section.querySelector('.orbit-head'));
 function update(){
  const {width,height,top,introTop,introHeight,end}=metrics;if(!height)return;
  const local=scrollY-top;
  const delta=scrollY-lastY;lastY=scrollY;
  if(header){if(local<20||scrollY>=end-1||reduced||document.querySelector('.detail-menu.open')||document.body.classList.contains('editing'))header.classList.remove('orbit-scroll-away');else if(Math.abs(delta)>1)header.classList.toggle('orbit-scroll-away',delta>0)}
  // Finish the reveal before the introduction reaches its resting position.
  // Scroll drives it directly, so hash navigation and fast scrolling need no extra delay.
  const entrance=clamp((local+height*.7)/(height*.55));
  const reveal=entrance*entrance*(3-2*entrance);
  visual.style.transform=`scale(${reduced?1:.92+reveal*.08})`;
  section.dataset.orbitReveal=entrance.toFixed(3);
  const fadeStart=introTop+introHeight,fadeEnd=fadeStart+height*.25,maskEnd=fadeEnd+height*1.25;
  const targetFade=clamp((local-fadeStart)/(height*.25)),targetMask=clamp((local-fadeEnd)/(height*1.25));
  // One damped scroll value drives the background and the aperture together.
  fade+= (targetFade-fade)*.2;mask+=(targetMask-mask)*.2;
  if(Math.abs(fade-targetFade)<.001)fade=targetFade;if(Math.abs(mask-targetMask)<.001)mask=targetMask;
  const active=local>fadeStart-height*.1&&local<maskEnd+height*.1&&mask<.999;
  tone.style.opacity=String(fade);visual.style.opacity=String(reveal*(1-fade));
  if(reduced){cover.style.opacity='0';visual.style.opacity=entrance>0?'1':'0';tone.style.opacity='0'}
  else{
   const radius=width*.2416666668+(Math.hypot(width,height)*.5-width*.2416666668)*mask;
   const gradient=`radial-gradient(circle at 50% 50%,transparent ${radius}px,#000 ${radius+1}px)`;
   cover.style.maskImage=gradient;cover.style.webkitMaskImage=gradient;cover.style.opacity=active?String(fade):'0';
  }
  section.dataset.orbitPhase=entrance<1?'intro':local<fadeStart?'disc':local<fadeEnd?'fade':local<maskEnd?'aperture':'complete';
 }
 // Let the following scene begin inside this aperture instead of after its runway.
 const getExitGeometry=()=>{const {top,introTop,introHeight,height,end}=metrics;return {start:top+introTop+introHeight+height*.25,end,apertureEnd:top+introTop+introHeight+height*1.5}};
 window.orbitNarrative={update,getExitGeometry};
})();
