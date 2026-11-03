import {clamp,wrap,normalizeHex,hexToRgb,hexToHsl,hslToRgb,hslToHex,FORMULAS,makePalette,contrast,inkFor,PRESETS} from './core.mjs';

const $ = s=>document.querySelector(s), $$ = s=>[...document.querySelectorAll(s)];
const esc = value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/>',
 save:'<path d="M6 3h12v18l-6-4-6 4Z"/>',
 download:'<path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/>',
 shuffle:'<path d="m17 3 4 4-4 4M3 17h3c4 0 6-10 10-10h5M17 13l4 4-4 4M3 7h3c1.5 0 2.5 1.5 3.5 3M14.5 14c.5 1.5 1.5 3 3.5 3h3"/>',
 drop:'<path d="m14 4 6 6m-4-8 6 6-4 4-2-2-9 9-5 1 1-5 9-9-2-2 4-4Z"/>',
 undo:'<path d="m8 3-5 5 5 5M3 8h10a7 7 0 0 1 0 14"/>',
 arrow:'<path d="M6 18 18 6M6 6h12v12"/>',
 swap:'<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>'
};
const icon = name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
function readStorage(key,fallback) {try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function persist(key,value) {try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
const validSaved = p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&Array.isArray(p.colors)&&p.colors.length>=2&&p.colors.length<=5&&p.colors.every(c=>normalizeHex(c));
const initial = normalizeHex(readStorage('kelen-portfolio-hueform-base','#B5C88F')) || '#B5C88F';
const state = {base:initial,hsl:hexToHsl(initial),formula:'complementary',custom:null,format:'hex',preview:'poster',view:'studio',filter:'全部',saved:readStorage('kelen-portfolio-hueform-saved',[]),recent:readStorage('kelen-portfolio-hueform-recent',[initial]),history:[],foreground:'#191B1A',background:initial};
state.saved = Array.isArray(state.saved)?state.saved.filter(validSaved):[];
state.recent = Array.isArray(state.recent)?state.recent.filter(normalizeHex).slice(0,7):[initial];
let palette = [], wheelLightness = -1, toastTimer, renderFrame, commitTimer;
const formula = ()=>FORMULAS.find(f=>f.id===state.formula);
const title = ()=>state.custom?.name || `${formula().name}搭配`;
function snapshot(){return {base:state.base,formula:state.formula,custom:state.custom?structuredClone(state.custom):null};}
function remember(){const current=snapshot();if(JSON.stringify(current)!==JSON.stringify(state.history.at(-1))){state.history.push(current);if(state.history.length>40)state.history.shift();}$('#undo-button').disabled=!state.history.length;}
function recentCommit(){state.recent=[state.base,...state.recent.filter(c=>c!==state.base)].slice(0,7);persist('kelen-portfolio-hueform-recent',state.recent);persist('kelen-portfolio-hueform-base',state.base);renderRecent();}
function queueCommit(){clearTimeout(commitTimer);commitTimer=setTimeout(recentCommit,500);}
function setBase(hex,{record=true,keepHsl=false}={}) {
  const normalized=normalizeHex(hex);if(!normalized)return false;
  if(record)remember();state.base=normalized;state.custom=null;
  if(!keepHsl){const next=hexToHsl(normalized);if(next[1]===0)next[0]=state.hsl[0];state.hsl=next;}
  state.background=normalized;render();queueCommit();return true;
}
function setHsl(index,value,record=true){if(record)remember();state.hsl[index]=index===0?wrap(value):clamp(value,0,100);setBase(hslToHex(...state.hsl),{record:false,keepHsl:true});}
function notify(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
async function copy(text,message='已复制'){
  try{await navigator.clipboard.writeText(text);notify(message);}catch{
    const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();notify(ok?message:'复制失败，请手动选择色值复制');
  }
}
function formatted(hex){if(state.format==='rgb')return `rgb(${hexToRgb(hex).join(', ')})`;if(state.format==='hsl'){const [h,s,l]=hexToHsl(hex).map(Math.round);return `hsl(${h}, ${s}%, ${l}%)`;}return hex;}
function formulaIcon(f){
  const angles=f.id==='monochromatic'?[0]:f.angles;
  const points=angles.map(a=>{const t=(a-90)*Math.PI/180;return [16+11*Math.cos(t),16+11*Math.sin(t)];});
  return `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="12.5" stroke="currentColor" opacity=".25"/>${f.id==='monochromatic'?'<circle cx="16" cy="16" r="8" stroke="currentColor" opacity=".4"/><circle cx="16" cy="16" r="3" fill="currentColor"/>':`<path d="${points.map((p,i)=>(i?'L':'M')+p.join(',')).join(' ')}${points.length>2?'Z':''}" stroke="currentColor" stroke-width="1.3"/>${points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i===0?2.8:2.2}" fill="${i===0?'currentColor':'#fff'}" stroke="currentColor" stroke-width="1.2"/>`).join('')}`}</svg>`;
}
$('#copy-base').innerHTML=icon('copy');$('#copy-all').innerHTML=icon('copy');$('#save-button').innerHTML=icon('save')+'收藏方案';$('#export-button').innerHTML=icon('download')+'导出配色';$('#random-button').innerHTML=icon('shuffle')+'随机灵感';$('#eyedropper-button').innerHTML=icon('drop')+'屏幕取色';$('#undo-button').innerHTML=icon('undo');$('#swap-contrast').innerHTML=icon('swap');
$('#formula-tabs').innerHTML=FORMULAS.map(f=>`<button class="formula-button" data-formula="${f.id}" aria-pressed="false">${formulaIcon(f)}<strong>${f.name}</strong><small>${f.en}</small></button>`).join('');
$('#help-formulas').innerHTML=FORMULAS.map(f=>`<div>${formulaIcon(f)}<span><strong>${f.name}</strong><small>${f.rule}</small></span></div>`).join('');
function renderWheel(){
  const [h,s,l]=state.hsl;
  if(Math.abs(l-wheelLightness)>.03){
    const canvas=$('#wheel'),ctx=canvas.getContext('2d'),size=canvas.width,mid=size/2,radius=mid*.96;
    const data=ctx.createImageData(size,size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const dx=x-mid,dy=y-mid,dist=Math.hypot(dx,dy),idx=(y*size+x)*4;
      if(dist>radius)continue;
      const hue=wrap(Math.atan2(dy,dx)*180/Math.PI+90),rgb=hslToRgb(hue,dist/radius*100,l);
      data.data[idx]=rgb[0];data.data[idx+1]=rgb[1];data.data[idx+2]=rgb[2];data.data[idx+3]=Math.min(255,(radius-dist)*255);
    }
    ctx.putImageData(data,0,0);wheelLightness=l;
  }
  const points=palette.map(p=>{const [ph,ps]=hexToHsl(p.hex),t=(ph-90)*Math.PI/180,r=ps/100*124.8;return [130+Math.cos(t)*r,130+Math.sin(t)*r];});
  if(points.length){const t=(h-90)*Math.PI/180,r=s/100*124.8;points[0]=[130+Math.cos(t)*r,130+Math.sin(t)*r];}
  $('#wheel-overlay').innerHTML=`${points.length>1?`<path d="${points.map((p,i)=>(i?'L':'M')+p.join(',')).join(' ')}${points.length>2?'Z':''}" fill="none" stroke="#fff" stroke-width="1.2" opacity=".8"/>`:''}${points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i===0?8:5.5}" fill="${palette[i].hex}" stroke="${inkFor(palette[i].hex)}" stroke-opacity=".6" stroke-width="1"/><circle cx="${x}" cy="${y}" r="${i===0?6:3.5}" fill="none" stroke="#fff" stroke-width="2"/>`).join('')}`;
  $('#wheel-control').setAttribute('aria-valuenow',Math.round(h));
  $('#wheel-control').setAttribute('aria-valuetext',`色相 ${Math.round(h)} 度，饱和度 ${Math.round(s)}%，明度 ${Math.round(l)}%`);
}
function renderRecent(){
  $('#recent-colors').innerHTML=state.recent.map(hex=>`<button data-recent="${hex}" class="${hex===state.base?'active':''}" style="background:${hex}" title="${hex}" aria-label="选用 ${hex}"></button>`).join('');
}
function render(){
  palette=state.custom?state.custom.colors.map((hex,i)=>({hex,label:i===0?'主色':i===1?'辅助色':i===4?'点缀色':`搭配色 ${i}`,angle:hexToHsl(hex)[0]})):makePalette(state.base,state.formula);
  const [h,s,l]=state.hsl;
  document.documentElement.style.setProperty('--base',state.base);$('#native-color').value=state.base;$('#hex-input').value=state.base;$('#hex-input').removeAttribute('aria-invalid');$('#hex-error').hidden=true;
  $('#hue').value=Math.round(h);$('#hue-number').value=Math.round(h);$('#saturation').value=Math.round(s);$('#lightness').value=Math.round(l);$('#saturation-value').textContent=Math.round(s)+'%';$('#lightness-value').textContent=Math.round(l)+'%';
  $('#hue').style.background='linear-gradient(to right,#e45c5c,#e4e45c,#5ce45c,#5ce4e4,#5c5ce4,#e45ce4,#e45c5c)';
  $('#saturation').style.background=`linear-gradient(to right,${hslToHex(h,0,l)},${hslToHex(h,100,l)})`;
  $('#lightness').style.background=`linear-gradient(to right,#000,${hslToHex(h,s,50)},#fff)`;
  $$('.formula-button').forEach(b=>b.setAttribute('aria-pressed',String(!state.custom&&b.dataset.formula===state.formula)));
  $('#palette-title').textContent=title();$('#palette-description').textContent=state.custom?.desc||formula().desc;
  $('#palette').dataset.count=palette.length;$('#palette').dataset.format=state.format;
  $('#palette').innerHTML=palette.map((p,i)=>`<article class="swatch" style="--color:${p.hex};--ink:${inkFor(p.hex)}" data-hex="${p.hex}" data-neutral="${contrast(p.hex,'#FFFFFF')<1.05}"><div class="swatch-top"><span>${p.label}</span>${i?`<button data-set-base="${p.hex}" aria-label="将 ${p.hex} 设为主色" title="设为主色">${icon('arrow')}</button>`:''}</div><div class="swatch-bottom"><button class="swatch-copy" data-copy="${p.hex}" title="复制 ${formatted(p.hex)}" aria-label="复制 ${formatted(p.hex)}">${formatted(p.hex)}</button><small>${hexToRgb(p.hex).join(' · ')}</small></div></article>`).join('');
  const neutral = !state.custom&&(s<.01||l===0||l===100);
  $('#formula-rule').textContent=neutral?'无彩色没有明确色相，请增加饱和度并调整明度':state.custom?'精选方案 · 保留原始色值':`配色公式  ${formula().rule}`;
  $('#usage-note').textContent=state.custom?.desc||formula().usage;
  $('#undo-button').disabled=!state.history.length;
  const isSaved=state.saved.some(p=>p.colors.join()===palette.map(p=>p.hex).join());
  $('#save-button').innerHTML=icon('save')+(isSaved?'已收藏':'收藏方案');$('#save-button').setAttribute('aria-label',isSaved?'方案已收藏':'收藏方案');
  $('#export-button').setAttribute('aria-label','导出配色');
  renderWheel();renderPreview();renderContrast();renderRecent();renderCounts();
}
function renderCounts(){$('#saved-count').textContent=state.saved.length;}
function renderPreview(){
  const [a,b,c]=[palette[0].hex,palette[1]?.hex||palette[0].hex,state.custom?palette.at(-1).hex:palette[2]?.hex||inkFor(palette[0].hex)];
  const surface=state.custom?palette[1].hex:a,ink=inkFor(surface);
  if(state.preview==='poster'){
    $('#design-preview').innerHTML=`<div class="poster-preview" style="background:${surface};color:${ink}"><div class="poster-copy"><div class="poster-brand">FORM & FEEL</div><p class="poster-title">Less,<br>but better.</p><div class="poster-sub">留一点空白，给生活。 &nbsp; / &nbsp; Design collection</div></div><div class="poster-art" style="background:${state.custom?a:b};color:${inkFor(state.custom?a:b)}"><div class="poster-art-inner" style="background:${c}"></div></div><span class="poster-corner">THE ART OF EVERYDAY</span></div>`;
  }else if(state.preview==='ui'){
    $('#design-preview').innerHTML=`<div class="ui-preview" style="background:${state.custom?b:hslToHex(state.hsl[0],Math.min(state.hsl[1],20),95)}"><div class="sample-app"><div class="sample-art" style="background:${a}"><div style="background:${state.custom?c:b}"></div></div><div class="sample-content"><span class="sample-label">FORM & FEEL / 生活灵感</span><h3>A little<br>less, a little better.</h3><p>把日常过成喜欢的样子。</p><div style="background:${a};color:${inkFor(a)};border-radius:5px;text-align:center;padding:7px;font-size:11px">探索生活系列 ↗</div></div></div></div>`;
  }else{
    const roles=[a,b,c],labels=['主色','辅助色','点缀色'],percent=[60,30,10];
    $('#design-preview').innerHTML=`<div class="ratio-preview"><div class="ratio-bar">${roles.map((hex,i)=>`<div class="ratio-segment" style="flex:${percent[i]};background:${hex};color:${inkFor(hex)}">${percent[i]}<small>%</small></div>`).join('')}</div><div class="ratio-legend">${roles.map((hex,i)=>`<span><i style="background:${hex}"></i>${labels[i]}</span>`).join('')}</div><p>60 / 30 / 10 是常用的比例起点，可按内容调整。${palette.length===2?'点缀使用自动选择的深色或白色。':''}</p></div>`;
  }
  $$('[data-preview]').forEach(b=>b.classList.toggle('active',b.dataset.preview===state.preview));
}
function renderContrast(){
  const options=[{hex:'#191B1A',label:'深色文字'},{hex:'#FFFFFF',label:'纯白'},...palette.map(p=>({hex:p.hex,label:p.label}))];
  const unique=options.filter((p,i)=>options.findIndex(o=>o.hex===p.hex)===i);
  if(!unique.some(p=>p.hex===state.foreground))state.foreground='#191B1A';
  if(!unique.some(p=>p.hex===state.background))state.background=palette[0].hex;
  const html=unique.map(p=>`<option value="${p.hex}">${p.label} ${p.hex}</option>`).join('');
  $('#contrast-foreground').innerHTML=html;$('#contrast-background').innerHTML=html;$('#contrast-foreground').value=state.foreground;$('#contrast-background').value=state.background;
  $('#contrast-sample').style.background=state.background;$('#contrast-sample').style.color=state.foreground;
  const ratio=contrast(state.foreground,state.background);
  $('#contrast-ratio').textContent=ratio.toFixed(2)+' : 1';
  $('#contrast-status').textContent=ratio>=7?'AAA 通过':ratio>=4.5?'AA 通过':ratio>=3?'仅大字 AA':'未达 AA';
  $('#contrast-detail').textContent=ratio>=7?'普通文字与大号文字均达到 AAA。':ratio>=4.5?'普通文字达到 AA，大号文字达到 AAA。':ratio>=3?'仅大号文字达到 AA，普通文字对比度不足。':'普通文字与大号文字均需提高对比度。';
  $('#contrast-status').style.background=ratio>=4.5?'#eaf0e4':'#f2ede4';$('#contrast-status').style.color=ratio>=4.5?'#405333':'#775c30';
}
function navigate(view){
  state.view=['studio','classics','saved'].includes(view)?view:'studio';
  $$('.view').forEach(el=>el.hidden=el.id!==state.view+'-view');$$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===state.view));
  if(state.view==='classics')renderPresets();if(state.view==='saved')renderSaved();
  history.replaceState(null,'','#'+state.view);
}
function renderPresets(){
  const items=PRESETS.filter(p=>state.filter==='全部'||p.category===state.filter);
  $('#preset-grid').innerHTML=items.map(p=>`<article class="preset-card"><button class="preset-open" data-preset="${p.id}" aria-label="使用 ${p.name}"><div class="preset-colors">${p.colors.map(hex=>`<i style="background:${hex}"></i>`).join('')}</div><div class="preset-info"><div class="preset-meta"><h2>${p.name}</h2><span>↗</span></div><p>${p.en}</p><div class="preset-caption"><span>${p.scene}</span><span>${p.category}</span></div></div></button></article>`).join('');
  $$('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.filter));
  $('.library-total').textContent=items.length+' 套精选方案';
}
function applyPreset(p,fromSaved=false){remember();state.base=p.colors[0];state.hsl=hexToHsl(state.base);state.custom={name:p.name,colors:[...p.colors],desc:p.desc||'已收藏的配色方案'};state.background=p.colors[1];render();recentCommit();navigate('studio');notify(fromSaved?'已载入收藏方案':`已应用「${p.name}」`);}
function savePalette(){
  if(state.saved.some(p=>p.colors.join()===palette.map(p=>p.hex).join())){notify('这组配色已经在收藏中');return;}
  const record={id:crypto.randomUUID(),name:title(),desc:state.custom?.desc||formula().desc,colors:palette.map(p=>p.hex),formula:state.custom?'classic':state.formula,createdAt:new Date().toISOString()};
  state.saved.unshift(record);const ok=persist('kelen-portfolio-hueform-saved',state.saved);render();notify(ok?'已收藏，灵感已留存':'已暂存本次会话；浏览器未允许本地存储，请导出备份');
}
function renderSaved(){
  $('#saved-empty').hidden=state.saved.length>0;$('#saved-export').disabled=!state.saved.length;
  $('#saved-grid').innerHTML=state.saved.map(p=>`<article class="preset-card"><button class="preset-open" data-saved="${esc(p.id)}" aria-label="打开 ${esc(p.name)}"><div class="preset-colors">${p.colors.map(hex=>`<i style="background:${normalizeHex(hex)}"></i>`).join('')}</div><div class="preset-info"><div class="preset-meta"><h2>${esc(p.name)}</h2><span>↗</span></div><p>${p.colors.length} 色 · ${esc(p.colors[0])}</p><div class="preset-caption"><span>${p.createdAt?new Date(p.createdAt).toLocaleDateString('zh-CN'):''}</span><span>点击载入</span></div></div></button><button class="saved-remove" data-remove="${esc(p.id)}" aria-label="移除 ${esc(p.name)} 收藏" title="移除收藏">×</button></article>`).join('');
}
function paletteRecord(){return {name:title(),base:state.base,formula:state.custom?'classic':state.formula,colorSpace:'sRGB / HSL',colors:palette.map(p=>({hex:p.hex,rgb:hexToRgb(p.hex),hsl:hexToHsl(p.hex).map(v=>Math.round(v*100)/100),role:p.label}))};}
function download(content,mime,filename){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type:mime}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
function exportPalette(kind){
  const name=`色序_${title()}_${state.base.slice(1)}`;
  if(kind==='json')download(JSON.stringify(paletteRecord(),null,2),'application/json',name+'.json');
  if(kind==='css'){copy(`:root {\n${palette.map((p,i)=>`  --color-${i===0?'primary':i+1}: ${p.hex};`).join('\n')}\n}`,'CSS 变量已复制');$('#export-dialog').close();return;}
  if(kind==='svg'){
    const width=1600,height=900,pad=80,startY=220,swatchWidth=(width-pad*2)/palette.length;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="1600" height="900" fill="#F5F6F3"/><text x="80" y="100" font-family="Arial,sans-serif" font-size="28" fill="#29332B">HUEFORM / 色序</text><text x="80" y="168" font-family="Arial,sans-serif" font-size="44" fill="#29332B">${esc(title())}</text>${palette.map((p,i)=>`<rect x="${pad+i*swatchWidth}" y="${startY}" width="${swatchWidth+1}" height="500" fill="${p.hex}"/><text x="${pad+i*swatchWidth+24}" y="${startY+445}" font-family="Arial,sans-serif" font-size="${palette.length>4?27:33}" fill="${inkFor(p.hex)}">${p.hex}</text><text x="${pad+i*swatchWidth+24}" y="${startY+475}" font-family="Arial,sans-serif" font-size="18" fill="${inkFor(p.hex)}">${p.label}</text>`).join('')}<text x="80" y="810" font-family="Arial,sans-serif" font-size="20" fill="#69706A">${esc(state.custom?'Classic collection':formula().en)} · sRGB</text></svg>`;
    download(svg,'image/svg+xml',name+'.svg');
  }
  if(kind==='png'){
    const canvas=document.createElement('canvas');canvas.width=2400;canvas.height=1350;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#F5F6F3';ctx.fillRect(0,0,2400,1350);ctx.fillStyle='#29332B';ctx.font='500 42px Urbanist,MiSans,sans-serif';ctx.fillText('HUEFORM / 色序',120,150);ctx.font='500 66px Urbanist,MiSans,sans-serif';ctx.fillText(title(),120,252);
    const sw=2160/palette.length;
    palette.forEach((p,i)=>{const x=120+i*sw;ctx.fillStyle=p.hex;ctx.fillRect(x,330,sw+1,750);ctx.fillStyle=inkFor(p.hex);ctx.font=`500 ${palette.length>4?43:50}px Urbanist,MiSans,sans-serif`;ctx.fillText(p.hex,x+36,992);ctx.font='400 27px MiSans,sans-serif';ctx.fillText(p.label,x+36,1040);});
    ctx.fillStyle='#69706A';ctx.font='400 30px Urbanist,MiSans,sans-serif';ctx.fillText((state.custom?'Classic collection':formula().en)+' · sRGB',120,1215);
    canvas.toBlob(blob=>{if(blob){download(blob,'image/png',name+'.png');notify('PNG 色卡已生成，正在下载');}else notify('导出失败，请重试');},'image/png');$('#export-dialog').close();return;
  }
  $('#export-dialog').close();notify('已生成，正在下载');
}
function randomColor(){const h=crypto.getRandomValues(new Uint32Array(1))[0]%360,s=25+Math.random()*45,l=35+Math.random()*40;setBase(hslToHex(h,s,l));notify('换个颜色，换种可能');}

document.addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  if(el.dataset.view)navigate(el.dataset.view);
  if(el.dataset.formula){remember();state.formula=el.dataset.formula;state.custom=null;render();}
  if(el.dataset.copy)copy(formatted(el.dataset.copy),'已复制 '+formatted(el.dataset.copy));
  if(el.dataset.setBase){setBase(el.dataset.setBase);notify('已设为主色，重新生成搭配');}
  if(el.dataset.recent)setBase(el.dataset.recent);
  if(el.dataset.preview){state.preview=el.dataset.preview;renderPreview();}
  if(el.dataset.filter){state.filter=el.dataset.filter;renderPresets();}
  if(el.dataset.preset)applyPreset(PRESETS.find(p=>p.id===el.dataset.preset));
  if(el.dataset.saved){const p=state.saved.find(p=>p.id===el.dataset.saved);if(p)applyPreset(p,true);}
  if(el.dataset.remove){state.saved=state.saved.filter(p=>p.id!==el.dataset.remove);persist('kelen-portfolio-hueform-saved',state.saved);renderSaved();renderCounts();render();notify('已移除收藏');}
  if(el.dataset.export)exportPalette(el.dataset.export);
  if(el.classList.contains('close-dialog'))el.closest('dialog').close();
});
$('#hex-input').addEventListener('input',e=>{if(/^#?[\da-f]{6}$/i.test(e.target.value))setBase(e.target.value);});
$('#hex-input').addEventListener('keydown',e=>{if(e.key==='Enter'){if(!setBase(e.target.value)){e.target.setAttribute('aria-invalid','true');$('#hex-error').hidden=false;}e.target.blur();}});
$('#hex-input').addEventListener('change',e=>{if(!setBase(e.target.value)){e.target.setAttribute('aria-invalid','true');$('#hex-error').hidden=false;}});
$('#native-color').addEventListener('input',e=>setBase(e.target.value,{record:false}));$('#native-color').addEventListener('click',remember);
['hue','saturation','lightness'].forEach((id,i)=>{const el=$('#'+id);el.addEventListener('pointerdown',remember);el.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))remember();});el.addEventListener('input',e=>setHsl(i,Number(e.target.value),false));});
$('#hue-number').addEventListener('change',e=>{const value=e.target.valueAsNumber;if(Number.isFinite(value))setHsl(0,value);else e.target.value=Math.round(state.hsl[0]);});
$('#color-format').addEventListener('change',e=>{state.format=e.target.value;render();});
$('#contrast-foreground').addEventListener('change',e=>{state.foreground=e.target.value;renderContrast();});$('#contrast-background').addEventListener('change',e=>{state.background=e.target.value;renderContrast();});
$('#swap-contrast').addEventListener('click',()=>{[state.foreground,state.background]=[state.background,state.foreground];renderContrast();});
$('#copy-base').addEventListener('click',()=>copy(state.base,'已复制主色 '+state.base));$('#copy-all').addEventListener('click',()=>copy(palette.map(p=>formatted(p.hex)).join(', '),'整组配色已复制'));
$('#random-button').addEventListener('click',randomColor);$('#save-button').addEventListener('click',savePalette);$('#export-button').addEventListener('click',()=>$('#export-dialog').showModal());
$('#saved-export').addEventListener('click',()=>{download(JSON.stringify({app:'Hueform',version:1,palettes:state.saved},null,2),'application/json','色序_我的收藏.json');notify('收藏备份已生成，正在下载');});
$('#undo-button').addEventListener('click',()=>{const previous=state.history.pop();if(!previous)return;Object.assign(state,previous);state.hsl=hexToHsl(state.base);state.background=state.base;render();recentCommit();});
['help-button','principles-button'].forEach(id=>$('#'+id).addEventListener('click',()=>$('#help-dialog').showModal()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}));
$('#eyedropper-button').addEventListener('click',async()=>{
  if(!('EyeDropper' in window)){notify('当前浏览器不支持屏幕取色，已打开系统选色器');$('#native-color').click();return;}
  try{const result=await new EyeDropper().open();setBase(result.sRGBHex);notify('已采集屏幕颜色');}catch(error){if(error.name!=='AbortError')notify('取色未完成，可使用系统选色器');}
});
let dragging=false;
const wheel=$('#wheel-control');
function wheelSelect(e){const rect=wheel.getBoundingClientRect(),dx=e.clientX-rect.left-rect.width/2,dy=e.clientY-rect.top-rect.height/2;state.hsl[0]=wrap(Math.atan2(dy,dx)*180/Math.PI+90);state.hsl[1]=clamp(Math.hypot(dx,dy)/(rect.width*.48)*100,0,100);cancelAnimationFrame(renderFrame);renderFrame=requestAnimationFrame(()=>setBase(hslToHex(...state.hsl),{record:false,keepHsl:true}));}
wheel.addEventListener('pointerdown',e=>{remember();dragging=true;wheel.setPointerCapture(e.pointerId);wheelSelect(e);});wheel.addEventListener('pointermove',e=>{if(dragging)wheelSelect(e);});wheel.addEventListener('pointerup',()=>{dragging=false;});wheel.addEventListener('pointercancel',()=>{dragging=false;});
wheel.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'].includes(e.key)){e.preventDefault();setHsl(0,state.hsl[0]+(['ArrowLeft','ArrowDown'].includes(e.key)?-1:1)*(e.shiftKey?10:1));}});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(e.target.tagName)&&!$('dialog[open]')&&e.target!==wheel){e.preventDefault();randomColor();}});
window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
render();renderPresets();navigate(location.hash.slice(1)||'studio');
