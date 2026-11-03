(()=>{
'use strict';
const root=document.getElementById('yao-account-data'),data=window.YAO_ACCOUNT_DATA;if(!root||!data)return;
const $=s=>root.querySelector(s),chart=$('.yao-fan-chart'),readout=$('#yao-chart-readout');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let audience='age',chartEntered=false,profileEntered=false,chartAnimation;
const format=n=>`${(n/10000).toFixed(1)}万`;
function node(tag,attrs={},text){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el}
function model(){return window.ClassroomFanModel.calculate(data.records,{likeRate:.007,followRate:.003,anchor:data.account.fans})}
function draw(){
 let m;try{m=model();}catch(error){return}
 for(const [id,value,prefix]of [['#yao-fan-start',m.baseline,''],['#yao-fan-end',m.end,''],['#yao-fan-gain',m.growth,'+']])$(id).innerHTML=`${prefix}${(value/10000).toFixed(1)}<small>万</small>`;
 const W=Math.max(260,Math.floor(chart.clientWidth)),H=W<550?280:370,b={x:52,y:32,w:W-70,h:H-84};
 const span=Math.max(m.end-m.baseline,1000),raw=span/4,mag=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(x=>x*mag).find(x=>x>=raw),top=m.baseline+Math.ceil(span/step)*step;
 const x=i=>b.x+i/(m.daily.length-1)*b.w,y=v=>b.y+b.h-(v-m.baseline)/(top-m.baseline)*b.h;
 const svg=node('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':`3至9月粉丝走势 ${format(m.baseline)}至${format(m.end)}`});
 for(let value=m.baseline;value<=top+.1;value+=step){const yy=y(value);svg.append(node('line',{x1:b.x,y1:yy,x2:b.x+b.w,y2:yy,stroke:'var(--soft)','stroke-opacity':.15}),node('text',{x:b.x-9,y:yy+4,'text-anchor':'end'},format(value)))}
 const dates=m.daily.flatMap((r,i)=>i===0||r.date.slice(0,7)!==m.daily[i+1]?.date.slice(0,7)?[i]:[]);
 (W<550?[dates[0],dates[1],dates[4],dates[7]]:dates).forEach(i=>svg.append(node('text',{x:x(i),y:H-20,'text-anchor':i===0?'start':i===m.daily.length-1?'end':'middle'},i===0?'2月底':`${Number(m.daily[i].date.slice(5,7))}月底`)));
 const path=m.daily.map((r,i)=>`${i?'L':'M'}${x(i).toFixed(2)},${y(r.fans).toFixed(2)}`).join(' ');
 const defs=node('defs'),clip=node('clipPath',{id:'yao-chart-clip'}),sweep=node('rect',{x:b.x,y:b.y,width:b.w,height:b.h,'data-chart-sweep':''});
 sweep.style.transformOrigin=`${b.x}px 0`;sweep.style.transform=chartEntered||reduced?'scaleX(1)':'scaleX(0)';clip.append(sweep);defs.append(clip);svg.append(defs);
 const plot=node('g',{'clip-path':'url(#yao-chart-clip)'});
 plot.append(node('path',{d:`${path} L${b.x+b.w},${b.y+b.h} L${b.x},${b.y+b.h} Z`,fill:'var(--accent)','fill-opacity':.13}));
 plot.append(node('path',{d:path,fill:'none',stroke:'var(--accent)','stroke-width':2.4,'stroke-linejoin':'round','stroke-linecap':'round'}));svg.append(plot);
 svg.append(node('text',{x:b.x+b.w,y:y(m.end)-13,'text-anchor':'end',class:'yao-end-label'},format(m.end)));
 if(W>650)for(const [date,label]of [['2026-04-23','4月 6条集中发布'],['2026-08-14','8月 3/4'],['2026-09-07','9月 2/2']]){const i=m.daily.findIndex(r=>r.date===date),xx=x(i);svg.append(node('line',{x1:xx,x2:xx,y1:b.y,y2:b.y+b.h,stroke:'currentColor','stroke-opacity':.18}),node('text',{x:Math.min(xx+7,W-65),y:16},label))}
 const guide=node('line',{y1:b.y,y2:b.y+b.h,stroke:'var(--paper)','stroke-opacity':.45,visibility:'hidden'}),dot=node('circle',{r:4,fill:'var(--paper)',visibility:'hidden'}),overlay=node('rect',{x:b.x,y:b.y,width:b.w,height:b.h,fill:'transparent','data-chart-hit':'true'});
 const defaultText=`2026.03—09 · ${format(m.end)} 粉丝`;if(readout)readout.textContent=defaultText;
 function inspect(event){const box=svg.getBoundingClientRect(),px=Math.max(b.x,Math.min(b.x+b.w,(event.clientX-box.left)*W/box.width)),i=Math.round((px-b.x)/b.w*(m.daily.length-1)),row=m.daily[i],xx=x(i);guide.setAttribute('x1',xx);guide.setAttribute('x2',xx);guide.setAttribute('visibility','visible');dot.setAttribute('cx',xx);dot.setAttribute('cy',y(row.fans));dot.setAttribute('visibility','visible');if(readout)readout.textContent=`${row.date} · ${format(row.fans)} 粉丝`}
 overlay.addEventListener('pointermove',inspect);overlay.addEventListener('pointerdown',inspect);overlay.addEventListener('pointerleave',()=>{guide.setAttribute('visibility','hidden');dot.setAttribute('visibility','hidden');if(readout)readout.textContent=defaultText});
 svg.append(guide,dot,overlay);chart.replaceChildren(svg);
}
function drawProfile(){
 const host=$('.yao-profile-chart');host.replaceChildren(...data.demographics[audience].map(([label,percent])=>{const row=document.createElement('div');row.className='yao-category';const text=document.createElement('span');text.textContent=label;const value=document.createElement('b');value.textContent=percent+'%';const bar=document.createElement('i'),fill=document.createElement('i');bar.className='rank-track';fill.className='rank-fill';fill.style.width=percent+'%';bar.append(fill);row.append(text,value,bar);return row}));if(profileEntered)revealProfile();
}
const tabs=[...root.querySelectorAll('[data-audience]')];
tabs.forEach(button=>button.addEventListener('click',()=>{audience=button.dataset.audience;root.querySelectorAll('[data-audience]').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button))});drawProfile()}));
function revealChart(){const sweep=chart.querySelector('[data-chart-sweep]');if(!sweep)return;chartAnimation?.cancel();if(reduced){sweep.style.transform='scaleX(1)';return}chartAnimation=sweep.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1100,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'})}
function revealProfile(){if(reduced)return;for(const fill of root.querySelectorAll('.yao-profile-chart .rank-fill'))fill.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:600,easing:'ease-out'})}
tabs.forEach((button,index)=>button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].click();tabs[next].focus()}));
draw();drawProfile();new ResizeObserver(draw).observe(chart);
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){if(entry.target===chart){chartEntered=true;revealChart()}else{profileEntered=true;revealProfile()}observer.unobserve(entry.target)}},{threshold:.15});observer.observe(chart);observer.observe($('.yao-profile-chart'))}else{chartEntered=profileEntered=true;revealChart();revealProfile()}
})();
