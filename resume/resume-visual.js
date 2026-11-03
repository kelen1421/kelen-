(()=>{'use strict';
const NS='http://www.w3.org/2000/svg';
function el(p,tag,a={},text){const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;p.append(n);return n;}
const pol=(x,y,r,a)=>[x+r*Math.cos(a*Math.PI/180),y+r*Math.sin(a*Math.PI/180)];
const rnd=(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n)};
const delay=t=>`--delay:${t}s`;
// L12 Type Colonnade: named records, Bézier threads, two ownership groups.
const ledger=document.querySelector('#resume-deliverables');if(ledger){const records=[['60 秒介绍片',0],['片头与动效',0],['其他视频作品',0],['字幕',1],['分镜',1],['可编辑工程',1]],groups=['作品','制作资料'];records.forEach(([name,j],i)=>{const yi=40+i*48,yj=96+j*150;el(ledger,'text',{x:145,y:yi+5,'font-size':16,fill:'#aaa99f','text-anchor':'end',class:'diagram-fade',style:delay(i*.08)},name);el(ledger,'rect',{x:157,y:yi-2,width:5,height:4,fill:'#aaa99f',class:'diagram-pop',style:delay(i*.08)});el(ledger,'path',{d:`M167 ${yi} C 245 ${yi} 260 ${yj} 355 ${yj}`,fill:'none',stroke:'#999b8f','stroke-width':.9,opacity:.65,pathLength:1,class:'diagram-draw',style:delay(.2+i*.08)})});groups.forEach((name,i)=>{const y=96+i*150;el(ledger,'circle',{cx:361,cy:y,r:4.25,fill:'#e1e2d5',class:'diagram-pop',style:delay(.6+i*.08)});el(ledger,'text',{x:379,y:y+5,'font-size':16,fill:'#e1e2d5',class:'diagram-fade',style:delay(.65+i*.08)},name)});}
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(!reduced)document.body.classList.add('resume-enhanced');
const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}},{threshold:.13});document.querySelectorAll('.visual-project,.project-visual').forEach(e=>observer.observe(e));
document.querySelectorAll('.replay-diagram').forEach(b=>b.addEventListener('click',()=>{const v=b.closest('.project-visual');v.classList.remove('is-visible');requestAnimationFrame(()=>requestAnimationFrame(()=>v.classList.add('is-visible')))}));
// PDF includes the complete résumé, then restores the reader's open/closed state.
let printDetails=[];addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('.resume-details,.ability-rail details')].map(e=>[e,e.open]);for(const[e]of printDetails)e.open=true});addEventListener('afterprint',()=>{for(const[e,open]of printDetails)e.open=open});
})();
