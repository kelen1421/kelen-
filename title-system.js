/* One typography family; the compact variants keep navigation and short headings legible. */
(() => {
  'use strict';
  function title(selector, spec) {
    const el=document.querySelector(selector);
    if(!el)return;
    el.classList.add('archive-type',`archive-type--${spec.variant||'standard'}`);
    if(spec.variant==='home')el.classList.add('archive-type--latin');
    el.setAttribute('aria-label',spec.label);
    const first=document.createElement('span');first.className='type-first';first.append(spec.first);
    if(spec.particle){const particle=document.createElement('span');particle.className='type-particle';particle.textContent=spec.particle;first.append(particle);}
    if(spec.firstOutline){const outline=document.createElement('span');outline.className='type-outline';outline.textContent=spec.firstOutline;first.append(outline);}
    el.replaceChildren(first);
    if(spec.second||spec.outline){const second=document.createElement('span');second.className='type-second';second.append(spec.second||'');if(spec.outline){const outline=document.createElement('span');outline.className='type-outline';outline.textContent=spec.outline;second.append(outline);}el.append(second);}
    const caption=document.createElement('span');caption.className='type-caption';caption.setAttribute('aria-hidden','true');
    const words=document.createElement('span');words.textContent=spec.caption;
    const arrow=document.createElement('i');arrow.textContent='↗';caption.append(words,arrow);el.append(caption);
  }
  title('.scene-intro h1',{first:'KEL',firstOutline:'EN',label:'KELEN 谢凯伦的个人档案',caption:'谢凯伦 / PERSONAL ARCHIVE',variant:'home'});
  title('.profile-unfold-copy h3',{first:'从思考',particle:'到',second:'认识',outline:'彼此',label:'从思考，到认识彼此',caption:'PROFILE / OPEN FILE',variant:'intro'});
  title('.profile-copy h2',{first:'谢凯伦',particle:'也可以叫我',outline:'kelen',label:'谢凯伦，也可以叫我 kelen',caption:'PROFILE / WHO I AM',variant:'identity'});
  title('.archive-brand h2',{first:'兴趣',firstOutline:'档案',label:'兴趣档案',caption:'INTEREST ARCHIVE',variant:'compact'});
  title('#programs-title',{first:'个人',second:'程序',outline:'档案',label:'个人程序档案',caption:'PERSONAL TOOL ARCHIVE'});
  title('#resume-title',{first:'履',firstOutline:'历',label:'履历',caption:'EDITORIAL EXPERIENCE',variant:'short'});
  title('.resume-role h3',{first:'科普',particle:'内容的',second:'后期',outline:'制作',label:'科普内容的后期制作',caption:'SCIENCE / POST PRODUCTION',variant:'role'});
  title('.resume-process-heading h3',{first:'从读稿',particle:'到',firstOutline:'成片',label:'从读稿，到成片',caption:'WORKFLOW / FIVE STAGES',variant:'process'});
  title('.notes-layout h2',{first:'性格',particle:'难以定义',second:'与',outline:'计划',label:'难以定义的性格，和擅长的计划',caption:'PERSONALITY / PLANNING'});
  title('.contact-main h2',{first:'新东西',particle:'我想',second:'亲自',outline:'试试',label:'新东西，我想亲自试试',caption:'ALWAYS CURIOUS / KEEP EXPLORING',variant:'life'});
})();
