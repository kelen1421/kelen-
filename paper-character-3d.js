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
 function inside(x,y,polygon){let hit=false;for(let i=0,k=polygon.length-1;i<polygon.length;k=i++){const a=polygon[i],b=polygon[k];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
 function owner(x,y){
   if(y<418)return'Head';
   if((x<625&&y>937)||(x>=625&&y>990))return x<625?'Foot_L':'Foot_R';
   if(y>820)return null;
   if(inside(x,y,[[404,631],[444,641],[455,667],[496,643],[526,657],[518,684],[507,708],[462,728],[425,716],[397,687]]))return'Hand_L';
   if(inside(x,y,[[390,455],[575,486],[599,775],[451,812],[392,731]]))return'Folder';
   if(inside(x,y,[[850,550],[924,536],[979,566],[948,600],[980,630],[974,653],[930,674],[881,652],[850,632]]))return'Hand_R';
   if(inside(x,y,[[746,464],[799,496],[817,535],[782,568],[733,529]]))return'UpperArm_R';
   if(inside(x,y,[[781,534],[822,534],[857,568],[867,616],[824,638],[792,587]]))return'LowerArm_R';
   if(x<500&&y>538&&y<740)return y<615?'UpperArm_L':'Hand_L';
   if(x>568&&x<670&&y<490)return'Neck';
   return'Chest';
 }
 // Hard parts keep the reference texture from bridging across a folded joint.
 const parts={};const sourceCount=data.position.length/6;
 for(let i=0;i<data.groups[0][1];i+=3){const tri=data.indices.slice(i,i+3),x=tri.reduce((s,k)=>s+data.uv[k*2]*1254,0)/3,y=tri.reduce((s,k)=>s+data.uv[k*2+1]*1254,0)/3,name=owner(x,y);const longest=Math.max(...tri.map((a,k)=>{const b=tri[(k+1)%3];return Math.hypot((data.uv[a*2]-data.uv[b*2])*1254,(data.uv[a*2+1]-data.uv[b*2+1])*1254);}));if(name&&longest<26)(parts[name]||(parts[name]=[])).push(tri);}
 // Discard isolated silhouette slivers after separating the rigid pieces.
 Object.keys(parts).forEach(name=>{
   const triangles=parts[name],parent=triangles.map((_,i)=>i),vertexOwner=new Map();
   function find(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;}
   triangles.forEach((tri,i)=>tri.forEach(vertex=>{if(vertexOwner.has(vertex))parent[find(i)]=find(vertexOwner.get(vertex));else vertexOwner.set(vertex,i);}));
   const components=new Map();triangles.forEach((tri,i)=>{const root=find(i);if(!components.has(root))components.set(root,[]);components.get(root).push(tri);});
   parts[name]=[...components.values()].sort((a,b)=>b.length-a.length)[0]||[];
 });
 const pos=[],uvs=[],ids=[],weights=[],faces=[],groups=[];
 Object.entries(parts).forEach(([name,triangles])=>{
   const mapping=new Map(),boneIndex=bones.indexOf(byName[name]);
   function index(original,back=false){const key=original+(back?sourceCount:0);if(mapping.has(key))return mapping.get(key);const n=pos.length/3;mapping.set(key,n);pos.push(...data.position.slice(key*3,key*3+3));uvs.push(...data.uv.slice(key*2,key*2+2));ids.push(boneIndex,0,0,0);weights.push(1,0,0,0);return n;}
   let start=faces.length;triangles.forEach(tri=>faces.push(...tri.map(k=>index(k))));groups.push([start,faces.length-start,0]);
   start=faces.length;triangles.forEach(([a,b,c])=>faces.push(index(a,true),index(c,true),index(b,true)));groups.push([start,faces.length-start,1]);
   const edges=new Map();triangles.forEach(tri=>tri.forEach((a,i)=>{const b=tri[(i+1)%3],key=a<b?a+'-'+b:b+'-'+a;if(edges.has(key))edges.get(key).count++;else edges.set(key,{a,b,count:1});}));
   start=faces.length;edges.forEach(({a,b,count})=>{if(count===1)faces.push(index(a),index(b,true),index(b),index(a),index(a,true),index(b,true));});groups.push([start,faces.length-start,1]);
 });
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(pos,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(ids,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));geometry.setIndex(faces);groups.forEach(group=>geometry.addGroup(...group));geometry.computeVertexNormals();
 const texture=new T.Texture();texture.flipY=false;texture.colorSpace=T.SRGBColorSpace;
 const front=new T.MeshBasicMaterial({map:texture,alphaTest:.20,side:T.FrontSide,toneMapped:false});
 // The front-facing site choreography hides source cut surfaces between parts.
 const side=new T.MeshStandardMaterial({color:0xcfc9b5,roughness:.97,side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false});
 const mesh=new T.SkinnedMesh(geometry,[front,side]);mesh.name='LineDrivenPaperExplorer';mesh.frustumCulled=false;mesh.add(bones[0]);scene.add(mesh);scene.updateMatrixWorld(true);
 const skeleton=new T.Skeleton(bones);mesh.bind(skeleton);mesh.normalizeSkinWeights();
 const bindWorld=bones.map(b=>b.matrixWorld.clone());bones.forEach(b=>b.matrixAutoUpdate=false);
 const limbMaterial=new T.MeshStandardMaterial({color:0xe2ddcb,roughness:.95,flatShading:true}),jointMaterial=new T.MeshStandardMaterial({color:0x73815b,roughness:.8,flatShading:true});
 const legSegments=Array.from({length:4},()=>{const m=new T.Mesh(new T.CylinderGeometry(1,1,1,5),limbMaterial);scene.add(m);return m;});
 const jointMarks=Array.from({length:8},()=>{const m=new T.Mesh(new T.IcosahedronGeometry(1,1),jointMaterial);scene.add(m);return m;});
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
   if(viewWidth!==width||viewHeight!==height||pixelScale!==scale){viewWidth=width;viewHeight=height;pixelScale=scale;renderer.setSize(Math.max(1,Math.round(width*scale)),Math.max(1,Math.round(height*scale)),false);canvas.style.height=`${height*scale}px`;camera.right=width;camera.top=height;camera.updateProjectionMatrix();}
   const root=[x,y],shoulder=[(J.sl[0]+J.sr[0])*.5,(J.sl[1]+J.sr[1])*.5],headPivot=[J.head[0],J.head[1]+24];
   const transforms={};
   const torso=segment([612,710],[623,499],root,shoulder,height,.27);
   transforms.Hips=rigid([612,710],root,height,.27);transforms.Spine=torso;transforms.Chest=torso;
   transforms.Neck=segment([623,499],[626,422],shoulder,headPivot,height,.27);
   const lean=clamp(Math.atan2(J.head[0]-shoulder[0],Math.max(1,shoulder[1]-J.head[1]))*.25,-.12,.12);
   transforms.Head=rigid([626,422],headPivot,height,.27,-lean,Math.sin(t*Math.PI/3)*.018);
   transforms.Shoulder_L=segment([623,499],[513,495],shoulder,J.sl,height);
   transforms.Shoulder_R=segment([623,499],[753,488],shoulder,J.sr,height);
   transforms.UpperArm_L=segment([513,495],[424,605],J.sl,J.el,height);
   transforms.LowerArm_L=segment([424,605],[470,678],J.el,J.wl,height);
   transforms.UpperArm_R=segment([753,488],[806,557],J.sr,J.er,height);
   transforms.LowerArm_R=segment([806,557],[861,607],J.er,J.wr,height);
   const rightDirection=gripping?[0,-1]:seated?[1,.08]:t<.17?[-.5,-.86]:[.25,1];
   const leftDirection=t<.17?[.6,-.8]:[.7,.3];
   transforms.Hand_L=segment([470,678],[510,684],J.wl,[J.wl[0]+leftDirection[0]*12,J.wl[1]+leftDirection[1]*12],height);
   transforms.Folder=transforms.Hand_L;
   transforms.Hand_R=segment([861,607],[940,608],J.wr,[J.wr[0]+rightDirection[0]*22,J.wr[1]+rightDirection[1]*22],height);
   transforms.Fingers_R=transforms.Hand_R;transforms.Thumb_R=transforms.Hand_R;
   // Preserve the old line actor's sole positions while keeping the boot proportions.
   const footScale=.25,leftAnkle=[J.al[0],J.al[1]+18-(1147-983)*footScale],rightAnkle=[J.ar[0],J.ar[1]+18-(1210-1036)*footScale];
   transforms.UpperLeg_L=segment([568,710],[569,856],[x-10,y],J.kl,height,.27);
   transforms.LowerLeg_L=segment([569,856],[590,983],J.kl,leftAnkle,height,.27);
   transforms.Foot_L=rigid([590,983],leftAnkle,height,footScale);
   transforms.UpperLeg_R=segment([654,710],[696,872],[x+10,y],J.kr,height,.27);
   transforms.LowerLeg_R=segment([696,872],[737,1036],J.kr,rightAnkle,height,.27);
   transforms.Foot_R=rigid([737,1036],rightAnkle,height,footScale);
   const segments=[[[x-10,y+8],J.kl,7],[J.kl,leftAnkle,5.8],[[x+10,y+8],J.kr,7],[J.kr,rightAnkle,5.8]];
   segments.forEach(([a,b,r],i)=>{const start=v(a,height,-1),end=v(b,height,-1),direction=end.clone().sub(start);legSegments[i].position.copy(start).add(end).multiplyScalar(.5);legSegments[i].scale.set(r,direction.length(),r);legSegments[i].quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());});
   [J.kl,J.kr,leftAnkle,rightAnkle,J.sl,J.sr,J.el,J.er].forEach((p,i)=>{jointMarks[i].position.copy(v(p,height,1));jointMarks[i].scale.setScalar(i<4?5.5:5);});
   const worldMatrices={};
   bones.forEach((bone,i)=>{
     const desired=(transforms[bone.name]||transforms.Hips).clone().multiply(bindWorld[i]);worldMatrices[bone.name]=desired;
     if(bone.parent?.isBone)bone.matrix.copy(worldMatrices[bone.parent.name]).invert().multiply(desired);else bone.matrix.copy(desired);
     bone.matrixWorldNeedsUpdate=true;
   });
   scene.updateMatrixWorld(true);skeleton.update();renderer.render(scene,camera);
   canvas.dataset.character='line-driven-3d';canvas.dataset.time=t.toFixed(3);canvas.dataset.gripX=J.wr[0].toFixed(2);canvas.dataset.gripY=J.wr[1].toFixed(2);canvas.dataset.linePhase=state.phase||'';
 }
 return{draw,get ready(){return ready;}};
}
global.createPaperCharacter3D=createPaperCharacter3D;
})(window);
