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
    const overview = new T.Group(),gallery = new T.Group();scene.add(overview,gallery);
    const shadow = new T.Mesh(new T.PlaneGeometry(22,22),new T.ShadowMaterial({opacity:.13}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=-.12;shadow.receiveShadow=true;overview.add(shadow);
    const grid = new T.GridHelper(16,16,0xbdbfb0,0xbdbfb0);
    grid.material.transparent=true;grid.material.opacity=.16;grid.position.y=-.095;overview.add(grid);
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
      ctx.fillText(`K-00${index+1} / KELEN`,panel ? 48 : 256,panel ? 76 : 210);
      ctx.font=panel ? '100px Georgia,serif' : 'italic 88px Georgia,serif';
      ctx.fillText(code,panel ? 48 : 256,panel ? 230 : 124);
      if (panel) {
        ctx.font='40px sans-serif';ctx.fillText(name,48,320);
        ctx.font='17px monospace';ctx.fillText('PERSONAL PROGRAM ARCHIVE',48,390);
        ctx.beginPath();ctx.moveTo(48,445);ctx.lineTo(464,445);ctx.stroke();
        ctx.font='15px monospace';ctx.fillText('IDEAS IN USE / OPEN FILE',48,489);
        ctx.globalAlpha=.34;
        for(let x=48;x<464;x+=17){ctx.beginPath();ctx.moveTo(x,545);ctx.lineTo(x,730);ctx.stroke();}
        ctx.globalAlpha=1;ctx.font='18px monospace';ctx.fillText(`0${index+1} / 04`,48,808);
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
      ctx.fillStyle='#697e60';ctx.font='24px monospace';ctx.fillText(`K-00${index+1} / KELEN`,58,86);
      ctx.font='21px monospace';ctx.fillText('PERSONAL TOOL / FUNCTION DEMO',630,85);
      ctx.fillStyle='#354b3c';ctx.font='132px Georgia,serif';ctx.fillText(codes[index],58,251);
      ctx.font='55px sans-serif';ctx.fillText(names[index],402,186);
      ctx.fillStyle='#879b78';ctx.font='22px monospace';ctx.fillText(['MATTER / INTERACTION','FRAME / CAPTURE','VOICE / RECORD','TASKS / FOCUS'][index],405,236);
      ctx.beginPath();ctx.moveTo(58,296);ctx.lineTo(1142,296);ctx.strokeStyle='#aabf9b';ctx.stroke();
      ctx.fillStyle='#6a855a';ctx.font='24px sans-serif';ctx.fillText('功能演示',58,344);
      ctx.font='19px monospace';ctx.fillText('FUNCTION / PREVIEW',920,341);
      ctx.fillStyle='#68835e';ctx.font='26px sans-serif';ctx.fillText(demo.caption,58,909,745);
      ctx.fillStyle='#20382a';ctx.fillRect(actionArea.x,actionArea.y,actionArea.width,actionArea.height);
      ctx.fillStyle='#f4f8ec';ctx.font='28px sans-serif';ctx.fillText(index===0 ? '打开网页版  ↗' : '下载 Mac 版  ↓',actionArea.x+22,actionArea.y+43);
      const source=archive.querySelectorAll('.program-card')[index];
      ctx.fillStyle='#8e9e83';ctx.font='20px monospace';ctx.fillText(`0${index+1} / 04`,58,952);
      ctx.textAlign='right';ctx.font='18px sans-serif';ctx.fillText(`${source.querySelector('.program-platform').textContent} · ${source.querySelector('.program-version').textContent}`,1142,965);ctx.textAlign='left';
      const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
      texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      const paint=time=>{demo.paint(time);ctx.drawImage(demo.canvas,58,380,1084,466);texture.needsUpdate=true;};
      paint(2.4);return {texture,paint};
    }
    const codes=['PHY','CAP','REC','AI'];
    const names=[...archive.querySelectorAll('.program-card h3')].map(node=>node.textContent);
    const positions=[[-1.65,-1.65],[1.65,-1.65],[-1.65,1.65],[1.65,1.65]];
    const hits=[],stations=[];
    positions.forEach(([x,z],index) => {
      const group=new T.Group();group.position.set(x,0,z);overview.add(group);
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
      hits.push(group);stations.push({group,model,label,labelMaterial,restTexture,demo,flight:0,index});
    });
    const core=new T.Group();overview.add(core);
    box(core,.67,.85,.67,glass,0,.52,0);
    const coreEdges=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.7,.88,.7)),new T.LineBasicMaterial({color:0x9caa8e,transparent:true,opacity:.8}));
    coreEdges.position.y=.52;core.add(coreEdges);
    const kCanvas=document.createElement('canvas');kCanvas.width=kCanvas.height=128;
    const kContext=kCanvas.getContext('2d');kContext.fillStyle='#75806c';kContext.font='bold 79px sans-serif';kContext.fillText('K.',15,98);
    const kTexture=new T.CanvasTexture(kCanvas);kTexture.colorSpace=T.SRGBColorSpace;
    const kFace=new T.Mesh(new T.PlaneGeometry(.42,.42),new T.MeshBasicMaterial({map:kTexture,transparent:true,depthWrite:false}));
    kFace.position.set(0,.55,.353);core.add(kFace);
    const wires=[];
    for(const [x,z] of positions) {
      const points=[];
      for(let i=0;i<24;i++){const p=i/23;points.push(new T.Vector3(x*p,-.075,z*p));}
      const geometry=new T.BufferGeometry().setFromPoints(points);
      const line=new T.Line(geometry,new T.LineBasicMaterial({color:0x9b9f8d,transparent:true,opacity:.6}));overview.add(line);wires.push(line);
    }

    const panels=[],ribs=[];
    const radius=6.2,step=.76,panelWidth=4.35,panelHeight=3.57;
    for(let i=0;i<4;i++) {
      const angle=(i-1.5)*step;
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
        const a=angle+j*.027;
        const rib=new T.Mesh(new T.PlaneGeometry(panelWidth+.04,3.66),new T.MeshBasicMaterial({color:0xeaf3de,transparent:true,opacity:.075,side:T.DoubleSide,depthWrite:false}));
        rib.position.set(Math.sin(a)*(radius+.28),1.92,-Math.cos(a)*(radius+.28));rib.rotation.y=-a;gallery.add(rib);ribs.push(rib);
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
    let current=0,view='overview',mix=0,selectedAngle=-1.5*step;
    let visible=false,raf,lastFrame,introStart,introDone=motion.matches,disposed=false;
    let demoTime=2.4,demoLastPaint=-Infinity,demoPaused=false;
    let previewIndex=-1;
    const eye=new T.Vector3(),target=new T.Vector3(),zoom=new T.Vector3(),panelScale=new T.Vector3();
    const flightWorld=new T.Vector3(),flightLocal=new T.Vector3(),flightDirection=new T.Vector3(),normal=new T.Vector3();
    const restPosition=new T.Vector3(0,.175,.6),restRotation=new T.Quaternion().setFromEuler(new T.Euler(0,-.1,0));
    const flightRotation=new T.Quaternion(),parentRotation=new T.Quaternion(),localRotation=new T.Quaternion();
    const flightEuler=new T.Euler(0,0,0,'YXZ');
    const overviewEye=new T.Vector3(5.4,6.5,7.7),overviewTarget=new T.Vector3(0,.45,0);
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
      zoom.set(3.7,3.7,5.4).lerp(overviewEye,intro);
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
      core.rotation.y=-Math.PI/5+(1-intro)*Math.PI*.7;
      core.scale.setScalar(1+.55*(1-intro));
      wires.forEach(line=>line.geometry.setDrawRange(0,Math.round(24*smooth((intro-.15)/.48))));
      stations.forEach(station=>{
        const {group,label,labelMaterial,restTexture,demo,index}=station;
        const born=introDone ? 1 : smooth(((now-introStart)-280-index*90)/750);
        group.visible=born>.001;
        group.scale.setScalar(.62+.38*born);
        const hover=index===previewIndex && view==='overview' ? .06 : 0;
        const desired=-(1-born)*.65+hover;
        group.position.y += (desired-group.position.y)* (introDone ? follow : 1);
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
        label.scale.set(1+(3.45/1.42-1)*grow,1,1+(2.875/.85-1)*grow);
        label.castShadow=p<.28;
        const wantedTexture=p>.12 ? demo.texture : restTexture;
        if(labelMaterial.map!==wantedTexture){labelMaterial.map=wantedTexture;labelMaterial.needsUpdate=true;}
      });
      const goal=(current-1.5)*step;
      selectedAngle += (goal-selectedAngle)*follow;
      gallery.rotation.y=selectedAngle;
      panels.forEach(({group,material,ink,borderMaterial,index})=>{
        const active=index===current;
        group.scale.lerp(panelScale.set(active ? 1.04 : .93,active ? 1.04 : .93,1),follow);
        const angle=(index-1.5)*step;
        const reach=radius-(active ? .22 : 0);
        group.position.x+=(Math.sin(angle)*reach-group.position.x)*follow;
        group.position.z+=(-Math.cos(angle)*reach-group.position.z)*follow;
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
      galleryTarget.x=0;
      overviewTarget.x=0;
      camera.updateProjectionMatrix();
      start();if(motion.matches && visible)draw(performance.now());
    }
    function hit(event,withAction=false) {
      const rect=renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
      raycaster.setFromCamera(pointer,camera);
      const objects=view==='overview' ? stations.map(x=>x.group) : panels.map(x=>x.group);
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
    host.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse')return;
      const bounds=host.getBoundingClientRect();
      driftTarget.set((event.clientX-bounds.left)/bounds.width-.5,-((event.clientY-bounds.top)/bounds.height-.5));
      const index=hit(event);renderer.domElement.style.cursor=index===undefined ? 'default' : 'pointer';
      if(view==='overview') {
        setPreview(index ?? -1);
        if(index!==undefined && index!==current)callbacks.onSelect(index);
      }
    },{passive:true});
    host.addEventListener('pointerleave',event=>{
      driftTarget.set(0,0);renderer.domElement.style.cursor='default';
      if(!event.relatedTarget?.closest?.('.plugin-vault-top,.plugin-scene-controls,.plugin-inspector'))setPreview(-1);
    });
    archive.addEventListener('pointerleave',()=>setPreview(-1));
    host.addEventListener('click',event=>{
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
    motion.addEventListener('change',()=>{finishIntro();mix=view==='records' ? 1 : 0;selectedAngle=(current-1.5)*step;start();if(visible)draw(performance.now());});
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
    return {setState(index,nextView) {
      if(current!==index){demoTime=2.4;demoLastPaint=-Infinity;}
      current=index;view=nextView;
      if(view==='records')setPreview(-1);
      if(view==='records')finishIntro();
      start();if(motion.matches && visible)draw(performance.now());
    },setDemoPaused(value){demoPaused=value;start();},setPreview};
  };
})();
