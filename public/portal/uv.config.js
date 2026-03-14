const k = new TextEncoder().encode(btoa(new Date().toISOString().slice(0, 10) + location.host).split('').reverse().join('').slice(6.7));
const cfg = "/portal/uv.config.js";
const pfx = "/portal/k12/";
const trim = s => !s || s === "/" ? "" : s.replace(/\/$/, "");

const basePath = (() => {
    const src = typeof document !== "undefined" ? document.currentScript?.src : "";
    if (src) {
        const path = new URL(src, location.href).pathname;
        if (path.endsWith(cfg)) return trim(path.slice(0, -cfg.length));
    }

    const path = location.pathname;
    if (path.endsWith("/sw.js") || path.endsWith("/s_sw.js")) {
        return trim(path.slice(0, path.lastIndexOf("/")));
    }

    const i = path.indexOf(pfx);
    return i === -1 ? "" : trim(path.slice(0, i));
})();
self.__uv$config = {
    prefix: basePath + pfx,
    encodeUrl: s => {
        if (!s) return s;
        try {
            const d = new TextEncoder().encode(s), o = new Uint8Array(d.length);
            for (let i = 0; i < d.length; i++) o[i] = d[i] ^ k[i % 8];
            return Array.from(o, b => b.toString(16).padStart(2, "0")).join("");
        } catch { return s; }
    },
    decodeUrl: s => {
        if (!s) return s;
        try {
            const n = Math.min(s.indexOf('?') + 1 || s.length + 1, s.indexOf('#') + 1 || s.length + 1, s.indexOf('&') + 1 || s.length + 1) - 1;
            let h = 0;
            for (let i = 0; i < n && i < s.length; i++) {
                const c = s.charCodeAt(i);
                if (!((c >= 48 && c <= 57) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102))) break;
                h = i + 1;
            }
            if (h < 2 || h % 2) return decodeURIComponent(s);
            const l = h >> 1, o = new Uint8Array(l);
            for (let i = 0; i < l; i++) {
                const x = i << 1;
                o[i] = parseInt(s[x] + s[x + 1], 16) ^ k[i % 8];
            }
            return new TextDecoder().decode(o) + s.slice(h);
        } catch { return decodeURIComponent(s); }
    },
    handler: basePath + "/portal/uv.handler.js",
    client: basePath + "/portal/uv.client.js", 
    bundle: basePath + "/portal/uv.bundle.js",
    config: basePath + "/portal/uv.config.js",
    sw: basePath + "/portal/uv.sw.js"
};

self.console = new Proxy({}, {
  get: () => () => {}
});