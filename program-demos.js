(() => {
  const captions = [
    '移动刚体，观察液滴形变；调整材质与尺寸。',
    '从悬浮球框选区域，截取画面并存入暂存区。',
    '摄像头预览与滚动提词同时显示，录制口播。',
    '在剪辑工作区上方，用浮窗查看不同任务的进度。'
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
      text('在其他应用工作，也能看见任务状态',24,420,18,soft);
    }
    const project=window.KelenProgramProjects?.[index];
    function waveform(x,y,width,t,phase=0){for(let i=0;i<34;i++){const h=8+Math.abs(Math.sin(i*.57+t*1.8+phase)*Math.cos(i*.31+phase))*65;rect(x+i*width/34,y-h/2,4,h,accent,null,2);}}
    function person(x,y,scale,t,moving=false){
      c.save();c.translate(x,y);c.scale(scale,scale);circle(0,-74,23,'#dde8d5',accent);
      const lift=moving?Math.sin(t*1.1)*25:0;
      path([[0,-47],[0,34],[-34,86]],ink,5);path([[0,34],[35,86]],ink,5);path([[0,-26],[-46,-4],[ -68,-29+lift]],accent,5);path([[0,-26],[45,-10],[67,-50-lift]],accent,5);
      [[0,-26],[0,34],[-46,-4],[45,-10]].forEach(([a,b])=>circle(a,b,5,paper,accent));c.restore();
    }
    function projectFlow(t){
      chrome(project?.name||'个人项目','WORKFLOW / ILLUSTRATION');
      if(project?.id==='voice'){
        rect(25,78,296,277,paper,line);text('参考人声',47,112,22);waveform(49,182,247,t,.7);text('选择片段 · 识别文字',47,280,19,soft);
        rect(350,78,292,277,paper,line);text('台词与发音',373,112,22);text('保持好奇，',374,168,28);text('向未知出发。',374,213,28);path([[374,239],[608,239]],line);text('情绪 / 语速 / 停顿',373,291,18,soft);
        rect(671,78,327,277,paper,line);text('A / B 试听',694,112,22);text('A',692,161,17,soft);waveform(728,163,241,t,1.5);text('B',692,257,17,soft);waveform(728,257,241,t*.75,2.1);
      } else if(project?.id==='avatar'){
        rect(25,78,278,277,paper,line);text('人物 + 声音',47,112,22);person(163,229,.57,t);waveform(50,325,230,t);
        path([[318,208],[343,208]],accent,3);rect(357,78,284,277,paper,line);text('动作条件',379,112,22);person(503,234,.8,t,true);
        path([[657,208],[683,208]],accent,3);rect(695,78,303,277,'#e9f0e1',line);text('视频画面',717,112,22);person(846,234,.8,t,true);text('768 × 768 / 实验流程',715,329,15,soft,'monospace');
      } else if(project?.id==='studio'){
        rect(25,78,437,277,'#dce7d5',line);path([[25,285],[462,285],[381,235],[381,79]],soft,2);rect(63,110,163,99,'#eaf1e3',soft,2);person(283,227,.65,t);rect(184,278,222,19,'#acbaa0',null,3);
        text('三维房间 / 人物构图',490,119,25);['人物抠像','面光与发丝边缘','横竖画幅 / 5 秒预览'].forEach((v,i)=>{text(v,491,176+i*64,22,ink);rect(491,192+i*64,432,5,'#cbd7c0',null,2);rect(491,192+i*64,165+i*74,5,accent,null,2);});
      } else if(project?.id==='translate'){
        rect(30,80,964,274,paper,line);text('The next idea starts here.',67,143,29,soft);text('Explore what makes things work.',67,192,26,soft);rect(49,217,650,89,'#e1ecd8',accent,2);text('下一个想法，从这里开始。',69,271,31);rect(738,107,217,213,paper,line);text('选区覆盖',761,145,24);text('OCR → 翻译',760,200,20,soft);text('保持原应用可操作',760,256,17,soft);
      } else if(project?.id==='mobile'){
        rect(31,82,542,271,paper,line);text('电脑 / 当前项目',56,119,24);['原对话与项目文件','执行状态与实时回复','本机继续处理'].forEach((v,i)=>text(v,59,178+i*57,23,i===1?accent:soft));path([[601,215],[676,215]],accent,3);rect(707,76,242,292,paper,line,20);text('手机',735,111,21);rect(727,133,196,49,'#e1ecd8',null);text('接着聊这个项目',740,163,19);rect(744,203,180,57,'#d4e2cb',null);text('查看回复与进度',757,237,18);circle(828,345,5,null,soft);
      } else if(project?.id==='hub'){
        rect(28,79,968,278,paper,line);rect(29,80,217,276,'#e5eddd',null);text('资源目录',52,119,23);['应用','插件','技能 / 工作流'].forEach((v,i)=>text(v,53,176+i*57,22,soft));['个人程序','创作工具','技能说明'].forEach((v,i)=>{rect(272+i*231,114,211,193,paper,line);text(v,292+i*231,154,22);for(let j=0;j<3;j++)rect(292+i*231,183+j*32,160-j*17,5,'#c4d4b8',null,2);});
      } else if(project?.id==='pagepick'){
        rect(28,79,968,278,paper,line);text('链接 / HTML 源码',53,118,23);rect(51,139,918,42,'#e6eedf',line);text('公开网页内容',69,167,19,soft);['正文','媒体与字幕','导出资料'].forEach((v,i)=>{rect(51+i*310,210,292,116,paper,line);text(v,69+i*310,245,22);path([[70+i*310,271],[304+i*310,271]],line);path([[70+i*310,291],[269+i*310,291]],line);});
      } else if(project?.id==='atelier'){
        rect(28,78,607,279,'#e6eddf',line);circle(331,208,31,'#a8bea0',accent);circle(331+Math.cos(t*.6)*117,208+Math.sin(t*.6)*59,8,accent);text('分镜预览',50,113,22);rect(657,78,339,279,paper,line);text('时间轴 / 参数',679,114,22);['时长','位置','颜色与缓动'].forEach((v,i)=>{text(v,682,166+i*61,20,soft);rect(682,182+i*61,277,4,'#c5d5b9',null,2);});
      }
      const steps=project?.steps||[];steps.forEach((value,i)=>{text(String(i+1).padStart(2,'0')+'  '+value,33+i*333,407,20,ink);if(i<2)text('→',312+i*333,407,23,soft);});
    }
    const draw=[physics,capture,recorder,workbench][index]||projectFlow;
    function paint(time) {draw(Math.max(0,time));}
    paint(2.4);
    return {canvas,paint,caption:captions[index]||project?.steps.join(' → ')||'项目流程示意'};
  };
})();
