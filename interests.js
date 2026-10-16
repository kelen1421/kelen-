(() => {
  const archive = document.querySelector('.interest-archive');
  if (!archive) return;

  const records = window.KelenResearchRecords || [];
  if (!records.length) return;
  const $ = selector => archive.querySelector(selector);
  const world = $('.archive-world');
  const selection = $('.archive-selection');
  const controls = $('.archive-controls');
  const detail = $('.archive-detail');
  const detailCopy = $('.archive-detail-copy');
  const readButton = $('.archive-read');
  const dotStrip=$('.archive-dots');dotStrip.replaceChildren();
  records.forEach((record,index)=>{const button=document.createElement('button');button.type='button';button.dataset.record=index;button.setAttribute('aria-label',`选择档案 ${String(index+1).padStart(2,'0')}，${record.title}`);const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');button.append(number);dotStrip.append(button);});
  const dots = [...dotStrip.children];
  $('.archive-counter i').textContent='/ '+String(records.length).padStart(2,'0');
  archive.dataset.total=records.length;
  const topicNav=document.createElement('nav');topicNav.className='research-groups';topicNav.setAttribute('aria-label','研究方向');
  for(const [group,label] of [['life','生命起源'],['flight','起飞与降落'],['population','人口结构']]){const button=document.createElement('button');button.type='button';button.dataset.group=group;button.textContent=label;const n=document.createElement('small');n.textContent=String(records.filter(r=>r.group===group).length).padStart(2,'0');button.append(n);button.addEventListener('click',()=>setRecord(records.findIndex(r=>r.group===group)));topicNav.append(button);}archive.append(topicNav);
  const model = $('.archive-document');
  const viewer = $('.archive-model-viewer');
  const dialog = document.querySelector('.archive-index-dialog');
  const search = dialog.querySelector('input');
  const results = dialog.querySelector('.archive-index-results');
  const tabs = [...archive.querySelectorAll('[role="tab"]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let currentTab = 'overview';
  let focusTimer;
  let parallaxFrame;
  let pointerSample;
  let lastMouseSelection;
  let hoverResumeAt = 0;
  let swipeStart;
  let drag;
  let rotation = {x:0,y:0};

  const ground = document.createElement('div');
  ground.className = 'archive-ground';
  world.append(ground);
  const volumes = [];
  const waveVolumes = [];
  const geometry = document.createDocumentFragment();
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 24; column++) {
      const volume = document.createElement('div');
      volume.className = 'file-volume';
      volume.style.setProperty('--book-x', `${column * 48}px`);
      volume.style.setProperty('--book-y', `${row * 392}px`);
      volume.style.setProperty('--book-height', `${152 + ((column + row * 3) % 5) * 2}px`);
      waveVolumes.push({volume, row, column});
      ['volume-top','volume-cover','volume-spine'].forEach(name => {
        const face = document.createElement('span');
        face.className = name;
        volume.append(face);
      });
      if (row === 1 && column >= 6 && column < 6 + records.length) {
        const index = column - 6;
        const label = document.createElement('b');
        label.className = 'volume-record';
        label.textContent = `KELEN / ${records[index].id}`;
        volume.querySelector('.volume-cover').append(label);
        volume.dataset.record = index;
        volumes[index] = volume;
      }
      geometry.append(volume);
      // A fixed plane keeps mouse selection steady while the files rise above it.
      const pickArea = document.createElement('div');
      pickArea.className = 'archive-pick-area';
      pickArea.style.setProperty('--book-x', `${column * 48}px`);
      pickArea.style.setProperty('--book-y', `${row * 392}px`);
      pickArea.dataset.pick = Math.max(0, Math.min(records.length - 1, column - 6));
      geometry.append(pickArea);
    }
  }
  world.append(geometry);

  function shapeWave(index) {
    const crest = index + 6;
    waveVolumes.forEach(({volume, row, column}) => {
      const distance = column - crest;
      const amplitude = row === 1 ? 134 : 89;
      const rise = amplitude * Math.exp(-(distance * distance) / 11.5) - 27;
      volume.style.setProperty('--wave-rise', `${rise.toFixed(2)}px`);
    });
  }

  function animateCopy(element, name) {
    element.classList.remove(name);
    void element.offsetWidth;
    element.classList.add(name);
  }

  function renderTab(key) {
    currentTab = key;
    tabs.forEach(tab => {
      const active = tab.dataset.tab === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    const panel = $('.detail-tab-panel');
    panel.setAttribute('aria-labelledby', `interest-tab-${key}`);
    panel.replaceChildren();
    if (window.KelenResearchVisual) {panel.append(window.KelenResearchVisual(records[current],key));return;}
    if (window.KelenVisuals) {
      panel.append(window.KelenVisuals.interest(current, key, records[current]));
      return;
    }
    if (key === 'focus') {
      const list = document.createElement('ul');
      records[current].focus.forEach(text => {
        const item = document.createElement('li');
        item.textContent = text;
        list.append(item);
      });
      panel.append(list);
    } else {
      const paragraph = document.createElement('p');
      paragraph.textContent = records[current][key];
      panel.append(paragraph);
    }
  }

  function setRecord(index, animate = true, pointerDriven = false) {
    if (!pointerDriven) {
      stopPointerFrame();
      hoverResumeAt = performance.now() + 450;
    }
    current = (index + records.length) % records.length;
    const record = records[current];
    const number = String(current + 1).padStart(2, '0');
    archive.dataset.current = current;
    archive.dataset.researchGroup=record.group;
    topicNav.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.group===record.group)));
    $('.archive-selection-rule span').textContent=record.field+' / '+record.status;
    archive.style.setProperty('--archive-focus-pan', `${112 - current * 37}px`);
    shapeWave(current);
    volumes.forEach((volume, i) => volume.classList.toggle('is-current', i === current));
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === current)));
    dotStrip.scrollLeft=dots[current].offsetLeft-dotStrip.offsetLeft-dotStrip.clientWidth*.5+dots[current].offsetWidth*.5;
    $('.archive-file-number b').textContent = record.id;
    $('.archive-selected-title').textContent = record.title;
    $('.archive-selected-subtitle').textContent = record.english;
    $('.archive-count').textContent = number;
    $('.detail-file-id').textContent = `FILE ${record.id}`;
    $('.detail-english').textContent = record.english;
    $('#interest-detail-title').textContent = record.title;
    $('.detail-field').textContent = record.field;
    $('.detail-keywords').textContent = record.keywords;
    $('.document-id').textContent = `NO.${record.id.slice(2)}`;
    $('.document-label').textContent = record.english;
    $('.archive-live').textContent = `已选择档案 ${number}：${record.title}`;
    readButton.setAttribute('aria-label', `读取档案 ${number}：${record.title}`);
    renderTab(currentTab);
    if (animate) animateCopy(archive.dataset.view === 'detail' ? detailCopy : selection, archive.dataset.view === 'detail' ? 'is-refreshing' : 'is-changing');
  }

  function resetModel() {
    rotation = {x:0,y:0};
    model.style.setProperty('--model-rx','0deg');
    model.style.setProperty('--model-ry','0deg');
  }

  function openRecord(index = current) {
    clearTimeout(focusTimer);
    stopPointerFrame();
    if (dialog.open) dialog.close();
    currentTab = 'overview';
    setRecord(index, false);
    resetModel();
    detail.inert = true;
    detail.setAttribute('aria-hidden', 'true');
    selection.inert = true;
    controls.inert = true;
    selection.setAttribute('aria-hidden', 'true');
    controls.setAttribute('aria-hidden', 'true');
    archive.dataset.view = 'detail';
    focusTimer = setTimeout(() => {
      detail.inert = false;
      detail.setAttribute('aria-hidden', 'false');
      $('#interest-detail-title').focus({preventScroll:true});
    }, motion.matches ? 0 : 950);
  }

  function closeRecord() {
    clearTimeout(focusTimer);
    archive.dataset.view = 'overview';
    detail.inert = true;
    detail.setAttribute('aria-hidden', 'true');
    selection.inert = false;
    controls.inert = false;
    selection.removeAttribute('aria-hidden');
    controls.removeAttribute('aria-hidden');
    detailCopy.classList.remove('is-refreshing');
    resetModel();
    readButton.focus({preventScroll:true});
  }

  readButton.addEventListener('click', () => openRecord());
  $('.archive-back').addEventListener('click', closeRecord);
  $('.archive-prev').addEventListener('click', () => setRecord(current - 1));
  $('.archive-next').addEventListener('click', () => setRecord(current + 1));
  $('.detail-next').addEventListener('click', () => {
    currentTab = 'overview';
    setRecord(current + 1);
    resetModel();
  });
  dots.forEach(dot => {
    dot.addEventListener('click', () => setRecord(Number(dot.dataset.record)));
    dot.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      let index = Number(dot.dataset.record);
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = records.length - 1;
      else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + records.length) % records.length;
      setRecord(index);
      dots[index].focus({preventScroll:true});
    });
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => renderTab(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      renderTab(tabs[next].dataset.tab);
      tabs[next].focus({preventScroll:true});
    });
  });

  archive.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (archive.dataset.view === 'overview') {
      if (['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(event.key)) {
        event.preventDefault();
        setRecord(current + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1));
      } else if (event.key === 'Enter' && !event.target.closest('button')) {
        event.preventDefault();
        openRecord();
      }
    } else if (event.key === 'Escape' && !dialog.open) {
      event.preventDefault();
      closeRecord();
    }
  });

  function renderIndex() {
    const query = search.value.trim().toLocaleLowerCase();
    const matches = records.map((record, index) => ({record,index})).filter(({record}) => `${record.id} ${record.title} ${record.english} ${record.field} ${record.keywords} ${record.source}`.toLocaleLowerCase().includes(query));
    results.replaceChildren();
    matches.forEach(({record,index}) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'archive-index-result';
      button.setAttribute('aria-label', `查看 ${record.id}：${record.title}`);
      const id = document.createElement('span');
      id.textContent = record.id;
      const name = document.createElement('strong');
      name.textContent = record.title;
      const english = document.createElement('small');
      english.textContent = record.english;
      name.append(english);
      const field = document.createElement('span');
      field.textContent = record.field;
      const arrow = document.createElement('span');
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden','true');
      button.append(id,name,field,arrow);
      button.addEventListener('click', () => openRecord(index));
      results.append(button);
    });
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'archive-index-empty';
      empty.textContent = '没有找到对应档案，试试其他关键词。';
      results.append(empty);
    }
    dialog.querySelector('.archive-index-count').textContent = `${String(matches.length).padStart(2,'0')} RECORDS FOUND`;
  }
  $('.archive-index-open').addEventListener('click', () => {
    search.value = '';
    renderIndex();
    dialog.showModal();
    search.focus();
  });
  dialog.querySelector('.archive-index-close').addEventListener('click', () => dialog.close());
  search.addEventListener('input', renderIndex);
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });

  function stopPointerFrame() {
    if (parallaxFrame) cancelAnimationFrame(parallaxFrame);
    parallaxFrame = null;
    pointerSample = null;
    lastMouseSelection = null;
  }
  archive.addEventListener('pointermove', event => {
    if (archive.dataset.view !== 'overview' || dialog.open || event.pointerType !== 'mouse') return;
    if (performance.now() < hoverResumeAt || (event.movementX === 0 && event.movementY === 0)) return;
    if (pointerSample && event.clientX === pointerSample.clientX && event.clientY === pointerSample.clientY) return;
    const file = event.target.closest('.file-volume[data-record]');
    const pickArea = event.target.closest('.archive-pick-area');
    const bounds = archive.getBoundingClientRect();
    pointerSample = {
      index: file ? Number(file.dataset.record) : pickArea ? Number(pickArea.dataset.pick) : null,
      clientX: event.clientX,
      clientY: event.clientY,
      x: ((event.clientX - bounds.left) / bounds.width - .5) * 8,
      y: ((event.clientY - bounds.top) / bounds.height - .5) * 4
    };
    if (parallaxFrame) return;
    parallaxFrame = requestAnimationFrame(() => {
      parallaxFrame = null;
      if (!pointerSample || archive.dataset.view !== 'overview' || dialog.open) return;
      const {index, x, y, clientX, clientY} = pointerSample;
      const moved = !lastMouseSelection || Math.hypot(clientX - lastMouseSelection.x, clientY - lastMouseSelection.y) > 10;
      if (index !== null && index !== current && moved) {
        setRecord(index, true, true);
        lastMouseSelection = {x:clientX, y:clientY};
      }
      archive.style.setProperty('--camera-x', `${motion.matches ? 0 : x}px`);
      archive.style.setProperty('--camera-y', `${motion.matches ? 0 : y}px`);
    });
  });
  archive.addEventListener('click', event => {
    const file = event.target.closest('.file-volume[data-record]');
    const pickArea = event.target.closest('.archive-pick-area');
    if ((file || pickArea) && archive.dataset.view === 'overview' && !dialog.open) openRecord(Number(file ? file.dataset.record : pickArea.dataset.pick));
  });
  archive.addEventListener('pointerleave', () => {
    stopPointerFrame();
    archive.style.setProperty('--camera-x','0px');
    archive.style.setProperty('--camera-y','0px');
  });
  archive.addEventListener('pointerdown', event => {
    if (archive.dataset.view === 'overview' && event.pointerType === 'touch' && !event.target.closest('button')) swipeStart = {x:event.clientX,y:event.clientY};
  });
  archive.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) setRecord(current + (dx < 0 ? 1 : -1));
    swipeStart = null;
  });
  archive.addEventListener('pointercancel', () => swipeStart = null);

  function applyRotation(x, y) {
    rotation = {x:Math.max(-18,Math.min(18,x)),y:Math.max(-44,Math.min(44,y))};
    model.style.setProperty('--model-rx',`${rotation.x}deg`);
    model.style.setProperty('--model-ry',`${rotation.y}deg`);
  }
  viewer.tabIndex = 0;
  viewer.setAttribute('role','group');
  viewer.setAttribute('aria-label','立体档案封面。拖动或用方向键旋转，Home 键复位。');
  model.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = {x:event.clientX,y:event.clientY,rx:rotation.x,ry:rotation.y};
    model.classList.add('is-dragging');
    model.setPointerCapture(event.pointerId);
  });
  model.addEventListener('pointermove', event => {
    if (drag) applyRotation(drag.rx - (event.clientY-drag.y)*.13,drag.ry + (event.clientX-drag.x)*.2);
  });
  function finishDrag(){drag=null;model.classList.remove('is-dragging');}
  model.addEventListener('pointerup',finishDrag);
  model.addEventListener('pointercancel',finishDrag);
  model.addEventListener('lostpointercapture',finishDrag);
  viewer.addEventListener('keydown', event => {
    if (event.target !== viewer || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') resetModel();
    else applyRotation(rotation.x + (event.key === 'ArrowUp' ? -5 : event.key === 'ArrowDown' ? 5 : 0),rotation.y + (event.key === 'ArrowLeft' ? -8 : event.key === 'ArrowRight' ? 8 : 0));
  });
  $('.archive-model-reset').addEventListener('click',resetModel);
  setRecord(0,false);
  archive.dataset.ready = 'true';
})();
