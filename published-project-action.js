$('usePublishedProject').hidden = state.publishedProjectRevision === PUBLISHED_PROJECT_REVISION;
// Embedded in the editor scope so the save queue is paused during replacement.
$('usePublishedProject').addEventListener('click', async () => {
  if (!confirm('Load the owner\'s published project? This replaces the products, images and settings in this browser. Your current project will be downloaded as a backup first.')) return;
  const button = $('usePublishedProject');
  const app = document.querySelector('.app');
  button.disabled = true;
  button.textContent = 'Loading published project...';
  app.inert = true;
  try {
    if (!await flushDatabaseSave()) throw Error('Finish saving before loading the published project.');
    const published = await loadPublishedDefault();
    downloadStateBackup(state);
    await StoreDatabase.save(published);
    databaseQueued = false;
    button.hidden = true;
    location.reload();
  } catch (error) {
    showNotice(error.message);
    app.inert = false;
    button.disabled = false;
    button.textContent = 'Load published project';
  }
});
