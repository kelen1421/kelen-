(() => {
  const host=document.querySelector('#project-index');
  if(!host)return;
  const groups={all:'全部',desktop:'桌面工具',web:'网页项目',lab:'实验项目'};
  const projects=[
    {id:'voice',code:'VOX',name:'克隆音',group:'desktop',platform:'MAC / APPLE SILICON',status:'本地应用',version:'1.3.1',featured:true,
      intro:'从一段参考人声出发，生成新台词，再把语气、停顿与讲述节奏慢慢调到合适。',
      steps:['参考人声','台词与发音','试听与导出'],tags:['音色克隆','音素校对','A / B 试听'],
      features:['导入参考录音，识别并校对文字，生成新的中文台词。','调整情绪、语速、停顿与讲述感；比较初始版与调整版。','导出 MP3、WAV 和逐字参数，管理本地音色与最近记录。'],
      note:'在本机运行，依赖已配置的 Python、Qwen3-TTS、Whisper 与 FFmpeg 环境；当前应用包不是跨机器独立安装包。'},
    {id:'avatar',code:'HUM',name:'数字人口播实验',group:'lab',platform:'APPLE SILICON / MPS + MLX',status:'适配实验',featured:true,
      intro:'让人物图片、声音与动作模板在同一条生成链里相遇，探索本机数字人口播。',
      steps:['人物与音频','动作条件','口播视频'],tags:['EchoMimicV2 适配','MPS / MLX','中文口播'],
      features:['基于 EchoMimicV2 官方模型，完成 Apple Silicon 的推理兼容与独立本地界面。','组合人物图片、口播音频与官方动作模板，生成 768 像素视频。','保留生成参数、帧预览与日志，继续研究中文发音和动作稳定性。'],
      note:'已完成短句视频生成。中文嘴型精度与长片段稳定性仍在研究，当前未接入独立嘴部修复、视频姿态提取或 3D 模型导入。'},
    {id:'translate',code:'TRN',name:'全局翻译',group:'desktop',platform:'MAC / APPLE SILICON',status:'本地应用',version:'1.0.7',
      intro:'框选屏幕中的一小块，让译文跟着文字变化，直接覆盖到原来的位置。',
      steps:['框选屏幕','识字与翻译','原位覆盖'],tags:['屏幕 OCR','透明覆盖','语言包'],
      features:['框选、移动或缩放识别区域，持续检查文字变化。','译文透明背景、描边可调，覆盖层允许鼠标穿透。','支持所选文字、剪贴板翻译，以及暂停与继续快捷键。'],
      note:'首次使用需要屏幕录制权限和对应语言包。实时更新速度受选区大小、识字与翻译耗时影响。'},
    {id:'studio',code:'SET',name:'口播虚拟直播间',group:'desktop',platform:'MAC / APPLE SILICON',status:'本地应用',version:'1.9.4',
      intro:'把已经录好的口播人物放进三维房间，配好面光、边缘与景深，再导出预览。',
      steps:['导入与抠像','房间与面光','5 秒预览'],tags:['人物抠像','灯光匹配','横竖画幅'],
      features:['导入 MOV、MP4，自动人物抠像并调整构图。','处理发丝边缘、安全区跟踪、桌面倒影与肤色冷暖。','选择三套灯光和横竖画幅，离线生成 5 秒 MP4 预览。'],
      note:'用于已录视频的离线合成。内置布景可直接使用；重新渲染自定义房间灯光需要本机 Blender。'},
    {id:'hub',code:'HUB',name:'KELEN 工作台',group:'desktop',platform:'MAC / NATIVE',status:'本地应用',version:'1.1',
      intro:'给散落的个人应用、插件与技能一个入口，按正在做的事情找到合适的工具。',
      steps:['资源目录','工具与技能','打开使用'],tags:['应用入口','技能目录','工作流'],
      features:['集中浏览本机应用、插件配套工具与技能说明。','动态扫描个人程序文件夹，查看应用是否可用。','从工作台打开应用，按创作流程组织常用入口。'],
      note:'依赖本机应用与技能目录；目录内容随本机资源变化。'},
    {id:'mobile',code:'MOB',name:'Codex 随行',group:'lab',platform:'LOCAL BRIDGE / MOBILE WEB',status:'本地原型',
      intro:'电脑继续执行项目，手机接着看对话、写草稿和回复，把工作带到另一块屏幕。',
      steps:['电脑桥接','手机配对','续接对话'],tags:['手机界面','同一对话','实时回复'],
      features:['扫码配对，搜索本机对话、按项目筛选并查看历史。','通过电脑上的 Codex 接回原对话，发送文本、接收实时回复。','处理支持的审批与提问，保留草稿并支持撤销设备配对。'],
      note:'需要电脑保持运行并配置本地桥接服务。手机真机、网络切换和远程模式仍需按实际环境验收。'},
    {id:'pagepick',code:'PICK',name:'拾页 PagePick',group:'web',platform:'WEB / CONTENT TOOL',status:'受限访问',
      intro:'把公开网页里的正文、媒体和字幕拾起来，整理成可预览、复制与导出的资料。',
      steps:['链接或源码','内容识别','预览与导出'],tags:['HTML 导入','正文与媒体','多格式导出'],
      features:['输入公开链接自动提取；支持辅助加载与整页 HTML 源码导入。','预览正文、视频、音频和字幕，复制内容或下载可用资源。','导出 TXT、Markdown、JSON 与资源链接，保留本机历史。'],
      note:'项目当前为受限访问。登录、验证码、地区限制与 DRM 会影响提取；当前不进行语音转写。'},
    {id:'yuky',code:'FOL',name:'Yuky 作品集网站',group:'web',platform:'WEB / RESPONSIVE PORTFOLIO',status:'在线项目',url:'https://kelen1421.github.io/uk/',source:'https://github.com/kelen1421/uk',
      intro:'为设计作品建立有层次的展示空间，让分类、搜索、详情与立体预览连成一体。',
      steps:['分类浏览','作品详情','三维预览'],tags:['作品管理','响应式布局','Three.js'],
      features:['七类作品、侧栏导航、搜索、作品详情和合作入口。','本地上传封面、编辑作品、导入与导出备份。','部分概念作品支持旋转、缩放、换色与线框预览。'],
      note:'这是网站开发项目。站内示例明确标为概念作品；管理内容保存在当前浏览器，不是共享后台。'},
    {id:'atelier',code:'ANI',name:'小知未动画工作台',group:'web',platform:'WEB / ANIMATION EDITOR',status:'受限访问',
      intro:'从分镜到时间轴，把光点、颜色和故事变成可以逐帧调整的动画。',
      steps:['编辑分镜','时间轴预览','导出工程'],tags:['逐帧预览','分镜编辑','工程导出'],
      features:['添加、复制和删除分镜，调整时长、光点、颜色与缓动。','播放、暂停、拖动、逐帧和速度控制，显示画面安全框。','导出 PNG、无声 WebM、时间轴与动画工程 ZIP。'],
      note:'当前为受限访问项目。动画编辑与工程导出可独立使用；共享分镜功能按原有访问权限开放。'},
    {id:'physics',code:'PHY',name:'物理模型',group:'web',platform:'WEB / 3D',status:'在线体验',hall:0,
      intro:'旋转一滴悬浮液体，改变材质和刚体尺寸，观察碰撞与流体的响应。',steps:['选择材质','调整刚体','观察响应'],tags:['液滴与刚体','三维交互'],features:['切换液体，调整密度、黏度、表面张力和刚体尺寸。','鼠标操作刚体，旋转或缩放镜头。'],note:'模型用于定性探索与观察。网页版入口位于下方交互展示厅。'},
    {id:'capture',code:'CAP',name:'截图助手',group:'desktop',platform:'MAC / APPLE SILICON',status:'可下载',hall:1,
      intro:'截图、录屏和滚动长截图，都从一个悬浮球开始，把屏幕上的灵感留下来。',steps:['选择区域','截图或录屏','保存与拖出'],tags:['滚动长截图','区域录屏'],features:['通过悬浮球选择截图、录屏或长截图。','内容保存到本机，从暂存区直接拖出。'],note:'下载与安装说明位于交互展示厅。'},
    {id:'recorder',code:'REC',name:'口播工具箱',group:'desktop',platform:'MAC / APPLE SILICON',status:'可下载',hall:2,
      intro:'摄像头预览、自动滚动提词与录制，让准备好的故事说得更从容。',steps:['准备文稿','预览与提词','录制导出'],tags:['浮窗提词','摄像头录制'],features:['粘贴口播稿，调整字号与滚动速度。','选择摄像头和麦克风，录制并保存 MOV。'],note:'提词文字不会进入视频；下载入口位于交互展示厅。'},
    {id:'progress',code:'AI',name:'ai 工作台',group:'desktop',platform:'MAC / APPLE + INTEL',status:'可下载',hall:3,
      intro:'在其他应用里工作，也能从浮窗看见 Codex 任务进度，随时回到当前对话。',steps:['读取任务','浮窗看进度','回到对话'],tags:['任务浮窗','进度与续聊'],features:['以方框、列表或圆球显示本机任务的处理阶段。','固定任务，切换个性化外观，从浮窗打开对应对话。'],note:'进度表示任务阶段，不预测精确剩余时间；下载入口位于交互展示厅。'}
  ];
  const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  function diagram(id){
    const forms={
      voice:'<path d="M34 79V101m10-34v46m10-57v68m10-54v40m10-29v18M112 90h41m-9-7 9 7-9 7"/><rect x="174" y="42" width="140" height="97" rx="5"/><path d="M190 61h69m-69 59h105M194 89v13m10-23v32m10-48v56m10-36v23m10-17v12m10-30v47m10-35v27m10-49v69m10-37v14m10-23v30"/><circle cx="289" cy="59" r="4" class="pl-fill"/>',
      avatar:'<rect x="32" y="38" width="87" height="104" rx="4"/><circle cx="75" cy="70" r="16"/><path d="M49 126v-12c0-27 51-27 51 0v12M138 71v36m9-47v58m9-37v20m16-11h30m-7-7 7 7-7 7"/><rect x="223" y="31" width="97" height="117" rx="5"/><circle cx="272" cy="66" r="15"/><path d="m272 82-1 28m-1-16-23 13m25-13 23 13m-25 4-17 23m19-23 19 23"/><g class="pl-fill"><circle cx="271" cy="95" r="3"/><circle cx="247" cy="107" r="3"/><circle cx="295" cy="107" r="3"/></g>',
      translate:'<rect x="38" y="38" width="274" height="108" rx="4"/><path d="M38 56h274m-252 21h79m-79 12h61m-61 12h73M169 69h123v60H169zM181 84h82m-82 12h98m-98 12h65"/><path d="M160 79h-8V65h19m122 0h8v14m0 44v13h-18" class="pl-accent"/>',
      studio:'<path d="m40 48 99-25h159l22 25v102H40zm99-25v127M41 124h279"/><rect x="178" y="49" width="99" height="53"/><path d="m178 95 28-27 23 18 30-22 18 29"/><circle cx="135" cy="76" r="16"/><path d="M107 127v-19c0-24 55-24 55 0v19M81 130h184m-170 0v21m157-21v21"/><path d="M71 47v17m-8-9h17M284 115v12m-6-6h12" class="pl-accent"/>',
      hub:'<rect x="36" y="34" width="278" height="117" rx="4"/><path d="M36 55h278m-207 0v96M51 76h39m-39 17h31m-31 17h37"/><rect x="126" y="75" width="67" height="53"/><rect x="213" y="75" width="79" height="53"/><path d="M140 91h37m-37 15h24m63-15h51m-51 15h31"/><circle cx="287" cy="44" r="3" class="pl-fill"/>',
      mobile:'<rect x="30" y="37" width="148" height="100" rx="4"/><path d="M91 137v13m-22 0h58m-83-90h102m-102 14h77m-77 14h91"/><rect x="239" y="23" width="72" height="136" rx="10"/><path d="M261 35h28m-37 25h44m-44 14h35m-35 14h40m-27 55h15M187 90h39m-8-7 8 7-8 7"/>',
      pagepick:'<rect x="29" y="35" width="115" height="113" rx="4"/><path d="M44 54h85m-85 17h63m-63 12h75m-75 12h55m-55 12h69M157 90h35m-8-7 8 7-8 7"/><rect x="213" y="35" width="107" height="31"/><rect x="213" y="76" width="107" height="31"/><rect x="213" y="117" width="107" height="31"/><path d="m224 45 10 6-10 6zm0 41h13m-13 11h7m-7 29h72m-72 10h54"/>',
      yuky:'<rect x="28" y="33" width="294" height="119" rx="4"/><path d="M28 52h294m-236 0v100M41 70h30m-30 14h24m-24 14h29"/><rect x="104" y="68" width="94" height="65"/><path d="m112 121 25-31 22 17 19-20 12 34"/><rect x="213" y="68" width="90" height="27"/><path d="M213 109h83m-83 13h59"/>',
      atelier:'<rect x="30" y="30" width="291" height="123" rx="4"/><path d="M30 121h291M47 135h33m10 0h46m10 0h66m10 0h48m-123-15V40"/><circle cx="174" cy="77" r="22"/><path d="M141 76c17-28 51-28 68 0m-68 0c17 28 51 28 68 0"/><circle cx="229" cy="56" r="4" class="pl-fill"/>',
      physics:'<circle cx="138" cy="88" r="54"/><ellipse cx="138" cy="88" rx="54" ry="19"/><ellipse cx="138" cy="88" rx="22" ry="54"/><path d="m229 57 41-20 36 22-41 22-36-24zm0 0v49l36 24V81m41-22v47l-41 24M40 151h283"/>',
      capture:'<rect x="42" y="37" width="268" height="113" rx="4"/><path d="M42 55h268M86 78V65h17m148 0h17v13m0 48v12h-17m-148 0H86v-12M111 88h121m-121 17h93m-93 16h117"/><path d="m254 112 6 37 9-11 13 8 5-7-14-8 10-6z" class="pl-accent"/>',
      recorder:'<rect x="34" y="41" width="154" height="103" rx="4"/><circle cx="111" cy="75" r="17"/><path d="M81 128v-12c0-29 60-29 60 0v12"/><rect x="212" y="30" width="103" height="123"/><path d="M226 52h74m-74 17h57m-57 17h74m-74 17h57m-57 17h74m-74 17h48"/>',
      progress:'<rect x="38" y="34" width="123" height="53" rx="4"/><rect x="184" y="34" width="123" height="53" rx="4"/><rect x="38" y="106" width="123" height="53" rx="4"/><rect x="184" y="106" width="123" height="53" rx="4"/><path d="M51 51h68m-68 18h94m52-18h76m-76 18h63M51 123h51m-51 18h70m76-18h66m-66 18h94"/>'
    };
    return '<svg viewBox="0 0 350 185" fill="none" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'+forms[id]+'</g></svg>';
  }
  const header=e('div','pl-header');
  const heading=e('div');heading.append(e('p','pl-kicker','DEVELOPMENT COLLECTION / 开发项目'),e('h3','','把想法做出来。'));
  heading.querySelector('h3').id='project-library-title';
  const meta=e('p','pl-meta','13 PROJECTS · 更新于 2026.10.21');header.append(heading,meta);
  const toolbar=e('div','pl-toolbar'),filters=e('div','pl-filters');filters.setAttribute('role','group');filters.setAttribute('aria-label','按项目类型筛选');
  Object.entries(groups).forEach(([key,name])=>{const button=e('button','',name+' '+String(key==='all'?projects.length:projects.filter(p=>p.group===key).length).padStart(2,'0'));button.type='button';button.dataset.filter=key;button.setAttribute('aria-pressed',String(key==='all'));filters.append(button);});
  const searchLabel=e('label','pl-search');searchLabel.append(e('span','','搜索项目'));const input=e('input');input.type='search';input.placeholder='名称 / 功能';input.autocomplete='off';searchLabel.append(input);toolbar.append(filters,searchLabel);
  const grid=e('div','pl-grid'),status=e('p','pl-result');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const cards=projects.map((p,index)=>{
    const card=e('article','pl-card'+(p.featured?' pl-featured':''));card.dataset.group=p.group;
    const top=e('div','pl-card-top');top.append(e('span','',String(index+1).padStart(2,'0')+' / '+p.code),e('span','pl-status',p.status));
    const visual=e('div','pl-visual');visual.innerHTML=diagram(p.id);
    const copy=e('div','pl-copy'),title=e('h4','',p.name);title.id='project-'+p.id;card.setAttribute('aria-labelledby',title.id);
    copy.append(e('p','pl-platform',p.platform),title,e('p','pl-description',p.intro));
    const flow=e('ol','pl-flow');p.steps.forEach((step,i)=>{const li=e('li');li.append(e('small','',String(i+1).padStart(2,'0')),e('span','',step));flow.append(li);});copy.append(flow);
    const tags=e('div','pl-tags');p.tags.forEach(tag=>tags.append(e('span','',tag)));copy.append(tags);
    const details=e('details','pl-details'),summary=e('summary');summary.append(e('span','','功能与当前状态'),e('span','pl-plus','＋'));details.append(summary);
    const body=e('div','pl-detail-body'),list=e('ul');p.features.forEach(feature=>list.append(e('li','',feature)));body.append(list,e('p','pl-note',p.note));if(p.version)body.append(e('small','pl-version','VERSION '+p.version));details.append(body);
    const actions=e('div','pl-actions');
    if(p.url){const link=e('a','pl-action','打开网站 ↗');link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);if(p.source){const source=e('a','pl-source','源码 ↗');source.href=p.source;source.target='_blank';source.rel='noopener noreferrer';actions.append(source);}}
    else if(p.hall!==undefined){const button=e('button','pl-action','在展示厅打开 ↗');button.type='button';button.addEventListener('click',()=>document.querySelector('.program-archive')?.dispatchEvent(new CustomEvent('kelen-program-open',{detail:{index:p.hall}})));actions.append(button);}
    else actions.append(e('span','pl-access',p.status==='受限访问'?'项目展示 / 访问受限':p.group==='lab'?'研究记录 / 本地运行':'项目展示 / 本地应用'));
    card.append(top,visual,copy,details,actions);grid.append(card);return card;
  });
  const empty=e('p','pl-empty','没有找到对应项目，试试其他名称或功能。');empty.hidden=true;
  const more=e('button','pl-more','展开全部 13 个项目 ↓');more.type='button';more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls','project-library-grid');grid.id='project-library-grid';
  host.append(header,toolbar,status,grid,empty,more);
  let filter='all',expanded=false;
  function render(){
    const query=input.value.trim().toLocaleLowerCase();let total=0,shown=0;
    cards.forEach((card,i)=>{const p=projects[i],matches=(filter==='all'||p.group===filter)&&[p.name,p.intro,...p.tags,...p.features].join(' ').toLocaleLowerCase().includes(query);if(matches)total++;const visible=matches&&(expanded||filter!=='all'||query||shown<6);card.hidden=!visible;if(visible)shown++;});
    status.textContent='显示 '+String(shown).padStart(2,'0')+' / '+String(total).padStart(2,'0')+' 个项目';empty.hidden=total>0;
    more.hidden=filter!=='all'||Boolean(query)||total<=6;more.textContent=expanded?'收起项目 ↑':'展开全部 '+total+' 个项目 ↓';more.setAttribute('aria-expanded',String(expanded));
    filters.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));
  }
  filters.addEventListener('click',event=>{const button=event.target.closest('button[data-filter]');if(!button)return;filter=button.dataset.filter;render();});input.addEventListener('input',render);
  more.addEventListener('click',()=>{expanded=!expanded;render();if(!expanded)host.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  render();
})();
