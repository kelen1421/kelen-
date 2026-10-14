/* A finite, seekable browser opening: binary orbit -> gamma jets -> glass K -> home. */
(function(global) {
  'use strict';
  const TAU=Math.PI*2, MERGE=5.4, POINT=5.9, BURST=6.15, K_START=7.7, K_FORM_END=8.85, CONTENT_START=9.45, END=10.9, PLAYBACK_RATE=END/2.85;
  const clamp=v=>Math.max(0,Math.min(1,v));
  const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
  function seed(i){let n=Math.imul(i+13,1597334677);n=Math.imul(n^(n>>>15),2246822519);return ((n^(n>>>13))>>>0)/4294967296;}
  function starSprite(cold) {
    const c=document.createElement('canvas');c.width=c.height=192;
    const ctx=c.getContext('2d'),image=ctx.createImageData(192,192);
    for(let y=0;y<192;y++)for(let x=0;x<192;x++) {
      const u=(x-95.5)/93,v=(y-95.5)/93,d=u*u+v*v,at=(y*192+x)*4;
      if(d>=1)continue;
      const z=Math.sqrt(1-d);
      const noise=(Math.sin(u*37+Math.sin(v*17)*3)+Math.sin(v*46+Math.cos(u*23)*2)+Math.sin((u+v)*71)*.5)/2.5;
      const light=.26+.74*Math.pow(z,.48)+noise*.13;
      const hotspot=.10*Math.exp(-((u+.23)**2+(v+.27)**2)*7);
      const rgb=cold?[160,224,255]:[255,188,89];
      for(let k=0;k<3;k++)image.data[at+k]=Math.min(255,rgb[k]*light+hotspot*255);
      image.data[at+3]=Math.round(clamp((1-d)*48)*255);
    }
    ctx.putImageData(image,0,0);return c;
  }
  class CosmicOpening {
    constructor(canvas,stage,frame,options={}) {
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.stage=stage;this.home=frame;this.options=options;
      this.root=document.documentElement;this.elapsed=0;this.last=0;this.mode='opening';this.phase='';this.raf=0;
      this.sprites=[starSprite(false),starSprite(true)];this.kTargets=[];this.kTargetRect=null;this.homeProgress=-1;this.revealing=false;
      this.kElement=document.getElementById('k-handoff');this.kImage=document.getElementById('k-handoff-image');
      const prepare=()=>this.prepareK();
      if(this.kImage.complete&&this.kImage.naturalWidth)prepare();else this.kImage.addEventListener('load',prepare,{once:true});
      this.tick=this.tick.bind(this);this.resize=this.resize.bind(this);
      this.onVisibility=()=>{this.last=0;};
      this.resizeObserver=new ResizeObserver(this.resize);this.resizeObserver.observe(stage);this.resize();
      document.addEventListener('visibilitychange',this.onVisibility);
      document.fonts.ready.then(()=>{if(this.mode==='opening')this.measureTarget();});
    }
    measureTarget() {
      const k=this.home.querySelector('.scene-glass');
      const rect=k?.getBoundingClientRect();
      this.kTargetRect=rect&&rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<this.h&&rect.right>0&&rect.left<this.w
        ?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null;
    }
    resize() {
      if(this.mode==='home')return;
      const r=this.stage.getBoundingClientRect();this.w=r.width;this.h=r.height;this.dpr=Math.min(devicePixelRatio||1,2);
      this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);
      this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.measureTarget();this.render(this.elapsed);
    }
    label(phase,caption) {
      if(phase===this.phase)return;
      this.phase=phase;this.canvas.dataset.phase=phase;
      const status=document.getElementById('animation-status');if(status)status.textContent=caption;
    }
    prepareK() {
      const mask=document.createElement('canvas');mask.width=210;mask.height=247;
      const context=mask.getContext('2d');context.drawImage(this.kImage,0,0,mask.width,mask.height);
      const pixels=context.getImageData(0,0,mask.width,mask.height).data;
      this.kTargets=[];
      for(let y=2;y<mask.height;y+=3)for(let x=2;x<mask.width;x+=3)if(pixels[(y*mask.width+x)*4+3]>55)this.kTargets.push({u:x/mask.width,v:y/mask.height});
    }
    revealHome(progress) {
      this.homeProgress=progress;
      if(this.elapsed>=CONTENT_START&&!this.revealing) {
        this.revealing=true;
        this.options.onReveal?.();
      }
    }
    renderK(t) {
      const c=this.ctx,formation=smooth(K_START,K_FORM_END,t),content=smooth(CONTENT_START,END,t);
      this.root.classList.add('intro-forming');this.stage.style.background='#eeede8';this.stage.style.opacity=String(1-smooth(CONTENT_START,CONTENT_START+.176,t));
      const glyphHeight=Math.min(this.h*.47,this.w*.68*414/339,400),glyphWidth=glyphHeight*339/414;
      const center={x:this.w*.5-glyphWidth*.5,y:this.h*.5-glyphHeight*.5,width:glyphWidth,height:glyphHeight};
      const target=this.kTargetRect||center;
      const glyph={x:center.x+(target.x-center.x)*content,y:center.y+(target.y-center.y)*content,width:center.width+(target.width-center.width)*content,height:center.height+(target.height-center.height)*content};
      const outer={x:glyph.x-glyph.width*40/339,y:glyph.y-glyph.height*40/414,width:glyph.width*419/339,height:glyph.height*494/414};
      Object.assign(this.kElement.style,{width:`${outer.width}px`,height:`${outer.height}px`,transform:`translate3d(${outer.x}px,${outer.y}px,0)`,opacity:String(smooth(.35,.88,formation)*(this.kTargetRect?1:1-content))});
      this.kElement.dataset.centerX=(center.x+center.width/2).toFixed(2);this.kElement.dataset.centerY=(center.y+center.height/2).toFixed(2);
      this.kElement.dataset.contentProgress=content.toFixed(3);
      if(t<K_FORM_END) {
        c.fillStyle=`rgba(248,255,255,${1-smooth(.08,.62,formation)})`;c.fillRect(0,0,this.w,this.h);
        c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.75*(1-smooth(.78,1,formation));c.fillStyle='#ffffff';c.shadowColor='#f2ffff';c.shadowBlur=15*(1-formation);
        c.beginPath();
        for(let i=0;i<this.kTargets.length;i++) {
          const point=this.kTargets[i],startX=seed(i*5+600)*this.w,startY=seed(i*5+601)*this.h;
          const targetX=outer.x+point.u*outer.width,targetY=outer.y+point.v*outer.height;
          const bend=Math.sin(formation*Math.PI)*(1-formation)*32;
          const x=startX*(1-formation)+targetX*formation+Math.sin(i*.73+formation*5)*bend;
          const y=startY*(1-formation)+targetY*formation+Math.cos(i*.51+formation*4)*bend;
          const r=.8+18*Math.pow(1-formation,2);c.moveTo(x+r,y);c.arc(x,y,r,0,TAU);
        }
        c.fill();c.restore();
        this.label('light-to-k','白光向中心汇聚 · 形成玻璃 K');
      } else if(t<CONTENT_START)this.label('centered-k','玻璃 K · 正中心停留');
      else this.label('content-reveal','K 就位 · 主页内容出现');
      this.revealHome(content);
      
      this.canvas.dataset.time=t.toFixed(2);
    }
    play() {
      cancelAnimationFrame(this.raf);this.elapsed=0;this.last=0;this.startedAt=null;this.mode='opening';this.root.classList.add('intro-running');
      this.home.inert=true;this.render(0);this.raf=requestAnimationFrame(this.tick);
    }
    finish(fromSkip=false) {
      if(this.mode==='home')return;
      this.mode='home';cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();
      document.removeEventListener('visibilitychange',this.onVisibility);
      this.options.onFinish?.(fromSkip);
    }
    tick(now) {
      if(this.mode!=='opening')return;
      if(this.startedAt===null)this.startedAt=now;
      this.elapsed=Math.min(END,(now-this.startedAt)/1000*PLAYBACK_RATE);
      if(this.elapsed>=END){this.finish();return;}
      this.render(this.elapsed);this.raf=requestAnimationFrame(this.tick);
    }
    glow(x,y,r,cold,alpha=1) {
      const c=this.ctx,gradient=c.createRadialGradient(x,y,r*.15,x,y,r*4.8);
      const color=cold?'131,215,255':'255,179,92';
      gradient.addColorStop(0,`rgba(${color},${.31*alpha})`);gradient.addColorStop(.18,`rgba(${color},${.14*alpha})`);gradient.addColorStop(1,`rgba(${color},0)`);
      c.fillStyle=gradient;c.fillRect(x-r*5,y-r*5,r*10,r*10);
    }
    star(x,y,r,cold,t,alpha=1,energy=0) {
      const c=this.ctx;this.glow(x,y,r,cold,alpha*(1+energy*1.2));
      c.save();c.translate(x,y);c.rotate(t*(cold?-.15:.21));c.globalAlpha=alpha;
      c.filter=`brightness(${1+energy*2.3}) saturate(${1.08-energy*.38})`;
      c.drawImage(this.sprites[cold?1:0],-r,-r,r*2,r*2);c.restore();
      c.save();c.globalCompositeOperation='lighter';c.strokeStyle=cold?`rgba(180,238,255,${.33+energy*.40})`:`rgba(255,221,172,${.27+energy*.43})`;c.lineWidth=.7+energy*.5;c.beginPath();
      for(let i=0;i<=90;i++){const a=i/90*TAU;const rad=r*(1.035+.055*Math.sin(a*11+t*1.4)+.024*Math.sin(a*23-t));const px=x+Math.cos(a)*rad,py=y+Math.sin(a)*rad;i?c.lineTo(px,py):c.moveTo(px,py);}
      c.stroke();c.restore();
    }
    render(t) {
      if(this.mode==='home')return;
      const c=this.ctx,w=this.w,h=this.h,cx=w*.5,cy=h*.5,unit=Math.min(w,h);
      c.clearRect(0,0,w,h);
      if(t>=K_START) {this.renderK(t);return;}
      this.root.classList.remove('intro-forming');this.stage.style.background='';this.stage.style.opacity='1';this.kElement.style.opacity='0';this.revealHome(0);
      const background=c.createRadialGradient(cx,cy,0,cx,cy,unit*.56);
      background.addColorStop(0,'#05112400');background.addColorStop(1,'#02060b55');c.fillStyle=background;c.fillRect(0,0,w,h);
      for(let i=0;i<170;i++) {
        const x=seed(i*3)*w,y=seed(i*3+1)*h,alpha=(.10+seed(i*3+2)*.30)*(1-smooth(POINT,BURST+1.4,t));
        c.fillStyle=`rgba(175,208,224,${alpha})`;c.fillRect(x,y,.7+seed(i)*.9,.7+seed(i)*.9);
      }
      if(t<MERGE) {
        this.canvas.dataset.lightCoverage='0';
        const progress=clamp(t/MERGE),collapse=Math.pow(progress,1.15);
        const radius=unit*(.310*(1-collapse)+.004*collapse);
        const starRadius=unit*(.175*(1-collapse)+.003*collapse);
        const rotationClock=t*7.8/MERGE,rotationScale=1.25;
        const angle=rotationScale*(rotationClock*.65+.060*Math.pow(rotationClock,3)+.0006*Math.pow(rotationClock,5));
        const angularSpeed=rotationScale*7.8/MERGE*(.65+.180*rotationClock*rotationClock+.003*Math.pow(rotationClock,4));
        const energy=smooth(.01,1,progress);this.canvas.dataset.brightness=(1+energy*2.3).toFixed(2);
        this.canvas.dataset.starRadius=starRadius.toFixed(2);
        this.canvas.dataset.orbitRadius=radius.toFixed(2);
        this.canvas.dataset.angularSpeed=angularSpeed.toFixed(2);
        const a={x:cx+Math.cos(angle)*radius,y:cy+Math.sin(angle)*radius*.62,z:Math.sin(angle)*.19};
        const b={x:cx-Math.cos(angle)*radius,y:cy-Math.sin(angle)*radius*.62,z:-Math.sin(angle)*.19};
        c.save();c.globalCompositeOperation='lighter';
        for(let which=0;which<2;which++) {
          const color=which?'#81cfff':'#ffcf8a';
          const tail=.18+progress*progress*3.9; c.strokeStyle=color;
          for(let j=0;j<42;j++) {
            const ang=angle-j*tail/42+which*Math.PI;
            const px=cx+Math.cos(ang)*radius,py=cy+Math.sin(ang)*radius*.62;
            c.globalAlpha=(1-j/42)*(.012+progress*.085);c.beginPath();c.arc(px,py,Math.max(.30,starRadius*(.045+progress*.10)),0,TAU);c.fillStyle=color;c.fill();
          }
        }
        c.restore();
        const first=a.z<b.z?[{...a,cold:false},{...b,cold:true}]:[{...b,cold:true},{...a,cold:false}];
        for(const s of first)this.star(s.x,s.y,starRadius,s.cold,t,1,energy);
        this.label(t>.9?'accelerating':'orbiting',t>.9?'双星持续缩小 · 旋转加速':'双星互旋');
      } else {
        this.canvas.dataset.angularSpeed='0';
        if(t<BURST)this.canvas.dataset.lightCoverage='0';
        const compression=smooth(MERGE,POINT,t);
        const terminalRadius=Math.min(1.05,unit*.002);
        const pointRadius=unit*.003*(1-compression)+terminalRadius*compression;
        this.canvas.dataset.starRadius=pointRadius.toFixed(2);
        this.canvas.dataset.orbitRadius='0';
        if(t<BURST) {
          this.glow(cx,cy,Math.max(1.5,pointRadius*1.8),true,.85);
          c.save();c.globalCompositeOperation='lighter';c.fillStyle='#efffff';c.shadowColor='#a2e9ff';c.shadowBlur=7;
          c.beginPath();c.arc(cx,cy,pointRadius,0,TAU);c.fill();c.restore();
          this.label(t>=POINT?'singularity':'merging',t>=POINT?'极点凝聚 · 爆发前夕':'双星汇聚 · 压缩为极点');
        }
        c.save();c.globalCompositeOperation='lighter';
        const dt=Math.max(0,t-BURST),attack=smooth(0,.28,dt),decay=1-smooth(1.35,3.2,dt);
        if(dt>0) {
          this.label(dt>1.2?'light-diffusion':'gamma-burst',dt>1.2?'爆发光幕 · 扩散至全屏':'伽马射线爆 · 贯穿全屏');
          // A radial light front reaches beyond every corner before the handoff.
          const expansion=smooth(0,1.65,dt),lightRadius=Math.max(2,Math.hypot(w,h)*.70*expansion);
          const envelope=smooth(0,.24,dt)*(1-smooth(2.1,3.6,dt));
          const diffusion=c.createRadialGradient(cx,cy,0,cx,cy,lightRadius);
          diffusion.addColorStop(0,`rgba(247,255,255,${.97*envelope})`);
          diffusion.addColorStop(.45,`rgba(215,246,255,${.89*envelope})`);
          diffusion.addColorStop(.82,`rgba(166,225,255,${.79*envelope})`);
          diffusion.addColorStop(1,'rgba(134,202,255,0)');
          c.fillStyle=diffusion;c.fillRect(0,0,w,h);
          this.canvas.dataset.lightCoverage=String(Math.min(1,lightRadius/(Math.hypot(w,h)*.5)).toFixed(2));
          const ringRadius=unit*(.02+dt*.82);
          c.globalAlpha=Math.max(0,(1-dt/1.8))*.45;c.strokeStyle='#cff8ff';c.lineWidth=1+dt*1.2;c.beginPath();c.ellipse(cx,cy,ringRadius,ringRadius*.62,-.35,0,TAU);c.stroke();c.globalAlpha=1;
          const axis=-.49,reach=Math.hypot(w,h)*1.35*attack,halfWidth=unit*(.004+.021*smooth(.15,1.7,dt));
          c.save();c.translate(cx,cy);c.rotate(axis);
          for(const sign of [-1,1]) {
            c.save();c.scale(sign,1);
            const jet=c.createLinearGradient(0,0,reach,0);jet.addColorStop(0,`rgba(240,255,255,${.90*decay})`);jet.addColorStop(.35,`rgba(137,222,255,${.68*decay})`);jet.addColorStop(1,'rgba(106,188,255,0)');
            c.fillStyle=jet;c.shadowColor='#6bcfff';c.shadowBlur=unit*.038;
            c.beginPath();c.moveTo(0,-halfWidth*.25);c.lineTo(reach,-halfWidth*4.2);c.lineTo(reach,halfWidth*4.2);c.lineTo(0,halfWidth*.25);c.closePath();c.fill();
            c.shadowBlur=22;c.lineWidth=unit*.005*decay;c.strokeStyle=`rgba(244,255,255,${.95*decay})`;c.beginPath();c.moveTo(0,0);c.lineTo(reach,0);c.stroke();
            c.restore();
          }
          c.restore();
          for(let i=0;i<190;i++) {
            const speed=.15+seed(i*4)*.95,a=seed(i*4+1)*TAU,r=dt*unit*speed*.62;
            const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.80;
            c.globalAlpha=(1-clamp(dt/2.5))*(.15+seed(i)*.45);c.fillStyle=i%3?'#b6eaff':'#ffdeb1';c.fillRect(x,y,1+seed(i+9)*2,1+seed(i+9)*2);
          }
          c.globalAlpha=1;
          const wash=smooth(.65,1.7,dt)*(1-smooth(1.8,3.2,dt));
          c.fillStyle=`rgba(188,230,246,${wash*.32})`;c.fillRect(0,0,w,h);
        }
        c.restore();
      }
      this.canvas.dataset.time=t.toFixed(2);
    }
  }
  global.CosmicOpening=CosmicOpening;
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
