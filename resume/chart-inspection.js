// Both account charts use the same cursor and keyboard behavior.
window.bindChartInspection=function({overlay,guide,dot,readout,summary,label,count,nearest,pointAt}){
 const svg=overlay.ownerSVGElement;
 let selected=-1;
 overlay.setAttribute('tabindex','0');
 overlay.setAttribute('role','slider');
 overlay.setAttribute('aria-label',label);
 overlay.setAttribute('aria-valuemin','1');
 overlay.setAttribute('aria-valuemax',String(count));
 function select(index){
  if(index===selected)return;
  selected=index;
  const point=pointAt(index);
  guide.setAttribute('x1',point.x);
  guide.setAttribute('x2',point.x);
  dot.setAttribute('cx',point.x);
  dot.setAttribute('cy',point.y);
  guide.setAttribute('visibility','visible');
  dot.setAttribute('visibility','visible');
  overlay.setAttribute('aria-valuenow',String(index+1));
  overlay.setAttribute('aria-valuetext',point.text);
  readout.textContent=point.text;
 }
 function reset(){
  selected=-1;
  guide.setAttribute('visibility','hidden');
  dot.setAttribute('visibility','hidden');
  overlay.setAttribute('aria-valuenow',String(count));
  overlay.setAttribute('aria-valuetext',pointAt(count-1).text);
  readout.textContent=summary;
 }
 function inspect(event){
  const box=svg.getBoundingClientRect();
  if(box.width)select(nearest((event.clientX-box.left)*svg.viewBox.baseVal.width/box.width));
 }
 overlay.addEventListener('pointerdown',inspect);
 overlay.addEventListener('pointermove',inspect);
 overlay.addEventListener('pointerleave',()=>{if(!overlay.matches(':focus-visible'))reset()});
 overlay.addEventListener('focus',()=>select(selected<0?count-1:selected));
 overlay.addEventListener('blur',reset);
 overlay.addEventListener('keydown',event=>{
  const index=selected<0?count-1:selected;
  const targets={ArrowLeft:index-1,ArrowDown:index-1,ArrowRight:index+1,ArrowUp:index+1,Home:0,End:count-1};
  if(!Object.hasOwn(targets,event.key))return;
  event.preventDefault();
  select(Math.max(0,Math.min(count-1,targets[event.key])));
 });
 reset();
};
