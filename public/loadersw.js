const DB_NAME = 'gm loader db';
const DB_VER = 1;
const STORE_NAME = 'gms';

const gmCcahe = new Map();

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VER);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getGms(gameId) {
  if (gmCcahe.has(gameId)) {
    return gmCcahe.get(gameId);
  }
  
  const db = await openDB();
  return new Promise((resolve, reject) => {
    //thank you webdev
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(gameId);
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        gmCcahe.set(gameId, result);
      }
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}

function b64tooBlob(base64, mimeType) {
  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([uint8Array], { type: mimeType });
}

function findFile(files, requestedPath) {
  const normalizePathForMatching = (p) => {
    return p.replace(/^\/+/, '').replace(/\\/g, '/');
  };
  
  const normalizedRequest = normalizePathForMatching(requestedPath);
  
  if (files[requestedPath]) {
    return { data: files[requestedPath], path: requestedPath };
  }
  
  if (files[normalizedRequest]) {
    return { data: files[normalizedRequest], path: normalizedRequest };
  }
  
  for (const path in files) {
    const normalizedPath = normalizePathForMatching(path);
    
    if (normalizedPath === normalizedRequest) {
      return { data: files[path], path: path };
    }
    
    if (normalizedPath === normalizedRequest + '/' || normalizedPath + '/' === normalizedRequest) {
      return { data: files[path], path: path };
    }
  }
  
  const requestedFilename = normalizedRequest.split('/').pop();
  if (requestedFilename) {
    for (const path in files) {
      const normalizedPath = normalizePathForMatching(path);
      const filename = normalizedPath.split('/').pop();
      
      if (filename === requestedFilename) {
        if (normalizedPath.endsWith(normalizedRequest) || normalizedRequest.endsWith(normalizedPath)) {
          return { data: files[path], path: path };
        }
      }
    }
  }
  
  const lowerRequest = normalizedRequest.toLowerCase();
  for (const path in files) {
    const normalizedPath = normalizePathForMatching(path);
    if (normalizedPath.toLowerCase() === lowerRequest) {
      return { data: files[path], path: path };
    }
  }
  
  return null;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const match = url.pathname.match(/^\/game\/([^\/]+)\/(.+)$/);
  
  if (event.request.method === 'OPTIONS') {
    event.respondWith(
      new Response(null, {
        status: 200,
        headers: new Headers({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        })
      })
    );
    return;
  }
  
  if (match) {
    const gameId = match[1];
    const filePath = match[2];
    
    event.respondWith(
      (async () => {
        try {
          const gameData = await getGms(gameId);
          if (!gameData || !gameData.files) {
            return new Response('game not found', { status: 404 });
          }
          
          const found = findFile(gameData.files, filePath);
          if (!found) {
            return new Response('couldnt find file: ' + filePath, { status: 404 });
          }
          
          const fileData = found.data;
          let content, mimeType, isBinary;
          
          if (typeof fileData === 'object' && fileData.content !== undefined) {
            content = fileData.content;
            mimeType = fileData.mime || fileData.mimeType || 'application/octet-stream';
            isBinary = fileData.binary !== undefined ? fileData.binary : fileData.isBinary;
          } else {
            content = fileData;
            const ext = found.path.split('.').pop().toLowerCase();
            const fallbackMimes = {
              html: 'text/html', css: 'text/css', js: 'application/javascript',
              json: 'application/json', png: 'image/png', jpg: 'image/jpeg',
              gif: 'image/gif', svg: 'image/svg+xml', woff: 'font/woff',
              woff2: 'font/woff2', ttf: 'font/ttf', wasm: 'application/wasm',
              txt: 'text/plain', xml: 'application/xml', webp: 'image/webp',
              mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav'
            };
            mimeType = fallbackMimes[ext] || 'application/octet-stream';
            const textExts = new Set(['html', 'htm', 'css', 'js', 'mjs', 'json', 'xml', 'txt', 'md', 'csv', 'svg']);
            isBinary = !textExts.has(ext);
          }
          
          const headers = new Headers({
            'Content-Type': mimeType + (isBinary ? '' : '; charset=utf-8'),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Content-Type-Options': 'nosniff',
          });
          
          const resBody = isBinary ? b64tooBlob(content, mimeType) : content;
          return new Response(resBody, { 
            status: 200,
            statusText: 'OK',
            headers 
          });
          
        } catch (error) {
          return new Response('err: ' + error.message, { status: 500 });
        }
      })()
    );
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    gmCcahe.clear();
    event.ports[0].postMessage({ success: true });
  }
});
