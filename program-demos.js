(() => {
  const captions = [
    '移动刚体，观察液滴形变；调整材质与尺寸。',
    '从悬浮球框选区域，截取画面并存入暂存区。',
    '摄像头预览与滚动提词同时显示，录制口播。',
    '查看任务阶段，内置续聊；开发版接入电脑桥开关。'
  ];
  window.createProgramDemo = index => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;canvas.height = 440;
    const c = canvas.getContext('2d');
    const ink='#354b41',soft='#8b9e88',line='#b6c6ad',paper='#f7f9f0',accent='#7f9e65';
    const clamp = x => Math.max(0,Math.min(1,x));
    const ease = x => {const p=clamp(x);return p*p*(3-2*p);};
    function rect(x,y,w,h,fill=paper,stroke=line,r=8) {
      c.beginPath();c.roundRect(x,y,w,h,r);
      if(fill){c.fillStyle=fill;c.fill();}
      if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke();}
    }
    function text(value,x,y,size=24,color=ink,font='sans-serif') {
      c.fillStyle=color;c.font=`${size}px ${font}`;c.fillText(value,x,y);
    }
    function path(points,color=line,width=1.6) {
      c.beginPath();points.forEach(([x,y],i)=>i ? c.lineTo(x,y) : c.moveTo(x,y));
      c.strokeStyle=color;c.lineWidth=width;c.stroke();
    }
    function circle(x,y,r,fill,stroke) {
      c.beginPath();c.arc(x,y,r,0,Math.PI*2);
      if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}
    }
    function cursor(x,y) {
      c.save();c.translate(x,y);c.beginPath();
      c.moveTo(0,0);c.lineTo(0,31);c.lineTo(8,23);c.lineTo(16,36);c.lineTo(23,32);c.lineTo(15,20);c.lineTo(29,19);c.closePath();
      c.fillStyle=ink;c.strokeStyle=paper;c.lineWidth=3;c.fill();c.stroke();c.restore();
    }
    function chrome(title,tag) {
      c.clearRect(0,0,1024,440);
      const wash=c.createLinearGradient(0,0,1024,440);wash.addColorStop(0,'#f4f7ec');wash.addColorStop(1,'#e2ebdc');
      rect(0,0,1024,440,wash,line,12);
      text(title,24,38,22,ink);text(tag,740,36,15,soft,'monospace');
      path([[0,57],[1024,57]],line,1);
    }
    function physics(t) {
      chrome('物理模型','MATTER / INTERACTION');
      c.save();c.beginPath();c.rect(20,70,677,324);c.clip();
      c.globalAlpha=.25;
      for(let x=28;x<696;x+=36)path([[x,72],[x,393]],line,1);
      for(let y=83;y<394;y+=36)path([[24,y],[695,y]],line,1);
      c.globalAlpha=1;
      const px=352+134*Math.sin(t*.95),py=222+22*Math.cos(t*.8);
      const pressure=Math.exp(-Math.pow((px-358)/120,2));
      const glow=c.createRadialGradient(331,177,12,359,235,147);
      glow.addColorStop(0,'#ffffff');glow.addColorStop(.3,'#d6e9e1');glow.addColorStop(.78,'#b4d3c8');glow.addColorStop(1,'#7caaa2');
      c.beginPath();
      for(let i=0;i<=90;i++) {
        const a=i/90*Math.PI*2;
        const r=106+Math.sin(a*3+t*1.1)*5+pressure*Math.cos(a*2-t*.7)*12;
        const x=351+Math.cos(a)*r,y=226+Math.sin(a)*r*(.94-pressure*.1);
        i ? c.lineTo(x,y) : c.moveTo(x,y);
      }
      c.closePath();c.fillStyle=glow;c.fill();c.strokeStyle='#7ba098';c.lineWidth=2;c.stroke();
      c.save();c.translate(351,226);c.rotate(-.35);
      c.beginPath();c.ellipse(0,0,109,31,0,0,Math.PI*2);c.strokeStyle='#edf6ef';c.lineWidth=1.5;c.stroke();
      c.beginPath();c.ellipse(0,0,36,102,0,0,Math.PI*2);c.strokeStyle='#9cbeb5';c.stroke();c.restore();
      c.save();c.translate(px,py);c.rotate(Math.sin(t*.75)*.22);
      rect(-31,-35,62,70,'#526f63','#f8fcf5',3);path([[-20,-23],[20,-23],[20,23]],'#9fbba9',2);c.restore();
      cursor(px+26,py+23);c.restore();
      path([[716,78],[716,380]],line,1);
      text('液体性质',744,104,24);text('黏度',744,159,20,soft);
      rect(744,179,238,5,'#cad8c1',null,2);rect(744,179,110+30*Math.sin(t*.7),5,accent,null,2);
      circle(854+30*Math.sin(t*.7),181,7,paper,accent);
      text('刚体尺寸',744,235,20,soft);
      rect(744,257,238,5,'#cad8c1',null,2);rect(744,257,147,5,accent,null,2);circle(891,259,7,paper,accent);
      text('拖动 · 旋转',744,334,21,ink);text('调整材质 · 观察响应',24,420,18,soft);
    }
    function capture(t) {
      chrome('截图助手','SELECT / CAPTURE / KEEP');
      rect(29,80,660,304,'#fcfcf5',line,7);
      rect(29,80,660,30,'#e4ecdc',null,7);
      [46,60,74].forEach(x=>circle(x,95,3,'#9aad8f'));
      text('灵感素材',54,146,19,soft);
      rect(54,162,180,134,'#d7e4cf',null,4);
      path([[72,272],[114,210],[158,249],[198,201],[220,272]],'#93b080',3);
      circle(203,185,10,'#b4c89f');
      for(let i=0;i<5;i++)rect(264,169+i*24,330-(i%3)*55,4,'#c6d2bd',null,1);
      rect(265,306,265,34,'#e8efdf',null,4);
      const p=t%8,drag=ease((p-.65)/1.85),snapped=p>3;
      const sx=121,sy=136,w=415*drag+1,h=194*drag+1;
      c.save();c.beginPath();c.rect(29,110,660,274);c.rect(sx,sy,w,h);c.fillStyle='#314c352e';c.fill('evenodd');c.restore();
      c.save();c.setLineDash([7,7]);rect(sx,sy,w,h,null,accent,0);c.restore();
      for(const [x,y,dx,dy]of [[sx,sy,1,1],[sx+w,sy,-1,1],[sx,sy+h,1,-1],[sx+w,sy+h,-1,-1]])path([[x,y+dy*16],[x,y],[x+dx*16,y]],ink,3);
      if(p<3.8)cursor(sx+w,sy+h);
      circle(962,220,25,'#416352');text('+',949,230,31,paper);
      rect(723,86,213,296,'#f4f8ed',line,8);text('暂存区',744,121,21,ink);
      if(snapped){
        const enter=ease((p-3)/.6);c.save();c.globalAlpha=enter;
        rect(746,147+(1-enter)*28,167,132,'#d4e2c9',line,4);
        path([[761,247],[793,196],[824,230],[861,180],[897,247]],'#91aa7d',3);
        text('截图已保存',745,315,20,ink);text('拖出即可使用',745,347,17,soft);c.restore();
      }else{text('等待截图',747,220,18,soft);}
      text(snapped ? '截取完成 → 存入暂存区' : '从悬浮球展开 → 框选区域',24,420,18,soft);
    }
    function recorder(t) {
      chrome('口播工具箱','CAMERA / PROMPT / RECORD');
      rect(27,80,417,303,'#223c34','#678d7b',8);
      const gradient=c.createLinearGradient(28,85,441,380);gradient.addColorStop(0,'#36584a');gradient.addColorStop(1,'#182e29');
      rect(40,95,391,268,gradient,null,5);
      circle(235,187,43,'#b7cdb9');
      c.beginPath();c.ellipse(235,301,87,63,0,Math.PI,Math.PI*2);c.lineTo(322,343);c.lineTo(148,343);c.closePath();c.fillStyle='#9dbda5';c.fill();
      for(const[x,y,dx,dy]of [[57,112,1,1],[414,112,-1,1],[57,347,1,-1],[414,347,-1,-1]])path([[x,y+dy*13],[x,y],[x+dx*13,y]],'#d5e6d5',2);
      circle(66,129,5,'#c99281');text(`REC 00:${String(12+Math.floor(t%8)).padStart(2,'0')}`,80,136,17,'#dfebda','monospace');
      rect(466,80,526,303,'#f8faef',line,8);text('滚动提词',486,119,21);path([[466,137],[992,137]],line,1);
      const script=['保持好奇，向未知出发。','喜欢理解事物背后的原理，','也想讲述自己笔下的故事。','把准备好的内容，','从容地说出来。','让表达更自然。'];
      const offset=(t%8)/8*112;
      c.save();c.beginPath();c.rect(481,147,497,220);c.clip();
      rect(480,213,498,49,'#dce9cb',null,2);
      script.forEach((value,i)=>text(value,488,187+i*48-offset,26,i*48+187-offset>212&&i*48+187-offset<264 ? ink : '#899a7e'));
      c.restore();
      text('速度',487,365,16,soft);rect(540,359,158,4,'#bbcea8',null,2);circle(635,361,5,paper,accent);
      for(let i=0;i<15;i++){const h=6+Math.abs(Math.sin(t*3+i*.7))*12;rect(297+i*8,398-h/2,3,h,'#8aa67b',null,1);}
      text('摄像头预览 + 自动提词 + 保存视频',24,420,18,soft);
    }
    function workbench(t) {
      chrome('ai 工作台','TASKS / FOCUS / PROGRESS');
      rect(28,82,964,302,'#edf2e4',line,7);text('剪辑工作区',50,115,18,soft);
      for(let row=0;row<3;row++) {
        rect(52,155+row*56,649,40,'#e4ebdc',null,3);
        for(let i=0;i<4;i++)rect(61+i*161+row*9,163+row*56,100+(i*13)%45,24,['#b8cdaa','#c9d7bc','#b6cebe'][row],null,3);
      }
      path([[459,139],[459,332]],'#789167',2);
      const x=492+Math.sin(t*.55)*15,y=106+Math.cos(t*.65)*7;
      c.save();c.shadowColor='#364d3530';c.shadowBlur=20;c.shadowOffsetY=12;rect(x,y,457,259,'#fcfdf5','#9db490',8);c.restore();
      text('ai 工作台',x+18,y+32,22,ink);text('3 TASKS',x+329,y+29,14,soft,'monospace');path([[x,y+46],[x+457,y+46]],line,1);
      ['素材整理','旁白草稿','画面制作'].forEach((name,i)=>{
        const p=clamp((t%10-i*.8)/(6+i*.7));
        text(name,x+18,y+80+i*62,21,ink);
        text(p>.985 ? '完成' : '进行中',x+340,y+79+i*62,16,p>.985 ? accent : soft);
        rect(x+18,y+94+i*62,415,5,'#dce5d3',null,2);rect(x+18,y+94+i*62,415*p,5,p>.985 ? '#8fad6b' : '#85a795',null,2);
      });
      rect(52,341,153,29,'#e2ecda',line,4);text('内置对话 ↗',67,362,17,ink);
      rect(219,341,177,29,'#e2ecda',line,4);circle(236,355,4,accent);text('电脑调用开关',249,362,17,ink);
      text('任务进度 · 内置续聊 · 电脑桥管理',24,420,18,soft);
    }
    const project=window.KelenProgramProjects?.[index];
    function waveform(x,y,width,t,phase=0){for(let i=0;i<34;i++){const h=8+Math.abs(Math.sin(i*.57+t*1.8+phase)*Math.cos(i*.31+phase))*65;rect(x+i*width/34,y-h/2,4,h,accent,null,2);}}
    function person(x,y,scale,t,moving=false){
      c.save();c.translate(x,y);c.scale(scale,scale);circle(0,-74,23,'#dde8d5',accent);
      const lift=moving?Math.sin(t*1.1)*25:0;
      path([[0,-47],[0,34],[-34,86]],ink,5);path([[0,34],[35,86]],ink,5);path([[0,-26],[-46,-4],[ -68,-29+lift]],accent,5);path([[0,-26],[45,-10],[67,-50-lift]],accent,5);
      [[0,-26],[0,34],[-46,-4],[45,-10]].forEach(([a,b])=>circle(a,b,5,paper,accent));c.restore();
    }
    function transfer(x1,y1,x2,y2,t){
      path([[x1,y1],[x2,y2]],line,2);
      for(let i=0;i<3;i++){const p=((t*.43+i/3)%1+1)%1;circle(x1+(x2-x1)*p,y1+(y2-y1)*p,3.5,accent);}
    }
    function focusArea(x,y,w,h,active){
      if(!active)return;
      const n=14;for(const [a,b,dx,dy]of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]])path([[a,b+dy*n],[a,b],[a+dx*n,b]],accent,3);
    }
    function meter(x,y,w,p){rect(x,y,w,4,'#d4dfcb',null,2);rect(x,y,w*clamp(p),4,accent,null,2);circle(x+w*clamp(p),y+2,4,paper,accent);}
    function projectFlow(t){
      const cycle=t%9.6,step=Math.min(2,Math.floor(cycle/3.2)),phase=ease((cycle-step*3.2)/2.35);
      chrome(project?.name||'个人项目','FUNCTION MAP / ILLUSTRATION');
      if(project?.id==='voice'){
        rect(25,78,296,277,paper,line);text('参考人声',47,112,22);waveform(49,182,247,t,.7);text('选择片段 · 识别文字',47,280,19,soft);
        rect(350,78,292,277,paper,line);text('台词与发音',373,112,22);text('保持好奇，',374,168,28);text('向未知出发。',374,213,28);path([[374,239],[608,239]],line);text('情绪 / 语速 / 停顿',373,291,18,soft);
        rect(671,78,327,277,paper,line);text('A / B 试听',694,112,22);text('A',692,161,17,soft);waveform(728,163,241,t,1.5);text('B',692,257,17,soft);waveform(728,257,241,t*.75,2.1);
      } else if(project?.id==='avatar'){
        rect(25,78,278,277,paper,line);text('人物 + 声音',47,112,22);person(163,229,.57,t);waveform(50,325,230,t);
        transfer(312,208,348,208,t);rect(357,78,284,277,paper,line);text('动作条件',379,112,22);person(503,234,.8,t,true);
        transfer(650,208,687,208,t-.5);rect(695,78,303,277,'#e9f0e1',line);text('视频画面',717,112,22);person(846,234,.8,t,true);circle(846,184,2.4+Math.abs(Math.sin(t*6))*2.5,ink);meter(717,325,255,(t%4)/4);
        focusArea([25,357,695][step],78,[278,284,303][step],277,true);
      } else if(project?.id==='studio'){
        rect(25,78,437,277,'#dce7d5',line);path([[25,285],[462,285],[381,235],[381,79]],soft,2);rect(63,110,163,99,'#eaf1e3',soft,2);person(283,227,.65,t);rect(184,278,222,19,'#acbaa0',null,3);
        const light=.45+.38*Math.sin(t*.65);c.save();c.globalAlpha=.08+light*.12;c.fillStyle='#fffefa';c.beginPath();c.moveTo(55,78);c.lineTo(400,290);c.lineTo(180,290);c.closePath();c.fill();c.restore();
        if(step===0){const scan=85+phase*264;path([[32,scan],[455,scan]],accent,2);}
        text('三维房间 / 人物构图',490,119,25);['人物抠像','面光与发丝边缘','横竖画幅 / 5 秒预览'].forEach((v,i)=>{text(v,491,176+i*64,22,i===step?ink:soft);meter(491,192+i*64,432,i<step?1:i===step?(i===1?light:phase):.08);});
        focusArea(25,78,437,277,step===2);
      } else if(project?.id==='translate'){
        rect(30,80,964,274,paper,line);text('The next idea starts here.',67,143,29,soft);text('Explore what makes things work.',67,192,26,soft);
        const selection=step===0?Math.max(.12,phase):1;rect(49,100,650*selection,105,null,accent,2);
        if(step===0)cursor(49+650*selection,205);
        if(step===1){const scan=57+phase*632;path([[scan,103],[scan,203]],accent,2);}
        rect(49,217,650,89,step===2?'#e1ecd8':'#f2f6eb',line,2);
        const translated='下一个想法，从这里开始。';text(step===2?translated.slice(0,Math.max(1,Math.ceil(phase*translated.length))):'选区文字 → 原位译文',69,271,31,step===2?ink:soft);
        rect(738,107,217,213,paper,line);text('选区覆盖',761,145,24);text('OCR → 翻译',760,200,20,step===1?ink:soft);text('保持原应用可操作',760,256,17,soft);meter(760,285,165,cycle/9.6);
      } else if(project?.id==='mobile'){
        rect(31,82,542,271,paper,line);text('电脑 / 当前项目',56,119,24);
        ['原对话与项目文件','执行状态与实时回复','本机继续处理'].forEach((v,i)=>{if(i===step)rect(48,151+i*57,506,41,'#e8f0df',null,3);text(v,59,178+i*57,23,i===step?ink:soft);});
        meter(58,326,475,step===2?phase:.14+phase*.42);
        transfer(step===1?697:588,215,step===1?588:697,215,t);
        rect(707,76,242,292,paper,line,20);text('手机',735,111,21);rect(727,133,196,49,'#e1ecd8',null);
        const prompt='接着聊这个项目';text(step===0?prompt.slice(0,Math.max(1,Math.ceil(phase*prompt.length))):prompt,740,163,19);
        rect(733,202,191,82,step===2?'#d4e2cb':'#edf3e6',null);text('查看回复与进度',746,230,18,step===0?soft:ink);
        for(let i=0;i<2;i++)rect(748,246+i*17,step===2?156*clamp(phase*2-i):step===1?24+phase*65:16,3,line,null,1);
        circle(828,345,5,null,soft);focusArea(707,76,242,292,step>0);
      } else if(project?.id==='hub'){
        rect(28,79,968,278,paper,line);rect(29,80,217,276,'#e5eddd',null);text('资源目录',52,119,23);
        const selected=Math.floor(t/3.2)%3;rect(42,146+selected*57,189,43,'#cfddc2',null,3);
        ['应用','插件','技能 / 工作流'].forEach((v,i)=>text(v,53,176+i*57,22,i===selected?ink:soft));
        ['个人程序','创作工具','技能说明'].forEach((v,i)=>{const chosen=i===selected;rect(272+i*231,114,211,193,chosen?'#eef4e6':paper,chosen?accent:line);text(v,292+i*231,154,22);for(let j=0;j<3;j++)rect(292+i*231,183+j*32,160-j*17,5,chosen&&j<=Math.floor(phase*3)?accent:'#c4d4b8',null,2);if(chosen){focusArea(272+i*231,114,211,193,true);text(phase>.7?'打开使用 ↗':'查看资源 →',292+i*231,291,17,ink);}});
        const targetX=343+selected*231,travel=ease((cycle%3.2)/1.55);cursor(171+(targetX-171)*travel,176+selected*57+(265-(176+selected*57))*travel);
      } else if(project?.id==='pagepick'){
        rect(28,79,968,278,paper,line);text('链接 / HTML 源码',53,118,23);rect(51,139,918,42,'#e6eedf',line);
        const input='公开网页内容 / HTML';text(step===0?input.slice(0,Math.max(1,Math.ceil(phase*input.length))):input,69,167,19,soft);
        ['正文','媒体与字幕','导出资料'].forEach((v,i)=>{const reveal=step===0?.08:step===1?ease((phase-i*.17)/.66):1;rect(51+i*310,210,292,116,paper,line);text(v,69+i*310,245,22);meter(70+i*310,271,234,reveal);path([[70+i*310,291],[70+i*310+199*reveal,291]],line);focusArea(51+i*310,210,292,116,i===step);});
        if(step===2){rect(713,282,226,29,'#e0ebd5',null,3);text(['TXT','Markdown','JSON'][Math.floor(t*1.1)%3]+'  ↓',732,304,17,ink);cursor(890,296);}
      } else if(project?.id==='hueform'){
        rect(28,79,292,278,paper,line);text('选择主色',50,116,23);
        const hue=83+Math.sin(t*.45)*24,cx=171,cy=224,r=74;
        for(let i=0;i<36;i++){const a=i/36*Math.PI*2;c.beginPath();c.arc(cx,cy,r,a,a+Math.PI/18+.01);c.arc(cx,cy,r-17,a+Math.PI/18+.01,a,true);c.closePath();c.fillStyle=`hsl(${i*10} 40% 64%)`;c.fill();}
        circle(cx,cy,39,`hsl(${hue} 41% 56%)`,paper);const angle=hue/180*Math.PI;circle(cx+Math.cos(angle)*(r-8),cy+Math.sin(angle)*(r-8),7,paper,ink);
        const formulas=['互补色','类似色','三角色','分裂互补','矩形四色','单色搭配'],mode=Math.floor(t/3.2)%6;
        rect(347,79,649,278,paper,line);text('六公式 / 22 套经典配色',369,116,23);text(formulas[mode],812,115,20,soft);
        const offsets=[[0,180],[-30,0,30],[0,120,240],[0,150,210],[0,60,180,240],[0,0,0]][mode];
        offsets.forEach((offset,i)=>{const w=582/offsets.length,light=mode===5?35+i*21:56;rect(369+i*w,144,w-8,94,`hsl(${(hue+offset+360)%360} 41% ${light}%)`,null,3);});
        rect(369,254,275,77,'#edf2e7',line,3);text('海报 / 界面 / 比例',384,283,20);meter(385,304,235,.4+.4*phase);
        rect(668,254,302,77,step===2?'#e0ebd6':paper,line,3);text(step===2?'PNG · SVG · CSS · JSON':'文字对比度 / 本地收藏',684,283,18,step===2?ink:soft);text(step===2?'导出配色 →':'预览后再决定',684,311,20,ink);
      } else if(project?.id==='organs'){
        rect(28,79,279,278,paper,line);text('CT 体数据',49,116,23);
        for(let i=0;i<4;i++){rect(63+i*15,163-i*15,150,126,i===step?'#dce8d1':paper,line,2);circle(139+i*15,224-i*15,29,null,soft);}
        text('方向 / 间距 / 位置',51,331,18,soft);transfer(318,215,349,215,t);
        rect(361,79,336,278,'#e8efdf',line);text('三维与自由剖面',382,116,23);
        c.save();c.translate(526,222);c.scale(1.12,.8);circle(0,0,65,'#ccdcbf',accent);path([[-46,-30],[-11,-49],[44,-26],[57,20],[10,53],[-40,30],[-46,-30]],soft,1.7);const cut=-51+phase*102;path([[cut,-71],[cut,71]],ink,2.5);path([[-60,cut*.7],[60,cut*.7]],line,1);c.restore();
        text('密度 / 同例标签 / 切面',384,331,17,soft);rect(725,79,271,278,paper,line);text('候选与导出',747,116,23);
        ['原始密度','标签表面','候选结构'].forEach((v,i)=>{rect(746,143+i*58,227,43,i===step?'#dbe7cf':paper,line,3);text(v,763,171+i*58,21,i===step?ink:soft);});text('示意 / 不含病例影像',746,335,17,soft);
      } else if(project?.id==='knowledge'){
        rect(28,79,253,278,paper,line);text('收件箱',50,116,23);['链接','笔记','文件'].forEach((v,i)=>{rect(48,144+i*57,213,43,i===step?'#dfead5':paper,line,3);text(v,65,172+i*57,21);});
        rect(309,79,421,278,'#e9f0e1',line);text('保留来源的知识网络',330,116,23);const nodes=[[359,238,'来源'],[461,163,'概念'],[563,260,'项目'],[662,178,'问答']];
        [[0,1],[0,2],[1,2],[1,3],[2,3]].forEach(([a,b],i)=>{const av=nodes[a],bv=nodes[b];path([[av[0],av[1]],[bv[0],bv[1]]],line,1.5);const progress=(t*.3+i*.19)%1;circle(av[0]+(bv[0]-av[0])*progress,av[1]+(bv[1]-av[1])*progress,3,accent);});
        nodes.forEach(([x,y,name],i)=>{circle(x,y,i===step?17:12,paper,i===step?accent:soft);text(name,x-20,y+39,18,soft);});
        rect(758,79,238,278,paper,line);text('本地检索',779,116,23);rect(779,143,196,38,'#e6eedf',line,3);text('问题 → 引用',790,169,18);for(let i=0;i<3;i++){path([[780,211+i*40],[969-i*20,211+i*40]],i===step?accent:line,3);}text('示意 / 不公开库内资料',779,335,15,soft);
      } else if(project?.id==='makgi'){
        rect(28,79,968,278,paper,line);text('动作计划 → 图像锚帧 → 局部反馈',50,115,23);const xs=[83,348,613,909];path([[xs[0],300],[xs[3],300]],line,2);
        [0,1,2].forEach((i)=>{const x=68+i*316;rect(x,139,262,126,i===step?'#e6eedf':paper,line,4);person(x+131,212,.45,t,i===step);text(['起始','转折','收束'][i],x+14,163,16,soft);circle(xs[i],300,7,i===step?accent:paper,soft);});circle(xs[3],300,7,paper,soft);
        const feedback=step===2;path([[773,278],[773,329],[509,329],[509,275]],feedback?accent:line,2);text(feedback?'风险反馈 / 局部补锚':'检查遮挡与镜头变化',374,345,18,feedback?ink:soft);
      } else if(project?.id==='mimg'){
        rect(28,79,968,278,paper,line);text('MIMG / 独立研究',51,116,23);text('图像表示与理解',51,153,18,soft);
        const nodes=[184,511,838];path([[nodes[0],225],[nodes[2],225]],line,1.5);
        nodes.forEach((x,i)=>{circle(x,225,39,paper,i===step?accent:line);circle(x,225,10+i*3,i===step?accent:line);text(['研究问题','原型探索','阶段记录'][i],x-43,302,21,i===step?ink:soft);});
        text('方向与状态概览 / 暂不展示具体方法和实验材料',301,340,18,soft);
      } else if(project?.id==='actors'){
        rect(28,79,488,278,paper,line);text('个人 / 连续周程',49,116,23);
        ['读本','排练','拍摄'].forEach((v,i)=>{
          rect(49+i*149,140,132,182,i===step?'#e3eddb':paper,line,4);
          text(['周一','周二','周三'][i],66+i*149,171,18,soft);text(v,66+i*149,219,24,ink);
          path([[66+i*149,245],[147+i*149,245]],line);path([[66+i*149,266],[126+i*149,266]],line);
        });
        transfer(528,218,557,218,t);
        rect(572,79,424,278,paper,line);text('团队 / 协作流程',594,116,23);
        ['提出日程变更','对比与本人确认','执行与完成回执'].forEach((v,i)=>{
          const y=139+i*65;rect(593,y,380,52,i===step?'#dce9d0':paper,line,4);text(String(i+1).padStart(2,'0'),609,y+32,17,soft,'monospace');text(v,650,y+32,21,i===step?ink:soft);if(i<step)text('✓',942,y+32,23,accent);
        });
        focusArea(572,79,424,278,step===2);
      } else if(project?.id==='computer'){
        rect(28,79,307,278,paper,line);text('屏幕与应用',49,116,23);rect(53,139,258,147,'#e6eedf',soft,4);
        for(let i=0;i<3;i++){rect(69+i*77,164,62,67,i===step?'#cfddc2':paper,line,3);text(['屏幕','文件','输入'][i],78+i*77,205,17,ink);}
        path([[178,287],[178,310],[133,310],[223,310]],soft,2);
        rect(365,79,295,278,paper,line);text('本机工具调用',387,116,23);
        ['截取当前屏幕','读取与写入文件','鼠标键盘操作'].forEach((v,i)=>{const y=145+i*60;rect(386,y,253,44,i===step?'#e0ebd5':paper,line,3);text(v,402,y+29,19,i===step?ink:soft);});
        const paused=step===2&&phase>.5;transfer(341,216,358,216,paused?0:t);
        rect(689,79,307,278,paper,line);text('随时暂停',711,116,23);
        rect(758,161,167,66,paused?'#d9ded4':'#b8cda9',soft,33);circle(paused?793:890,194,25,paper,soft);
        text(paused?'调用已暂停':'电脑工具可用',741,277,24,ink);text('菜单栏 / 权限与状态',712,327,18,soft);
      } else if(project?.id==='motion'){
        rect(28,79,252,278,paper,line);text('动效素材库',49,116,23);
        ['片头','线稿','透明标注'].forEach((v,i)=>{const y=144+i*60;rect(48,y,210,45,i===step?'#dce8d2':paper,line,3);circle(69,y+22,6,i===step?accent:line);text(v,88,y+29,21,i===step?ink:soft);});
        rect(309,79,429,278,'#e8efdf',line);text('独立实例 / 预览',330,116,23);
        const amount=.5+.3*Math.sin(t*.8);c.save();c.beginPath();c.rect(326,133,396,167);c.clip();
        circle(522,214,35+amount*37,'#b9cda8',accent);path([[394,248],[453,185],[510,230],[570,164],[648,246]],ink,3);circle(394+cycle/9.6*254,246,5,accent);c.restore();
        for(let i=0;i<3;i++)rect(330+i*128,317,112,15,i===step?accent:'#cad8bd',null,2);path([[330+cycle/9.6*368,308],[330+cycle/9.6*368,341]],ink,2);
        rect(767,79,229,278,paper,line);text('参数与导出',788,116,23);text('图层大小',789,161,19,soft);meter(789,179,181,amount);text('时间与节奏',789,227,19,soft);meter(789,244,181,cycle/9.6);rect(789,283,181,42,step===2?'#d5e4ca':paper,line,3);text('按需导出 ↗',805,311,21,ink);
      } else if(project?.id==='atelier'){
        const position=.5+.4*Math.sin(t*.85),orbX=170+position*310,orbY=218+Math.sin(t*1.1)*27;
        rect(28,78,607,279,'#e6eddf',line);path([[96,218],[566,218]],line);circle(orbX,orbY,31,'#a8bea0',accent);text('分镜预览',50,113,22);
        for(let i=0;i<4;i++)rect(55+i*140,309,124,19,i===Math.floor(cycle/2.4)?'#b5cba7':'#d1dec6',null,2);path([[55+cycle/9.6*544,301],[55+cycle/9.6*544,339]],ink,2);
        rect(657,78,339,279,paper,line);text('时间轴 / 参数',679,114,22);['时长','位置','颜色与缓动'].forEach((v,i)=>{text(v,682,166+i*61,20,i===step?ink:soft);meter(682,182+i*61,277,i===1?position:i===0?cycle/9.6:.5+.25*Math.sin(t*.65));});
        focusArea(28,78,607,279,step===1);
      }
      const steps=project?.steps||[];steps.forEach((value,i)=>{text(String(i+1).padStart(2,'0')+'  '+value,33+i*333,407,20,i===step?ink:soft);if(i<2)text('→',312+i*333,407,23,soft);});
    }
    const draw=[physics,capture,recorder,workbench][index]||projectFlow;
    function paint(time) {draw(Math.max(0,time));}
    paint(2.4);
    return {canvas,paint,duration:index<3?8:index===3?10:9.6,caption:captions[index]||project?.steps.join(' → ')||'项目流程示意'};
  };
})();
