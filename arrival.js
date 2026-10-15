/* Finite 2.85s opening: concentric archive rings -> wordmark -> line -> page. */
(function(global) {
  'use strict';
  const TAU=Math.PI*2, END=2.85, CONTENT_START=2.28;
  const clamp=v=>Math.max(0,Math.min(1,v));
  const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
  const out=v=>1-Math.pow(1-clamp(v),3);
  class ArchiveOpening {
    constructor(canvas,stage,frame,options={}) {
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.stage=stage;this.home=frame;this.options=options;
      this.root=document.documentElement;this.arrival=stage.parentElement;this.elapsed=0;this.mode='opening';this.phase='';this.raf=0;this.revealing=false;
      this.lockup=this.arrival.querySelector('.arrival-lockup');
      this.brand=this.arrival.querySelector('.arrival-brand');this.edition=this.arrival.querySelector('.arrival-edition');
      this.words=[...this.arrival.querySelectorAll('.arrival-lockup > div > span')];
      this.mark=this.arrival.querySelector('.arrival-mark');
      this.tick=this.tick.bind(this);this.resize=this.resize.bind(this);
      this.resizeObserver=new ResizeObserver(this.resize);this.resizeObserver.observe(stage);this.resize();
    }
    resize() {
      if(this.mode==='home')return;
      const r=this.stage.getBoundingClientRect();this.w=r.width;this.h=r.height;this.dpr=Math.min(devicePixelRatio||1,2);
      this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);
      this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.render(this.elapsed);
    }
    label(phase,caption) {
      if(phase===this.phase)return;
      this.phase=phase;this.canvas.dataset.phase=phase;
      this.arrival.querySelector('.arrival-status').textContent=caption;
    }
    line(x1,y1,x2,y2,color='#617451',width=1) {
      const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
    }
    arc(x,y,r,a,b,color,width=1) {
      const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,Math.max(.1,r),a,b);c.stroke();
    }
    node(x,y,r=2.4,color='#34432e') {
      const c=this.ctx;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
    }
    renderRings(t) {
      const c=this.ctx,cx=this.w/2,cy=this.h/2,unit=Math.min(this.w,this.h);
      const settle=out(t/.62),fold=smooth(.72,1.03,t),size=Math.min(112,unit*.165);
      const r=(unit*.68+(size-unit*.68)*settle)*(1-fold);
      c.save();c.globalAlpha=smooth(0,.07,t)*(1-smooth(.88,1.02,t));
      this.arc(cx,cy,r,0,TAU,'#34432e',1.2);
      const turn=t*4.1;
      this.arc(cx,cy,r*.89,turn-.4,turn+4.6,'#ffffff',1.5);
      this.arc(cx,cy,r*.42,-turn+.25,-turn+2.6,'#617451',.85);
      this.arc(cx,cy,r*.42,-turn+3.4,-turn+5.75,'#617451',.85);
      for(let i=0;i<2;i++) {
        const a=turn+i*Math.PI;
        this.node(cx+Math.cos(a)*r,cy+Math.sin(a)*r,2.8,i?'#a6b77f':'#34432e');
        this.node(cx+Math.cos(-a+1.1)*r*.66,cy+Math.sin(-a+1.1)*r*.66,2.2,'#94a773');
      }
      const inner=smooth(.31,.72,t);
      c.globalAlpha*=inner;
      for(const side of [-1,1])this.arc(cx+side*r*.55,cy,r*.13,turn,turn+TAU*inner,'#68795d',.7);
      this.line(cx-6,cy,cx+6,cy,'#34432e',1.1);this.line(cx,cy-6,cx,cy+6,'#34432e',1.1);
      // Four registration marks draw inward, then join the central lockup.
      c.globalAlpha*=.55;
      const corner=r*1.17,d=5;
      for(const sx of [-1,1])for(const sy of [-1,1]) {
        const x=cx+sx*corner,y=cy+sy*corner;
        this.line(x,y,x-sx*d,y);this.line(x,y,x,y-sy*d);
      }
      c.restore();
    }
    renderLockup(t) {
      const show=smooth(.78,.92,t),fold=smooth(1.73,2.02,t);
      this.lockup.style.opacity=String(show*(1-smooth(1.93,2.03,t)));
      this.lockup.style.transform=`translate(-50%,-50%) scaleY(${Math.max(.008,1-fold)})`;
      // Clip-wipe treatment: each line reveals independently behind a fixed mask.
      const cues=[[.82,1.03],[.97,1.19],[1.28,1.47]];
      this.words.forEach((word,i)=> {
        const cue=cues[i],p=out((t-cue[0])/(cue[1]-cue[0]));
        word.style.clipPath=`inset(0 ${100*(1-p)}% 0 0)`;
      });
      const mark=out((t-1.11)/.25);
      this.mark.style.clipPath=`inset(${100*(1-mark)}% 0 0 0)`;
      this.mark.style.transform=`translateY(${8*(1-mark)}px)`;
    }
    renderSeam(t) {
      const c=this.ctx,cx=this.w/2,cy=this.h/2;
      const appear=smooth(1.87,2.03,t),open=smooth(CONTENT_START,2.72,t);
      const half=88+(this.w*.5-88)*out((t-2.05)/.38);
      const edgeAlpha=appear*(1-smooth(2.5,2.72,t));
      c.save();c.globalAlpha=edgeAlpha;
      if(t<CONTENT_START) {
        this.line(cx-half,cy,cx+half,cy,'#7c8e70',.85);
        for(const s of [-1,1]) {
          c.fillStyle='#eeede8';c.strokeStyle='#405237';c.lineWidth=.8;
          c.fillRect(cx+s*half-2,cy-2,4,4);c.strokeRect(cx+s*half-2,cy-2,4,4);
        }
      } else {
        const gap=this.h*.52*open;
        this.line(0,cy-gap,this.w,cy-gap,'#a5b397',.8);
        this.line(0,cy+gap,this.w,cy+gap,'#a5b397',.8);
      }
      c.restore();
    }
    render(t) {
      if(this.mode==='home')return;
      const c=this.ctx,w=this.w,h=this.h;
      c.clearRect(0,0,w,h);
      c.fillStyle='#eeede8';
      if(t<CONTENT_START)c.fillRect(0,0,w,h);
      else {
        const halfGap=h*.52*smooth(CONTENT_START,2.72,t);
        c.fillRect(0,0,w,Math.max(0,h/2-halfGap));
        c.fillRect(0,h/2+halfGap,w,Math.max(0,h/2-halfGap));
      }
      const chrome=smooth(.06,.22,t)*(1-smooth(2.16,2.5,t));
      this.brand.style.opacity=String(chrome);this.edition.style.opacity=String(chrome);
      if(t<1.03)this.renderRings(t);
      this.renderLockup(t);this.renderSeam(t);
      if(t<.82)this.label('archive-rings','档案圆环 · 向中心收拢');
      else if(t<1.73)this.label('welcome-lockup','欢迎进入 KELEN 的个人档案');
      else if(t<CONTENT_START)this.label('line-collapse','标题收束 · 细线展开');
      else {
        this.label('content-reveal','档案打开 · 网页内容旋转入场');
        if(!this.revealing){this.revealing=true;this.options.onReveal?.();}
      }
      this.canvas.dataset.time=t.toFixed(3);
      this.canvas.dataset.duration=String(END);
    }
    play() {
      cancelAnimationFrame(this.raf);this.elapsed=0;this.startedAt=null;this.mode='opening';this.root.classList.add('intro-running');
      this.home.inert=true;this.render(0);this.raf=requestAnimationFrame(this.tick);
    }
    tick(now) {
      if(this.mode!=='opening')return;
      if(this.startedAt===null)this.startedAt=now;
      this.elapsed=Math.min(END,(now-this.startedAt)/1000);
      if(this.elapsed>=END){this.finish();return;}
      this.render(this.elapsed);this.raf=requestAnimationFrame(this.tick);
    }
    finish(fromSkip=false) {
      if(this.mode==='home')return;
      this.mode='home';cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.options.onFinish?.(fromSkip);
    }
  }
  global.ArchiveOpening=ArchiveOpening;
  // Keep the existing opening API available to local preview consumers.
  global.CosmicOpening=ArchiveOpening;
})(window);

