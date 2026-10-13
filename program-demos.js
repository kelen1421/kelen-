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
    const draw=[physics,capture,recorder,workbench][index];
    function paint(time) {draw(Math.max(0,time));}
    paint(2.4);
    return {canvas,paint,caption:captions[index]};
  };
})();
