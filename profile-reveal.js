(function(){
"use strict";
const section=document.querySelector('#about'),layout=section?.querySelector('.profile-layout');
if(!section||!layout||!window.gsap)return;
const root=document.documentElement,motion=matchMedia('(prefers-reduced-motion: reduce)');
const stage=document.createElement('div');stage.className='profile-unfold-stage';
const intro=document.createElement('div');intro.className='profile-unfold-intro';
intro.innerHTML='<div class="profile-unfold-copy"><p class="overline">BASIC INFORMATION / 基本信息</p><h3>从思考<br>到认识彼此</h3><button class="profile-unfold-trigger" type="button" aria-expanded="false" aria-controls="profile-unfold-biography">向下滚动 · 展开个人介绍 <span aria-hidden="true">↘</span></button></div><img class="profile-unfold-throne" src="assets/profile-throne.webp" alt="" aria-hidden="true">';
const mask=document.createElement('div');mask.id='profile-unfold-biography';mask.className='profile-unfold-mask';mask.inert=true;mask.setAttribute('aria-hidden','true');
section.insertBefore(stage,layout);mask.append(layout);stage.append(intro,mask);stage.insertAdjacentHTML('beforeend','<svg class="profile-unfold-overlay" aria-hidden="true" viewBox="0 0 1440 1180">\n<path id="profile-motion-edge-one" class="edge" d="M 80 540 L 1360 540"/><path id="profile-motion-edge-two" class="edge" d="M 80 800 L 1360 800"/>\n<text id="profile-motion-edge-two-label" class="edge-label" x="1340" y="782">02</text><path id="profile-motion-motion-lines"/>\n<ellipse id="profile-motion-landing-ring" cx="1000" cy="800" rx="30" ry="4"/>\n<defs><filter id="profile-motion-unified-outline" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">\n<feMorphology in="SourceAlpha" operator="dilate" radius="1.1" result="expanded"/>\n<feComposite in="expanded" in2="SourceAlpha" operator="out" result="border"/>\n<feFlood flood-color="#465b49" result="ink"/><feComposite in="ink" in2="border" operator="in" result="outline"/>\n<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="outline"/></feMerge>\n</filter></defs>\n<g id="profile-motion-actor">\n<g id="profile-motion-actor-silhouette" filter="url(#profile-motion-unified-outline)">\n<path id="profile-motion-left-leg"/><path id="profile-motion-right-leg"/><path id="profile-motion-left-foot"/><path id="profile-motion-right-foot"/><path id="profile-motion-torso"/>\n<path id="profile-motion-left-arm"/><path id="profile-motion-right-arm"/><path id="profile-motion-neck"/><path id="profile-motion-head"/><path id="profile-motion-left-hand"/><path id="profile-motion-right-hand"/>\n</g><g id="profile-motion-actor-lines">\n<path id="profile-motion-torso-detail"/><path id="profile-motion-left-arm-detail"/><path id="profile-motion-right-arm-detail"/>\n<path id="profile-motion-left-leg-detail"/><path id="profile-motion-right-leg-detail"/><path id="profile-motion-head-detail"/>\n</g>\n</g></svg>');
section.classList.add('profile-unfold-ready');
const overlay=stage.querySelector('.profile-unfold-overlay'),trigger=stage.querySelector('.profile-unfold-trigger'),throne=stage.querySelector('.profile-unfold-throne');
const paperCanvas=document.createElement('canvas');paperCanvas.className='profile-paper-actor';paperCanvas.setAttribute('role','img');paperCanvas.setAttribute('aria-label','纸质探索者小人，拉开个人介绍');stage.append(paperCanvas);
const paperOptions={src:'assets/kelen-paper-character.png',onReady(){stage.classList.add('profile-paper-character');render();}};
const paperActor=window.createPaperCharacter3D?.(paperCanvas,paperOptions)||window.createPaperCharacter?.(paperCanvas,paperOptions);
const copy=layout.querySelector('.profile-copy'),copyItems=[...copy.children];
let scale=1,bodyHeight=260,played=false,running=false,buttonStarted=false,lastScroll=scrollY,touchY=null,observer;

const CONFIG={duration:3,width:1440,height:1180,firstEdge:540,secondHeight:260,gripX:1040,landingX:1000};
const $=function(id){return stage.querySelector("#profile-motion-"+id);};
const lerp=function(a,b,p){return a+(b-a)*p;};
const clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
const poses={
think:{head:[0,-104],size:[13,23],sl:[-34,-74],sr:[34,-74],el:[-38,-19],er:[38,-19],wl:[-7,-62],wr:[7,-62],kl:[-39,-17],kr:[39,-17],al:[-40,80],ar:[40,80]},
launch:{head:[-4,-111],size:[14,23],sl:[-37,-76],sr:[36,-68],el:[-52,-32],er:[47,-109],wl:[-56,18],wr:[54,-151],kl:[-33,17],kr:[36,13],al:[-54,57],ar:[52,46]},
fall:{head:[-4,-108],size:[14,23],sl:[-39,-75],sr:[34,-83],el:[-51,-20],er:[43,-118],wl:[-50,25],wr:[46,-154],kl:[-23,42],kr:[22,51],al:[-36,87],ar:[25,108]},
grab:{head:[-5,-110],size:[14,23],sl:[-39,-78],sr:[34,-87],el:[-50,-20],er:[43,-127],wl:[-49,24],wr:[46,-154],kl:[-22,43],kr:[20,55],al:[-38,87],ar:[24,112]},
yank:{head:[-7,-113],size:[14,23],sl:[-39,-83],sr:[33,-96],el:[-60,-20],er:[45,-130],wl:[-58,20],wr:[46,-154],kl:[-37,28],kr:[17,53],al:[-62,74],ar:[23,113]},
tuck:{head:[-3,-118],size:[14,23],sl:[-39,-83],sr:[34,-82],el:[-56,-20],er:[46,-38],wl:[-68,-14],wr:[46,-14],kl:[-56,-56],kr:[41,16],al:[-77,-48],ar:[43,87]},
land:{head:[0,-130],size:[14.5,23],sl:[-39,-95],sr:[38,-86],el:[-52,-40],er:[54,3],wl:[-61,-17],wr:[65,69],kl:[-48,13],kr:[30,35],al:[-72,66],ar:[45,107]},
press:{head:[4,-143],size:[15,23],sl:[-39,-108],sr:[39,-97],el:[-47,-54],er:[62,-16],wl:[-47,-63],wr:[77,17],kl:[-47,-48],kr:[29,45],al:[-60,10],ar:[37,150]},
perch:{head:[3,-148],size:[15,23],sl:[-40,-109],sr:[40,-104],el:[-57,-74],er:[61,-47],wl:[-45,-67],wr:[83,-11],kl:[-50,-69],kr:[27,65],al:[-60,-18],ar:[35,169]}
};
const keys=[
[0,1070,334,"think","none"],[.16,1070,334,"think","none"],
[.36,1030,393,"launch","power2.in"],[.56,1000,565,"fall","power2.in"],
[.70,994,710,"grab","power2.out"],[.84,994,710,"yank","power2.inOut"],
[1.54,994,970,"yank","none"],[1.76,994,834,"tuck","power2.inOut"],
[2.02,1000,716,"land","power2.out"],[2.22,1000,772,"press","power2.inOut"],
[2.58,1000,800,"perch","power2.out"],[2.75,1000,797,"perch","power2.out"],
[2.96,1000,800,"perch","power2.inOut"],[3,1000,800,"perch","none"]
].map(function(k){return{t:k[0],x:k[1],y:k[2],pose:poses[k[3]],name:k[3],ease:gsap.parseEase(k[4])};});
const clock={t:0};
function mixPose(a,b,p){const out={};Object.keys(a).forEach(function(k){out[k]=[lerp(a[k][0],b[k][0],p),lerp(a[k][1],b[k][1],p)];});return out;}
function sampleActor(t){let a=keys[0],b=keys[1];for(let i=1;i<keys.length;i++){b=keys[i];a=keys[i-1];if(t<=b.t)break;}const u=clamp((t-a.t)/(b.t-a.t),0,1),p=b.ease(u);const y=k=>k.y+(k.t>=1.54?CONFIG.secondHeight-260:0);return{x:lerp(a.x,b.x,p)+CONFIG.gripX-1040,y:lerp(y(a),y(b),p),j:mixPose(a.pose,b.pose,p),name:b.name};}
function revealAt(t){if(t<.84)return 0;if(t<.96)return .12*gsap.parseEase("power3.in")((t-.84)/.12);if(t<1.18)return lerp(.12,.8,(t-.96)/.22);if(t<1.54)return lerp(.8,1,gsap.parseEase("power4.out")((t-1.18)/.36));return 1;}
function num(v){return Math.round(v*100)/100;}
function point(p){return num(p[0])+" "+num(p[1]);}
function poly(p){return"M "+p.map(point).join(" L ")+" Z";}
function line(p){return"M "+p.map(point).join(" L ");}
function normal(a,b){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.max(.001,Math.hypot(dx,dy));return[-dy/d,dx/d];}
function offset(p,n,w){return[p[0]+n[0]*w,p[1]+n[1]*w];}
function limb(a,b,c,wa,wb,wc){const n1=normal(a,b),n2=normal(b,c),avg=[(n1[0]+n2[0])*.5,(n1[1]+n2[1])*.5];return{outline:poly([offset(a,n1,wa),offset(b,avg,wb),offset(c,n2,wc),offset(c,n2,-wc),offset(b,avg,-wb),offset(a,n1,-wa)]),detail:line([offset(b,avg,wb),b,offset(b,avg,-wb)])};}
function path(id,d){$(id).setAttribute("d",d);}
function phase(t){return t<.16?"思考":t<.70?"跃下":t<.84?"抓边":t<1.54?"下拉展开":t<2.22?"单腿下压":t<2.96?"平滑落座":"第二栏已展开";}
function actorYAt(t){const a=sampleActor(clamp(t,0,3));return t>=.70&&t<=1.54?CONFIG.firstEdge+CONFIG.secondHeight*revealAt(t)+170:a.y;}
function render(){
const t=clock.t,grow=revealAt(t),edge=CONFIG.firstEdge+CONFIG.secondHeight*grow,a=sampleActor(t),j=a.j;
if(t>=.70&&t<=1.54)a.y=edge+170;
const world=function(p){return[a.x+p[0],a.y+p[1]];};const J={};Object.keys(j).forEach(function(k){J[k]=world(j[k]);});
const gripping=t>=.70&&t<=1.96,seated=t>=2.58;
if(gripping)J.wr=[CONFIG.gripX,edge+16];
if(t>=2.02){J.al=[a.x+j.al[0],edge-18];}
if(t>=2.22){J.wr=[a.x+j.wr[0],edge-11];}
const parts=[["left-arm",limb(J.sl,J.el,J.wl,7,6,3.5)],["right-arm",limb(J.sr,J.er,J.wr,7,6,3.5)],["left-leg",limb(world([-10,0]),J.kl,J.al,10,6,3.5)],["right-leg",limb(world([10,0]),J.kr,J.ar,10,6,3.5)]];
parts.forEach(function(p){path(p[0],p[1].outline);path(p[0]+"-detail",p[1].detail);});
function foot(p,side){return poly([[p[0]-4,p[1]-3],[p[0]+4,p[1]-3],[p[0]+side*14,p[1]+14],[p[0]+side*7,p[1]+18],[p[0]-side*8,p[1]+17]]);}
path("left-foot",foot(J.al,-1));path("right-foot",foot(J.ar,1));
const sy=(j.sl[1]+j.sr[1])/2,collarL=world([-20,sy-9]),collarR=world([20,sy-9]),neckPoint=world([1,sy+15]);
path("torso",poly([J.sl,collarL,neckPoint,collarR,J.sr,world([16,-22]),world([0,8]),world([-16,-22])]));
path("torso-detail",line([neckPoint,world([0,sy*.25])]));
const h=J.head,hw=j.size[0],hh=j.size[1],hp=[[0,-hh],[hw,-hh*.48],[hw*.97,hh*.23],[0,hh],[-hw*.97,hh*.23],[-hw,-hh*.48]].map(function(p){return[h[0]+p[0],h[1]+p[1]];});
path("neck",poly([[h[0]-hw*.6,h[1]+hh*.6],[h[0]+hw*.6,h[1]+hh*.6],neckPoint]));path("head",poly(hp));
path("head-detail",line([hp[5],[h[0]-hw*.63,h[1]+hh*.7]])+" "+line([hp[1],[h[0]+hw*.63,h[1]+hh*.7]]));
function hand(w,kind){
if(kind==="claspL")return poly([[w[0]-3,w[1]+5],[w[0]-10,w[1]-5],[w[0]+5,w[1]-13],[w[0]+13,w[1]-8],[w[0]+3,w[1]-3]]);
if(kind==="claspR")return poly([[w[0]+3,w[1]+5],[w[0]+10,w[1]-5],[w[0]-5,w[1]-13],[w[0]-13,w[1]-8],[w[0]-3,w[1]-3]]);
if(kind==="fist")return poly([[w[0]-4,w[1]-3],[w[0]+5,w[1]-3],[w[0]+10,w[1]+8],[w[0]+4,w[1]+14],[w[0]-7,w[1]+10]]);
if(kind==="brace")return poly([[w[0]-3,w[1]-2],[w[0]+4,w[1]-2],[w[0]+22,w[1]+8],[w[0]+12,w[1]+11],[w[0]-3,w[1]+9]]);
return poly([[w[0]-4,w[1]-2],[w[0]+4,w[1]-2],[w[0]+9,w[1]+10],[w[0]+3,w[1]+15],[w[0]+1,w[1]+7],[w[0]-3,w[1]+13],[w[0]-7,w[1]+9]]);
}
const thinking=t<=.16;path("left-hand",hand(J.wl,thinking?"claspL":(t>=.70&&t<1.70?"fist":"open")));
if(gripping){const x=CONFIG.gripX,y=edge;path("right-hand",poly([[x-4,y+19],[x-12,y+9],[x-13,y-3],[x-9,y-8],[x-5,y-5],[x-1,y-10],[x+4,y-8],[x+9,y-8],[x+13,y-5],[x+11,y+8],[x+4,y+19]]));}else path("right-hand",hand(J.wr,thinking?"claspR":(seated?"brace":"open")));
path("edge-one","M 0 "+CONFIG.firstEdge+" L "+num(CONFIG.width)+" "+CONFIG.firstEdge);
path("edge-two","M 0 "+num(edge)+" L "+num(CONFIG.width)+" "+num(edge));$("edge-two-label").setAttribute("y",num(edge-15));$("edge-two-label").setAttribute("x",num(CONFIG.width-20));
gsap.set($("edge-two"),{opacity:t<.68?0:1});gsap.set($("edge-two-label"),{opacity:grow<.2?0:clamp((grow-.2)*3,0,1)});
mask.style.height=(grow*bodyHeight)+"px";
copyItems.forEach((node,index)=>gsap.set(node,{opacity:clamp((grow-.08-index*.06)*2.6,0,1),y:(1-grow)*12}));
gsap.set(layout.querySelector('.profile-stamp'),{opacity:clamp((grow-.2)*2,0,1),y:(1-grow)*14});
const velocity=(actorYAt(t+.012)-actorYAt(t-.012))/.024;
const speed=t>.17&&t<2.5?clamp(Math.abs(velocity)/650,0,1):0;
const direction=velocity>=0?-1:1;
path("motion-lines",line([[a.x-78,a.y-64],[a.x-90,a.y-64+direction*90]])+" "+line([[a.x+82,a.y-25],[a.x+90,a.y-25+direction*120]])+" "+line([[a.x-50,a.y+55],[a.x-56,a.y+55+direction*62]]));
gsap.set($("motion-lines"),{opacity:speed*.8});
const land=clamp((t-2.02)/.5,0,1),pulse=t>=2.02&&t<2.52?Math.sin(land*Math.PI):0;
$("landing-ring").setAttribute("cy",num(edge));$("landing-ring").setAttribute("cx",num(a.x-66));$("landing-ring").setAttribute("rx",num(15+land*45));gsap.set($("landing-ring"),{opacity:pulse*.45});
const bottom=Math.max(J.al[1]+20,J.ar[1]+20,edge+30),fullHeight=clamp(Math.max(580,bottom+40),580,CONFIG.height);
const joinProgress=clamp((t-2.22)/.74,0,1),joinEase=joinProgress*joinProgress*(3-2*joinProgress);
const visibleHeight=lerp(fullHeight,edge+4,joinEase);
paperActor?.draw({t,x:a.x,y:a.y,width:CONFIG.width,height:CONFIG.height,scale,edge,gripX:CONFIG.gripX,joints:J,localJoints:j,gripping,seated,phase:phase(t)});
const state={time:t,duration:CONFIG.duration,reveal:grow,firstEdge:CONFIG.firstEdge,secondEdge:edge,actorX:a.x,actorY:a.y,gripY:gripping?edge:null,gripX:gripping?CONFIG.gripX:null,rightWrist:J.wr.slice(),leftFootY:J.al[1]+18,actorBottom:bottom,visibleHeight:visibleHeight,phase:phase(t),complete:t>=2.999};
update(state);
}
const tl=gsap.timeline({paused:true});tl.to(clock,{t:CONFIG.duration,duration:CONFIG.duration,ease:"none",onUpdate:render},0);
function update(state) {
  stage.style.height=Math.ceil(state.visibleHeight*scale)+"px";
  overlay.style.height=(CONFIG.height*scale)+"px";
  if(running&&state.time>.36&&state.time<2.96) {
    const top=stage.getBoundingClientRect().top+scrollY;
    const target=Math.max(0,top+(state.actorBottom+25)*scale-innerHeight*.83);
    if(Math.abs(scrollY-target)>1)window.scrollTo({top:target,behavior:'instant'});
  }
}
function measure() {
  const width=stage.clientWidth;if(!width)return;
  scale=Math.max(.46,Math.min(width/1440,1));CONFIG.width=width/scale;
  bodyHeight=layout.getBoundingClientRect().height;CONFIG.secondHeight=bodyHeight/scale;
  CONFIG.height=CONFIG.firstEdge+CONFIG.secondHeight+380;
  CONFIG.gripX=CONFIG.width*.90-30;CONFIG.landingX=CONFIG.gripX-40;
  overlay.setAttribute('viewBox','0 0 '+CONFIG.width+' '+CONFIG.height);
  intro.style.height=(CONFIG.firstEdge*scale)+'px';mask.style.top=(CONFIG.firstEdge*scale)+'px';
  Object.assign(throne.style,{left:((CONFIG.gripX+30-150)*scale)+'px',top:(54*scale)+'px',width:(300*scale)+'px',height:(450*scale)+'px'});
  render();
}
function finish() {
  running=false;played=true;section.classList.remove('profile-unfold-running');section.classList.add('profile-unfold-revealed');
  root.classList.remove('profile-layout-changing');mask.inert=false;mask.removeAttribute('aria-hidden');
  trigger.setAttribute('aria-expanded','true');trigger.disabled=true;
  window.removeEventListener('wheel',onWheel);window.removeEventListener('scroll',onScroll);
  window.removeEventListener('touchstart',onTouchStart);window.removeEventListener('touchmove',onTouchMove);
  window.removeEventListener('keydown',onKey);
  if(buttonStarted){const heading=copy.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});}
}
function canOpen() {
  const r=stage.getBoundingClientRect();
  return !played&&!root.classList.contains('intro-pending')&&!root.classList.contains('vortex-open')&&r.top<innerHeight*.76&&r.bottom>0;
}
function open(fromButton=false) {
  if(played||root.classList.contains('intro-pending'))return;
  played=true;running=true;buttonStarted=fromButton;trigger.disabled=true;
  section.classList.add('profile-unfold-running');root.classList.add('profile-layout-changing');
  measure();tl.play(0);
}
function onWheel(event) {
  if(event.ctrlKey||event.target.closest('input,textarea,select,[contenteditable]'))return;
  if(running){event.preventDefault();return;}
  if(event.deltaY>5&&canOpen()){event.preventDefault();open();}
}
function onScroll() {
  const down=scrollY>lastScroll+2;lastScroll=scrollY;
  if(location.hash&&!['#home','#about'].includes(location.hash))return;
  if(down&&canOpen())open();
}
function onTouchStart(event){touchY=event.touches[0]?.clientY??null;}
function onTouchMove(event){const y=event.touches[0]?.clientY;if(touchY===null||y===undefined)return;if(running){event.preventDefault();return;}if(touchY-y>12&&canOpen()){event.preventDefault();open();}}
function onKey(event) {
  if(event.target.closest('input,textarea,select,[contenteditable],button,a'))return;
  if(['ArrowDown','PageDown',' '].includes(event.key)&&(running||canOpen())){event.preventDefault();if(!running)open();}
}
function onMotionChange(event){if(event.matches){tl.pause();clock.t=3;render();finish();}}
trigger.addEventListener('click',()=>open(true));
tl.eventCallback('onComplete',finish);
window.addEventListener('wheel',onWheel,{passive:false});window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('touchstart',onTouchStart,{passive:true});window.addEventListener('touchmove',onTouchMove,{passive:false});window.addEventListener('keydown',onKey);
window.addEventListener('resize',measure,{passive:true});motion.addEventListener('change',onMotionChange);
observer=new ResizeObserver(measure);observer.observe(layout);document.fonts.ready.then(measure);
measure();if(motion.matches){clock.t=3;render();finish();}
})();
