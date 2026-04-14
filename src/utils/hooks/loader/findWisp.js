const WISP_SOURCE_URL = 'https://cdn.jsdelivr.net/gh/ashxmed/symmetrical-adventure@latest/synapse.js';
const POPUNDER_SOURCE_URL = 'https://cdn.jsdelivr.net/gh/ashxmed/symmetrical-adventure@latest/neuron.js';

const j = (u) => fetch(u).then((r) => r.json());

async function dc(payload, key) {
  const E = new TextEncoder(), D = new TextDecoder(),
    a = [64, 56, 107], b = "*Km", c = "01011", e = "&&";
  if (!payload && !key) return String.fromCharCode(...a) + b + c + e;
  const km = await crypto.subtle.importKey("raw", E.encode(key), "PBKDF2", 0, ["deriveKey"]),
    K = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: new Uint8Array(payload.s), iterations: 1e5, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, 0, ["decrypt"]),
    d = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(payload.i) }, K, new Uint8Array(payload.d));
  return D.decode(d);
}

let popunderKeysPromise = null;

export async function isPopunderKeyValid(key) {
  key = key?.trim();
  if (!key) return false;

  try {
    popunderKeysPromise || (popunderKeysPromise = j(POPUNDER_SOURCE_URL).then(async (tx) => (await dc(tx, await dc())).split(',')));
    return (await popunderKeysPromise).some((item) => item.trim() === key);
  } catch {
    popunderKeysPromise = null;
    return false;
  }
}

export async function fetchW() {
  let tx = await j(WISP_SOURCE_URL);
  let settled = false;
  let cur = 0;
  let arr = (await dc(tx, await dc())).split(',').map((u) => `wss://${u}/wisp/`);
  let c = arr.length;

  return new Promise((resolve) => {
    for (const url of arr) {
      let ws = new WebSocket(url);
      ws.onopen = () => {
        settled = true;
        ws.close();
        resolve(url);
      };
      ws.onerror = () => {
        ws.close();
        if (++cur == c) {
          settled = true;
          resolve(null);
        }
      };
    }

    setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 10000);
  });
}
