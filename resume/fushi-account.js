(()=>{
'use strict';
const root=document.getElementById('account-data');if(!root)return;
const D=window.FUSHI_ACCOUNT_DATA,$=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
  const state={platform:'bili',mode:'fans',forecast:false};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const wan=n=>n>=10000?String(Number((n/10000).toFixed(n>=10000000?1:2)))+'万':Number(n).toLocaleString('zh-CN');
  const ts=d=>Date.parse(d.slice(0,10)+'T00:00:00Z');
  const dateText=d=>d.slice(0,7).replace('-','.');
  function metric(n,decimals=2){return n>=10000?`${Number((n/10000).toFixed(decimals))}<small>万</small>`:n.toLocaleString('zh-CN')}
  function renderPlatform(){
    const d=D[state.platform];
    $('#metric-fans').innerHTML=metric(d.fans,state.platform==='bili'?2:1);
    $('#metric-likes').innerHTML=metric(d.totalLikes,state.platform==='bili'?2:1);
    $('#metric-works').textContent=d.works;
    $('#asof').textContent=`${d.asOf}`;
    $('#ranking-title').textContent=state.platform==='bili'?'作品播放':'作品获赞';
    $('#ranking-unit').textContent='累计'+d.sampleUnit;
    const max=Math.max(...d.top.map(x=>x.metric));
    $('#ranking-chart').innerHTML=d.top.slice(0,8).map(r=>`<a class="rank-row" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(r.title)}，${wan(r.metric)}${d.sampleUnit}"><span class="rank-title">${esc(r.title)}</span><span class="rank-value">${wan(r.metric)}</span><span class="rank-track"><span class="rank-fill" style="width:${(r.metric/max*100).toFixed(2)}%"></span></span></a>`).join('');
    drawChart();
  }
  $$('[data-platform]').forEach(b=>b.addEventListener('click',()=>{
    state.platform=b.dataset.platform;
    $$('[data-platform]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',String(x===b))});
    $('#platform-panel').setAttribute('aria-labelledby',b.id);renderPlatform();
  }));
  $$('[data-platform]').forEach(b=>b.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    e.preventDefault();const tabs=$$('[data-platform]'),i=tabs.indexOf(b);
    const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    tabs[next].click();tabs[next].focus();
  }));
  $$('[data-chart-mode]').forEach(b=>b.addEventListener('click',()=>{
    state.mode=b.dataset.chartMode;
    $$('[data-chart-mode]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});
    $('#show-forecast').disabled=state.mode==='monthly';drawChart();
  }));
  $('#show-forecast').addEventListener('change',e=>{state.forecast=e.target.checked;drawChart()});
  function svgEl(name,attrs={},text){const e=document.createElementNS('http://www.w3.org/2000/svg',name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e}
  function path(rows,x,y,k){return rows.map((r,i)=>(i?'L':'M')+x(ts(r[0])).toFixed(2)+','+y(r[k]).toFixed(2)).join(' ')}
  function drawChart(){
    const host=$('#growth-chart'),d=D[state.platform],monthly=state.mode==='monthly',future=state.forecast&&!monthly;
    const rows=monthly?d.monthly:d.curve,fore=future?d.forecast:[];
    const W=Math.max(240,Math.floor(host.clientWidth)),H=W<400?300:330,b={x:44,y:32,w:W-58,h:H-82};
    const all=[...rows,...fore],xmin=ts(rows[0][0]),xmax=ts((fore.length?fore:rows).at(-1)[0]);
    const values=all.flatMap(r=>r.slice(1,4).filter(Number.isFinite));
    const vmin=monthly?Math.min(0,...values):0,vmax=Math.max(...values),span=vmax-vmin||1;
    const ymin=vmin<0?vmin-span*.1:0,ymax=vmax+span*.15;
    const x=t=>b.x+(t-xmin)/(xmax-xmin)*b.w,y=v=>b.y+b.h-(v-ymin)/(ymax-ymin)*b.h;
    host.replaceChildren();
    const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,width:W,height:H,role:'img','aria-label':`${d.label}${monthly?'月度粉丝增量':'历史粉丝走势'}估算。${d.basis}`});
    svg.append(svgEl('title',{},`${d.label}粉丝${monthly?'月度增量':'走势'}估算`));
    const defs=svgEl('defs'),clip=svgEl('clipPath',{id:'chart-clip'});clip.append(svgEl('rect',{x:b.x,y:b.y,width:b.w,height:b.h}));defs.append(clip);svg.append(defs);
    const ticks=4;
    for(let i=0;i<=ticks;i++){const v=ymin+(ymax-ymin)*i/ticks,py=y(v);svg.append(svgEl('line',{x1:b.x,y1:py,x2:b.x+b.w,y2:py,stroke:'var(--soft)','stroke-opacity':.15}));svg.append(svgEl('text',{x:b.x-9,y:py+4,'text-anchor':'end'},(v/10000).toFixed(monthly?1:0)))}
    svg.append(svgEl('text',{x:b.x,y:15},monthly?'月增量 / 万人（估算）':'粉丝 / 万人（估算）'));
    const xdates=W<400?[rows[0][0],rows[Math.floor(rows.length/2)][0],(fore.length?fore:rows).at(-1)[0]]:[rows[0][0],'2024-01-01','2025-01-01',(fore.length?fore:rows).at(-1)[0]];
    xdates.filter(t=>ts(t)>=xmin&&ts(t)<=xmax).forEach((t,i,a)=>svg.append(svgEl('text',{x:x(ts(t)),y:H-24,'text-anchor':i===0?'start':i===a.length-1?'end':'middle'},dateText(t))));
    svg.append(svgEl('text',{x:b.x+b.w,y:H-3,'text-anchor':'end'},'年月'));
    const plot=svgEl('g',{'clip-path':'url(#chart-clip)'});
    const band=path(rows,x,y,3)+' '+[...rows].reverse().map(r=>'L'+x(ts(r[0])).toFixed(2)+','+y(r[2]).toFixed(2)).join(' ')+' Z';
    plot.append(svgEl('path',{d:band,fill:'var(--accent)','fill-opacity':.13}));
    plot.append(svgEl('path',{d:path(rows,x,y,1),fill:'none',stroke:'var(--accent)','stroke-width':2.4,'stroke-linejoin':'round'}));
    if(fore.length){const fb=path(fore,x,y,3)+' '+[...fore].reverse().map(r=>'L'+x(ts(r[0]))+','+y(r[2])).join(' ')+' Z';plot.append(svgEl('path',{d:fb,fill:'var(--accent)','fill-opacity':.15}));plot.append(svgEl('path',{d:path(fore,x,y,1),fill:'none',stroke:'var(--accent)','stroke-width':2,'stroke-dasharray':'5 4'}));const fx=x(ts(d.asOf));plot.append(svgEl('line',{x1:fx,y1:b.y,x2:fx,y2:b.y+b.h,stroke:'var(--soft)','stroke-opacity':.4,'stroke-dasharray':'3 4'}))}
    if(!monthly)d.anchors.forEach(a=>{const xx=x(ts(a.date));if(xx>=b.x&&xx<=b.x+b.w){plot.append(svgEl('circle',{cx:Math.min(xx,b.x+b.w-3),cy:y(a.fans),r:4,fill:'var(--paper)',stroke:'var(--bg)','stroke-width':1.5}))}});
    svg.append(plot);
    const guide=svgEl('line',{x1:0,x2:0,y1:b.y,y2:b.y+b.h,stroke:'var(--paper)','stroke-opacity':.45,visibility:'hidden'}),dot=svgEl('circle',{r:4,fill:'var(--paper)',visibility:'hidden'});
    svg.append(guide,dot);
    const overlay=svgEl('rect',{x:b.x,y:b.y,width:b.w,height:b.h,fill:'transparent','data-chart-hit':'true'});
    const readout=$('#chart-readout');
    const defaultText=monthly?`${d.label} 月度增量 估算`:`${d.asOf} ${wan(d.fans)} 粉丝`;
    readout.textContent=defaultText;
    function inspect(e){const rect=svg.getBoundingClientRect(),px=Math.max(b.x,Math.min(b.x+b.w,(e.clientX-rect.left)*W/rect.width));const t=xmin+(px-b.x)/b.w*(xmax-xmin);let row=all[0];for(const r of all){if(Math.abs(ts(r[0])-t)<Math.abs(ts(row[0])-t))row=r;}const xx=x(ts(row[0]));guide.setAttribute('x1',xx);guide.setAttribute('x2',xx);guide.setAttribute('visibility','visible');dot.setAttribute('cx',xx);dot.setAttribute('cy',y(row[1]));dot.setAttribute('visibility','visible');readout.textContent=`${monthly?row[0].slice(0,7):row[0]} · ${monthly?'模型月增量':'模型粉丝'} ${wan(row[1])}${future&&ts(row[0])>ts(d.asOf)?'（条件情景）':'（估算）'}`}
    overlay.addEventListener('pointermove',inspect);overlay.addEventListener('pointerdown',inspect);overlay.addEventListener('pointerleave',()=>{guide.setAttribute('visibility','hidden');dot.setAttribute('visibility','hidden')});svg.append(overlay);host.append(svg);
    $('#growth-title').textContent=monthly?'月度增量 估算':'粉丝走势 估算';
    $('.dot-key').parentElement.hidden=monthly;
  }

renderPlatform();new ResizeObserver(()=>drawChart()).observe($('#growth-chart'));
})();
