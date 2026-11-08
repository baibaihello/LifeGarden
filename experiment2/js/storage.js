window.LG2Storage = (() => {
  let database;
  function open() {
    if (database) return Promise.resolve(database);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('lifegarden-experiment2-v1', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('states');
        request.result.createObjectStore('queue', { keyPath: 'filename' });
      };
      request.onsuccess = () => { database = request.result; resolve(database); };
      request.onerror = () => reject(request.error);
    });
  }
  async function transaction(stores, mode, work) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(stores, mode);
      let result;
      try { result = work(tx); } catch (error) { tx.abort(); reject(error); return; }
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || Error('本地保存已中止'));
    });
  }
  async function read(store, key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const request = db.transaction(store).objectStore(store).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function all(store) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const request = db.transaction(store).objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function checkpoint(state, upload) {
    const snapshot = JSON.parse(JSON.stringify(state));
    return transaction(['states', 'queue'], 'readwrite', tx => {
      tx.objectStore('states').put(snapshot, state.key);
      if (upload) tx.objectStore('queue').put(upload);
    });
  }
  function validateMainSnapshot(data) {
    const visit = value => {
      if (!value || typeof value !== 'object') return;
      if (Object.prototype.hasOwnProperty.call(value, 'pendingFiles')) throw Error('主快照禁止包含pendingFiles');
      Object.values(value).forEach(visit);
    };
    visit(data);
    const allowed = new Set(['tag','filename','mimeType','bytes','atISO']);
    for (const recording of data.data?.recordings || []) {
      if (Object.keys(recording).some(key => !allowed.has(key))) throw Error('主快照录音仅允许元数据');
    }
  }
  async function request(path, body) {
    // Defence in depth: rehearsal must never consume a live allocation or upload.
    const rehearsal = window.LG2_CONFIG?.RUN_MODE === 'prerun' ||
      (typeof location !== 'undefined' && new URLSearchParams(location.search).get('mode') === 'preview');
    if (rehearsal) throw Error('本地演练禁止调用DataPipe');
    if(path === 'data') {
      const data = JSON.parse(body.data);
      if(data.schemaVersion || Object.prototype.hasOwnProperty.call(data,'pendingFiles')) validateMainSnapshot(data);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://pipe.jspsych.org/api/' + path + '/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: controller.signal
      });
      let result;
      try { result = await response.json(); } catch { result = {}; }
      if (!response.ok) {
        const error = Error(result.message || '服务器返回 ' + response.status);
        error.code = result.error;
        error.status = response.status;
        throw error;
      }
      return result;
    } finally { clearTimeout(timer); }
  }
  let flushing = null;
  function flush(key) {
    if (flushing) return flushing;
    flushing = (async () => {
      let saved = 0;
      // Include files enqueued while an earlier batch is uploading, including final.
      while (true) {
      const entries = (await all('queue')).filter(e => e.sessionKey === key && !e.testData);
      if (!entries.length) return { saved, pending: 0 };
      for (const entry of entries) {
        try {
          await request(entry.kind === 'recording' ? 'base64' : 'data', {
            experimentID: entry.experimentID, filename: entry.filename, data: entry.data
          });
        } catch (error) {
          // The queue payload and random filename are immutable. A duplicate acknowledges a previous retry.
          if (!(error.code === 'FILE_EXISTS' || /already exists|file exists/i.test(error.message))) {
            const pending = (await all('queue')).filter(e => e.sessionKey === key && !e.testData).length;
            return { saved, pending, error: String(error) };
          }
        }
        await transaction(['queue'], 'readwrite', tx => tx.objectStore('queue').delete(entry.filename));
        saved++;
      }
      }
    })().finally(() => { flushing = null; });
    return flushing;
  }
  async function queue(entry) {
    return transaction(['queue'], 'readwrite', tx => tx.objectStore('queue').put(entry));
  }
  return { open, read, all, checkpoint, queue, flush, request, validateMainSnapshot };
})();
