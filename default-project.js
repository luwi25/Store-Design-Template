/* Lightweight check for a newer published catalog -- lets a browser that
   already has a saved project notice a new weekly sync without re-fetching
   every product image just to find out. */
window.fetchPublishedRevision = async function () {
  const base = new URL('defaults/', document.baseURI);
  const response = await fetch(new URL('project.json', base));
  if (!response.ok) return null;
  const project = await response.json();
  return typeof project.sourceRevision === 'number' ? project.sourceRevision : null;
};

/* Public starter project. Called when this browser has no saved project,
   or when a newer one has been published since the last save. */
window.loadPublishedDefault = async function () {
  const base = new URL('defaults/', document.baseURI);
  const response = await fetch(new URL('project.json', base));
  if (!response.ok) throw new Error('The starting project could not load. Please retry.');
  const project = await response.json();
  if (project.version !== 1 || !Array.isArray(project.state?.products)) {
    throw new Error('Invalid starting project.');
  }
  const images = new Map();
  function collect(value) {
    if (!value || typeof value !== 'object') return;
    if (value.__defaultImage) {
      if (!/^images\/[a-f0-9]{64}\.(png|jpg|webp|svg)$/.test(value.__defaultImage)) throw new Error('Invalid starter image path.');
      images.set(value.__defaultImage, value.mime);
    } else Object.values(value).forEach(collect);
  }
  collect(project.state);
  const queue = [...images.entries()];
  const loaded = new Map();
  await Promise.all(Array.from({length: Math.min(4, queue.length)}, async () => {
    while (queue.length) {
      const [path, mime] = queue.shift();
      const image = await fetch(new URL(path, base));
      if (!image.ok) throw new Error('A starting product image could not load. Please retry.');
      const blob = new Blob([await image.arrayBuffer()], {type: mime});
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      loaded.set(path, data);
    }
  }));
  function hydrate(value) {
    if (!value || typeof value !== 'object') return value;
    if (value.__defaultImage) return loaded.get(value.__defaultImage);
    if (Array.isArray(value)) return value.map(hydrate);
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, hydrate(item)]));
  }
  const state = hydrate(project.state);
  state.publishedProjectRevision = project.sourceRevision;
  return state;
};
