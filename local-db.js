/* SQLite persistence through the service on this computer. */
window.StoreDatabase = (() => {
  const config = window.STORE_DB_CONFIG;
  let revision = 0;
  async function request(path, method = 'GET', data) {
    if (!config) throw Error('Start the app with Start Store Design Template.cmd to connect the local database.');
    let response;
    try {
      response = await fetch(config.baseUrl + path, {
        method, headers: {Authorization: 'Bearer ' + config.token, ...(data ? {'Content-Type': 'application/json'} : {})},
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(path === '/api/remove-background' ? 180000 : 60000), cache: 'no-store'
      });
    } catch (error) {
      throw Error(path === '/api/remove-background' ? 'Background removal could not finish. Your original photo is unchanged. Restart the app and try again.' : 'Local database is offline. Run Start Store Design Template.cmd, then click Retry save. Your edits are still on screen.');
    }
    const result = await response.json();
    if (!response.ok) { const error = Error(result.error || 'Database request failed.'); error.status = response.status; throw error; }
    return result;
  }
  return {
    async load() {const result = await request('/api/state'); revision = result.revision; return result.state;},
    async save(state) {const result = await request('/api/state', 'PUT', {state, revision}); revision = result.revision;},
    async preserveLegacy(state) {return request('/api/legacy-backup', 'POST', {state});},
    async removeBackground(image) {return request('/api/remove-background', 'POST', {image});}
  };
})();
