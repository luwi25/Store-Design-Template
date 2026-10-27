// Embedded in the editor closure by the browser build.
function restoredTemplateProject(current, published, templateId) {
  const keys = {'home-everyday':'everyday','home-back':'homeBack','home-collection':'homeCollection','home-collection-front':'homeCollectionFront','peso-plus':'peso','peso-back':'pesoBack','peso-collection-front':'pesoCollectionFront','peso-collection-back':'pesoCollectionBack','alkeia-talamban-front':'alkeiaFront'};
  const key = keys[templateId];
  if (!key || !Array.isArray(published[key]?.slots)) {
    throw Error('This template has no published default. Choose a store template.');
  }
  if (!Array.isArray(published.products) || !published.templateSettings?.[templateId]) {
    throw Error('The published template is incomplete. Your project has not been changed.');
  }
  const next = structuredClone(current);
  next[key] = structuredClone(published[key]);
  next.templateSettings ||= {};
  next.templateSettings[templateId] = structuredClone(published.templateSettings[templateId]);
  next.templateNames ||= {};
  if (published.templateNames?.[templateId] !== undefined) next.templateNames[templateId] = published.templateNames[templateId];
  else delete next.templateNames[templateId];
  const catalog = new Map(published.products.map(product => [product.id, product]));
  const remapped = new Map();
  // Never overwrite a shared catalog record: another poster may still use it.
  const restoreSlots = (slots, active = true) => {
    for (const slot of slots || []) {
      if (!slot.productId) continue;
      const originalId = slot.productId;
      if (!remapped.has(originalId)) {
        const product = catalog.get(originalId);
        if (!product) {
          // Legacy generic slots are not used by these canvas templates.
          if (!active) { slot.productId = null; continue; }
          throw Error('A published product is missing. Your project has not been changed.');
        }
        const existing = next.products.find(item => item.id === originalId);
        let id = originalId;
        if (existing && JSON.stringify(existing) !== JSON.stringify(product)) {
          id = 'restored-' + crypto.randomUUID();
        }
        if (!existing || id !== originalId) next.products.push({...structuredClone(product), id});
        next.deletedProductIds = (next.deletedProductIds || []).filter(deleted => deleted !== id);
        remapped.set(originalId, id);
      }
      slot.productId = remapped.get(originalId);
    }
  };
  restoreSlots(next[key].slots);
  restoreSlots(next.templateSettings[templateId].slots, false);
  next.templateId = templateId;
  // Keep serialized active settings consistent with the per-template getters.
  for (const name of ['poster','textSizes','discount','slots']) {
    next[name] = structuredClone(next.templateSettings[templateId][name]);
  }
  next.selectedSlot = -1;
  // The selected reset already read this revision. Do not let startup replace
  // the other templates just because the previous saved revision was older.
  next.publishedProjectRevision = published.publishedProjectRevision;
  return next;
}

