/* The paper explorer, skinned to the profile reveal's existing action clock. */
(function(global){
'use strict';
const S=1254,GRID=64,TAU=Math.PI*2;
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const angle=(x)=>Math.atan2(Math.sin(x),Math.cos(x));
function createPaperCharacter(canvas,options={}) {
  const definitions=[
    ['root','骨盆 / 整体',null,[612,790],[612,748]],
    ['torso','躯干','root',[612,790],[623,499]],
    ['neck','颈部','torso',[623,499],[626,422]],
    ['head','头部与帽子','neck',[626,422],[625,302]],
    ['shoulderR','右肩 · 画面右侧','torso',[623,499],[753,488]],
    ['upperR','右上臂','shoulderR',[753,488],[806,557]],
    ['lowerR','右前臂','upperR',[806,557],[861,607]],
    ['handR','右手','lowerR',[861,607],[940,608]],
    ['shoulderL','左肩 · 文件夹侧','torso',[623,499],[513,495]],
    ['upperL','左上臂','shoulderL',[513,495],[424,605]],
    ['lowerL','左前臂','upperL',[424,605],[470,678]],
    ['handL','左手','lowerL',[470,678],[510,684]],
    ['folder','档案夹','handL',[470,678],[494,540]],
    ['hipL','左髋','root',[612,790],[568,812]],
    ['thighL','左大腿','hipL',[568,812],[569,856]],
    ['shinL','左小腿','thighL',[569,856],[590,983]],
    ['footL','左脚','shinL',[590,983],[545,1108]],
    ['hipR','右髋','root',[612,790],[654,814]],
    ['thighR','右大腿','hipR',[654,814],[696,872]],
    ['shinR','右小腿','thighR',[696,872],[737,1036]],
    ['footR','右脚','shinR',[737,1036],[775,1144]]
  ];
  const bones=definitions.map(([id,label,parent,start,end])=>({id,label,parent,start:[...start],end:[...end],rotation:0,skin:null}));
  const byId=Object.fromEntries(bones.map((b,i)=>[b.id,i]));
  let rootOffset=[0,0],loaded=false,contextLost=false,lastState=null;
  const identity=()=>[1,0,0,1,0,0];
  function multiply(a,b){return[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
  function inverse(a){const d=a[0]*a[3]-a[1]*a[2];return[a[3]/d,-a[1]/d,-a[2]/d,a[0]/d,(a[2]*a[5]-a[3]*a[4])/d,(a[1]*a[4]-a[0]*a[5])/d];}
  const point=(m,p)=>[m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];
  const rotate=r=>[Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0];
  function bind(){bones.forEach(b=>{const r=Math.atan2(b.end[1]-b.start[1],b.end[0]-b.start[0]);b.bind=[Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),...b.start];b.inverseBind=inverse(b.bind);b.length=Math.hypot(b.end[0]-b.start[0],b.end[1]-b.start[1]);const parent=b.parent?bones[byId[b.parent]]:null;b.localBind=parent?multiply(parent.inverseBind,b.bind):b.bind;});}
  function updateBones(){bones.forEach(b=>{const parent=b.parent?bones[byId[b.parent]]:null;b.world=multiply(parent?parent.world:[1,0,0,1,...rootOffset],multiply(b.localBind,rotate(b.rotation)));b.skin=multiply(b.world,b.inverseBind);b.worldStart=point(b.world,[0,0]);b.worldEnd=point(b.world,[b.length,0]);});}
  function segmentDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(den||1)));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t);}
  function inPolygon(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
  function weightsAt(p){
    const [x,y]=p;
    if(y<404&&x>335&&x<835)return[[byId.head,1]];
    if(inPolygon(p,[[392,459],[574,484],[596,775],[450,814],[396,730]]))return[[byId.folder,1]];
    let candidates;
    if(y>809)candidates=x<615?['hipL','thighL','shinL','footL','torso']:['hipR','thighR','shinR','footR','torso'];
    else if(y>585&&x>590&&x<815)candidates=['torso','hipL','hipR'];
    else if(x>724&&y<700)candidates=['shoulderR','upperR','lowerR','handR','torso'];
    else if(x<527&&y>448)candidates=['shoulderL','upperL','lowerL','handL','folder','torso'];
    else if(y<480)candidates=['head','neck','torso'];
    else candidates=['torso','neck','shoulderL','shoulderR','hipL','hipR'];
    if(y>1008&&x<615)return[[byId.footL,1]];
    if(y>1050&&x>=615)return[[byId.footR,1]];
    if(x>876&&y>544&&y<686)return[[byId.handR,1]];
    const scored=candidates.map(id=>{const i=byId[id],b=bones[i],distance=segmentDistance(p,b.start,b.end);return[i,1/Math.pow(distance+13,4)];}).sort((a,b)=>b[1]-a[1]).slice(0,4);
    const sum=scored.reduce((a,b)=>a+b[1],0);return scored.map(([i,w])=>[i,w/sum]);
  }
  const vertices=[],uvs=[],weights=[],indices=[],triangles=[];
  for(let y=0;y<=GRID;y++)for(let x=0;x<=GRID;x++) {
    const p=[x/GRID*S,y/GRID*S],values=weightsAt(p);
    vertices.push(...p);uvs.push(x/GRID,y/GRID);
    for(let k=0;k<4;k++){indices.push(values[k]?.[0]||0);weights.push(values[k]?.[1]||0);}
  }
  for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){const a=y*(GRID+1)+x,b=a+1,c=a+GRID+1,d=c+1;triangles.push(a,c,b,b,c,d);}
  bind();updateBones();
  let gl,program,boneUniform,viewUniform,globalUniform,texture;
  try {
    gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
    if(!gl)throw new Error('WebGL unavailable');
    const vs=`attribute vec2 aPosition;attribute vec2 aUV;attribute vec4 aWeights;attribute vec4 aIndices;
    uniform mat3 uBones[${bones.length}];uniform mat3 uGlobal;uniform vec2 uView;varying vec2 vUV;
    void main(){vec3 p=vec3(aPosition,1.);vec3 q=(uBones[int(aIndices.x)]*p)*aWeights.x+(uBones[int(aIndices.y)]*p)*aWeights.y+(uBones[int(aIndices.z)]*p)*aWeights.z+(uBones[int(aIndices.w)]*p)*aWeights.w;
    q=uGlobal*q;gl_Position=vec4(q.x/uView.x*2.-1.,1.-q.y/uView.y*2.,0.,1.);vUV=aUV;}`;
    const fs='precision mediump float;uniform sampler2D uImage;varying vec2 vUV;void main(){vec4 c=texture2D(uImage,vUV);if(c.a<.01)discard;gl_FragColor=c;}';
    function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader unavailable');return s;}
    program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Skinning unavailable');gl.useProgram(program);
    function attribute(name,size,data){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const at=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,size,gl.FLOAT,false,0,0);}
    attribute('aPosition',2,vertices);attribute('aUV',2,uvs);attribute('aWeights',4,weights);attribute('aIndices',4,indices);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(triangles),gl.STATIC_DRAW);
    boneUniform=gl.getUniformLocation(program,'uBones[0]');viewUniform=gl.getUniformLocation(program,'uView');globalUniform=gl.getUniformLocation(program,'uGlobal');
    texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  } catch(error) {gl=null;}
  const image=new Image();
  image.onload=()=> {
    loaded=true;
    if(gl){gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);}
    options.onReady?.();if(lastState)draw(lastState);
  };
  image.src=options.src||'assets/kelen-paper-character.png';
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();gl=null;canvas.style.visibility='hidden';if(lastState)draw(lastState);});
  const poseKeys=[
    [0,0,0,0,0,-.20,.22,.10,-.08],
    [.16,0,0,0,0,-.20,.22,.10,-.08],
    [.36,0,-.7,-.18,.03,-.28,.24,.19,-.17],
    [.56,-20,-1.2,-.30,.025,-.10,.08,.13,-.06],
    [.70,-30,-1.2,-.30,.025,-.08,.07,.12,-.05],
    [1.54,-30,-1.2,-.30,.025,-.14,.12,.14,-.07],
    [1.76,-25,-.68,-.20,.035,-.60,.52,.37,-.25],
    [2.02,-20,-.20,-.14,-.025,-.27,.28,.20,-.14],
    [2.22,20,-.35,-.20,0,-.30,.34,.14,-.08],
    [2.58,70,-.35,-.20,.015,-.42,.44,.12,-.06],
    [3,70,-.35,-.20,.015,-.42,.44,.12,-.06]
  ];
  function sample(t){let a=poseKeys[0],b=poseKeys[1];for(let i=1;i<poseKeys.length;i++){a=poseKeys[i-1];b=poseKeys[i];if(t<=b[0])break;}let p=clamp((t-a[0])/(b[0]-a[0]),0,1);p=p*p*(3-2*p);return a.map((v,i)=>lerp(v,b[i],p));}
  function reachRight(target,globalMatrix,gripping) {
    const upper=bones[byId.upperR],lower=bones[byId.lowerR],hand=bones[byId.handR];
    const goal=point(inverse(globalMatrix),target),start=upper.worldStart;
    const dx=goal[0]-start[0],dy=goal[1]-start[1],l1=upper.length,l2=lower.length;
    const d=clamp(Math.hypot(dx,dy),Math.abs(l1-l2)+1,l1+l2-1),phi=Math.atan2(dy,dx);
    const shoulderAngle=phi+Math.acos(clamp((d*d+l1*l1-l2*l2)/(2*d*l1),-1,1));
    const parent=bones[byId[upper.parent]],base=Math.atan2(parent.world[1],parent.world[0])+Math.atan2(upper.localBind[1],upper.localBind[0]);
    upper.rotation=angle(shoulderAngle-base);updateBones();
    const elbow=lower.worldStart,targetAngle=Math.atan2(goal[1]-elbow[1],goal[0]-elbow[0]);
    const lowerBase=Math.atan2(upper.world[1],upper.world[0])+Math.atan2(lower.localBind[1],lower.localBind[0]);
    lower.rotation=angle(targetAngle-lowerBase);updateBones();
    const handBase=Math.atan2(lower.world[1],lower.world[0])+Math.atan2(hand.localBind[1],hand.localBind[0]);
    hand.rotation=angle((gripping?-Math.PI/2:0)-handBase);updateBones();
  }
  function draw(state) {
    lastState=state;if(!loaded||contextLost)return;
    const {t,x,y,width,height,scale:pixelScale,edge,gripX}=state,p=sample(t),s=.30;
    const world=[s,0,0,s,x-612*s,y+p[1]-790*s];
    bones.forEach(b=>b.rotation=0);
    bones[byId.torso].rotation=p[4];bones[byId.head].rotation=-p[4]*.55;
    bones[byId.upperR].rotation=p[2];bones[byId.lowerR].rotation=p[3];
    bones[byId.upperL].rotation=Math.sin(t*2)*.035;bones[byId.lowerL].rotation=-Math.sin(t*2)*.035;
    bones[byId.thighL].rotation=p[5];bones[byId.shinL].rotation=p[6];bones[byId.thighR].rotation=p[7];bones[byId.shinR].rotation=p[8];
    updateBones();
    const gripping=t>=.70&&t<=1.54,bracing=t>=2.22;
    if(gripping||bracing)reachRight(gripping?[gripX,edge+16]:[x+77,edge-11],world,gripping);
    const dpr=Math.min(devicePixelRatio||1,2),pw=Math.max(1,Math.round(width*pixelScale*dpr)),ph=Math.max(1,Math.round(height*pixelScale*dpr));
    if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
    canvas.style.height=`${height*pixelScale}px`;
    if(gl) {
      gl.viewport(0,0,pw,ph);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
      const matrices=[];bones.forEach(b=>matrices.push(b.skin[0],b.skin[1],0,b.skin[2],b.skin[3],0,b.skin[4],b.skin[5],1));
      gl.uniformMatrix3fv(boneUniform,false,new Float32Array(matrices));gl.uniformMatrix3fv(globalUniform,false,new Float32Array([world[0],world[1],0,world[2],world[3],0,world[4],world[5],1]));gl.uniform2f(viewUniform,width,height);gl.drawElements(gl.TRIANGLES,triangles.length,gl.UNSIGNED_SHORT,0);
    } else {
      // A paper-image fallback keeps the same position and reveal on non-WebGL browsers.
      let fallback=canvas.nextElementSibling;
      if(!fallback?.classList.contains('profile-paper-fallback')){fallback=document.createElement('img');fallback.src=image.src;fallback.alt='';fallback.className='profile-paper-fallback';canvas.after(fallback);}
      Object.assign(fallback.style,{width:`${S*s*pixelScale}px`,height:`${S*s*pixelScale}px`,transform:`translate(${world[4]*pixelScale}px,${world[5]*pixelScale}px)`});
    }
    canvas.dataset.time=t.toFixed(3);canvas.dataset.character='paper-explorer';
  }
  return{draw,get ready(){return loaded;}};
}
global.createPaperCharacter=createPaperCharacter;
})(window);
