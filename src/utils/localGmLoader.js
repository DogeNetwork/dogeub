import JSZip from 'jszip';

const DB_NAME = 'gm loader db';
const DB_VER = 1;
const STORE_NAME = 'gms';
const TEXT_EXTS = new Set(['html', 'htm', 'css', 'js', 'mjs', 'json', 'xml', 'txt', 'md', 'csv', 'svg']);

class LocalGmLoader {
  constructor() {
    this.db = null;
  }

  async initDB() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        this.db = req.result;
        resolve(this.db);
      };
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async dbAction(mode, action) {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], mode);
      const store = tx.objectStore(STORE_NAME);
      action(store, resolve, reject);
    });
  }

  async saveGm(gmName, files) {
    return this.dbAction('readwrite', (store, resolve, reject) => {
      const req = store.put({
        id: gmName,
        name: gmName,
        files,
        uploadDate: new Date().toISOString(),
        lastPlayed: new Date().toISOString()
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async updateLastPlayed(gmName) {
    return this.dbAction('readwrite', (store, resolve, reject) => {
      const getReq = store.get(gmName);
      getReq.onsuccess = () => {
        const gm = getReq.result;
        if (gm) {
          gm.lastPlayed = new Date().toISOString();
          const putReq = store.put(gm);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async cleanupOld() {
    return this.dbAction('readwrite', (store, resolve, reject) => {
      const req = store.openCursor();
      const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const gm = cursor.value;
          const lastPlayed = new Date(gm.lastPlayed || gm.uploadDate).getTime();
          if (lastPlayed < cutoff) cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getGm(gmName) {
    return this.dbAction('readonly', (store, resolve, reject) => {
      const req = store.get(gmName);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllGms() {
    return this.dbAction('readonly', (store, resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  isBinary(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return !TEXT_EXTS.has(ext);
  }

  async extractZip(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    const zip = await new JSZip().loadAsync(blob);
    const files = {};
    
    for (const [path, entry] of Object.entries(zip.files)) {
      if (!entry.dir) {
        const isBin = this.isBinary(path);
        files[path] = {
          content: await entry.async(isBin ? 'base64' : 'string'),
          mime: this.getMime(path),
          binary: isBin
        };
      }
    }
    return files;
  }

  async extractMultipleZips(urls) {
    const allFiles = {};
    
    for (const url of urls) {
      const files = await this.extractZip(url);
      //merge
      Object.assign(allFiles, files);
    }
    
    return allFiles;
  }

  getMime(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      html: 'text/html', htm: 'text/html', css: 'text/css',
      js: 'application/javascript', mjs: 'application/javascript',
      json: 'application/json', xml: 'application/xml',
      txt: 'text/plain', md: 'text/markdown', csv: 'text/csv',
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon',
      webp: 'image/webp', bmp: 'image/bmp', avif: 'image/avif',
      woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf',
      otf: 'font/otf', eot: 'application/vnd.ms-fontobject',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
      m4a: 'audio/mp4', aac: 'audio/aac',
      mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg',
      wasm: 'application/wasm', zip: 'application/zip',
      gz: 'application/gzip', pdf: 'application/pdf',
      data: 'application/octet-stream', unityweb: 'application/octet-stream',
      bundle: 'application/octet-stream', bin: 'application/octet-stream',
      dat: 'application/octet-stream', mem: 'application/octet-stream',
      asset: 'application/octet-stream', resource: 'application/octet-stream'
    };
    return types[ext] || 'application/octet-stream';
  }

  async regSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      let existing = regs.find(r => r.active?.scriptURL.includes('/loadersw.js'));
      
      if (!existing) {
        const reg = await navigator.serviceWorker.register('/loadersw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        
        await navigator.serviceWorker.ready;
        
        if (!navigator.serviceWorker.controller) {
          await new Promise(resolve => {
            navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
          });
        }
        
        return reg;
      }
      
      if (existing.installing || existing.waiting) {
        await new Promise(resolve => {
          const sw = existing.installing || existing.waiting;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'activated') {
              resolve();
            }
          });
        });
      }
      
      if (!navigator.serviceWorker.controller) {
        const reg = await navigator.serviceWorker.ready;
        const sw = reg.active;
        if (sw) {
          sw.postMessage({ type: 'SKIP_WAITING' });
          await new Promise(resolve => {
            navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
          });
        }
      }
      
      return existing;
    } catch (e) {
      console.error('from local gm loader', e);
    }
  }

  async load(url, onDownload) {
    await this.regSW();
    await this.initDB();
    
    const isSplitZip = Array.isArray(url);
    const firstUrl = isSplitZip ? url[0] : url;
    const gmName = firstUrl.split('/').pop().replace('.zip', '') || 'gm-' + Date.now();
    const existing = await this.getGm(gmName);
    
    if (existing) {
      await this.updateLastPlayed(gmName);
      return { url: `/game/${gmName}/index.html`, cached: true };
    }

    if (onDownload) onDownload(true);
    
    const files = isSplitZip 
      ? await this.extractMultipleZips(url)
      : await this.extractZip(url);
      
    await this.saveGm(gmName, files);
    if (onDownload) onDownload(false);
    
    return { url: `/game/${gmName}/index.html`, cached: false };
  }
}

export default LocalGmLoader;