function setupRestoreDefaults() {
  if (typeof window.loadPublishedDefault !== 'function') return;
  const toolbarButton = document.createElement('button');
  toolbarButton.type = 'button';
  toolbarButton.id = 'restorePublishedDefaults';
  toolbarButton.className = 'btn';
  toolbarButton.textContent = 'Restore Published Defaults';
  toolbarButton.setAttribute('aria-haspopup','dialog');
  const backgroundButton = $('bgRemoverBtn');
  if (backgroundButton) backgroundButton.after(toolbarButton);
  else document.querySelector('.top-actions').append(toolbarButton);
  const panel = document.createElement('dialog');
  panel.className = 'restore-defaults-dialog restore-defaults-picker';
  panel.setAttribute('aria-labelledby','restoreDefaultsPickerTitle');
  panel.innerHTML = '<h2 id="restoreDefaultsPickerTitle">Restore Published Defaults</h2><p class="helper">Choose what to restore to the latest owner-published version. You can download a backup before confirming.</p><div class="restore-defaults-actions"><button class="btn" type="button" data-reset="template">Reset selected template</button><button class="btn" type="button" data-reset="project">Reset entire project</button><button class="btn" type="button" data-close>Cancel</button></div>';
  document.body.append(panel);
  toolbarButton.onclick = () => panel.showModal();
  panel.querySelector('[data-close]').onclick = () => panel.close();
  panel.addEventListener('close', () => { if (!dialog.open) toolbarButton.focus(); });
  const dialog = document.createElement('dialog');
  dialog.className = 'restore-defaults-dialog';
  dialog.setAttribute('aria-labelledby','restoreDefaultsTitle');
  dialog.setAttribute('aria-describedby','restoreDefaultsDescription');
  dialog.innerHTML = '<h2 id="restoreDefaultsTitle"></h2><p id="restoreDefaultsDescription"></p><p class="helper">Download a backup first if you may need your current edits again. A reset replaces your edits; it does not merge them.</p><button class="btn" type="button" data-backup>Download backup</button><p class="helper" role="status" aria-live="polite" data-status></p><div class="restore-defaults-actions"><button class="btn" type="button" data-cancel>Cancel</button><button class="btn btn-primary" type="button" data-confirm>Restore defaults</button></div>';
  document.body.append(dialog);
  const status = dialog.querySelector('[data-status]');
  let scope, selectedId, busy = false, trigger;
  const enable = value => { for (const button of dialog.querySelectorAll('button')) button.disabled = !value; };
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-reset]');
    if (!button || busy) return;
    scope = button.dataset.reset; selectedId = state.templateId; trigger = toolbarButton;
    panel.close();
    dialog.querySelector('h2').textContent = scope === 'template' ? 'Reset selected template?' : 'Reset entire project?';
    dialog.querySelector('#restoreDefaultsDescription').textContent = scope === 'template'
      ? 'Restore “' + templateName(selectedId) + '” including its products, photos, discounts, text sizes, name and settings. Other templates and existing catalog edits are kept. Published product copies may be added to the catalog.'
      : 'Replace all templates, products, photos and settings with the latest published project. This includes custom templates and catalog edits.';
    status.textContent = ''; dialog.showModal(); dialog.querySelector('[data-cancel]').focus();
  });
  dialog.querySelector('[data-backup]').onclick = () => {
    downloadStateBackup(state);
    status.textContent = 'Backup download requested. Check your downloads before restoring.';
  };
  dialog.querySelector('[data-cancel]').onclick = () => dialog.close();
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => trigger?.focus());
  dialog.querySelector('[data-confirm]').onclick = async () => {
    if (busy) return;
    busy = true; enable(false); dialog.setAttribute('aria-busy','true');
    const app = document.querySelector('.app'), previousInert = app.inert;
    app.inert = true;
    let saved = false, ownsSaveLock = false;
    try {
      if (navigator.onLine === false) throw Error('Connect to the internet to restore the latest published defaults.');
      status.textContent = 'Loading published products and images…';
      const published = await window.loadPublishedDefault({fresh:true});
      if (!Array.isArray(published.products) || !Array.isArray(published.templates)) throw Error('The published project is invalid.');
      if (!await flushDatabaseSave()) throw Error('Finish saving or reload after downloading a backup, then try again.');
      const replacement = scope === 'template'
        ? restoredTemplateProject(structuredClone(state), published, selectedId) : published;
      status.textContent = 'Saving restored defaults…';
      databaseSaving = true;
      ownsSaveLock = true;
      await StoreDatabase.save(replacement);
      saved = true;
      clearTimeout(saveTimer); saveTimer = null; databaseQueued = false;
      status.textContent = 'Defaults restored. Reloading…';
      location.reload();
    } catch (error) {
      if (error.status === 409) databaseConflict = true;
      status.textContent = error.message || 'Could not restore defaults. Please try again.';
    } finally {
      if (!saved) {
        if (ownsSaveLock) databaseSaving = false;
        busy = false; enable(true); dialog.removeAttribute('aria-busy'); app.inert = previousInert;
        dialog.querySelector('[data-cancel]').focus();
      }
    }
  };
}
