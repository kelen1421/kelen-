(() => {
  const section = document.querySelector('#about');
  const stamp = section?.querySelector('.profile-stamp');
  const copy = section?.querySelector('.profile-copy');
  if (!section || !stamp || !copy || !Element.prototype.animate) return;
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...copy.children];
  const layout = copy.parentElement;
  const HOLD_MS = 180, MOVE_MS = 860;
  const easing = 'cubic-bezier(.3333,1,.6667,1)';
  let centerShift = 0;
  let visible = false, running = [], generation = 0;
  function measureCenter() {
    const area = layout.getBoundingClientRect();
    const box = stamp.getBoundingClientRect();
    const pendingShift = !section.classList.contains('profile-revealed') && !motion.matches ? centerShift : 0;
    centerShift = area.left + area.width / 2 - (box.left + box.width / 2 - pendingShift);
    section.style.setProperty('--profile-center-shift',`${centerShift}px`);
  }
  measureCenter();
  section.classList.add('profile-reveal-ready');

  function cancel() {
    generation++;
    running.forEach(animation => animation.cancel());
    running = [];
    section.classList.remove('profile-reveal-running');
  }

  function unfold() {
    if (!visible || section.classList.contains('profile-revealed') || root.classList.contains('intro-pending') || root.classList.contains('vortex-open')) return;
    cancel();
    measureCenter();
    const centeredSource = stamp.getBoundingClientRect();
    section.classList.add('profile-revealed');
    if (motion.matches) return;
    const ticket = generation;
    const source = stamp.getBoundingClientRect();
    const travel = centeredSource.left - source.left;
    const poses = items.map((node, index) => {
      const target = node.getBoundingClientRect();
      // Each later paragraph leaves the K at its position during the leftward move.
      const remaining = Math.pow(1 - Math.min(1,index * 85 / MOVE_MS),3);
      const x = source.left + travel * remaining + source.width * .56 - target.left - target.width / 2;
      const y = source.top + source.height * .5 + (index - 2) * 6 - target.top - target.height / 2;
      const scale = Math.min(.3, source.width * .7 / Math.max(1,target.width), source.height * .7 / Math.max(1,target.height));
      return {node,x,y,scale};
    });
    section.classList.add('profile-reveal-running');
    const stampMove = stamp.animate([
      {transform:`translateX(${travel}px) rotate(-5deg)`},
      {transform:'translateX(0px) rotate(-5deg)'}
    ],{duration:MOVE_MS,delay:HOLD_MS,easing,fill:'both'});
    running = [stampMove,...poses.map(({node,x,y,scale},index) => node.animate([
      {transform:`translate(${x}px,${y}px) rotate(-5deg) scale(${scale})`,opacity:0,offset:0},
      {transform:`translate(${x}px,${y}px) rotate(-5deg) scale(${scale})`,opacity:.75,offset:.1},
      {transform:'translate(0px,0px) rotate(0deg) scale(1)',opacity:1,offset:1}
    ],{duration:MOVE_MS,delay:HOLD_MS+index*85,easing,fill:'both'}))];
    Promise.allSettled(running.map(animation => animation.finished)).then(() => {
      if (ticket !== generation) return;
      cancel();
    });
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .6;
    if (visible) unfold();
    else if (!entry.isIntersecting) {
      cancel();
      section.classList.remove('profile-revealed');
    }
  },{threshold:[0,.6],rootMargin:'-8% 0px -14% 0px'});
  observer.observe(stamp);
  stamp.addEventListener('click',() => {
    cancel();
    section.classList.remove('profile-revealed');
    visible = true;
    unfold();
  });
  new MutationObserver(() => unfold()).observe(root,{attributes:true,attributeFilter:['class']});
  motion.addEventListener('change',() => {
    cancel();
    if (motion.matches) section.classList.add('profile-revealed');
    else if (visible) {section.classList.remove('profile-revealed');unfold();}
    measureCenter();
  });
  window.addEventListener('resize',() => {
    if (running.length) {cancel();section.classList.add('profile-revealed');}
    measureCenter();
  },{passive:true});
  document.fonts?.ready.then(() => {if (!running.length) measureCenter();});
})();
