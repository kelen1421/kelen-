/* Classroom scenario model. Historical followers are unknown; all outputs except anchor are assumed. */
(function(root){
  'use strict';
  const DAY=86400000;
  function allocate(weights,total){
    if(!weights.length)return [];
    const units=Math.round(total/100),sum=weights.reduce((a,b)=>a+b,0);
    if(!sum)return weights.map(()=>0);
    const raw=weights.map(x=>x/sum*units),counts=raw.map(Math.floor);
    const order=raw.map((x,i)=>({i,fraction:x-counts[i]})).sort((a,b)=>b.fraction-a.fraction||a.i-b.i);
    let left=units-counts.reduce((a,b)=>a+b,0);
    for(let i=0;i<left;i++)counts[order[i].i]++;
    return counts.map(x=>x*100);
  }
  function calculate(rows,options={}){
    const likeRate=options.likeRate??.007, followRate=options.followRate??.003, anchor=options.anchor??861000,highBoost=options.highBoost??1.8;
    if(!Number.isFinite(likeRate)||likeRate<.005||likeRate>.03)throw new Error('点赞率请填写0.5%—3%之间的数值。');
    if(![.001,.002,.003].includes(followRate))throw new Error('请选择有效的净增粉假设。');
    if(!Number.isFinite(highBoost)||highBoost<1||highBoost>5)throw new Error('高表现作品权重应在1—5之间。');
    const future=Array.from({length:9},(_,i)=>{
      const month=`2026-${String(i+3).padStart(2,'0')}`, items=rows.filter(r=>r.date.startsWith(month));
      const likes=items.reduce((s,r)=>s+r.likes,0);
      return {month,count:items.length,likes,views:likes/likeRate,gain:Math.round(likes/likeRate*followRate/100)*100};
    });
    const baseline=anchor-future.reduce((s,r)=>s+r.gain,0);
    if(baseline<0)throw new Error('当前假设会回推出负数粉丝，无法构成有效情景。');
    const periodRows=rows.filter(r=>r.date>='2026-03-01'&&r.date<'2026-10-01').sort((a,b)=>a.date.localeCompare(b.date));
    const targetCount=Math.max(1,Math.round(periodRows.length*.25));
    const sorted=[...periodRows].sort((a,b)=>b.likes-a.likes);
    const threshold=sorted[targetCount-1]?.likes??0;
    const budget=future.slice(0,7).reduce((s,r)=>s+r.gain,0);
    const eventBudgets=allocate(periodRows.map(r=>r.likes*(r.likes>=threshold?highBoost:1)),budget);
    const releaseWeights=Array.from({length:14},(_,i)=>i<7?.7/7:.3/7);
    const gains=new Map();
    const events=periodRows.map((r,i)=>{
      const date=r.date.slice(0,10),at=Date.parse(date+'T00:00:00Z'),daily=allocate(releaseWeights,eventBudgets[i]);
      for(let d=0;d<daily.length;d++){
        const key=new Date(at+d*DAY).toISOString().slice(0,10);
        if(key<'2026-10-01')gains.set(key,(gains.get(key)||0)+daily[d]);
      }
      return {id:r.id,date,likes:r.likes,high:r.likes>=threshold,gain:eventBudgets[i]};
    });
    const start=Date.parse('2026-02-28T00:00:00Z'),end=Date.parse('2026-09-30T00:00:00Z');
    let cumulative=baseline;
    const daily=[];
    for(let at=start;at<=end;at+=DAY){
      const date=new Date(at).toISOString().slice(0,10),gain=gains.get(date)||0;cumulative+=gain;
      daily.push({date,gain,fans:cumulative});
    }
    for(let i=0;i<7;i++)future[i].gain=daily.filter(d=>d.date.startsWith(future[i].month)).reduce((s,d)=>s+d.gain,0);
    let fans=baseline;
    const all=future.map(r=>({...r,fans:(fans+=r.gain)})),period=all.slice(0,7);
    const density=period.map(r=>{const e=events.filter(x=>x.date.startsWith(r.month));return {month:r.month,count:e.length,highCount:e.filter(x=>x.high).length,ratio:e.length?e.filter(x=>x.high).length/e.length:0}});
    return {likeRate,followRate,anchor,baseline,period,all,end:period.at(-1).fans,growth:period.reduce((s,r)=>s+r.gain,0),likes:period.reduce((s,r)=>s+r.likes,0),count:period.reduce((s,r)=>s+r.count,0),threshold,highBoost,events,daily,density,releaseDays:14,points:[{month:'2026-02',label:'入职前',fans:baseline},...period.map(r=>({...r,label:`${Number(r.month.slice(5))}月底`}))]};
  }
  root.ClassroomFanModel={calculate};
})(typeof window==='object'?window:globalThis);
