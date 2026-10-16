/* The diagrams describe supplied facts and ideas; they do not imply measured scores. */
(() => {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg = (body, viewBox = '0 0 360 160') => `<svg viewBox="${viewBox}" fill="none" aria-hidden="true">${body}</svg>`;
  const text = (x,y,label,extra='') => `<text x="${x}" y="${y}" ${extra}>${label}</text>`;
  const dot = (x,y,r=4) => `<circle class="vc-dot" cx="${x}" cy="${y}" r="${r}"/>`;
  const flow = (labels, caption = '', description = '') => `<span class="vc-flow"${description ? ` role="img" aria-label="${escape(description)}"` : ''}>${labels.map((label,i) => `${i ? '<i aria-hidden="true">→</i>' : ''}<span><small>${String(i+1).padStart(2,'0')}</small><b>${escape(label)}</b></span>`).join('')}</span>${caption ? `<span class="vc-flow-caption">${escape(caption)}</span>` : ''}`;
  const transcript = body => `<details class="vc-transcript"><summary>阅读文字说明 <span aria-hidden="true">＋</span></summary><p>${escape(body)}</p></details>`;

  const profile = document.querySelector('.profile-copy');
  if (profile) {
    const paragraphs = [...profile.querySelectorAll(':scope > p:not(.overline)')];
    const original = paragraphs.map(p => p.textContent).join('');
    const identity = document.createElement('div');
    identity.className = 'profile-identity';
    const informationLabel = profile.querySelector(':scope > .overline');
    informationLabel.classList.add('profile-information-label');
    profile.closest('.profile-layout').prepend(informationLabel);
    identity.append(profile.querySelector(':scope > h2'));
    profile.prepend(identity);
    const facts = document.createElement('div');
    facts.className = 'vc-profile';
    facts.innerHTML = `<ol class="vc-profile-path" aria-label="基本经历"><li><small>BORN / 出生</small><span class="vc-fact-sign">02</span><b>2002 年</b></li><li><small>STUDY / 本科</small><span class="vc-fact-sign">${svg('<path d="M7 30h38M14 28V17l12-9 12 9v11M20 28V18h12v10M10 17h32"/>','0 0 52 40')}</span><b>能源与动力</b></li><li><small>GRADUATED / 毕业</small><span class="vc-fact-sign">${svg('<path d="m3 13 23-10 23 10-23 10ZM12 18v12c10 7 18 7 28 0V18M48 14v17"/>','0 0 52 40')}</span><b>仲恺大学</b></li></ol><figure class="vc-curiosity"><figcaption><small>HOW I EXPLORE</small><b>从好奇出发</b></figcaption>${svg('<path class="vc-soft" d="M18 55C85 15 130 92 191 52S277 15 344 52"/><path d="M43 55H312" stroke-dasharray="2 6"/>'+dot(43,55)+dot(178,55)+dot(312,55)+text(43,34,'原理','text-anchor="middle"')+text(178,83,'跨领域探索','text-anchor="middle"')+text(312,34,'连接','text-anchor="middle"'),'0 0 360 100')}</figure>${transcript(original)}`;
    paragraphs.forEach(p => p.remove());
    profile.querySelector('.data-strip')?.remove();
    profile.append(facts);
  }

  const interestVisuals = [
    {labels:['读懂规则','比较选择','找到解法'], caption:'也享受看懂系统的过程', note:'游戏的乐趣，也在思考里', from:'尝试',to:'理解',
      art:'<path d="M35 80H106L171 33H247M106 80l65 47h76M247 33l61 47M247 127l61-47"/>'+dot(35,80)+dot(106,80)+dot(171,33)+dot(171,127)+dot(308,80,8)+'<path d="m300 80 6 6 11-13"/>'+text(190,24,'策略 A')+text(190,150,'策略 B')},
    {labels:['场景','旋律','情绪'],caption:'听见音乐如何参与叙事',note:'不只玩进去，也听进去',from:'聆听',to:'共鸣',
      art:'<path class="vc-soft" d="M20 47H340M20 80H340M20 113H340"/><path d="M25 80h38l12-19 13 40 15-61 16 78 17-52 13 29 15-15h28l12-39 15 75 16-52 16 16h81"/>'+dot(89,80,3)+dot(220,80,3)},
    {labels:['玩法与规则','关卡与故事','设计表达'],caption:'顺着设计，理解创作者的想法',note:'从体验游戏，到理解做出它的人',from:'体验',to:'表达',
      art:'<path d="M48 37 180 80 48 123M128 23l52 57-52 57M180 80H308"/>'+dot(48,37)+dot(48,123)+dot(128,23)+dot(128,137)+'<circle cx="180" cy="80" r="19"/><path d="m172 80 6 6 12-14"/><path d="M289 57h38v46h-38Z"/>'+text(20,25,'玩法')+text(20,147,'故事')+text(102,16,'关卡')+text(102,156,'音乐')},
    {labels:['设定目标','反复尝试','真正达成'],caption:'我想试试 → 我做到了',note:'喜欢过程，也珍惜达成的瞬间',from:'想完成',to:'做到了',
      art:'<path class="vc-soft" d="M26 137H336"/><path d="M36 127h60V98h61V69h61V40h78"/><path stroke-dasharray="3 6" d="M36 115Q118 142 158 57T291 26"/>'+dot(36,127)+dot(157,69)+dot(296,40,7)+'<path d="M296 40V9l27 7-27 8"/>'},
    {labels:['进入世界','认识人物','跟随故事'],caption:'走进别人笔下的各种人生',note:'看看故事里的人，会怎样选择',from:'阅读',to:'另一个世界',
      art:'<path d="M180 141V43C140 18 93 20 49 36v96c43-15 88-15 131 9Zm0 0V43c40-25 87-23 131-7v96c-43-15-88-15-131 9Z"/><path class="vc-soft" d="M72 53q43-12 84 6M72 72q43-12 84 6M72 91q43-12 84 6M204 59q43-18 84-6"/><path d="m207 113 28-33 20 18 23-31 14 37"/>'+dot(271,62,5)},
    {labels:['想象','落笔','自己的故事'],caption:'把脑海里的世界慢慢写下来',note:'为自己的想象，留下一个位置',from:'想法',to:'文字',
      art:'<path d="M81 15h143l34 34v97H81Z"/><path d="M224 15v34h34M105 65h104M105 84h77M105 103h96M105 122h51"/><path d="m207 121 65-73 14 13-65 73-20 6Z"/><path d="m264 57 14 13"/>'+dot(52,50,3)+dot(301,116,3)},
    {labels:['走出屏幕','沿路登高','亲自经历'],caption:'到真实的山野里，换一个视角',note:'有机会，就去山里走走',from:'出发',to:'亲历',
      art:'<path class="vc-soft" d="M13 132 71 64l36 38 58-83 60 90 38-54 83 77"/><path d="M28 136c57-14 131 16 118-13s-50-23-8-48 18-30 27-56" stroke-dasharray="3 5"/><path d="m148 43 17-24 19 29-20-8Z"/>'+dot(28,136)+dot(165,19,5)+'<circle cx="283" cy="26" r="12"/>'},
    {labels:['观察目标','亲自尝试','保持专注'],caption:'在真实体验里，认识一项活动',note:'把注意力，交给眼前的目标',from:'好奇',to:'专注',
      art:'<circle class="vc-soft" cx="180" cy="80" r="66"/><circle cx="180" cy="80" r="44"/><circle cx="180" cy="80" r="22"/><path d="M79 80h66m70 0h66M180 0v44m0 72v44"/>'+dot(180,80,4)+'<path class="vc-soft" d="m276 22-43 24M84 135l38-21"/>'}
  ];
  function interest(index,tab,record) {
    const data=interestVisuals[index],figure=document.createElement('figure');
    figure.className=`vc-interest vc-interest-${index}`;
    const subtitle=tab==='feeling'?data.note:tab==='focus'?'我会留意的三个部分':data.caption;
    let contents=svg(data.art);
    if(tab==='feeling') contents+=`<div class="vc-feeling"><span>${data.from}</span><i aria-hidden="true">↗</i><b>${data.to}</b></div>`;
    else contents+=`<ol class="vc-interest-labels">${data.labels.map((label,i)=>`<li><small>0${i+1}</small><b>${label}</b>${tab==='focus'?`<span>${escape(record.focus[i])}</span>`:''}</li>`).join('')}</ol>`;
    figure.innerHTML=`${contents}<figcaption>${subtitle}</figcaption>${transcript(tab==='focus'?record.focus.join(' '):record[tab])}`;
    return figure;
  }

  const role=document.querySelector('.resume-role');
  if(role) {
    const paragraphs=[...role.querySelectorAll(':scope > p:not(.overline)')];
    const original=paragraphs.map(p=>p.textContent).join('');
    const diagram=document.createElement('figure');diagram.className='vc-editing';
    diagram.innerHTML=`<div class="vc-editing-top"><span>抽象概念</span><span>剪辑与组织</span><span>视听表达</span></div>${svg('<path d="M25 65h80m49 0h51m49 0h81" stroke-dasharray="3 6"/><circle cx="50" cy="65" r="27"/><path d="M34 65h32M50 49v32M37 52l26 26M63 52 37 78"/><rect x="116" y="35" width="50" height="60"/><path d="M129 48h24m-24 11h24m-24 11h14m-14 11h21"/><rect x="205" y="35" width="50" height="60"/><path d="m212 77 12-17 10 9 11-17M214 44h32"/><path d="M294 45h41v40h-41ZM308 55l14 10-14 10Z"/><path class="vc-soft" d="M50 107v12h264v-22"/>'+dot(314,119),'0 0 360 130')}<div class="vc-editing-labels"><span>理解问题</span><span>梳理结构</span><span>安排画面</span><span>组织声画</span></div><figcaption>让每一步推理，都有能看见、听见的线索</figcaption>${transcript(original)}`;
    paragraphs.forEach(p=>p.remove());role.append(diagram);
  }

  const craftFlows=[
    [['文案','段落','重点'],'每一段，都有明确的解释任务'],
    [['旁白','图示','画面'],'画面参与解释，素材来源可追溯'],
    [['推理','停顿','理解'],'在需要消化的地方，留一点空间'],
    [['旁白','音乐','音效'],'平衡音量，让声音服务于内容'],
    [['术语','数字','署名'],'逐项核对，减少表达歧义'],
    [['反馈','修改','交付'],'保留清晰版本，整理工程与素材']
  ];
  document.querySelectorAll('.resume-craft details > p').forEach((p,i)=>{
    const original=p.textContent;
    p.classList.add('vc-craft-copy');
    p.innerHTML=flow(craftFlows[i][0],craftFlows[i][1],original);
  });
  const journeyFlows=[['核心问句','概念顺序','结构'],['旁白','画面任务','素材'],['解释路径','段落衔接','节奏'],['旁白','声画对齐','校对'],['反馈','版本确认','成片']];
  const journeyChecks=['段落删去，逻辑还成立吗？','画面在解释内容吗？','这一段解决什么问题？','旁白清晰，字幕无歧义','版本清楚，素材可追溯'];
  function journey(index,step){
    const p=document.querySelector('#cv-journey-description');
    if(p)p.innerHTML=flow(journeyFlows[index],'',step.text);
    const check=document.querySelector('#cv-journey-check');
    if(check)check.innerHTML=`<span class="vc-checkmark" aria-hidden="true">✓</span>${journeyChecks[index]}`;
  }

  const notes=document.querySelector('.note-list');
  if(notes){
    const diagrams=[
      [svg('<ellipse class="vc-soft" cx="180" cy="80" rx="119" ry="49"/><path d="M180 80 75 44M180 80l101-45M180 80l21 57" stroke-dasharray="3 5"/><circle cx="180" cy="80" r="24"/>'+text(180,85,'我','text-anchor="middle"')+dot(75,44)+dot(281,35)+dot(201,137)+text(40,27,'不同感受')+text(263,19,'相处')+text(215,145,'经历')),'TRAIT / 01','不急着被定义','不同的视角，慢慢认识同一个我'],
      [svg('<path d="M28 45h107m18 0h118M135 45v70h105l38-70M278 45h49"/><rect x="114" y="23" width="40" height="44"/><path d="m124 45 7 7 13-17"/>'+dot(28,45)+dot(278,45)+dot(327,45)+text(18,25,'目标')+text(205,29,'行动')+text(152,103,'突发变化')+text(245,137,'调整')+'<path d="m266 47 12-2-3 12"/>'),'STRENGTH / 02','计划，也为变化留位置','先拆解目标，再把不同可能考虑进来'],
      [svg('<path d="M40 30q87 0 138 48M40 80h138M40 132q87 0 138-54M178 78q69-52 140-38M178 78h140M178 78q69 53 140 39"/><circle cx="178" cy="78" r="16"/>'+dot(40,30)+dot(40,80)+dot(40,132)+dot(318,40)+dot(318,78)+dot(318,117)+text(65,22,'不同领域')+text(235,151,'多种思路')),'PRINCIPLE / 03','让知识彼此连接','知识面杂一点，遇到问题就多几种解法']
    ];
    notes.innerHTML=diagrams.map(([art,code,title,caption])=>`<figure class="vc-mind"><div class="vc-mind-art">${art}</div><figcaption><small>${code}</small><h3>${title}</h3><p>${caption}</p></figcaption></figure>`).join('')+'<p class="note-foot">PLAN FOR THE UNEXPECTED — STAY OPEN TO CHANGE.</p>';
  }
  const contact=document.querySelector('.contact-main');
  if(contact){
    const figure=document.createElement('figure');figure.className='vc-life';
    figure.innerHTML=`<figcaption><small>TRY SOMETHING NEW</small><span>好奇，是下一段经历的起点</span></figcaption>${svg('<path class="vc-soft" d="M-20 121 50 65l40 29 49-70 55 86 34-43 52 55 43-63 55 63"/><path class="vc-soft" d="M-15 142Q81 89 180 140T374 127"/><path d="M30 124C93 158 89 73 157 79S229 18 294 44" stroke-dasharray="3 6"/>'+dot(30,124)+dot(115,100)+dot(208,64)+dot(294,44,6)+text(8,153,'好奇')+text(92,83,'尝试')+text(182,43,'经历')+text(278,25,'故事')+'<circle cx="323" cy="20" r="11"/>','0 0 360 170')}<div class="vc-life-fields"><span>山野</span><span>动漫与小说</span><span>没试过的新事物</span></div>`;
    contact.insertBefore(figure,contact.querySelector('.contact-button'));
  }
  window.KelenVisuals={interest,journey};
})();
