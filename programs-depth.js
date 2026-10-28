(() => {
  const T = window.THREE;
  if (!T) return;
  window.createProgramDepth = (archive,callbacks) => {
    const root = document.documentElement;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const host = document.createElement('div');
    host.className = 'plugin-depth-stage';
    host.setAttribute('aria-hidden','true');
    archive.querySelector('.plugin-viewport').append(host);
    let renderer;
    try {
      renderer = new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    } catch (_) {host.remove();return null;}
    host.append(renderer.domElement);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35,1,.1,60);
    scene.add(new T.HemisphereLight(0xfffff4,0x94988b,1.4));
    const light = new T.DirectionalLight(0xfffbec,2.3);
    light.position.set(-3,9,6);light.castShadow=true;
    light.shadow.mapSize.set(1024,1024);
    Object.assign(light.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:24});
    light.shadow.bias=-.0006;scene.add(light);
    const fill = new T.DirectionalLight(0xe7ece9,1.2);fill.position.set(7,4,-4);scene.add(fill);

    // A local studio reflection, so the metal and glass need no external assets.
    const faces = Array.from({length:6},(_,i) => {
      const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
      const ctx=canvas.getContext('2d'),wash=ctx.createLinearGradient(0,0,0,128);
      wash.addColorStop(0,'#faf9f0');wash.addColorStop(.5,i%2 ? '#b3b6ad' : '#dedfd8');wash.addColorStop(1,'#7c8274');
      ctx.fillStyle=wash;ctx.fillRect(0,0,128,128);
      ctx.fillStyle='#fffef7';ctx.fillRect(i%2 ? 19 : 74,12,23,91);
      return canvas;
    });
    const cube = new T.CubeTexture(faces);cube.needsUpdate=true;cube.colorSpace=T.SRGBColorSpace;
    const pmrem = new T.PMREMGenerator(renderer);
    const environment = pmrem.fromCubemap(cube);scene.environment=environment.texture;
    pmrem.dispose();cube.dispose();
    const metal = new T.MeshStandardMaterial({color:0xc3c5ba,metalness:.78,roughness:.28});
    const edge = new T.MeshStandardMaterial({color:0x959b8a,metalness:.6,roughness:.3});
    const warm = new T.MeshStandardMaterial({color:0xb4b298,metalness:.68,roughness:.25});
    const accent = new T.MeshStandardMaterial({color:0xa2ae79,metalness:.3,roughness:.35});
    const glass = new T.MeshPhysicalMaterial({color:0xe1e7db,metalness:.08,roughness:.08,transmission:.45,thickness:.3,transparent:true,opacity:.62,clearcoat:1});
    const entries=window.KelenProgramProjects||[];
    const cards=[...archive.querySelectorAll('.program-card')];
    const codes=cards.map((card,i)=>entries[i]?.code||card.dataset.projectCode);
    const names=cards.map(card=>card.querySelector('h3').textContent);
    const total=cards.length,number=index=>String(index+1).padStart(2,'0');
    const overview = new T.Group(),gallery = new T.Group();scene.add(overview,gallery);
    const orbital=new T.Group();overview.add(orbital);
    const sphereRadius=2.9,stationScale=.62*Math.min(1,Math.sqrt(12/total));
    const orbitBase=new T.Vector2(.1,-.25),orbit=new T.Vector2(.1,-.25),orbitPointer=new T.Vector2(),orbitVelocity=new T.Vector2();
    let orbitDrag=null,suppressClick=false;
    const phi=(1+Math.sqrt(5))/2;
    const icosahedron=[[0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],[1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],[phi,0,1],[-phi,0,1],[phi,0,-1],[-phi,0,-1]].map(v=>new T.Vector3(...v).normalize());
    const directions=total===12?icosahedron:Array.from({length:total},(_,i)=>{
      const y=1-2*(i+.5)/total,r=Math.sqrt(1-y*y),angle=i*Math.PI*(3-Math.sqrt(5));
      return new T.Vector3(Math.cos(angle)*r,y,Math.sin(angle)*r);
    });
    const shadow = new T.Mesh(new T.PlaneGeometry(22,22),new T.ShadowMaterial({opacity:.13}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=-.12;shadow.receiveShadow=true;shadow.visible=false;overview.add(shadow);
    const grid = new T.GridHelper(16,16,0xbdbfb0,0xbdbfb0);
    grid.material.transparent=true;grid.material.opacity=.16;grid.position.y=-.095;grid.visible=false;overview.add(grid);
    function mesh(parent,geometry,material,x=0,y=0,z=0) {
      const value=new T.Mesh(geometry,material);value.position.set(x,y,z);
      value.castShadow=true;value.receiveShadow=true;parent.add(value);return value;
    }
    function box(parent,w,h,d,material,x=0,y=0,z=0) {return mesh(parent,new T.BoxGeometry(w,h,d),material,x,y,z);}
    function frame(parent,w,h,d,material) {
      const group=new T.Group();parent.add(group);
      box(group,w,.035,d,material,0,h/2,0);box(group,w,.035,d,material,0,-h/2,0);
      box(group,.035,h,d,material,w/2,0,0);box(group,.035,h,d,material,-w/2,0,0);return group;
    }
    function textTexture(code,name,index,panel=false) {
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=panel ? 900 : 256;
      const ctx=canvas.getContext('2d');
      if (!panel) {ctx.fillStyle='#d9dacd';ctx.fillRect(0,0,512,256);}
      ctx.strokeStyle='#8a8d7c';ctx.lineWidth=panel ? 1 : 3;
      ctx.strokeRect(16,16,480,canvas.height-32);
      ctx.fillStyle='#3f4539';ctx.textAlign=panel ? 'left' : 'center';
      ctx.font=panel ? '19px monospace' : '17px monospace';
      ctx.fillText(`K-${String(index+1).padStart(3,'0')} / KELEN`,panel ? 48 : 256,panel ? 76 : 210);
      ctx.font=panel ? '100px Georgia,serif' : 'italic 88px Georgia,serif';
      ctx.fillText(code,panel ? 48 : 256,panel ? 230 : 124);
      if (panel) {
        ctx.font='40px sans-serif';ctx.fillText(name,48,320);
        ctx.font='17px monospace';ctx.fillText('PERSONAL PROGRAM ARCHIVE',48,390);
        ctx.beginPath();ctx.moveTo(48,445);ctx.lineTo(464,445);ctx.stroke();
        ctx.font='15px monospace';ctx.fillText('IDEAS IN USE / OPEN FILE',48,489);
        ctx.globalAlpha=.34;
        for(let x=48;x<464;x+=17){ctx.beginPath();ctx.moveTo(x,545);ctx.lineTo(x,730);ctx.stroke();}
        ctx.globalAlpha=1;ctx.font='18px monospace';ctx.fillText(`${number(index)} / ${String(total).padStart(2,'0')}`,48,808);
      }
      const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
      texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture;
    }
    const actionArea={x:835,y:866,width:307,height:66};
    function demoTexture(index) {
      const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1000;
      const ctx=canvas.getContext('2d'),demo=window.createProgramDemo(index);
      ctx.fillStyle='#f1f5e9';ctx.fillRect(0,0,1200,1000);
      ctx.strokeStyle='#b4c4a8';ctx.lineWidth=2;ctx.strokeRect(21,21,1158,958);
      ctx.strokeStyle='#d1dcc6';ctx.strokeRect(34,34,1132,932);
      ctx.fillStyle='#697e60';ctx.font='24px monospace';ctx.fillText(`K-${String(index+1).padStart(3,'0')} / KELEN`,58,86);
      ctx.font='21px monospace';ctx.fillText('PERSONAL TOOL / FUNCTION DEMO',630,85);
      ctx.fillStyle='#354b3c';ctx.font='132px Georgia,serif';ctx.fillText(codes[index],58,251);
      ctx.font='55px sans-serif';ctx.fillText(names[index],402,186);
      ctx.fillStyle='#879b78';ctx.font='22px monospace';ctx.fillText((entries[index]?.tags||[]).join(' / '),405,236,690);
      ctx.beginPath();ctx.moveTo(58,296);ctx.lineTo(1142,296);ctx.strokeStyle='#aabf9b';ctx.stroke();
      ctx.fillStyle='#6a855a';ctx.font='24px sans-serif';ctx.fillText(index<4?'功能演示':'流程示意',58,344);
      ctx.font='19px monospace';ctx.fillText('FUNCTION / PREVIEW',920,341);
      ctx.fillStyle='#68835e';ctx.font='26px sans-serif';ctx.fillText(demo.caption,58,909,745);
      ctx.fillStyle='#20382a';ctx.fillRect(actionArea.x,actionArea.y,actionArea.width,actionArea.height);
      ctx.fillStyle='#f4f8ec';ctx.font='28px sans-serif';ctx.fillText(entries[index]?.action||'查看项目详情 ↗',actionArea.x+22,actionArea.y+43,actionArea.width-42);
      const source=archive.querySelectorAll('.program-card')[index];
      ctx.fillStyle='#8e9e83';ctx.font='20px monospace';ctx.fillText(`${number(index)} / ${String(total).padStart(2,'0')}`,58,952);
      ctx.textAlign='right';ctx.font='18px sans-serif';ctx.fillText(`${source.querySelector('.program-platform').textContent} · ${source.querySelector('.program-version').textContent}`,1142,965);ctx.textAlign='left';
      const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
      texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      const paint=time=>{demo.paint(time);ctx.drawImage(demo.canvas,58,380,1084,466);texture.needsUpdate=true;};
      paint(2.4);return {texture,paint};
    }
    const sphereUp=new T.Vector3(0,1,0);
    const faceNormal=new T.Vector3(),stationWorld=new T.Vector3(),cameraDirection=new T.Vector3();
    const orbitWorldRotation=new T.Quaternion(),stationFacing=new T.Quaternion().setFromEuler(new T.Euler(.04,-.2,0));
    const hits=[],stations=[];
    cards.forEach((card,index) => {
      const direction=directions[index%directions.length],id=entries[index]?.id;
      const group=new T.Group();group.position.copy(direction).multiplyScalar(sphereRadius);group.rotation.y=-.2;orbital.add(group);
      group.userData.program=index;
      box(group,1.76,.09,1.52,edge,0,0,0);
      box(group,1.66,.075,1.42,metal,0,.07,0);
      box(group,1.47,.035,1.25,warm,0,.125,0);
      const model=new T.Group();group.add(model);
      if(index===0) {
        mesh(model,new T.SphereGeometry(.39,40,28),glass,-.12,.6,0);
        const wire=new T.Mesh(new T.SphereGeometry(.4,16,12),new T.MeshBasicMaterial({color:0x8f9f8a,wireframe:true,transparent:true,opacity:.13}));
        wire.position.set(-.12,.6,0);model.add(wire);
        const solid=box(model,.35,.42,.35,metal,.34,.44,.17);solid.rotation.y=.25;
        const outline=new T.LineSegments(new T.EdgesGeometry(solid.geometry),new T.LineBasicMaterial({color:0xfafbf5,transparent:true,opacity:.72}));solid.add(outline);
      } else if(index===1) {
        for(let i=0;i<3;i++) {
          const sheet=frame(model,.79,.85,.045,metal);sheet.position.set((i-1)*.12,.7,(i-1)*.14);sheet.rotation.y=-.35;
          box(sheet,.75,.81,.015,glass);
        }
        const cursor=mesh(model,new T.ConeGeometry(.09,.22,3),edge,.45,.48,.37);cursor.rotation.z=.5;
      } else if(index===2) {
        mesh(model,new T.CylinderGeometry(.38,.48,.06,32),warm,0,.18,0);
        mesh(model,new T.CylinderGeometry(.045,.065,.32,20),edge,0,.37,0);
        box(model,.79,.5,.3,metal,0,.7,0);
        box(model,.25,.07,.22,edge,-.16,.98,0);
        const lens=mesh(model,new T.CylinderGeometry(.19,.21,.25,32),edge,.1,.72,.23);lens.rotation.x=Math.PI/2;
        const lensGlass=mesh(model,new T.CylinderGeometry(.157,.157,.012,32),glass,.1,.72,.36);lensGlass.rotation.x=Math.PI/2;
        mesh(model,new T.SphereGeometry(.035,12,8),accent,-.29,.86,.16);
      } else if(id==='voice') {
        for(let i=0;i<7;i++){const height=.25+Math.sin((i+1)*.8)**2*.63;box(model,.075,height,.12,i%2?accent:metal,(i-3)*.15,.25+height/2,0);}
        const ring=mesh(model,new T.TorusGeometry(.49,.024,8,48),warm,0,.64,0);ring.rotation.y=.2;
      } else if(id==='avatar') {
        mesh(model,new T.SphereGeometry(.17,24,16),glass,0,1.02,0);
        box(model,.3,.37,.18,metal,0,.63,0);
        const joints=[[-.23,.78,0],[-.4,.55,0],[.23,.78,0],[.4,1.04,0],[-.1,.41,0],[-.2,.19,.08],[.1,.41,0],[.25,.2,-.04]];
        for(const [x,y,z]of joints)mesh(model,new T.SphereGeometry(.055,12,8),accent,x,y,z);
        for(const [a,b]of [[[0,.78,0],joints[0]],[joints[0],joints[1]],[[0,.78,0],joints[2]],[joints[2],joints[3]],[[0,.43,0],joints[4]],[joints[4],joints[5]],[[0,.43,0],joints[6]],[joints[6],joints[7]]]){
          const av=new T.Vector3(...a),bv=new T.Vector3(...b),link=mesh(model,new T.CylinderGeometry(.035,.04,av.distanceTo(bv),12),metal);link.position.copy(av).add(bv).multiplyScalar(.5);link.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());
        }
      } else if(id==='translate') {
        for(let i=0;i<2;i++){const sheet=frame(model,.64,.78,.055,metal);sheet.position.set((i-.5)*.6,.68,(i-.5)*.25);sheet.rotation.y=-.24;box(sheet,.6,.74,.02,glass);for(let j=0;j<3;j++)box(sheet,.37-j*.05,.016,.012,accent,0,.15-j*.13,.04);}
      } else if(id==='studio') {
        box(model,1.15,.7,.045,metal,0,.52,-.4);box(model,.045,.7,.8,warm,-.55,.52,0);box(model,.7,.045,.4,metal,0,.46,.2);
        mesh(model,new T.SphereGeometry(.13,20,16),glass,.05,.88,.12);box(model,.22,.26,.13,accent,.05,.63,.12);
      } else if(id==='mobile') {
        box(model,.45,.9,.12,metal,.3,.69,.06);box(model,.37,.72,.015,glass,.3,.72,.13);box(model,.48,.5,.4,warm,-.32,.45,-.1);for(let i=0;i<3;i++)box(model,.28,.02,.03,accent,-.32,.4+i*.1,.12);
      } else if(id==='actors') {
        box(model,1.08,.71,.055,metal,0,.72,-.25);
        for(let row=0;row<2;row++)for(let col=0;col<4;col++)box(model,.15,.14,.02,(row+col)%3===0?accent:glass,-.35+col*.23,.57+row*.23,-.21);
        for(const x of [-.25,.25]){mesh(model,new T.SphereGeometry(.115,18,12),glass,x,.63,.25);box(model,.17,.25,.13,metal,x,.39,.25);}
      } else if(id==='computer') {
        box(model,.97,.61,.07,metal,.09,.75,-.1);box(model,.86,.49,.02,glass,.09,.75,-.05);
        box(model,.06,.22,.06,edge,.09,.35,-.1);box(model,.55,.04,.25,warm,.09,.23,-.03);box(model,.76,.035,.28,metal,.04,.18,.38);
        for(let i=0;i<3;i++)mesh(model,new T.SphereGeometry(.045,12,8),accent,-.24+i*.31,.75,-.015);
      } else if(id==='motion') {
        box(model,1.1,.65,.06,metal,0,.73,-.14);box(model,1,.55,.02,glass,0,.73,-.1);
        for(let i=0;i<3;i++)box(model,.18+i*.09,.045,.04,i===1?accent:warm,(i-1)*.26,.58+i*.15,-.05);
        box(model,.68,.035,.38,metal,0,.19,.35);box(model,.025,.42,.025,accent,.16,.75,-.02);
      } else if(id==='hueform') {
        const wheel=new T.Group();model.add(wheel);wheel.position.set(0,.74,0);wheel.rotation.x=.06;
        [0x92b2a0,0xb4a4c3,0xc4b78b,0x8da9c0,0xc39b9b,0xa5b27e].forEach((color,i)=>{
          const material=new T.MeshStandardMaterial({color,metalness:.18,roughness:.35});
          const swatch=box(wheel,.3,.3,.065,material,Math.cos(i*Math.PI/3)*.32,Math.sin(i*Math.PI/3)*.32,0);swatch.rotation.z=i*Math.PI/3;
        });mesh(wheel,new T.TorusGeometry(.47,.018,8,48),metal);mesh(wheel,new T.SphereGeometry(.12,20,12),glass,0,0,.1);
      } else if(id==='organs') {
        for(let i=0;i<4;i++){const sheet=box(model,.78,.75,.025,i===2?glass:metal,(i-1.5)*.1,.67,(i-1.5)*.16);sheet.rotation.y=-.3;}
        const organ=mesh(model,new T.SphereGeometry(.29,20,14),accent,.03,.68,.29);organ.scale.set(1,.74,.37);
        const cut=box(model,.025,.81,.64,glass,.05,.66,.1);cut.rotation.z=-.2;
      } else if(id==='knowledge') {
        const positions=[[-.44,.43,.04],[-.27,.94,-.08],[.07,.67,.23],[.4,1,-.04],[.47,.38,.08]];
        for(const [x,y,z]of positions)mesh(model,new T.SphereGeometry(.105,16,12),glass,x,y,z);
        for(const [a,b]of [[0,1],[0,2],[1,2],[2,3],[2,4],[3,4]]){
          const av=new T.Vector3(...positions[a]),bv=new T.Vector3(...positions[b]),link=mesh(model,new T.CylinderGeometry(.018,.018,av.distanceTo(bv),10),accent);link.position.copy(av).add(bv).multiplyScalar(.5);link.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());
        }
      } else if(id==='makgi') {
        for(let i=0;i<3;i++){const sheet=frame(model,.37,.48,.04,metal);sheet.position.set((i-1)*.4,.67,Math.sin(i)*.12);box(sheet,.33,.44,.015,glass);mesh(sheet,new T.SphereGeometry(.055,12,8),accent,0,.09,.04);box(sheet,.025,.15,.02,accent,0,-.05,.04);}
        box(model,1.12,.025,.04,accent,0,.29,.05);
      } else if(id==='mimg') {
        const boundary=frame(model,.85,.78,.055,metal);boundary.position.set(0,.67,0);box(boundary,.81,.74,.02,glass);
        mesh(model,new T.TorusGeometry(.23,.025,8,36),accent,0,.67,.07);mesh(model,new T.SphereGeometry(.085,16,12),glass,0,.67,.09);
      } else if(id==='pagepick'||id==='atelier') {
        for(let i=0;i<3;i++){const paper=box(model,.62,.7,.035,i===1?glass:metal,(i-1)*.17,.67,(i-1)*.18);paper.rotation.y=-.24;for(let j=0;j<3;j++)box(paper,.38,.017,.015,accent,0,.18-j*.13,.035);}
      } else {
        for(let i=0;i<5;i++) {
          const layer=box(model,.79,.065,.74,i%2 ? glass : metal,0,.23+i*.13,0);
          layer.rotation.y=(i-2)*.055;
          const trace=box(model,.32,.006,.025,accent,.07,.04,0);layer.add(trace);trace.position.set(.07,.04,0);
        }
        box(model,.3,.23,.28,warm,0,.91,0);
      }
      const restTexture=textTexture(codes[index],names[index],index),demo=demoTexture(index);
      const labelMaterial=new T.MeshBasicMaterial({map:restTexture,toneMapped:false});
      const label=mesh(group,new T.BoxGeometry(1.42,.035,.85),[metal,metal,labelMaterial,metal,metal,metal],0,.175,.6);
      label.rotation.y=-.1;
      hits.push(group);stations.push({group,model,label,labelMaterial,restTexture,demo,flight:0,index,direction,frontFacing:true});
    });
    const core=new T.Group();orbital.add(core);
    box(core,.67,.85,.67,glass,0,.52,0);
    const coreEdges=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.7,.88,.7)),new T.LineBasicMaterial({color:0x9caa8e,transparent:true,opacity:.8}));
    coreEdges.position.y=.52;core.add(coreEdges);
    const kCanvas=document.createElement('canvas');kCanvas.width=kCanvas.height=128;
    const kContext=kCanvas.getContext('2d');kContext.fillStyle='#75806c';kContext.font='bold 79px sans-serif';kContext.fillText('K.',15,98);
    const kTexture=new T.CanvasTexture(kCanvas);kTexture.colorSpace=T.SRGBColorSpace;
    const kFace=new T.Mesh(new T.PlaneGeometry(.42,.42),new T.MeshBasicMaterial({map:kTexture,transparent:true,depthWrite:false}));
    kFace.position.set(0,.55,.353);core.add(kFace);
    const wires=[];
    function sphereLine(points,opacity=.25){
      const geometry=new T.BufferGeometry().setFromPoints(points);
      const line=new T.Line(geometry,new T.LineBasicMaterial({color:0x9ba88d,transparent:true,opacity,depthWrite:false}));line.userData.points=points.length;orbital.add(line);wires.push(line);
    }
    for(let longitude=0;longitude<6;longitude++){
      const a=longitude*Math.PI/6;
      sphereLine(Array.from({length:97},(_,i)=>{const t=i/96*Math.PI*2;return new T.Vector3(Math.sin(t)*Math.cos(a)*sphereRadius,Math.cos(t)*sphereRadius,Math.sin(t)*Math.sin(a)*sphereRadius);}));
    }
    for(const latitude of [-Math.PI/3,-Math.PI/6,0,Math.PI/6,Math.PI/3]){
      sphereLine(Array.from({length:97},(_,i)=>{const t=i/96*Math.PI*2,r=Math.cos(latitude)*sphereRadius;return new T.Vector3(Math.cos(t)*r,Math.sin(latitude)*sphereRadius,Math.sin(t)*r);}),.19);
    }
    const globe=new T.Mesh(new T.SphereGeometry(sphereRadius-.07,48,32),new T.MeshPhysicalMaterial({color:0xe8eee1,roughness:.6,metalness:.04,transparent:true,opacity:.075,depthWrite:false,side:T.FrontSide}));orbital.add(globe);
    function focusSphere(index){
      const n=directions[index%directions.length];
      orbitBase.set(Math.atan2(n.y,Math.hypot(n.x,n.z)),-Math.atan2(n.x,n.z));orbitPointer.set(0,0);orbitVelocity.set(0,0);
    }

    const panels=[],ribs=[];
    const radius=6.2,step=.76,panelWidth=4.35,panelHeight=3.57;
    for(let i=0;i<total;i++) {
      const angle=0;
      const group=new T.Group();group.position.set(Math.sin(angle)*radius,1.92,-Math.cos(angle)*radius);group.rotation.y=-angle;
      group.userData.program=i;gallery.add(group);
      const material=new T.MeshPhysicalMaterial({color:0xf4f1df,roughness:.13,metalness:.04,transparent:true,opacity:.36,transmission:.23,thickness:.12,depthWrite:false,side:T.DoubleSide});
      const panel=box(group,panelWidth,panelHeight,.055,material);
      panel.castShadow=false;panel.receiveShadow=false;
      const borderMaterial=new T.LineBasicMaterial({color:0xb6b6a1,transparent:true,opacity:.65});
      const border=new T.LineSegments(new T.EdgesGeometry(panel.geometry),borderMaterial);panel.add(border);
      const demo=stations[i].demo;
      const ink=new T.MeshBasicMaterial({map:demo.texture,transparent:true,opacity:.98,depthWrite:false,side:T.DoubleSide,toneMapped:false});
      const print=new T.Mesh(new T.PlaneGeometry(panelWidth-.08,panelHeight-.08),ink);print.position.z=.031;print.userData.actionSurface=true;group.add(print);
      hits.push(group);panels.push({group,print,material,borderMaterial,ink,demo,index:i});
      for(let j=-2;j<=2;j++) {
        if(j===0)continue;
        const a=j*.027;
        const rib=new T.Mesh(new T.PlaneGeometry(panelWidth+.04,3.66),new T.MeshBasicMaterial({color:0xeaf3de,transparent:true,opacity:.075,side:T.DoubleSide,depthWrite:false}));
        rib.position.set(j*.035,0,-.05-Math.abs(j)*.025);rib.rotation.y=-a;group.add(rib);ribs.push(rib);
      }
    }
    // Open curved rails keep the separate files visible; no opaque cylinder shell.
    for(const y of [.04,3.86]) {
      const points=Array.from({length:65},(_,i)=>{
        const angle=-1.62+i/64*3.24;
        return new T.Vector3(Math.sin(angle)*(radius+.4),y,-Math.cos(angle)*(radius+.4));
      });
      const rail=mesh(gallery,new T.TubeGeometry(new T.CatmullRomCurve3(points),96,.027,8,false),metal);
      rail.castShadow=false;
    }
    gallery.visible=false;
    const raycaster=new T.Raycaster(),pointer=new T.Vector2();
    let current=0,view='overview',mix=0;
    let visible=false,raf,lastFrame,introStart,introDone=motion.matches,disposed=false;
    let demoTime=2.4,demoLastPaint=-Infinity,demoPaused=false;
    let previewIndex=-1;
    const eye=new T.Vector3(),target=new T.Vector3(),zoom=new T.Vector3(),panelScale=new T.Vector3();
    const flightWorld=new T.Vector3(),flightLocal=new T.Vector3(),flightDirection=new T.Vector3(),normal=new T.Vector3();
    const restPosition=new T.Vector3(0,.175,.6),restRotation=new T.Quaternion().setFromEuler(new T.Euler(0,-.1,0));
    const flightRotation=new T.Quaternion(),parentRotation=new T.Quaternion(),localRotation=new T.Quaternion();
    const flightEuler=new T.Euler(0,0,0,'YXZ');
    const overviewEye=new T.Vector3(0,5.4,11.5),overviewTarget=new T.Vector3(0,0,0);
    const galleryEye=new T.Vector3(0,2.08,.25),galleryTarget=new T.Vector3(0,1.92,-radius);
    const drift=new T.Vector2(),driftTarget=new T.Vector2();
    const smooth=p=>{const t=Math.max(0,Math.min(1,p));return t*t*(3-2*t);};
    const ready=()=>!root.classList.contains('intro-pending')&&!root.classList.contains('vortex-open');
    const start=()=>{if(!raf&&!disposed&&visible&&!document.hidden&&ready())raf=requestAnimationFrame(draw);};
    function finishIntro() {introDone=true;archive.classList.remove('program-opening');}
    function setPreview(index) {
      if(index===previewIndex)return;
      previewIndex=index;
      if(index>=0){demoTime=2.4;demoLastPaint=-Infinity;}
      callbacks.onPreview?.(index);start();
      if(motion.matches && visible)draw(performance.now());
    }
    function draw(now) {
      raf=undefined;if(disposed||!ready())return;
      if(introStart===undefined)introStart=now;
      const dt=Math.min(.05,(now-(lastFrame ?? now))/1000);lastFrame=now;
      const follow=motion.matches ? 1 : 1-Math.exp(-dt/ .19);
      if(!motion.matches && !demoPaused && (view==='records' || previewIndex>=0))demoTime+=dt;
      mix += ((view==='records' ? 1 : 0)-mix)*follow;
      if(Math.abs(mix-(view==='records' ? 1 : 0))<.0001)mix=view==='records' ? 1 : 0;
      const intro=introDone ? 1 : smooth((now-introStart)/1400);
      if(intro>=1)finishIntro();
      overview.visible=mix<.86;gallery.visible=mix>.03;
      overview.scale.setScalar(1-mix*.48);overview.rotation.y=-mix*.36;overview.position.y=-mix*.75;
      zoom.copy(overviewEye).multiplyScalar(1.12-.12*intro);
      eye.copy(zoom).lerp(galleryEye,mix);
      drift.lerp(driftTarget,motion.matches ? 1 : follow*.6);
      if(!motion.matches){eye.x+=drift.x*.28;eye.y+=drift.y*.15;}
      target.set(overviewTarget.x*intro,overviewTarget.y,0).lerp(galleryTarget,mix);
      camera.position.copy(eye);camera.lookAt(target);
      flightDirection.copy(target).sub(eye).normalize();
      flightWorld.copy(eye).addScaledVector(flightDirection,6.2);
      normal.copy(eye).sub(flightWorld).normalize();
      flightEuler.set(Math.atan2(Math.hypot(normal.x,normal.z),normal.y),Math.atan2(normal.x,normal.z),0,'YXZ');
      flightRotation.setFromEuler(flightEuler);
      if(view==='overview' && !orbitDrag?.moved && previewIndex<0){orbitBase.x+=orbitVelocity.x*dt;orbitBase.y+=orbitVelocity.y*dt;orbitVelocity.multiplyScalar(Math.exp(-dt*5));}
      orbitBase.x=Math.max(-1.3,Math.min(1.3,orbitBase.x));
      if(previewIndex<0||orbitDrag?.moved){orbit.x+=((orbitBase.x+orbitPointer.y*.28)-orbit.x)*follow;orbit.y+=((orbitBase.y+orbitPointer.x*.65)-orbit.y)*follow;}
      orbital.rotation.set(orbit.x,orbit.y,0,'XYZ');
      orbital.updateWorldMatrix(true,true);
      core.rotation.y=-Math.PI/5+(1-intro)*Math.PI*.7;
      core.scale.setScalar(1+.55*(1-intro));
      wires.forEach(line=>line.geometry.setDrawRange(0,Math.round(line.userData.points*smooth((intro-.15)/.48))));
      stations.forEach(station=>{
        const {group,label,labelMaterial,restTexture,demo,index}=station;
        const born=introDone ? 1 : smooth(((now-introStart)-150-index*35)/750);
        group.visible=born>.001;if(!group.visible)return;
        group.scale.setScalar(stationScale*(.62+.38*born));
        orbital.getWorldQuaternion(orbitWorldRotation);group.quaternion.copy(orbitWorldRotation).invert().multiply(stationFacing);
        const hover=index===previewIndex&&view==='overview' ? .12 : 0;
        group.position.copy(station.direction).multiplyScalar(sphereRadius-(1-born)*.7+hover);
        group.getWorldPosition(stationWorld);faceNormal.copy(station.direction).applyEuler(orbital.rotation);cameraDirection.copy(camera.position).sub(stationWorld).normalize();station.frontFacing=faceNormal.dot(cameraDirection)>.02;
        const goal=index===previewIndex && view==='overview' ? 1 : 0;
        station.flight += (goal-station.flight)*(motion.matches ? 1 : 1-Math.exp(-dt/.18));
        if(Math.abs(station.flight-goal)<.001)station.flight=goal;
        const p=smooth(station.flight),turn=smooth((p-.08)/.8),grow=smooth((p-.15)/.85);
        group.updateWorldMatrix(true,false);
        group.worldToLocal(flightLocal.copy(flightWorld));
        label.position.lerpVectors(restPosition,flightLocal,p);
        label.position.y+=Math.sin(p*Math.PI)*.32;
        group.getWorldQuaternion(parentRotation);
        localRotation.copy(parentRotation).invert().multiply(flightRotation);
        label.quaternion.slerpQuaternions(restRotation,localRotation,turn);
        label.scale.set(1+(3.45/1.42/stationScale-1)*grow,1,1+(2.875/.85/stationScale-1)*grow);
        label.castShadow=p<.28;
        const wantedTexture=p>.12 ? demo.texture : restTexture;
        if(labelMaterial.map!==wantedTexture){labelMaterial.map=wantedTexture;labelMaterial.needsUpdate=true;}
      });
      gallery.rotation.y=0;
      panels.forEach(({group,material,ink,borderMaterial,index})=>{
        const active=index===current;
        let offset=index-current;
        if(offset>total/2)offset-=total;if(offset<-total/2)offset+=total;
        const wasVisible=group.visible;group.visible=Math.abs(offset)<=2;
        if(!group.visible)return;
        group.scale.lerp(panelScale.set(active ? 1.04 : .93,active ? 1.04 : .93,1),follow);
        const angle=offset*step;
        const reach=radius-(active ? .22 : 0);
        const tracking=wasVisible?follow:1;
        group.position.x+=(Math.sin(angle)*reach-group.position.x)*tracking;
        group.position.z+=(-Math.cos(angle)*reach-group.position.z)*tracking;
        group.rotation.y+=(-angle-group.rotation.y)*tracking;
        material.opacity += ((active ? .58 : .2)*mix-material.opacity)*follow;
        ink.opacity += ((active ? .99 : .46)*mix-ink.opacity)*follow;
        borderMaterial.opacity= (active ? .7 : .3)*mix;
      });
      const demoIndex=view==='records' ? current : previewIndex;
      if(demoIndex>=0 && !demoPaused && !motion.matches && now-demoLastPaint>55) {
        stations[demoIndex].demo.paint(demoTime);demoLastPaint=now;
      }
      renderer.render(scene,camera);
      if(callbacks.onActionLayout) {
        const print=panels[current].print;
        const points=[[actionArea.x,actionArea.y],[actionArea.x+actionArea.width,actionArea.y],[actionArea.x+actionArea.width,actionArea.y+actionArea.height],[actionArea.x,actionArea.y+actionArea.height]].map(([x,y])=>{
          const p=print.localToWorld(new T.Vector3((x/1200-.5)*(panelWidth-.08),(.5-y/1000)*(panelHeight-.08),0)).project(camera);
          return {x:(p.x+1)*host.clientWidth/2,y:(1-p.y)*host.clientHeight/2};
        });
        const left=Math.min(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y));
        const width=Math.max(...points.map(p=>p.x))-left,height=Math.max(...points.map(p=>p.y))-top;
        callbacks.onActionLayout({left,top,width,height,visible:view==='records'&&mix>.9&&width>20&&height>8&&left<host.clientWidth&&left+width>0&&top<host.clientHeight&&top+height>0});
      }
      if(!motion.matches)start();
    }
    function resize() {
      const bounds=host.getBoundingClientRect();
      if(bounds.width<1||bounds.height<1)return;
      renderer.setSize(bounds.width,bounds.height,false);
      camera.aspect=bounds.width/bounds.height;
      camera.fov=camera.aspect<1.25 ? 44 : 37;
      overviewEye.set(0,5.4,Math.max(11.5,11.2/camera.aspect));
      galleryTarget.x=0;
      overviewTarget.x=0;
      camera.updateProjectionMatrix();
      start();if(motion.matches && visible)draw(performance.now());
    }
    function hit(event,withAction=false) {
      const rect=renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
      raycaster.setFromCamera(pointer,camera);
      const objects=(view==='overview' ? stations : panels).filter(x=>x.group.visible&&(view!=='overview'||x.frontFacing)).map(x=>x.group);
      const hits=raycaster.intersectObjects(objects,true);
      for(const hit of hits) {
        let node=hit.object;
        while(node&&node.userData.program===undefined)node=node.parent;
        if(node) {
          if(!withAction)return node.userData.program;
          const uv=hit.uv,x=uv?.x*1200,y=(1-(uv?.y??0))*1000;
          return {index:node.userData.program,action:hit.object.userData.actionSurface&&x>=actionArea.x&&x<=actionArea.x+actionArea.width&&y>=actionArea.y&&y<=actionArea.y+actionArea.height};
        }
      }
    }
    host.addEventListener('pointerdown',event=>{
      if(view!=='overview'||(event.pointerType==='mouse'&&event.button!==0))return;
      orbitDrag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,last:performance.now(),moved:false};
      orbitVelocity.set(0,0);host.setPointerCapture(event.pointerId);
    });
    host.addEventListener('pointermove',event=>{
      const bounds=host.getBoundingClientRect();
      if(orbitDrag&&orbitDrag.id===event.pointerId){
        const now=performance.now(),dx=event.clientX-orbitDrag.x,dy=event.clientY-orbitDrag.y,elapsed=Math.max(.016,(now-orbitDrag.last)/1000);
        if(Math.hypot(event.clientX-orbitDrag.startX,event.clientY-orbitDrag.startY)>5)orbitDrag.moved=true;
        if(orbitDrag.moved){
          event.preventDefault();setPreview(-1);orbitPointer.set(0,0);orbitBase.y+=dx*.008;orbitBase.x+=dy*.006;
          orbitVelocity.set(Math.max(-1.1,Math.min(1.1,dy*.006/elapsed)),Math.max(-1.8,Math.min(1.8,dx*.008/elapsed)));renderer.domElement.style.cursor='grabbing';
        }
        Object.assign(orbitDrag,{x:event.clientX,y:event.clientY,last:now});start();return;
      }
      if(event.pointerType!=='mouse')return;
      const x=(event.clientX-bounds.left)/bounds.width-.5,y=(event.clientY-bounds.top)/bounds.height-.5;
      driftTarget.set(x,-y);orbitPointer.set(x,-y);
      const index=hit(event);renderer.domElement.style.cursor=index===undefined?'grab':'pointer';
      if(view==='overview'){setPreview(index??-1);if(index!==undefined&&index!==current)callbacks.onSelect(index);}
    },{passive:false});
    function endOrbit(event){
      if(!orbitDrag||orbitDrag.id!==event.pointerId)return;
      suppressClick=orbitDrag.moved;if(event.type==='pointercancel')orbitVelocity.set(0,0);
      orbitDrag=null;if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId);
      renderer.domElement.style.cursor='grab';start();
    }
    host.addEventListener('pointerup',endOrbit);host.addEventListener('pointercancel',endOrbit);
    host.addEventListener('pointerleave',event=>{
      if(orbitDrag)return;driftTarget.set(0,0);orbitPointer.set(0,0);renderer.domElement.style.cursor='grab';
      if(!event.relatedTarget?.closest?.('.plugin-vault-top,.plugin-scene-controls,.plugin-inspector'))setPreview(-1);
    });
    archive.addEventListener('pointerleave',()=>{if(!orbitDrag)setPreview(-1);});
    host.addEventListener('click',event=>{
      if(suppressClick){suppressClick=false;event.preventDefault();event.stopPropagation();return;}
      const target=hit(event,true);if(target){if(view==='overview')callbacks.onOpen(target.index);else if(target.action)callbacks.onAction?.(target.index);else callbacks.onSelect(target.index);}
    });
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(visible) {
        if(introStart===undefined && ready())introStart=performance.now();
        if(!introDone)archive.classList.add('program-opening');
        resize();start();
      } else {cancelAnimationFrame(raf);raf=undefined;lastFrame=undefined;}
    },{threshold:0,rootMargin:'-5% 0px -12% 0px'});
    observer.observe(host);
    new MutationObserver(()=>{
      if(!ready()){cancelAnimationFrame(raf);raf=undefined;lastFrame=undefined;}else start();
    }).observe(root,{attributes:true,attributeFilter:['class']});
    const sizing=new ResizeObserver(resize);sizing.observe(host);
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){cancelAnimationFrame(raf);raf=undefined;lastFrame=undefined;}else start();
    });
    motion.addEventListener('change',()=>{finishIntro();mix=view==='records' ? 1 : 0;start();if(visible)draw(performance.now());});
    renderer.domElement.addEventListener('webglcontextlost',event=>{
      event.preventDefault();disposed=true;cancelAnimationFrame(raf);host.remove();archive.classList.remove('has-depth','program-opening');
      archive.querySelector('.plugin-stations').hidden=false;
      archive.querySelector('.plugin-cylinder').hidden=false;
      callbacks.onUnavailable?.();
    });
    archive.classList.add('has-depth');
    if(!motion.matches)archive.classList.add('program-opening');
    archive.querySelector('.plugin-stations').hidden=true;
    archive.querySelector('.plugin-cylinder').hidden=true;
    resize();
    return {setState(index,nextView,options={}) {
      if(current!==index){demoTime=2.4;demoLastPaint=-Infinity;}
      if(nextView==='overview'&&(view!=='overview'||options.focus))focusSphere(index);
      current=index;view=nextView;
      if(view==='records')setPreview(-1);
      if(view==='records')finishIntro();
      start();if(motion.matches && visible)draw(performance.now());
    },setDemoPaused(value){demoPaused=value;start();},setPreview};
  };
})();