(() => {
  const root=document.documentElement,arrival=document.querySelector('.site-arrival'),frame=document.querySelector('.site-frame');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const introClasses=['intro-pending','intro-running','intro-released','intro-landed','intro-forming','intro-standing','intro-revealing','intro-handoff'];
  if(!arrival||!frame)return;
  if(!root.classList.contains('intro-pending')||reducedMotion.matches) {
    clearTimeout(window.arrivalFallback);root.classList.remove(...introClasses);arrival.remove();return;
  }
  const tempo=Math.max(.1,parseFloat(getComputedStyle(root).getPropertyValue('--arrival-tempo'))||.44);
  const entranceAnimations=[];
  let revealing=false;
  function revealPage() {
    revealing = true;
    // Animate the actual content along curved turns from all four edges.
    // Native animations leave the existing scene and hover animations intact.
    const entrances = [
      {selector:'.rail',from:'translate3d(-115%,14vh,0) rotate(-38deg)',via:'translate3d(-12%,-4vh,0) rotate(9deg)',origin:'100% 50%',delay:0},
      {selector:'.micro-head',from:'translate3d(-12vw,-40vh,0) rotate(32deg)',via:'translate3d(2vw,-5vh,0) rotate(-8deg)',origin:'80% 100%',delay:40},
      {selector:'.scene-topline',from:'translate3d(18vw,-45vh,0) rotate(-35deg)',via:'translate3d(-2vw,-4vh,0) rotate(7deg)',origin:'50% 100%',delay:100},
      {selector:'.scene-intro',from:'translate3d(-45vw,65vh,0) rotate(-62deg)',via:'translate3d(-6vw,6vh,0) rotate(12deg)',origin:'100% 0%',delay:55},
      {selector:'.scene-link:nth-child(1)',from:'translate3d(60vw,-45vh,0) rotate(78deg)',via:'translate3d(6vw,3vh,0) rotate(-12deg)',origin:'0% 100%',delay:0},
      {selector:'.scene-link:nth-child(2)',from:'translate3d(70vw,8vh,0) rotate(68deg)',via:'translate3d(7vw,-3vh,0) rotate(-10deg)',origin:'0% 50%',delay:45},
      {selector:'.scene-link:nth-child(3)',from:'translate3d(65vw,40vh,0) rotate(-62deg)',via:'translate3d(6vw,3vh,0) rotate(9deg)',origin:'0% 50%',delay:95},
      {selector:'.scene-link:nth-child(4)',from:'translate3d(28vw,65vh,0) rotate(-75deg)',via:'translate3d(-3vw,6vh,0) rotate(11deg)',origin:'0% 0%',delay:140},
      {selector:'.scene-bottomline,.hero-footer',from:'translate3d(12vw,55vh,0) rotate(-28deg)',via:'translate3d(-2vw,5vh,0) rotate(7deg)',origin:'50% 0%',delay:110},
      {selector:'.page-head,.contact-top',from:'translate3d(-12vw,-45vh,0) rotate(35deg)',via:'translate3d(2vw,-4vh,0) rotate(-7deg)',origin:'50% 100%',delay:25},
      {selector:'.profile-layout,.notes-layout',from:'translate3d(70vw,14vh,0) rotate(38deg)',via:'translate3d(7vw,-3vh,0) rotate(-8deg)',origin:'0% 50%',delay:65},
      {selector:'.interest-archive,.contact-main',from:'translate3d(-65vw,18vh,0) rotate(-34deg)',via:'translate3d(-6vw,-3vh,0) rotate(8deg)',origin:'100% 50%',delay:65},
      {selector:'.contact-bottom,footer',from:'translate3d(12vw,55vh,0) rotate(-30deg)',via:'translate3d(-2vw,4vh,0) rotate(6deg)',origin:'50% 0%',delay:110}
    ];
    entrances.forEach(({selector,from,via,origin,delay}) => {
      frame.querySelectorAll(selector).forEach(node => {
        const bounds = node.getBoundingClientRect();
        if (bounds.bottom <= 0 || bounds.top >= innerHeight || bounds.right <= 0 || bounds.left >= innerWidth) return;
        const computed = getComputedStyle(node).transform;
        const base = computed === 'none' ? '' : computed;
        entranceAnimations.push(node.animate([
          {opacity:0,transform:`${from} ${base}`,transformOrigin:origin,offset:0},
          {opacity:.9,transform:`${via} ${base}`,transformOrigin:origin,offset:.58},
          {opacity:1,transform:base || 'none',transformOrigin:origin,offset:1}
        ],{duration:1700*tempo,delay:delay*tempo,easing:'cubic-bezier(.18,.72,.24,1)',fill:'both'}));
      });
    });
    root.classList.add('intro-revealing');
  }

  function cleanup(fromSkip) {
    clearTimeout(window.arrivalFallback);entranceAnimations.forEach(animation=>animation.cancel());
    root.classList.remove(...introClasses);frame.inert=false;arrival.remove();
    window.removeEventListener('keydown',skipWithKeyboard);window.removeEventListener('pagehide',onPageHide);
    reducedMotion.removeEventListener('change',onMotionChange);
    if(fromSkip)frame.querySelector('.identity')?.focus({preventScroll:true});
    delete window.finishArrival;
  }
  const opening=new CosmicOpening(arrival.querySelector('canvas'),arrival.querySelector('.cosmic-sky'),frame,{onReveal:revealPage,onFinish:cleanup});
  window.finishArrival=()=>opening.finish();
  function skipWithKeyboard(event){if(event.key==='Escape'){event.preventDefault();opening.finish(true);}}
  function onMotionChange(event){if(event.matches)opening.finish();}
  function onPageHide(){opening.finish();}
  arrival.querySelector('.arrival-skip').addEventListener('click',()=>opening.finish(true));
  window.addEventListener('keydown',skipWithKeyboard);window.addEventListener('pagehide',onPageHide);
  reducedMotion.addEventListener('change',onMotionChange);
  opening.play();
})();
