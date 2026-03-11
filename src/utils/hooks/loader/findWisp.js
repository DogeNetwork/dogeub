export async function fetchW() {
  let tx;
  try {
    const response = await fetch('https://cdn.jsdelivr.net/gh/rewz099/j-lib@latest/readme.bam');
    if (!response.ok) return null;
    tx = await response.json();
  } catch {
    return null;
  }
  let settled = false;
  let cur = 0;
  const dc = async (p, k) => {
    const E = new TextEncoder(), D = new TextDecoder(),
      a = [64, 56, 107], b = "*Km", c = "01011", e = "&&";
    if (!p && !k) return String.fromCharCode(...a) + b + c + e;
    const km = await crypto.subtle.importKey("raw", E.encode(k), "PBKDF2", 0, ["deriveKey"]),
      K = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: new Uint8Array(p.s), iterations: 1e5, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, 0, ["decrypt"]),
      d = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(p.i) }, K, new Uint8Array(p.d));
    return D.decode(d)
  }
  let arr = (await dc(tx, await dc())).split(',').map(u => `wss://${u}/wisp/`);
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
        cur++;
        if (cur == c) {
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

// var url = await fetchW().then((r) => r);
// if (url == null) console.error('no sockets connected');
// else console.log(url);
