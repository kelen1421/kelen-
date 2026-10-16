/* Bind the image-textured depth character to the original line actor's joints.
   The profile reveal remains the only motion clock. All contact points come from it. */
(function(global){
'use strict';
function createPaperCharacter3D(canvas,options={}) {
 const T=global.THREE,data=global.KelenPaperVolume;if(!T||!data)return null;
 let renderer;
 try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,premultipliedAlpha:true});}catch(error){return null;}
 renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NoToneMapping;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(0,1440,1180,0,.1,4000);camera.position.z=1000;
 scene.add(new T.HemisphereLight(0xfff8e5,0x687653,1.6));const light=new T.DirectionalLight(0xfffaed,1.8);light.position.set(-200,900,600);scene.add(light);
 const bones=[],byName={},absolute={};
 data.definitions.forEach(([name,label,parent,p])=>{const b=new T.Bone();b.name=name;b.userData.label=label;const q=parent?absolute[parent]:[0,0,0];b.position.set(p[0]-q[0],p[1]-q[1],p[2]-q[2]);if(parent)byName[parent].add(b);bones.push(b);byName[name]=b;absolute[name]=p;});
 // Every source vertex has one shared set of weights. Adjacent triangles stay
 // welded while the joint turns; no limb faces or disconnected islands are cut away.
 const boneIndex=Object.fromEntries(bones.map((bone,i)=>[bone.name,i]));
 function inside(x,y,polygon){let hit=false;for(let i=0,k=polygon.length-1;i<polygon.length;k=i++){const a=polygon[i],b=polygon[k];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
 function distance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy);}
 const chains={
  right:[['Chest',[623,499],[720,488]],['UpperArm_R',[753,488],[806,557]],['LowerArm_R',[806,557],[861,607]],['Hand_R',[861,607],[940,608]]],
  left:[['Chest',[623,499],[530,495]],['UpperArm_L',[513,495],[424,605]],['LowerArm_L',[424,605],[470,678]],['Hand_L',[470,678],[510,684]]],
  legL:[['Hips',[612,790],[568,812]],['UpperLeg_L',[568,812],[569,856]],['LowerLeg_L',[569,856],[590,983]],['Foot_L',[590,983],[545,1108]]],
  legR:[['Hips',[612,790],[654,814]],['UpperLeg_R',[654,814],[696,872]],['LowerLeg_R',[696,872],[737,1036]],['Foot_R',[737,1036],[775,1144]]]
 };
 function blend(a,b,u){return[[boneIndex[a],1-u],[boneIndex[b],u]];}
 function skinAt(x,y){
  if(y<400)return[[boneIndex.Head,1]];
  if(y<464&&x>525&&x<720){if(y<432)return blend('Head','Neck',(y-400)/32);return blend('Neck','Chest',(y-432)/32);}
  if(inside(x,y,[[404,631],[444,641],[455,667],[496,643],[526,657],[518,684],[507,708],[462,728],[425,716],[397,687]]))return[[boneIndex.Hand_L,1]];
  if(inside(x,y,[[390,455],[575,486],[599,775],[451,812],[392,731]]))return[[boneIndex.Folder,1]];
  if(x>720&&y>460&&y<700){
   // Each rigid sleeve owns its surface. Blend only within a short hinge band;
   // the palm can no longer drag the whole forearm into an S-shaped curve.
   const smooth=(a,b,value)=>{const u=Math.max(0,Math.min(1,(value-a)/(b-a)));return u*u*(3-2*u);};
   const wrist=((x-861)*55+(y-607)*50)/Math.hypot(55,50);
   if(wrist>=7)return[[boneIndex.Hand_R,1]];
   if(wrist>-9)return blend('LowerArm_R','Hand_R',smooth(-9,7,wrist));
   const hinge=((x-806)*53+(y-557)*69)/Math.hypot(53,69);
   if(hinge>-9)return blend('UpperArm_R','LowerArm_R',smooth(-9,9,hinge));
   const shoulder=((x-753)*53+(y-488)*69)/Math.hypot(53,69);
   return blend('Shoulder_R','UpperArm_R',smooth(-10,10,shoulder));
  }
  let chain;
  if(y>795){
   if(x<635&&y>937)return[[boneIndex.Foot_L,1]];
   if(x>=635&&y>990)return[[boneIndex.Foot_R,1]];
   chain=x<635?chains.legL:chains.legR;
  }else if(x<535&&y>450&&y<745)chain=chains.left;
  else return[[boneIndex.Chest,1]];
  const scored=chain.map(([name,a,b])=>[boneIndex[name],1/Math.pow(distance(x,y,a,b)+8,4)]).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=scored.reduce((n,p)=>n+p[1],0);
  return scored.map(([i,w])=>[i,w/sum]);
 }
 const ids=[],weights=[];
 for(let i=0;i<data.position.length/3;i++){
  const values=skinAt(data.uv[i*2]*1254,data.uv[i*2+1]*1254);
  for(let j=0;j<4;j++){ids.push(values[j]?.[0]||0);weights.push(values[j]?.[1]||0);}
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(data.position,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(data.uv,2));geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(ids,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));const frontFaces=[];
 for(let i=0;i<data.groups[0][1];i+=3){const tri=data.indices.slice(i,i+3),longest=Math.max(...tri.map((a,j)=>{const b=tri[(j+1)%3];return Math.hypot((data.uv[a*2]-data.uv[b*2])*1254,(data.uv[a*2+1]-data.uv[b*2+1])*1254);}));if(longest<64)frontFaces.push(...tri);}
 const sourceCount=data.position.length/6,backFaces=[],sideFaces=[];
 for(let i=0;i<frontFaces.length;i+=3)backFaces.push(frontFaces[i]+sourceCount,frontFaces[i+2]+sourceCount,frontFaces[i+1]+sourceCount);
 for(let i=data.groups[2][0];i<data.indices.length;i+=3){const tri=data.indices.slice(i,i+3),longest=Math.max(...tri.map((a,j)=>{const b=tri[(j+1)%3];return Math.hypot((data.uv[a*2]-data.uv[b*2])*1254,(data.uv[a*2+1]-data.uv[b*2+1])*1254);}));if(longest<64)sideFaces.push(...tri);}
 geometry.setIndex([...frontFaces,...backFaces,...sideFaces]);geometry.addGroup(0,frontFaces.length,0);geometry.addGroup(frontFaces.length,backFaces.length+sideFaces.length,1);geometry.computeVertexNormals();
 const texture=new T.Texture();texture.flipY=false;texture.colorSpace=T.SRGBColorSpace;
 const front=new T.MeshBasicMaterial({map:texture,alphaTest:.20,side:T.DoubleSide,toneMapped:false});
 // The closed paper shell remains visible around bent joints.
 const side=new T.MeshStandardMaterial({map:texture,color:0xe3dece,alphaTest:.20,roughness:.97,side:T.DoubleSide,transparent:false,opacity:1,depthWrite:true});
 const mesh=new T.SkinnedMesh(geometry,[front,side]);mesh.name='LineDrivenPaperExplorer';mesh.frustumCulled=false;mesh.add(bones[0]);scene.add(mesh);scene.updateMatrixWorld(true);
 const skeleton=new T.Skeleton(bones);mesh.bind(skeleton);mesh.normalizeSkinWeights();
 const bindWorld=bones.map(b=>b.matrixWorld.clone());bones.forEach(b=>b.matrixAutoUpdate=false);
 // Small paper sleeves cover the interior of the shared elbow/knee bends.
 const limbMaterial=new T.MeshStandardMaterial({color:0xe2ddcb,roughness:.95,flatShading:true});
 const limbSleeves=Array.from({length:8},(_,i)=>{const g=new T.CylinderGeometry(.85,1,1,6,8),p=g.attributes.position;for(let k=0;k<p.count;k++){const u=p.getY(k)+.5;p.setX(k,p.getX(k)+Math.sin(Math.PI*u)*.08);}g.computeVertexNormals();const m=new T.Mesh(g,limbMaterial);scene.add(m);return m;});
 const jointCovers=Array.from({length:10},()=>{const m=new T.Mesh(new T.SphereGeometry(1,10,8),limbMaterial);scene.add(m);return m;});
 let ready=false,lastState=null,viewWidth=0,viewHeight=0,pixelScale=0;
 const image=new Image();image.onload=()=>{texture.image=image;texture.needsUpdate=true;ready=true;options.onReady?.();if(lastState)draw(lastState);};image.src=options.src||'assets/kelen-paper-character.png';
 const unit=4.1/(data.sourceBounds[3]-1),ground=data.sourceBounds[1]+data.sourceBounds[3]-1;
 const source=(x,y)=>new T.Vector3((x-620)*unit,(ground-y)*unit,0);
 const v=(p,h,z=0)=>new T.Vector3(p[0],h-p[1],z);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function sourceFrame(a,b){const x=b.clone().sub(a).normalize(),z=new T.Vector3(0,0,1),y=z.clone().cross(x).normalize();return new T.Matrix4().makeBasis(x,y,z).setPosition(a);}
 function segment(a,b,start,end,h,crossScale=.27,zScale=.74){
   const p=source(...a),q=source(...b),s=v(start,h),e=v(end,h),length=Math.max(.001,e.distanceTo(s));
   const target=sourceFrame(s,e),scale=new T.Matrix4().makeScale(length/p.distanceTo(q),crossScale/unit,crossScale/unit*zScale);
   return target.multiply(scale).multiply(sourceFrame(p,q).invert());
 }
 function rigid(pixel,point,h,scale=.27,rotation=0,yaw=0){
   const target=v(point,h),q=new T.Quaternion().setFromEuler(new T.Euler(0,yaw,rotation));
   return new T.Matrix4().compose(target,q,new T.Vector3(scale/unit,scale/unit,scale/unit*.74)).multiply(new T.Matrix4().makeTranslation(...source(...pixel).multiplyScalar(-1).toArray()));
 }
 function draw(state){
   lastState=state;if(!ready||!state.joints)return;
   const {t,x,y,width,height,scale,edge,joints:J,localJoints:j,gripping,seated}=state;
   const topInset=state.topInset||0,viewportHeight=height+topInset;
   if(viewWidth!==width||viewHeight!==viewportHeight||pixelScale!==scale){viewWidth=width;viewHeight=viewportHeight;pixelScale=scale;renderer.setSize(Math.max(1,Math.round(width*scale)),Math.max(1,Math.round(viewportHeight*scale)),false);canvas.style.height=`${viewportHeight*scale}px`;canvas.style.top=`${-topInset*scale}px`;camera.right=width;camera.top=viewportHeight;camera.updateProjectionMatrix();}
   // Keep the reference's hip and shoulder anchors together. The action clock
   // supplies targets; bounded two-link chains preserve filled limb proportions.
   const root=[x,y],P={...J};
   P.sl=[x+(J.sl[0]-x)*.86,y+(J.sl[1]-y)*.72];P.sr=[x+(J.sr[0]-x)*.86,y+(J.sr[1]-y)*.72];
   function toward(a,b,length){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;return[a[0]+dx/d*length,a[1]+dy/d*length];}
   function elbow(start,target,hint,upper=47,lower=47,fixedBend=false){
    let dx=target[0]-start[0],dy=target[1]-start[1],d=Math.hypot(dx,dy)||1;
    if(d>upper+lower-.5){target=toward(start,target,upper+lower-.5);dx=target[0]-start[0];dy=target[1]-start[1];d=upper+lower-.5;}
    const q=(upper*upper-lower*lower+d*d)/(2*d),h=Math.sqrt(Math.max(0,upper*upper-q*q)),c=[start[0]+dx/d*q,start[1]+dy/d*q],a=[c[0]-dy/d*h,c[1]+dx/d*h],b=[c[0]+dy/d*h,c[1]-dx/d*h];
    return{joint:fixedBend?b:Math.hypot(a[0]-hint[0],a[1]-hint[1])<Math.hypot(b[0]-hint[0],b[1]-hint[1])?a:b,end:target};
   }
   const leftTarget=[x+(J.wl[0]-x)*.82,y+(J.wl[1]-y)*.55];
   // Raising the shoulder provides reach while the sleeve keeps a fixed length.
   if(gripping)P.sr[1]=Math.min(P.sr[1],J.wr[1]+72);
   const armL=elbow(P.sl,leftTarget,J.el,38,30),armR=elbow(P.sr,J.wr,J.er,39,40,true);
   P.el=armL.joint;P.wl=armL.end;P.er=armR.joint;P.wr=armR.end;
   const shoulder=[(P.sl[0]+P.sr[0])*.5,(P.sl[1]+P.sr[1])*.5],headPivot=[shoulder[0]+(J.head[0]-x)*.3,shoulder[1]-22];
   const hipL=[x-12,y+4],hipR=[x+12,y+4],rightKnee=toward(hipR,J.kr,37);
   const footScale=.25,leftGoal=[J.al[0],J.al[1]+18-(1147-983)*footScale];
   const freeKnee=toward(hipL,J.kl,35),freeAnkle=toward(freeKnee,leftGoal,37);
   const planted=elbow(hipL,leftGoal,J.kl,35,37),plant=state.leftFootContact||0;
   const mixPoint=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];
   const leftKnee=mixPoint(freeKnee,planted.joint,plant),leftAnkle=mixPoint(freeAnkle,planted.end,plant);
   const rightAnkle=toward(rightKnee,[J.ar[0],J.ar[1]-25],40);
   const transforms={};
   const torso=segment([612,790],[623,499],root,shoulder,height,.27);
   transforms.Hips=rigid([612,790],root,height,.27);transforms.Spine=torso;transforms.Chest=torso;
   transforms.Neck=segment([623,499],[626,422],shoulder,headPivot,height,.27);
   const lean=clamp(Math.atan2(headPivot[0]-shoulder[0],22)*.25,-.12,.12);
   transforms.Head=rigid([626,422],headPivot,height,.27,-lean,Math.sin(t*Math.PI/3)*.018);
   transforms.Shoulder_L=segment([623,499],[513,495],shoulder,P.sl,height);
   transforms.Shoulder_R=segment([623,499],[753,488],shoulder,P.sr,height);
   transforms.UpperArm_L=segment([513,495],[424,605],P.sl,P.el,height);
   transforms.LowerArm_L=segment([424,605],[470,678],P.el,P.wl,height);
   transforms.UpperArm_R=segment([753,488],[806,557],P.sr,P.er,height);
   transforms.LowerArm_R=segment([806,557],[861,607],P.er,P.wr,height);
   const restingAngle=t<.17?Math.atan2(-.86,-.5):Math.atan2(1,.25);
   const contact=clamp((t-2.18)/.47,0,1),contactEase=contact*contact*(3-2*contact);
   const desiredAngle=gripping?-Math.PI/2:restingAngle+(Math.atan2(.08,1)-restingAngle)*contactEase;
   // Limit wrist rotation relative to the sleeve, using the shortest angle.
   const forearmTurn=Math.atan2(P.wr[1]-P.er[1],P.wr[0]-P.er[0])-Math.atan2(50,55);
   const restHandAngle=Math.atan2(1,79),wanted=desiredAngle;
   const wristDelta=Math.atan2(Math.sin(wanted-forearmTurn-restHandAngle),Math.cos(wanted-forearmTurn-restHandAngle));
   const handAngle=forearmTurn+restHandAngle+clamp(wristDelta,-.65,.65);
   const rightDirection=[Math.cos(handAngle),Math.sin(handAngle)];
   const leftDirection=t<.17?[.6,-.8]:[.7,.3];
   transforms.Hand_L=segment([470,678],[510,684],P.wl,[P.wl[0]+leftDirection[0]*12,P.wl[1]+leftDirection[1]*12],height);
   transforms.Folder=rigid([470,678],P.wl,height,.27,.035*Math.sin(t*Math.PI/3));
   transforms.Hand_R=segment([861,607],[940,608],P.wr,[P.wr[0]+rightDirection[0]*22,P.wr[1]+rightDirection[1]*22],height);
   transforms.Fingers_R=transforms.Hand_R;transforms.Thumb_R=transforms.Hand_R;
   transforms.UpperLeg_L=segment([568,812],[569,856],hipL,leftKnee,height,.29);
   transforms.LowerLeg_L=segment([569,856],[590,983],leftKnee,leftAnkle,height,.29);
   transforms.Foot_L=rigid([590,983],leftAnkle,height,footScale);
   transforms.UpperLeg_R=segment([654,814],[696,872],hipR,rightKnee,height,.29);
   transforms.LowerLeg_R=segment([696,872],[737,1036],rightKnee,rightAnkle,height,.29);
   transforms.Foot_R=rigid([737,1036],rightAnkle,height,footScale,seated?.05:0);
   const sleeves=[[hipL,leftKnee,10],[leftKnee,leftAnkle,8],[hipR,rightKnee,10],[rightKnee,rightAnkle,8],[P.sl,P.el,10],[P.el,P.wl,8],[P.sr,P.er,10],[P.er,P.wr,8]];
   sleeves.forEach(([a,b,r],i)=>{const start=v(a,height,-12),end=v(b,height,-12),direction=end.clone().sub(start);limbSleeves[i].position.copy(start).add(end).multiplyScalar(.5);limbSleeves[i].scale.set(r,direction.length()+3,r*.7);limbSleeves[i].quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());});
   [leftKnee,rightKnee,leftAnkle,rightAnkle,P.sl,P.sr,P.el,P.er,P.wl,P.wr].forEach((p,i)=>{jointCovers[i].position.copy(v(p,height,-10));jointCovers[i].scale.set(i<4?8:9,i<4?8:9,5);});
   const worldMatrices={};
   bones.forEach((bone,i)=>{
     const desired=(transforms[bone.name]||transforms.Hips).clone().multiply(bindWorld[i]);worldMatrices[bone.name]=desired;
     if(bone.parent?.isBone)bone.matrix.copy(worldMatrices[bone.parent.name]).invert().multiply(desired);else bone.matrix.copy(desired);
     bone.matrixWorldNeedsUpdate=true;
   });
   scene.updateMatrixWorld(true);skeleton.update();renderer.render(scene,camera);
   canvas.dataset.character='edge-perched-paper-rig';canvas.dataset.time=t.toFixed(3);canvas.dataset.gripX=J.wr[0].toFixed(2);canvas.dataset.gripY=J.wr[1].toFixed(2);canvas.dataset.linePhase=state.phase||'';
 }
 return{draw,get ready(){return ready;}};
}
global.createPaperCharacter3D=createPaperCharacter3D;
})(window);
