/* The local opening holds the exact homepage K while its other content is revealed. */
(() => {
  if (!new URLSearchParams(location.search).has('cosmicHandoff') || window.parent === window) return;
  const origin='http://127.0.0.1:8774',root=document.documentElement,frame=document.querySelector('.site-frame');
  function sendTarget() {
    const k=document.querySelector('.scene-glass');
    if(!k)return;
    const r=k.getBoundingClientRect();
    if(r.width>0&&r.height>0)window.parent.postMessage({type:'cosmic-k-target',x:r.x,y:r.y,width:r.width,height:r.height},origin);
  }
  window.addEventListener('message',event=>{
    if(event.origin!==origin||event.source!==window.parent||!event.data)return;
    if(event.data.type==='cosmic-home-progress') {
      const p=Math.max(0,Math.min(1,Number(event.data.progress)||0));
      root.classList.add('cosmic-transit');
      root.style.setProperty('--cosmic-content-progress',String(p));
      if(frame)frame.inert=true;
      sendTarget();
      if(event.data.complete) {
        root.classList.remove('cosmic-transit');
        if(frame)frame.inert=false;
        requestAnimationFrame(()=>window.parent.postMessage({type:'cosmic-home-settled'},origin));
      }
    } else if(event.data.type==='cosmic-k-measure')sendTarget();
  });
  window.addEventListener('resize',sendTarget);
  window.addEventListener('load',sendTarget,{once:true});
  document.fonts.ready.then(sendTarget);
  sendTarget();
})();
