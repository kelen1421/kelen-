/* Resolve saved profile/project links to sections in the single personal site. */
(() => {
  const params = new URLSearchParams(location.search);
  const targets = ['workbench', 'hueform', 'reel'];
  const index = Number(params.get('project'));
  const project = document.body.dataset.legacyPage === 'project';
  const hash = location.hash || (project && targets[index] ? '#' + targets[index] : '#top');
  params.delete('project');
  const target = new URL('/', location.href);
  target.search = params.toString();
  target.hash = hash;
  location.replace(target.href);
})();
