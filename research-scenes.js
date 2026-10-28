/* Topic-specific vector plates. Geometry illustrates a question, not measured data. */
(() => {
  'use strict';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text=(x,y,s,sub=false)=>`<text x="${x}" y="${y}" class="${sub?'rs-sub':'rs-label'}">${esc(s)}</text>`;
  const circle=(x,y,r,cls='')=>`<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;
  const path=(d,cls='')=>`<path d="${d}" class="${cls}"/>`;
  const arrow=(x,y,xx,yy,cls='')=>{const a=Math.atan2(yy-y,xx-x),s=9;return path(`M${x} ${y}L${xx} ${yy}M${xx-s*Math.cos(a-.52)} ${yy-s*Math.sin(a-.52)}L${xx} ${yy}L${xx-s*Math.cos(a+.52)} ${yy-s*Math.sin(a+.52)}`,cls);};
  const dot=(x,y,r=5,cls='rs-dot')=>circle(x,y,r,cls);
  const particles=(x,y,n=5,spread=30,cls='rs-dot')=>Array.from({length:n},(_,i)=>dot(x+Math.cos(i*2.399)*spread*Math.sqrt((i+1)/n),y+Math.sin(i*2.399)*spread*Math.sqrt((i+1)/n),4,cls)).join('');
  const vesicle=(x,y,r,nested=false)=>circle(x,y,r,'rs-wash')+circle(x,y,r-7,'rs-fine')+(nested?circle(x-4,y+4,r*.48,'rs-paper')+particles(x-4,y+4,5,r*.25):particles(x,y,6,r*.5));
  const molecule=(x,y)=>path(`M${x-24} ${y+18}L${x} ${y-20}L${x+30} ${y+12}`)+dot(x-24,y+18)+dot(x,y-20)+dot(x+30,y+12);
  const box=(x,y,w,h,label)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="rs-paper"/>`+text(x+13,y+h*.6,label);
  const craft=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${path('M-20 14V-32L0-60 20-32V14ZM-20-8-36 18h16m40-26 16 26H20M-12 14v24M0 14v34M12 14v24','rs-paper')}${circle(0,-25,8,'rs-wash')}</g>`;
  const person=(x,y,s=1,cls='')=>`<g transform="translate(${x} ${y}) scale(${s})" class="${cls}">${circle(0,0,13,'rs-paper')}${path('M-20 69V38q0-19 20-19t20 19v31M-11 69v31m22-31v31M-20 36-32 62m52-26 12 26')}</g>`;
  const house=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${path('M-40 0 0-34 40 0M-31-6v65h62V-6M-8 59V25H10V59','rs-paper')}${path('M-20 7h10v10h-10Z M14 7h10v10H14Z')}</g>`;
  const labels=(a,b,c)=>text(72,311,a)+text(274,311,b)+text(478,311,c);
  function life(i){switch(i){
    case 0:return particles(95,150,9,45)+arrow(155,155,255,155)+molecule(318,152)+arrow(373,155,456,155)+molecule(505,120)+molecule(529,196)+text(246,78,'形成通量 J')+labels('原料相遇','组合形成','持续产生');
    case 1:return vesicle(112,164,49)+arrow(180,164,260,164)+`<g opacity=".5">${molecule(321,162)}</g>`+arrow(380,164,447,164)+particles(516,164,6,44,'rs-faint-dot')+text(244,80,'不同的损失路径')+labels('结构出现','分解 / 失活','剩余状态');
    case 2:return vesicle(116,162,40)+arrow(175,162,246,162)+vesicle(288,142,29)+vesicle(338,194,29)+arrow(391,162,463,162,'rs-dash')+text(498,186,'?',false)+text(244,77,'积累之后，如何继续？')+labels('差异存留','数量积累','复杂化');
    case 3:return `<ellipse cx="270" cy="151" rx="117" ry="80" class="rs-wash"/><ellipse cx="368" cy="151" rx="117" ry="80" class="rs-wash"/><ellipse cx="320" cy="204" rx="117" ry="80" class="rs-wash"/>`+dot(320,167,8)+text(137,76,'温度范围')+text(412,76,'盐度条件')+text(275,320,'酸碱条件')+text(266,174,'相容窗口',true)+path('M178 91 207 118M447 91 422 118M321 291V250','rs-fine');
    case 4:return Array.from({length:6},(_,k)=>dot(62+k*19,139+k%2*32,6)+path(`M${62+k*19} ${145+k%2*32}v28`)).join('')+arrow(198,165,275,165)+Array.from({length:22},(_,k)=>{const a=k*Math.PI/11;const x=408+Math.cos(a)*78,y=164+Math.sin(a)*78;return dot(x,y,5)+path(`M${x} ${y}L${408+Math.cos(a)*64} ${164+Math.sin(a)*64}`,'rs-fine');}).join('')+particles(408,164,6,35)+text(53,280,'两亲分子')+text(354,280,'封闭边界')+text(329,57,'包入了哪些组分？',true);
    case 5:return vesicle(101,173,32)+vesicle(166,173,27)+arrow(213,173,294,173)+path('M299 173Q336 173 350 105M299 173H350M299 173Q336 173 350 241','rs-dash')+circle(406,100,27)+circle(439,100,27)+vesicle(420,175,43,true)+`<ellipse cx="420" cy="257" rx="48" ry="22" class="rs-fine"/>`+text(475,106,'黏附')+text(475,181,'嵌套')+text(475,263,'其他结果')+text(73,290,'相遇')+text(239,82,'形成路径仍需比较',true);
    case 6:return path('M320 112V251M277 251h86M146 134H494M146 134l-39 72h78ZM494 134l-39 72h78Z')+vesicle(146,171,24)+path('M472 168h44m-36 13h28m-22 12h16')+text(86,283,'保护收益')+text(423,283,'交换与材料成本')+text(253,74,'净存续优势？');
    case 7:return vesicle(326,168,88,true)+particles(108,137,5,28)+arrow(153,144,257,161)+arrow(402,196,492,220)+dot(518,226,5)+molecule(323,166)+text(67,78,'原料进入')+text(273,300,'大分子滞留')+text(452,281,'产物离开')+path('M359 89 422 60','rs-fine')+text(430,63,'选择性边界',true);
    case 8:return vesicle(319,172,87)+molecule(309,174)+arrow(364,154,411,133)+path('M423 129C485 128 491 225 420 232','rs-dash')+arrow(420,232,356,218)+text(57,85,'内部反应')+path('M153 89 266 142','rs-fine')+text(447,105,'膜的响应')+text(218,305,'稳定 / 通透 / 泄漏 / 破裂');
    case 9:return path('M62 199Q120 100 175 180T288 177T402 162T525 179')+Array.from({length:12},(_,k)=>dot(73+k*39,170+Math.sin(k*1.4)*33,5)).join('')+path('M294 83 318 119 342 83Z','rs-wash')+arrow(318,121,318,156,'rs-dash')+circle(318,174,44,'rs-fine')+text(66,278,'RNA 局部结构')+text(264,60,'载体构型')+text(404,278,'结合方式与位点');
    case 10:return text(55,86,'连接未成')+path('M217 78h101m21 0h96')+path('M321 64l14 27M335 64 321 91','rs-fine')+text(55,170,'配对解离')+path('M215 145q105-24 222 0M215 180q105 24 222 0')+arrow(480,157,480,133)+arrow(480,165,480,190)+text(55,260,'主链断裂')+path('M215 252h83m39 0h101M299 241l10 10-9 12m36-22-10 10 11 12')+text(241,315,'三个不同的判定问题',true);
    case 11:return path('M320 49V284','rs-dash')+molecule(180,151)+path('M180 131V90M180 131l-35 47','rs-fine')+dot(180,90,8)+molecule(458,151)+path('M458 131V90M458 131l35 47','rs-fine')+dot(458,90,8)+text(143,256,'构型 A')+text(421,256,'构型 B')+text(275,324,'对照比较',true)+text(250,41,'镜像 / 立体关系',true);
    case 12:return box(53,95,148,69,'RNA 差异')+arrow(212,129,273,129)+molecule(346,130)+arrow(399,129,452,129)+vesicle(508,129,41)+path('M508 191V252H126V179','rs-dash')+arrow(126,179,126,167)+text(276,90,'短肽产物',true)+text(234,285,'反向影响能持续吗？');
    case 13:return vesicle(97,166,39)+arrow(154,166,231,166)+path('M300 114C242 98 239 231 300 214C330 194 340 194 369 214C430 231 426 98 369 114C337 135 332 135 300 114Z','rs-wash')+arrow(427,166,477,166)+vesicle(528,133,27)+vesicle(528,204,27)+text(60,292,'原隔室')+text(280,292,'形变与颈部')+text(481,292,'封闭裂分');
    case 14:return vesicle(121,174,62)+dot(106,154,7,'rs-accent-dot')+dot(145,193,7,'rs-accent-dot')+arrow(196,158,348,111)+arrow(196,189,348,237)+vesicle(420,107,43)+vesicle(420,243,43)+dot(412,105,7,'rs-accent-dot')+text(477,111,'保留关键组分')+text(477,247,'组分可能丢失')+text(64,290,'原有状态');
    case 15:return vesicle(100,170,34)+arrow(147,170,242,170)+vesicle(287,116,29)+vesicle(287,226,29)+arrow(324,116,425,85)+arrow(324,226,425,250)+vesicle(472,86,23)+vesicle(472,250,23)+path('M457 286C271 335 141 309 98 215','rs-dash')+text(185,310,'补给、损失与再次分裂',true)+text(59,76,'第 1 轮')+text(249,54,'第 2 轮')+text(439,39,'后续轮次');
    case 16:return path('M101 82l14-35 14 35-14 35Z','rs-wash')+arrow(151,83,250,124)+vesicle(325,175,77,true)+arrow(148,238,249,209)+particles(113,242,5,26)+arrow(403,175,506,175)+particles(542,175,5,25,'rs-faint-dot')+text(58,30,'自由能输入')+text(53,302,'物质补给')+text(452,273,'产物与损失')+text(267,69,'反应耦合',true);
    case 18:return box(48,69,157,70,'局部环境')+arrow(216,104,275,104)+vesicle(337,108,39)+arrow(387,108,449,108,'rs-dash')+box(462,69,132,70,'候选事件')+path('M337 166V216H109M337 216H528','rs-dash')+text(59,251,'材料与条件')+text(286,251,'机制可行')+text(461,251,'历史依据')+text(152,318,'三层问题，分别核对',true);
    case 19:return vesicle(149,163,62)+molecule(148,162)+arrow(220,163,298,163)+vesicle(367,163,62)+molecule(365,162)+particles(370,158,4,33)+arrow(365,62,365,93)+arrow(440,163,509,163)+text(55,285,'初始包入')+text(300,285,'生成与滞留')+text(494,285,'流失')+text(304,43,'持续供给',true)+text(194,332,'净积累 = 生成 − 损失',true);
    default:return box(76,53,480,62,'核心关系：存留、反馈与延续')+box(104,139,424,62,'候选实现：隔室与局部化学')+box(132,225,368,62,'历史延伸：后续分支')+path('M74 86H52V257H122','rs-dash')+text(119,332,'依据 / 假设 / 未知，需要分别标记',true);
  }}
  function flight(i){switch(i){
    case 0:return path('M57 271H580')+path('M96 237V118Q96 76 177 76H424Q510 76 510 126V237','rs-dash')+craft(96,235,.63)+craft(310,85,.63)+craft(510,235,.63)+arrow(165,76,216,76)+arrow(510,142,510,179)+text(61,318,'起飞')+text(273,318,'悬停 / 返回')+text(480,318,'降落');
    case 1:return craft(315,198,1.15)+box(55,53,147,55,'姿态测量')+box(55,222,147,55,'高度测量')+box(445,53,147,55,'位置测量')+arrow(209,85,268,139)+arrow(209,246,268,204)+arrow(438,85,365,139)+path('M316 228V278H435','rs-dash')+text(442,285,'估计状态');
    case 2:return box(39,130,115,65,'目标')+arrow(162,164,209,164)+box(214,130,133,65,'控制响应')+arrow(355,164,406,164)+craft(468,173,.78)+path('M470 221V268H105V205','rs-dash')+arrow(105,205,105,198)+text(227,300,'测量与反馈')+text(211,86,'分层理解闭环',true);
    case 3:return path('M45 290H594')+`<ellipse cx="484" cy="283" rx="69" ry="15" class="rs-wash"/>`+path('M80 92C270 42 451 100 484 255','rs-dash')+path('M80 92C215 118 344 189 457 254','rs-fine')+craft(82,96,.65)+craft(448,190,.65)+arrow(480,201,484,249)+text(52,44,'返回轨迹')+text(263,319,'位置误差 / 下降状态 / 阶段切换',true);
    default:return box(42,72,157,172,'仿真')+box(243,72,157,172,'台架')+box(444,72,157,172,'系留')+path('M63 208l22-35 19 20 23-55 25 23 23-29')+craft(321,158,.5)+path('M274 205h91M322 176v29')+craft(521,158,.5)+path('M521 99V58M487 204h68M521 177v27','rs-dash')+text(181,312,'目标 / 状态 / 输出 / 异常日志',true);
  }}
  function population(i){switch(i){
    case 0:return path('M324 54V280','rs-fine')+Array.from({length:6},(_,k)=>{const w=38+k*17;return `<rect x="${318-w}" y="${69+k*31}" width="${w}" height="20" class="rs-wash"/><rect x="330" y="${69+k*31}" width="${w*.85}" height="20" class="rs-paper"/>`;}).join('')+text(72,88,'不同年龄构成')+text(463,148,'劳动参与')+text(469,253,'需求结构')+text(199,324,'年龄结构示意 / 无统计刻度',true);
    case 1:return path('M68 177H575')+[83,241,399,557].map((x,k)=>dot(x,177,8)+text(x-24,133,['2030','2048','2052','2060'][k])+text(x-28,226,['出生','18 岁','22 岁','30 岁'][k])).join('')+text(218,294,'跟随一代人的成长',true);
    case 2:return house(110,154,.9)+house(509,154,1.15)+person(266,155,.63)+person(316,165,.53)+arrow(188,118,390,118,'rs-dash')+arrow(392,249,189,249,'rs-fine')+text(50,286,'地区与供给')+text(242,286,'家庭形成')+text(467,286,'位置与需求');
    case 3:return person(124,119,1.06)+box(257,75,136,56,'任务 A')+box(257,151,136,56,'任务 B')+box(257,227,136,56,'任务 C')+path('M456 115h104v116H456ZM480 115V94h56v21M476 143h12m40 0h12M479 188h56M472 231v24m72-24v24','rs-paper')+arrow(180,171,243,171)+arrow(407,171,445,171)+text(66,319,'劳动者')+text(275,319,'任务重组')+text(470,319,'技术辅助');
    default:return person(116,125,.85)+person(310,108,1.05)+person(511,139,.72)+path('M92 244H535M116 237v26m194-38v38m201-26v26')+text(61,311,'家庭照护')+text(265,311,'专业服务')+text(462,311,'公共支持')+text(213,59,'谁提供支持，怎样分配？');
  }}

  const frame=(x,y,pose=0)=>`<g transform="translate(${x} ${y})">${box(0,0,114,126,'')}${circle(57,35,10,'rs-wash')}${path(`M57 46v34M57 58L${36-pose*5} ${70-pose*12}M57 58L${78+pose*5} ${70-pose*13}M57 80L${43-pose*6} 109M57 80L${71+pose*6} 109`)}</g>`;
  function vision(i){switch(i){
    case 0:return frame(63,65,0)+frame(261,65,1)+frame(459,65,2)+arrow(190,124,245,124)+arrow(390,124,444,124)+path('M119 238H518')+[119,318,518].map(x=>dot(x,238,6)).join('')+text(82,278,'起始姿态')+text(282,278,'动作转折')+text(482,278,'收束姿态')+text(176,326,'动作 / 镜头 / 风险反馈',true);
    case 1:return text(53,75,'均匀分配')+text(53,193,'自适应分配')+path('M180 104H580M180 222H580')+[190,317,444,571].map(x=>dot(x,104,7)).join('')+[190,351,392,571].map(x=>dot(x,222,7)).join('')+path('M332 165H412V259H332Z','rs-wash')+text(344,287,'风险段',true)+text(178,328,'相同锚帧预算，比较实际结果',true);
    case 2:return frame(51,79,0)+frame(264,79,1)+frame(477,79,2)+path('M308 65h47v157h-47Z','rs-wash')+arrow(179,143,249,143,'rs-dash')+arrow(391,143,462,143,'rs-dash')+circle(321,143,64,'rs-fine')+text(62,269,'进入遮挡')+text(272,269,'局部风险')+text(488,269,'重现检查')+text(178,328,'补锚点后，仍需逐段复查',true);
    default:return box(61,101,139,83,'研究方向')+arrow(214,143,251,143,'rs-dash')+circle(319,143,48,'rs-wash')+circle(319,143,19,'rs-fine')+arrow(383,143,423,143,'rs-dash')+box(437,101,139,83,'阶段记录')+text(279,239,'原型探索')+text(170,316,'公开方向与状态 / 具体内容暂不展示',true);
  }}
  const organ=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${path('M-67-32C-62-67-16-73 16-55C45-64 79-46 78-15C78 10 45 30 21 33C1 37-2 67-28 59C-56 55-77 12-67-32Z','rs-wash')}</g>`;
  function imaging(i){switch(i){
    case 0:return [0,1,2,3].map(k=>path(`M${67+k*14} ${107-k*14}l120-19 47 69-120 19Z`,'rs-paper')).join('')+arrow(285,144,352,144)+path('M421 223V79M421 223H568M421 223l-60 55')+arrow(421,103,421,76)+arrow(540,223,572,223)+text(432,87,'Z')+text(576,229,'X')+text(344,294,'Y')+dot(471,163,7)+path('M471 163V223M471 163H421','rs-dash')+text(57,288,'切片位置与间距')+text(398,328,'方向 / 原点 / 尺度',true);
    case 1:return organ(118,140,.72)+Array.from({length:12},(_,k)=>dot(90+(k%4)*18,112+Math.floor(k/4)*22,3,'rs-faint-dot')).join('')+organ(323,140,.72)+path('M278 120q45 18 90 0M284 147q42 20 77-2M309 102q-14 46 9 76','rs-fine')+organ(528,140,.72)+path('M475 182l15-96 95 22-15 96Z','rs-paper')+path('M493 149q35-41 72 2','rs-dash')+labels('密度体渲染','标签表面','自由剖面')+text(180,51,'同一空间，三种观察方式',true);
    case 2:return path('M73 194V75M73 194H262')+[27,45,88,107,76,49,29].map((h,k)=>`<rect x="${88+k*23}" y="${194-h}" width="16" height="${h}" class="rs-wash"/>`).join('')+path('M167 79V222','rs-dash')+arrow(285,149,351,149)+organ(433,151,.72)+circle(452,151,23,'rs-fine')+text(526,162,'?')+text(64,276,'密度阈值')+text(376,276,'候选区域')+text(133,328,'高亮形状 ≠ 已确认的解剖名称',true);
    default:return organ(131,146,.82)+text(93,150,'肝掩膜',true)+arrow(209,146,276,146)+organ(349,146,.82)+path('M351 102V147l-35 35M351 147l35 21M351 124l-28-7M351 139l31-22')+arrow(422,146,484,146)+box(495,109,103,72,'复查范围')+text(56,276,'匹配的输入')+text(298,276,'血管预测')+text(491,276,'输出边界')+text(141,328,'示意图 / 未细分静脉或重建胆管',true);
  }}
  window.KelenResearchScene=(record,cover=false)=>{
    const i=record.localIndex||0,art=record.group==='life'?life(cover?7:i):record.group==='flight'?flight(cover?3:i):record.group==='vision'?vision(cover?3:i):record.group==='imaging'?imaging(cover?1:i):population(cover?4:i);
    return `<svg viewBox="0 0 640 360" role="img" aria-label="${esc(cover?record.field+'档案库封面':record.title)}的研究示意图"><g class="rs-registration">${path('M25 48V25h23M592 25h23v23M25 312v23h23M592 335h23v-23')}</g><g class="rs-art">${art}</g></svg>`;
  };
})();
