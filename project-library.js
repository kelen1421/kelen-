(() => {
  const host=document.querySelector('#project-index');
  const archive=document.querySelector('.program-archive');
  if(!host||!archive)return;
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
  const ordered=[...projects.filter(p=>p.hall!==undefined).sort((a,b)=>a.hall-b.hall),...projects.filter(p=>p.hall===undefined)];
  window.KelenProgramProjects=ordered;
  const grid=archive.querySelector('.program-grid'),original=[...grid.children];
  ordered.forEach((p,index)=>{
    let card=original[index];
    if(index>=original.length){
      card=e('article','program-card');
      const top=e('div','program-card-top');top.append(e('span','','PROJECT / '+String(index+1).padStart(3,'0')),e('span','program-platform',p.platform));
      const art=e('div','program-art');art.setAttribute('aria-hidden','true');
      const copy=e('div','program-copy');copy.append(e('h3','',p.name),e('p','',p.intro));
      const tags=e('div','program-tags');p.tags.forEach(tag=>tags.append(e('span','',tag)));copy.append(tags);
      const actions=e('div','program-actions');const action=e(p.url?'a':'button','program-primary',p.url?'打开网站 ↗':'查看功能与状态 ↗');
      if(p.url){action.href=p.url;action.target='_blank';action.rel='noopener noreferrer';}else action.type='button';
      actions.append(action,e('span','program-version',p.version?'V '+p.version:p.status));
      const help=e('details','program-help'),summary=e('summary','',p.name+' · 功能与状态');help.append(summary);
      p.features.forEach(feature=>help.append(e('p','',feature)));help.append(e('p','',p.note));
      if(!p.url)action.addEventListener('click',()=>{help.open=true;summary.focus();});
      card.append(top,art,copy,actions,help);grid.append(card);
    }
    card.dataset.projectId=p.id;card.dataset.projectCode=p.code;
    p.action=card.querySelector('.program-primary').textContent.trim();
  });
  host.className='hall-catalog';host.setAttribute('aria-label','展示厅项目目录');host.removeAttribute('aria-labelledby');
  archive.querySelector('.plugin-vault-top').after(host);
  const toolbar=e('div','hall-catalog-tools'),filters=e('div','hall-catalog-filters');filters.setAttribute('role','group');filters.setAttribute('aria-label','筛选展示厅项目');
  Object.entries(groups).forEach(([key,label])=>{const button=e('button','',label+' '+String(key==='all'?ordered.length:ordered.filter(p=>p.group===key).length).padStart(2,'0'));button.type='button';button.dataset.filter=key;button.setAttribute('aria-pressed',String(key==='all'));filters.append(button);});
  const label=e('label','hall-catalog-search','搜索项目'),input=e('input');input.type='search';input.placeholder='名称 / 功能';label.append(input);toolbar.append(filters,label);
  const chips=e('div','hall-catalog-list');chips.setAttribute('role','group');chips.setAttribute('aria-label','选择展示厅项目');
  const buttons=ordered.map((p,index)=>{const button=e('button','hall-catalog-item');button.type='button';button.append(e('small','',String(index+1).padStart(2,'0')+' / '+p.code),e('span','',p.name));button.setAttribute('aria-pressed','false');button.dataset.project=index;button.addEventListener('click',()=>archive.dispatchEvent(new CustomEvent('kelen-program-open',{detail:{index}})));chips.append(button);return button;});
  const result=e('p','hall-catalog-result');result.setAttribute('role','status');result.setAttribute('aria-live','polite');
  host.append(toolbar,chips,result);let filter='all',current=4;
  function filterProjects(){
    const query=input.value.trim().toLocaleLowerCase(),indices=[];
    buttons.forEach((button,index)=>{const p=ordered[index],matches=(filter==='all'||p.group===filter)&&[p.name,p.intro,...p.tags].join(' ').toLocaleLowerCase().includes(query);button.hidden=!matches;if(matches)indices.push(index);});
    result.textContent=indices.length?'可选择 '+indices.length+' 个项目 · 每组 4 个立体展台':'没有找到对应项目';
    filters.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));
    archive.dispatchEvent(new CustomEvent('kelen-program-filter',{detail:{indices}}));
    if(indices.length&&!indices.includes(current))archive.dispatchEvent(new CustomEvent('kelen-program-select',{detail:{index:indices[0]}}));
  }
  filters.addEventListener('click',event=>{const button=event.target.closest('button[data-filter]');if(button){filter=button.dataset.filter;filterProjects();}});input.addEventListener('input',filterProjects);
  window.KelenProgramCatalog={select(index){current=index;buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));},projects:ordered};
  const stamp=document.querySelector('.programs-stamp');stamp.setAttribute('aria-label',ordered.length+' 个程序与项目');stamp.querySelector('b').textContent=ordered.length;
  document.querySelector('.programs-footer>span').textContent=ordered.length+' PROJECTS / MADE BY KELEN';
  archive.querySelector('.plugin-vault-top>span').textContent="KELEN'S LAB / "+ordered.length+' PROJECTS';
  filterProjects();
})();
