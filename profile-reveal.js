(() => {
  const section = document.querySelector('#about');
  const stamp = section?.querySelector('.profile-stamp');
  const copy = section?.querySelector('.profile-copy');
  if (!section || !stamp || !copy || !Element.prototype.animate) return;
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...copy.children];
  let visible = false, running = [], generation = 0;
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
    section.classList.add('profile-revealed');
    if (motion.matches) return;
    const ticket = generation;
    const source = stamp.getBoundingClientRect();
    const poses = items.map((node, index) => {
      const target = node.getBoundingClientRect();
      const x = source.left + source.width * .56 - target.left - target.width / 2;
      const y = source.top + source.height * .5 + (index - 2) * 6 - target.top - target.height / 2;
      const scale = Math.min(.3, source.width * .7 / Math.max(1,target.width), source.height * .7 / Math.max(1,target.height));
      return {node,x,y,scale};
    });
    section.classList.add('profile-reveal-running');
    running = poses.map(({node,x,y,scale},index) => node.animate([
      {transform:`translate(${x}px,${y}px) rotate(-5deg) scale(${scale})`,opacity:0,offset:0},
      {transform:`translate(${x}px,${y}px) rotate(-5deg) scale(${scale})`,opacity:.75,offset:.1},
      {transform:'translate(0px,0px) rotate(0deg) scale(1)',opacity:1,offset:1}
    ],{duration:860,delay:index*85,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}));
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
  });
  window.addEventListener('resize',() => {
    if (!running.length) return;
    cancel();
    section.classList.add('profile-revealed');
  },{passive:true});
})();
