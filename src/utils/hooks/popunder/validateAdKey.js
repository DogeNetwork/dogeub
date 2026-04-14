const CFG_URLS = [
  'https://cdn.jsdelivr.net/gh/ashxmed/symmetrical-adventure@latest/neuron.js',
  'https://unpkg.com/@qerionx/neuron-synapse@1.0.0/neuron.js',
];

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let cfgPromise;

function b64uDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const bin = atob(base64);
  return new Uint8Array([...bin].map((ch) => ch.charCodeAt(0)));
}

async function decodeBundle(payload, key) {
  const s = [64, 56, 107];
  const x = '*Km';
  const m = '01011';
  const t = '&&';

  if (!payload && !key) {
    return String.fromCharCode(...s) + x + m + t;
  }

  const imp = await crypto.subtle.importKey('raw', encoder.encode(key), 'PBKDF2', false, [
    'deriveKey',
  ]);
  const dk = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(payload.s),
      iterations: 100000,
      hash: 'SHA-256',
    },
    imp,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
  const dec = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(payload.i) },
    dk,
    new Uint8Array(payload.d),
  );

  return decoder.decode(dec);
}

async function fetchCfg(urls = CFG_URLS) {
  if (!cfgPromise) {
    cfgPromise = (async () => {
      const list = Array.isArray(urls) ? urls : [urls];
      let lastErr;

      for (const url of list) {
        try {
          const enc = await fetch(url, { cache: 'no-store' }).then((res) => {
            if (!res.ok) throw new Error('aConfig failed: load');
            return res.json();
          });

          const k = await decodeBundle();
          const raw = await decodeBundle(enc, k);
          const parsed = JSON.parse(raw);
          const cfg = Array.isArray(parsed) ? JSON.parse(parsed.join('')) : parsed;

          if (!cfg || typeof cfg !== 'object') {
            throw new Error('invalid aConfig payload');
          }

          return cfg;
        } catch (err) {
          lastErr = err;
        }
      }

      throw lastErr || new Error('aConfig unavailable');
    })().catch((err) => {
      cfgPromise = null;
      throw err;
    });
  }

  return cfgPromise;
}

async function importPublicKey(rawB64Url) {
  return crypto.subtle.importKey('raw', b64uDecode(rawB64Url), { name: 'Ed25519' }, false, [
    'verify',
  ]);
}

function decodeAdKey(adKey) {
  const p = adKey.trim().split('.');
  if (p.length !== 3 || p[0] !== 'AD1') {
    throw new Error('aKey format invalid');
  }

  const pb = b64uDecode(p[1]);
  const sb = b64uDecode(p[2]);
  const pay = JSON.parse(decoder.decode(pb));

  return { payloadBytes: pb, signatureBytes: sb, payload: pay };
}

export async function validateAdKey(adKey, cfgUrls = CFG_URLS) {
  try {
    if (!adKey || typeof adKey !== 'string') return false;

    const cfg = await fetchCfg(cfgUrls);
    const { payloadBytes, signatureBytes, payload } = decodeAdKey(adKey);

    if (payload?.v !== 1) return false;
    if (payload?.kid !== cfg?.kid) return false;
    if (payload?.product !== cfg?.product) return false;
    if (typeof payload?.exp !== 'number') return false;
    if (Date.now() / 1000 > payload.exp) return false;

    const publicKey = await importPublicKey(cfg.pub);
    return crypto.subtle.verify('Ed25519', publicKey, signatureBytes, payloadBytes);
  } catch {
    return false;
  }
}
