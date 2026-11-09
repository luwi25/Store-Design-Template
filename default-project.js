/* Lightweight check for a newer published catalog -- lets a browser that
   already has a saved project notice a new weekly sync without re-fetching
   every product image just to find out. */
async function fetchFreshPublishedProject(base, {allowOffline = true} = {}) {
  const url = new URL('project.json', base);
  // Bypass both the HTTP cache and older installed workers' exact-URL caches.
  url.searchParams.set('check', Date.now().toString());
  try {
    const response = await fetch(url, {cache: 'no-store', signal: AbortSignal.timeout(10000)});
    if (response.ok) return response;
    throw new Error('Published project request failed.');
  } catch (error) {
    // Preserve offline startup using the worker's previously downloaded project.
    if (!allowOffline || navigator.onLine !== false) throw error;
    return fetch(new URL('project.json', base));
  }
}

function receivePublishedTemplateVisibility(project){
  if(project.version!==1||!project.state)return;
  window.publishedTemplateVisibility=Object.fromEntries(Object.entries(project.state.templateVisibility||{}).filter(([id,value])=>typeof value==='boolean'));
  window.dispatchEvent(new window.Event('published-template-visibility'));
}
let checkedPublishedProject;
window.fetchPublishedRevision = async function () {
  const base = new URL('defaults/', document.baseURI);
  const response = await fetchFreshPublishedProject(base);
  if (!response.ok) return null;
  const project = await response.json();
  checkedPublishedProject = project;
  receivePublishedTemplateVisibility(project);
  return typeof project.sourceRevision === 'number' ? project.sourceRevision : null;
};

/* Public starter project. Called when this browser has no saved project,
   or when a newer one has been published since the last save. */
window.loadPublishedDefault = async function ({fresh = false} = {}) {
  const base = new URL('defaults/', document.baseURI);
  let project = fresh ? undefined : checkedPublishedProject;
  if (!project) {
    const response = await fetchFreshPublishedProject(base, {allowOffline: !fresh});
    if (!response.ok) throw new Error('The starting project could not load. Please retry.');
    project = await response.json();
  }
  checkedPublishedProject = undefined;
  if (project.version !== 1 || !Array.isArray(project.state?.products)) {
    throw new Error('Invalid starting project.');
  }
  receivePublishedTemplateVisibility(project);
  function hydrate(value) {
    if (!value || typeof value !== 'object') return value;
    if (value.__defaultImage) {
      if (!/^images\/[a-f0-9]{64}\.(png|jpg|webp|svg)$/.test(value.__defaultImage)) throw new Error('Invalid starter image path.');
      const url = new URL(value.__defaultImage, base);
      // Relative URLs preserve shared-catalog identity and same-origin canvas export.
      const app = new URL('.', document.baseURI);
      return url.href.startsWith(app.href) ? url.href.slice(app.href.length) : url.href;
    }
    if (Array.isArray(value)) return value.map(hydrate);
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, hydrate(item)]));
  }
  const state = hydrate(project.state);
  state.publishedProjectRevision = project.sourceRevision;
  return state;
};
