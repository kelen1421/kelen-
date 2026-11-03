/* Native WebGL layer compositor and Canvas orbit renderer. Lens formulas adapted from LENZ. */
(()=>{'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});
 const cover=(ctx,img,x,y,w,h)=>{if(!img)return;const iw=img.videoWidth||img.naturalWidth||img.width,ih=img.videoHeight||img.naturalHeight||img.height;if(!iw||!ih)return;const scale=Math.max(w/iw,h/ih);ctx.drawImage(img,x+(w-iw*scale)/2,y+(h-ih*scale)/2,iw*scale,ih*scale)};
 class LensSlideshow {
  constructor(canvas, images, onChange) {
   Object.assign(this,{canvas,images,onChange,index:0,next:0,transitioning:false,paused:matchMedia('(prefers-reduced-motion: reduce)').matches,lastChange:performance.now(),mouse:[0,0],smoothMouse:[0,0],clock:0,lastFrame:0});
   // The visible inner lens rotates clockwise; the outer lens rotates counterclockwise.
   // Geometry, refraction and the image transition each retain their own clock.
   this.layers=[{type:'outer',size:1,speed:-.4},{type:'rim',size:1.1825,speed:-.8,phase:.25},{type:'middle',size:1.16,speed:.04},{type:'rim',size:.6925,speed:.8,phase:.5},{type:'small',size:.68,speed:0}];
   this.palettes=[[[.75,.37,.23],[.44,.49,.55]],[[.55,.67,.72],[.16,.37,.43]],[[.62,.39,.24],[.22,.29,.40]]];
   this.ready=this.init();
   canvas.parentElement.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();this.mouse=[e.clientX/r.width*2-1,(e.clientY-r.top)/r.height*2-1]});
   canvas.parentElement.addEventListener('pointerleave',()=>this.mouse=[0,0]);
  }
  async init(){
   const gl=this.canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'high-performance'});if(!gl)return;
   this.gl=gl;
   const vertex=`attribute vec2 aPosition; varying vec2 vUv; uniform vec2 uViewport;uniform vec2 uMeshResolution;uniform vec2 uOffset;uniform float uAngle;
   void main(){vUv=aPosition+.5;float c=cos(uAngle),s=sin(uAngle);vec2 p=mat2(c,-s,s,c)*aPosition*uMeshResolution+uOffset;gl_Position=vec4(p/uViewport*2.,0.,1.);}`;
   const compile=(kind,source)=>{const shader=gl.createShader(kind);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader};
   try{
    this.programs={};
    for(const [type,fragment] of Object.entries(window.KelenLensShaders)){
     const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
     const uniforms={};for(let i=0;i<gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);i++){const info=gl.getActiveUniform(program,i);uniforms[info.name]={location:gl.getUniformLocation(program,info.name),type:info.type}}this.programs[type]={program,uniforms,position:gl.getAttribLocation(program,'aPosition')};
    }
    this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,-.5,.5,.5,-.5,.5,.5]),gl.STATIC_DRAW);
    this.loaded=await Promise.all(this.images.map(loadImage));
    this.textures=this.loaded.map(img=>{
     const crop=document.createElement('canvas');crop.width=crop.height=1024;cover(crop.getContext('2d'),img,0,0,1024,1024);
     const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.MIRRORED_REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.MIRRORED_REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,crop);return tex;
    });
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);this.resize();this.isReady=true;this.canvas.previousElementSibling.style.opacity='0';this.canvas.dataset.renderer='layered-lens';new ResizeObserver(()=>this.resize()).observe(this.canvas);this.lastChange=performance.now();
   }catch(error){console.warn('Lens fallback:',error.message);this.gl=null;}
  }
  resize(){if(!this.gl)return;const r=this.canvas.getBoundingClientRect();this.w=r.width;this.h=r.height;const d=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.round(this.w*d);this.canvas.height=Math.round(this.h*d);this.gl.viewport(0,0,this.canvas.width,this.canvas.height)}
  async setImages(images){const loaded=await Promise.all(images.map(loadImage));const gl=this.gl;if(!gl)return;const textures=loaded.map(img=>{const crop=document.createElement('canvas');crop.width=crop.height=1024;cover(crop.getContext('2d'),img,0,0,1024,1024);const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.MIRRORED_REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.MIRRORED_REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,crop);return tex});this.textures.forEach(tex=>gl.deleteTexture(tex));this.images=images;this.loaded=loaded;this.textures=textures;}
  go(index){if(this.transitioning||index===this.index)return;this.next=index;this.direction=index===(this.index+1)%this.images.length?1:-1;this.start=performance.now();this.transitioning=true;this.onChange?.(index);if(!this.isReady){this.index=index;this.transitioning=false;this.canvas.previousElementSibling.src=this.images[index]}this.lastChange=performance.now()}
  uniforms(pass,values){const gl=this.gl;for(const [key,value] of Object.entries(values)){const u=pass.uniforms[key];if(!u)continue;const loc=u.location;if(u.type===gl.FLOAT_VEC2)gl.uniform2fv(loc,value);else if(u.type===gl.FLOAT_VEC3)gl.uniform3fv(loc,value);else if(u.type===gl.BOOL||u.type===gl.INT||u.type===gl.SAMPLER_2D)gl.uniform1i(loc,value);else gl.uniform1f(loc,value)}}
  draw(time){
   if(!this.paused&&!this.transitioning&&time-this.lastChange>5000)this.go((this.index+1)%this.images.length);
   if(!this.gl||!this.isReady)return;
   const dt=this.lastFrame?Math.min(.06,(time-this.lastFrame)/1000):0;this.lastFrame=time;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)this.clock+=dt;
   const elapsed=this.transitioning?(time-this.start)/1000:0;
   const cubic=t=>{t=clamp(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
   const progress=this.transitioning?cubic(elapsed):0,progress2=this.transitioning?1-Math.pow(2,-10*clamp(elapsed/1.6)):0;
   if(this.transitioning&&elapsed>=1.7){this.index=this.next;this.transitioning=false;this.lastChange=time}
   this.canvas.dataset.transition=String(this.transitioning);this.canvas.dataset.slide=String(this.index);const gl=this.gl,target=this.transitioning?this.next:this.index;
   gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.textures[this.index]);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.textures[target]);
   this.smoothMouse[0]+=(this.mouse[0]-this.smoothMouse[0])*.02;this.smoothMouse[1]+=(this.mouse[1]-this.smoothMouse[1])*.02;
   const mobile=this.w<=700,shift=mobile?[0,0]:[-this.smoothMouse[0]*this.w*.05,this.smoothMouse[1]*this.h*.05];
   const palette=this.palettes[this.index],nextPalette=this.palettes[target];
   for(const layer of this.layers){
    const pass=this.programs[layer.type];gl.useProgram(pass.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.enableVertexAttribArray(pass.position);gl.vertexAttribPointer(pass.position,2,gl.FLOAT,false,0,0);
    const size=(layer.type==='outer'?Math.hypot(this.w,this.h):Math.min(this.w,this.h))*layer.size*(mobile?1.2:1);
    const seconds=this.clock,angle=seconds*layer.speed;if(layer.type==='middle')this.canvas.dataset.innerAngle=String(angle);if(layer.type==='outer')this.canvas.dataset.outerAngle=String(angle);
    const shared={uViewport:[this.w,this.h],uMeshResolution:[size,size],uSectionResolution:[this.w,this.h],uOffset:layer.type==='outer'?[0,0]:shift,uAngle:angle,uTexture1:0,uTexture2:1,uTexture1Resolution:[1024,1024],uTexture2Resolution:[1024,1024],uCurrentColorA:palette[0],uCurrentColorB:palette[1],uNextColorA:nextPalette[0],uNextColorB:nextPalette[1],uOpacity:1,uSlideProgress:this.transitioning?progress:0,uSlideProgress2:this.transitioning?progress2:0,uSlideDirection:this.direction||1,uSlideRotationStrength:.1,uCircleEdgeSize:.01,uPageTransitionProgress:0,uDetailKvScale:0};
    if(layer.type==='small')Object.assign(shared,{uTime:seconds,uTexEdgeProgress:.93,uStartScale:1,uLoopScale1:Math.max(0,1-(time-this.lastChange)/6600),uLoopScale2:1,uSlideScale:.75,uCCLensProgress:-1.5});
    if(layer.type==='outer')Object.assign(shared,{uTime:seconds*.4,uCircleEdgeSize:.0001,uColorCoverAlpha:.4,uFrostStrength:.002,uRefractionStrength:.1,uRefractionStrength2:2,uCCLensProgress:-.8,uswirlStrength:30,uRGBDiff:[.002*Math.sin(seconds*.1),0,.003*Math.sin(seconds*.13)]});
    if(layer.type==='middle'){
     Object.assign(shared,{uTime:seconds*.04,uTexEdgeProgress:.9,uColorCoverAlpha:.3,uSlideScale:.5,uCCLensProgress:-2,uRGBDiff:[.02,0,-.02]});
     const starts=[[2.1,3.2,1.5],[.9,.6,.3],[.8,1.1,1.3],[1.1,.9,.6]];
     ['Top','Bottom','Left','Right'].forEach((side,i)=>{shared['uFx'+side+'_frostStrength']=i<2?.003:0;shared['uFx'+side+'_refractionStrength']=.3;shared['uFx'+side+'_swirlStrength']=i===0?0:5;shared['uFx'+side+'_repeatLength']=1;for(let n=1;n<=3;n++)shared['uFx'+side+'_startTime'+n]=starts[i][n-1]});
    }
    if(layer.type==='rim')Object.assign(shared,{uRotation:layer.phase,uSlideProgress:this.transitioning?cubic(elapsed/1.1):0});
    this.uniforms(pass,shared);gl.drawArrays(gl.TRIANGLES,0,6);
   }
  }
 }
 class OrbitDisc{
  async setImages(images){this.images=images;this.loaded=await Promise.all(images.map(loadImage))}
  constructor(canvas,images){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images=images;this.loaded=[];this.pointer=[0,0];this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.ready=Promise.all(images.map(loadImage)).then(imgs=>this.loaded=imgs);canvas.parentElement.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();this.pointer=[(e.clientX/r.width-.5)*.14,(e.clientY/r.height-.5)*.14]});this.resize();new ResizeObserver(()=>this.resize()).observe(canvas);}
  resize(){const r=this.canvas.getBoundingClientRect();this.w=r.width;this.h=r.height;const d=Math.min(devicePixelRatio||1,1.6);this.canvas.width=r.width*d;this.canvas.height=r.height*d;this.ctx.setTransform(d,0,0,d,0,0)}
  draw(time){const ctx=this.ctx,w=this.w,h=this.h;if(!w||!h)return;ctx.clearRect(0,0,w,h);const t=this.reduced?2.5:time/1000;const r=w>700?(w-64)*.25:(w-16)*.5;const cx=w*.5,cy=h*.5;ctx.lineWidth=1;ctx.setLineDash([2,2]);for(let i=0;i<5;i++){ctx.beginPath();ctx.strokeStyle=i===2?'rgba(255,255,255,.8)':'rgba(255,255,255,.29)';ctx.ellipse(cx+(i-2)*r,cy,r,r,0,0,Math.PI*2);ctx.stroke()}
   const angle=t*.24,tilt=t*.15;const ellipses=[{rx:r*Math.max(.018,.52+.48*Math.cos(angle*1.5)),ry:r,a:angle+.66+this.pointer[0]},{rx:r*Math.max(.018,.52+.48*Math.cos(tilt*1.5+2.3)),ry:r,a:-tilt-1.17+this.pointer[1]}];
   const img=this.loaded[Math.floor(t/3)%Math.max(1,this.loaded.length)];if(img){ctx.save();for(const el of ellipses){ctx.beginPath();ctx.ellipse(cx,cy,el.rx,el.ry,el.a,0,Math.PI*2);ctx.clip()}ctx.translate(cx,cy);ctx.rotate(Math.sin(t*.2)*.14);cover(ctx,img,-r,-r,r*2,r*2);ctx.restore()}
   ctx.strokeStyle='rgba(255,255,255,.95)';for(const el of ellipses){ctx.beginPath();ctx.ellipse(cx,cy,el.rx,el.ry,el.a,0,Math.PI*2);ctx.stroke()}}
 }
 class MovieWall{
  constructor(canvas,video,images){this.canvas=canvas;this.video=video;this.ctx=canvas.getContext('2d');this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.loaded=[];Promise.all(images.map(loadImage)).then(imgs=>this.loaded=imgs);this.resize();video.play().catch(()=>{});}
  resize(){const rect=this.canvas.getBoundingClientRect();this.w=rect.width;this.h=rect.height;const d=Math.min(devicePixelRatio||1,1.5);this.canvas.width=this.w*d;this.canvas.height=this.h*d;this.ctx.setTransform(d,0,0,d,0,0)}
  draw(time,scroll=0){const ctx=this.ctx,w=this.w,h=this.h;ctx.fillStyle='#151515';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2-scroll*.12);ctx.rotate(Math.PI/12);const tw=w*.64,th=h*.64;const t=this.reduced?0:time/1000;for(let row=-2;row<3;row++){const drift=Math.sin(t*.075)*w*.13*(row%2===0?1:-1);for(let col=-2;col<3;col++){const x=col*(tw+10)+drift-tw/2,y=row*(th+10)-th/2;ctx.save();ctx.beginPath();ctx.rect(x,y,tw,th);ctx.clip();const source=this.video.readyState>=2?this.video:this.loaded[(row+col+12)%Math.max(1,this.loaded.length)];cover(ctx,source,x,y,tw,th);ctx.restore()}}ctx.restore();}
 }
 window.ResumeEffects={LensSlideshow,OrbitDisc,MovieWall,clamp};
})();
