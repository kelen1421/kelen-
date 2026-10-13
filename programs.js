(() => {
  const archive = document.querySelector('.program-archive');
  if (!archive) return;
  const cards = [...archive.querySelectorAll('.program-card')];
  const stations = [...archive.querySelectorAll('.plugin-station')];
  const leaves = [...archive.querySelectorAll('.plugin-leaf')];
  const directory = [...archive.querySelectorAll('[data-plugin-select]')];
  const overview = archive.querySelector('.plugin-overview');
  const stage = archive.querySelector('.plugin-panel-stage');
  const back = archive.querySelector('.plugin-overview-back');
  const read = archive.querySelector('.plugin-read');
  const names = cards.map(card => card.querySelector('h3').textContent);
  const descriptions = cards.map(card => card.querySelector('.program-copy p').textContent);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, focusTimer;

  function select(index) {
    current = (index + cards.length) % cards.length;
    archive.dataset.selected = String(current);
    stations.forEach((station,i) => station.classList.toggle('is-selected',i === current));
    directory.forEach((button,i) => button.setAttribute('aria-pressed',String(i === current)));
    leaves.forEach((leaf,i) => {
      const angle = (i-current)*25;
      const radians = angle*Math.PI/180;
      leaf.style.setProperty('--leaf-x',`${Math.sin(radians)*420}px`);
      leaf.style.setProperty('--leaf-z',`${(Math.cos(radians)-1)*420}px`);
      leaf.style.setProperty('--leaf-angle',`${-angle*.8}deg`);
      leaf.classList.toggle('is-selected',i === current);
      leaf.setAttribute('aria-pressed',String(i === current));
    });
    cards.forEach((card,i) => {
      card.hidden = archive.dataset.view !== 'records' || i !== current;
      if (i !== current) card.querySelector('details').open = false;
    });
    archive.querySelector('.plugin-active-number').textContent = `PROGRAM / 0${current+1} — 04`;
    archive.querySelector('.plugin-active-title').textContent = names[current];
    archive.querySelector('.plugin-active-description').textContent = descriptions[current];
    read.setAttribute('aria-label',`读取${names[current]}档案`);
  }

  function open(index) {
    clearTimeout(focusTimer);
    archive.dataset.view = 'records';
    overview.hidden = true;
    stage.hidden = false;
    back.hidden = false;
    select(index);
    archive.scrollIntoView({behavior:motion.matches ? 'instant' : 'smooth',block:'start'});
    const heading = cards[current].querySelector('h3');
    heading.tabIndex = -1;
    focusTimer = setTimeout(() => heading.focus({preventScroll:true}),motion.matches ? 0 : 450);
  }

  stations.forEach((button,i) => {
    button.addEventListener('pointerenter',() => select(i));
    button.addEventListener('focus',() => select(i));
    button.addEventListener('click',() => open(i));
  });
  directory.forEach((button,i) => {
    button.addEventListener('pointerenter',() => {if (archive.dataset.view === 'overview') select(i);});
    button.addEventListener('focus',() => {if (archive.dataset.view === 'overview') select(i);});
    button.addEventListener('click',() => open(i));
  });
  leaves.forEach((button,i) => button.addEventListener('click',() => select(i)));
  read.addEventListener('click',() => open(current));
  function showOverview() {
    clearTimeout(focusTimer);
    archive.dataset.view = 'overview';
    overview.hidden = false;
    stage.hidden = true;
    back.hidden = true;
    select(current);
    stations[current].focus({preventScroll:true});
  }
  back.addEventListener('click',showOverview);
  archive.addEventListener('keydown',event => {
    if (event.target.closest('details,a')) return;
    if (event.key === 'Escape' && archive.dataset.view === 'records') {
      event.preventDefault();showOverview();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();select(current + (event.key === 'ArrowRight' ? 1 : -1));
      (archive.dataset.view === 'records' ? leaves : stations)[current].focus({preventScroll:true});
    }
  });
  archive.classList.add('is-enhanced');
  select(0);
})();
