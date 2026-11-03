/*
 * KELEN project preview — a single, editable résumé visualization.
 * Adapted from Lieflat Charts L5 “Radial Convergence” by 躺在废墟里.
 * Source: https://github.com/larashero3-dotcom/lieflat-charts
 * The radial item → hub Bézier structure and staggered SVG reveal are retained.
 * Example data replaced with user-provided résumé facts; layout, labels, keyboard
 * interaction, focus state, and mobile target sizes adapted for this website.
 * PolyForm Noncommercial 1.0.0: see LIEFLAT-LICENSE.txt.
 * Motion guidance: motion-web by feitangyuan, CC BY-NC 4.0.
 * https://github.com/feitangyuan/motion-web — see MOTION-WEB-LICENSE.txt.
 */
(() => {
  'use strict';
  const { el, txt, pol, DARK, MOTION } = window.MONO;
  const groups = [
    { id: 'tools', label: '工具入口', short: '工具', number: '01',
      title: '让常用工具，有一个共同入口。',
      description: '将截图、翻译、口播录制和虚拟场景等工具入口整合到本机工作台。',
      tags: ['macOS 本机工作台', '统一入口'],
      items: [
        { name: '截图', description: '工作台整合的常用工具入口之一，用于截图任务。' },
        { name: '翻译', description: '工作台整合的常用工具入口之一，用于翻译任务。' },
        { name: '口播录制', description: '将口播录制工具纳入工作台，从统一入口进入录制。' },
        { name: '虚拟场景', description: '将虚拟场景工具纳入工作台，集中管理创作入口。' }
      ]
    },
    { id: 'flows', label: '任务流程', short: '流程', number: '02',
      title: '六类任务，都有清楚的推进步骤。',
      description: '明确输入、处理步骤与交付检查；入口生成任务文本并跳转，由使用者确认提交。',
      tags: ['明确输入', '处理步骤', '交付检查', '人工确认提交'],
      items: ['软件开发', '视频制作', 'IP 调研', '口播视频', '网页工具', 'AI 资讯'].map(name => ({
        name, description: `${name}是工作台梳理的六类任务流程之一。明确输入、处理步骤与交付检查，生成任务文本并跳转后，由使用者确认提交。`
      }))
    },
    { id: 'outputs', label: '交付成果', short: '交付', number: '03',
      title: '成果留在本机，也能继续迭代。',
      description: '项目形成可安装应用、源码包和操作界面，支持后续使用与修改。',
      tags: ['可安装应用', '源码包', '操作界面'],
      items: [
        { name: '可安装应用', description: '形成 macOS 可安装应用，将工作台用于日常创作。' },
        { name: '源码包', description: '保留源码包，便于后续修改、维护和迭代。' },
        { name: '操作界面', description: '推进搜索、收藏、最近打开与运行状态等界面功能的迭代。' }
      ]
    }
  ];
  const svg = document.querySelector('#workbench-map');
  const controls = [...document.querySelectorAll('[data-group]')];
  const panel = document.querySelector('.inspector-content');
  const count = groups.reduce((sum, group) => sum + group.items.length, 0);
  const CX = 360, CY = 330, R = 246;
  const flat = groups.flatMap(group => group.items.map(item => ({ ...item, group })));
  let selectedGroup = null;
  let selectedItem = null;
  let panelAnimation;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLayout = window.matchMedia('(max-width: 900px)');
  if (new URLSearchParams(location.search).get('motion') === 'off') document.body.classList.add('motion-off');
  const still = () => reducedMotion.matches || document.body.classList.contains('motion-off');

  const updatePanel = (group, item) => {
    panelAnimation?.cancel();
    document.querySelector('#detail-number').textContent = group?.number || '01—03';
    document.querySelector('#detail-type').textContent = group?.label || '项目总览';
    document.querySelector('#detail-title').textContent = item?.name || group?.title || '从工具分散，到统一入口。';
    document.querySelector('#detail-copy').textContent = item?.description || group?.description || '整合常用工具、梳理任务步骤，并保留可安装应用与源码包。';
    const tagList = group?.tags || ['搜索', '收藏', '最近打开', '运行状态'];
    const tagRoot = document.querySelector('#detail-tags');
    tagRoot.replaceChildren(...tagList.map(label => { const span = document.createElement('span'); span.textContent = label; return span; }));
    if (!still()) panelAnimation = panel.animate([{ opacity: .3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  function select(group = null, item = null) {
    selectedGroup = group?.id || null;
    selectedItem = item?.name || null;
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.group === selectedGroup)));
    svg.querySelectorAll('.relationship').forEach(node => node.classList.toggle('dimmed', !!group && node.dataset.group !== group.id));
    svg.querySelectorAll('.node-button').forEach(node => {
      const selected = item ? node.dataset.item === item.name : !!group && node.dataset.hub === group.id;
      node.classList.toggle('selected', selected);
      node.setAttribute('aria-pressed', String(selected));
    });
    svg.querySelectorAll('.connection').forEach(path => path.classList.toggle('highlight', item ? path.dataset.item === item.name : !!group && path.dataset.group === group.id));
    updatePanel(group, item);
  }
  function makeButton(node, callback) {
    node.addEventListener('click', callback);
    node.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(); }
      if (event.key === 'Escape') select();
    });
  }
  function render() {
    svg.replaceChildren();
    txt(svg, { id: 'map-title' }, 'KELEN 本机创作工作台的内容关系');
    const title = svg.querySelector('#map-title');
    const properTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    properTitle.id = title.id; properTitle.textContent = title.textContent; title.replaceWith(properTitle);
    const desc = el(svg, 'desc', { id: 'map-desc' });
    desc.textContent = '13 个外圈节点归入 3 类：4 个已列出的工具入口、6 类任务流程、3 项交付成果。连线表示归属，不表示使用频率、自动执行或工作量。可点选或用 Tab、Enter 查看说明。';
    el(svg, 'circle', { cx: CX, cy: CY, r: R, class: 'orbit-guide' });
    const hubs = groups.map(group => {
      const indices = flat.map((item, i) => item.group.id === group.id ? i : -1).filter(i => i >= 0);
      const angle = ((indices[0] + indices.at(-1)) / 2) / count * 360 - 180;
      return { group, angle, point: pol(CX, CY, 86, angle) };
    });
    // L5 template: each named outer record converges to its category hub.
    flat.forEach((item, i) => {
      const deg = i / count * 360 - 180;
      const [px, py] = pol(CX, CY, R, deg);
      const hub = hubs.find(h => h.group.id === item.group.id);
      const [hx, hy] = hub.point;
      const c1x = CX + (px - CX) * .42, c1y = CY + (py - CY) * .42;
      const c2x = CX + (hx - CX) * .3, c2y = CY + (hy - CY) * .3;
      const group = el(svg, 'g', { class: 'relationship', 'data-group': item.group.id });
      el(group, 'path', { d: `M${px} ${py} C${c1x} ${c1y} ${c2x} ${c2y} ${hx} ${hy}`, class: 'connection draw', pathLength: 1, 'data-item': item.name, 'data-group': item.group.id, style: `--delay:${i * MOTION.staggerDot}ms` });
      const [tx, ty] = pol(CX, CY, R + 8, deg);
      const [ex, ey] = pol(CX, CY, R + 15, deg);
      el(group, 'line', { x1: tx, y1: ty, x2: ex, y2: ey, class: 'guide-tick fade', style: `--delay:${180 + i * 12}ms` });
      const button = el(group, 'g', { class: 'node-button', tabindex: 0, role: 'button', 'aria-label': `${item.name}，${item.group.label}，查看说明`, 'aria-pressed': 'false', 'data-item': item.name });
      el(button, 'circle', { cx: px, cy: py, r: 44, class: 'node-hit' });
      el(button, 'circle', { cx: px, cy: py, r: 14, class: 'node-ring' });
      el(button, 'circle', { cx: px, cy: py, r: 5, class: 'node-dot pop', style: `--delay:${150 + i * 12}ms` });
      const mobileOffset = item.name === '可安装应用' ? 54 : item.name === '虚拟场景' ? -42 : Math.sin(deg * Math.PI / 180) < -.15 ? -30 : 36;
      const [lx, ly] = mobileLayout.matches ? [px, py + mobileOffset] : pol(CX, CY, R + 36, deg);
      const cosine = Math.cos(deg * Math.PI / 180);
      txt(button, { x: lx, y: ly + 1, 'text-anchor': mobileLayout.matches ? 'middle' : cosine > .25 ? 'start' : cosine < -.25 ? 'end' : 'middle', 'dominant-baseline': 'middle', class: 'node-label fade', style: `--delay:${250 + i * 12}ms` }, item.name);
      makeButton(button, () => select(item.group, item));
    });
    hubs.forEach(({ group, point: [hx, hy] }, h) => {
      const root = el(svg, 'g', { class: 'relationship', 'data-group': group.id });
      const button = el(root, 'g', { class: 'node-button', tabindex: 0, role: 'button', 'aria-label': `聚焦${group.label}`, 'aria-pressed': 'false', 'data-hub': group.id });
      el(button, 'circle', { cx: hx, cy: hy, r: 44, class: 'node-hit' });
      el(button, 'circle', { cx: hx, cy: hy, r: Math.sqrt(group.items.length) * 7 + 7, class: 'node-ring' });
      el(button, 'circle', { cx: hx, cy: hy, r: Math.sqrt(group.items.length) * 7, fill: DARK.ink, class: 'pop', style: `--delay:${400 + h * 80}ms` });
      txt(button, { x: hx, y: hy + 1, 'dominant-baseline': 'middle', 'text-anchor': 'middle', class: 'hub-count fade', style: `--delay:${450 + h * 80}ms` }, String(group.items.length));
      txt(button, { x: hx, y: hy + 36, 'text-anchor': 'middle', class: 'hub-label fade', style: `--delay:${500 + h * 80}ms;paint-order:stroke;stroke:${DARK.bg};stroke-width:6px` }, group.short);
      makeButton(button, () => select(selectedGroup === group.id && !selectedItem ? null : group));
    });
    const group = groups.find(g => g.id === selectedGroup);
    select(group, group?.items.find(item => item.name === selectedItem));
  }
  controls.forEach(button => button.addEventListener('click', () => {
    const group = groups.find(g => g.id === button.dataset.group);
    select(selectedGroup === group.id && !selectedItem ? null : group);
  }));
  document.querySelector('#reset').addEventListener('click', () => select());
  document.querySelector('#replay').addEventListener('click', render);
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { render(); observer.disconnect(); }
  }, { threshold: .25 });
  observer.observe(svg);
  mobileLayout.addEventListener('change', () => { if (svg.querySelector('.node-button')) render(); });
})();
