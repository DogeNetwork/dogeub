import { defineConfig, normalizePath } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react-swc';
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { logging, server as wisp } from '@mercuryworkshop/wisp-js/server';
import { createBareServer } from '@tomphttp/bare-server-node';
import { bareModulePath } from '@mercuryworkshop/bare-as-module3';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { baremuxPath } from 'bare-mux-fork/node';
import { scramjetPath } from '@mercuryworkshop/scramjet/path';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import dotenv from 'dotenv';

dotenv.config();
const useBare = process.env.BARE === 'false' ? false : true;
const isStatic = process.env.STATIC === 'true';
const gaMeasurementId = 'G-HWLK0PZVBM';

const __dirname = dirname(fileURLToPath(import.meta.url));
logging.set_level(logging.NONE);
let bare;

const svgDomShim = `(() => {
  const ns = 'http://www.w3.org/1999/xhtml';
  const body = document.querySelector('body');
  if (!body) return;
  const svgRoot = document.documentElement;

  const head = document.createElementNS(ns, 'head');
  body.prepend(head);

  const htmlRoot = body.parentElement && body.parentElement.namespaceURI === ns
    ? body.parentElement
    : body;

  try {
    Object.defineProperty(document, 'head', {
      configurable: true,
      get() {
        return head;
      },
    });
  } catch {}

  try {
    Object.defineProperty(document, 'body', {
      configurable: true,
      get() {
        return body;
      },
    });
  } catch {}

  try {
    Object.defineProperty(document, 'documentElement', {
      configurable: true,
      get() {
        return htmlRoot;
      },
    });
  } catch {}

  try {
    Object.defineProperty(svgRoot, 'className', {
      configurable: true,
      get() {
        return svgRoot.getAttribute('class') || '';
      },
      set(value) {
        svgRoot.setAttribute('class', value || '');
      },
    });
  } catch {}

  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function createElement(tagName, options) {
    return typeof tagName === 'string'
      ? document.createElementNS(ns, tagName, options)
      : originalCreateElement(tagName, options);
  };
})();`;

const escapeCdata = (value) => value.replace(/]]>/g, ']]]]><![CDATA[>');

const createSvgEntry = (bundle) => {
  const entryChunk = Object.values(bundle).find((item) => item.type === 'chunk' && item.isEntry);
  if (!entryChunk) return null;

  const cssFiles = [...(entryChunk.viteMetadata?.importedCss ?? [])].sort();
  const preloadFiles = [...new Set(entryChunk.imports)].sort();

  const headBootstrap = [
    `const headNodes = [`,
    `  { tag: 'meta', attrs: { charset: 'UTF-8' } },`,
    `  { tag: 'link', attrs: { rel: 'icon', type: 'image/svg+xml', href: '' } },`,
    `  { tag: 'meta', attrs: { name: 'viewport', content: 'initial-scale=1, width=device-width' } },`,
    ...preloadFiles.map(
      (file) => `  { tag: 'link', attrs: { rel: 'modulepreload', href: './${file}', crossorigin: '' } },`,
    ),
    ...cssFiles.map(
      (file) => `  { tag: 'link', attrs: { rel: 'stylesheet', href: './${file}', crossorigin: '' } },`,
    ),
    `];`,
    `for (const nodeDef of headNodes) {`,
    `  const node = document.createElement(nodeDef.tag);`,
    `  for (const [name, value] of Object.entries(nodeDef.attrs)) node.setAttribute(name, value);`,
    `  document.head.appendChild(node);`,
    `}`,
    `const title = document.createElement('title');`,
    `title.textContent = 'DogeUB';`,
    `document.head.appendChild(title);`,
    `const analyticsLoader = document.createElement('script');`,
    `analyticsLoader.async = true;`,
    `analyticsLoader.src = 'https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}';`,
    `document.head.appendChild(analyticsLoader);`,
    `const analyticsConfig = document.createElement('script');`,
    `analyticsConfig.textContent = \"window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaMeasurementId}', { send_page_view: false });\";`,
    `document.head.appendChild(analyticsConfig);`,
    `const entryScript = document.createElement('script');`,
    `entryScript.type = 'module';`,
    `entryScript.setAttribute('crossorigin', '');`,
    `entryScript.src = './${entryChunk.fileName}';`,
    `document.body.appendChild(entryScript);`,
  ].join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="position: fixed; inset: 0;">
  <foreignObject x="0" y="0" width="100%" height="100%">
    <body xmlns="http://www.w3.org/1999/xhtml" lang="en" style="margin: 0; width: 100%; height: 100%; min-height: 100vh; overflow: auto;">
      <div id="root"></div>
      <style><![CDATA[
html,
body,
#root {
  width: 100%;
  min-height: 100vh;
}

body {
  margin: 0;
  background-size: 24px 24px;
  opacity: 1;
}
      ]]></style>
      <script><![CDATA[
${escapeCdata(`${svgDomShim}
${headBootstrap}`)}
      ]]></script>
    </body>
  </foreignObject>
</svg>
`;
};

Object.assign(wisp.options, {
  dns_method: 'resolve',
  dns_servers: ['1.1.1.3', '1.0.0.3'],
  dns_result_order: 'ipv4first',
});

const routeRequest = (req, resOrSocket, head) => {
  if (req.url?.startsWith('/wisp/')) return wisp.routeRequest(req, resOrSocket, head);
  if (bare.shouldRoute(req))
    return head ? bare.routeUpgrade(req, resOrSocket, head) : bare.routeRequest(req, resOrSocket);
};

const obf = {
  enable: true,
  autoExcludeNodeModules: true,
  threadPool: false,
  options: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.3,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'mangled',
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayEncoding: [],
    stringArrayCallsTransform: false,
    stringArrayThreshold: 0.5,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
    ignoreImports: true,
  },
};

export default defineConfig(({ command }) => {
  const environment = isStatic ? 'static' : command === 'serve' ? 'dev' : 'stable';

  return {
    base: isStatic ? './' : '/',
    plugins: [
      react(),
      vitePluginBundleObfuscator(obf),
      viteStaticCopy({
        targets: [
          { src: [normalizePath(resolve(libcurlPath, '*'))], dest: 'libcurl' },
          { src: [normalizePath(resolve(baremuxPath, '*'))], dest: 'baremux' },
          { src: [normalizePath(resolve(scramjetPath, '*'))], dest: 'eggs' },
          useBare && { src: [normalizePath(resolve(bareModulePath, '*'))], dest: 'baremod' },
          {
            src: [
              normalizePath(resolve(uvPath, 'uv.handler.js')),
              normalizePath(resolve(uvPath, 'uv.client.js')),
              normalizePath(resolve(uvPath, 'uv.bundle.js')),
              normalizePath(resolve(uvPath, 'uv.sw.js')),
            ],
            dest: 'portal',
          },
        ].filter(Boolean),
      }),
      isStatic && {
        name: 'replace-cdn',
        transform(code, id) {
          if (id.endsWith('apps.json') || id.endsWith('QuickLinks.jsx')) {
            return code
              .replace(/\/assets-fb\//g, 'https://cdn.jsdelivr.net/gh/DogeNetwork/v5-assets/img/server/')
              .replace(/\/assets\/img\//g, 'https://cdn.jsdelivr.net/gh/DogeNetwork/v5-assets/img/');
          }
          /*
            this may be weird, bc even if static = true,
            the images/files are still there, so why rewrite to use jsdelivr?
            because we feel like it. (this is needed under very specific circumstances)
          */
          if (id.endsWith('Logo.jsx')) {
            return code
              .replace(/['"]\/logo\.svg['"]/g, "'https://cdn.jsdelivr.net/gh/DogeNetwork/v5-assets/logo.svg'");
          }
          if (id.endsWith('useReg.js')) {
            return code
              .replace(/['"]\/eggs\/scramjet\.wasm\.wasm['"]/g, "'https://cdn.jsdelivr.net/gh/DogeNetwork/v5-assets/eggs/scramjet.wasm.wasm'")
              .replace(/['"]\/eggs\/scramjet\.all\.js['"]/g, "'https://cdn.jsdelivr.net/gh/DogeNetwork/v5-assets/eggs/scramjet.all.js'")
              .replace(/['"]\/eggs\/scramjet\.sync\.js['"]/g, "'https://cdn.jsdelivr.net/gh/DogeNetwork/v5-assets/eggs/scramjet.sync.js'")
              .replace(/['"]\/libcurl\/index\.mjs['"]/g, "'https://cdn.jsdelivr.net/gh/DogeNetwork/v5-assets/libcurl/index.mjs'");
          }
        },
      },
      {
        name: 'server',
        apply: 'serve',
        configureServer(server) {
          bare = createBareServer('/seal/');
          server.httpServer?.on('upgrade', (req, sock, head) => routeRequest(req, sock, head));
          server.middlewares.use((req, res, next) => routeRequest(req, res) || next());
        },
      },
      {
        name: 'search',
        apply: 'serve',
        configureServer(s) {
          s.middlewares.use('/return', async (req, res) => {
            const q = new URL(req.url, 'http://x').searchParams.get('q');
            try {
              const r = q && (await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}`));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(r ? await r.json() : { error: 'query parameter?' }));
            } catch {
              res.end(JSON.stringify({ error: 'request failed' }));
            }
          });
        },
      },
      {
        name: 'redirect',
        apply: 'serve',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/ds') {
              res.writeHead(302, { Location: 'https://discord.gg/ZBef7HnAeg' });
              res.end();
            } else {
              next();
            }
          });
        },
      },
      // create svg for jsdelivr
      // i know it's weird but it works somehow
      isStatic && {
        name: 'emit-svg-entry',
        apply: 'build',
        generateBundle(_, bundle) {
          const source = createSvgEntry(bundle);
          if (!source) return;

          this.emitFile({
            type: 'asset',
            fileName: 'index.svg',
            source,
          });
        },
      },
    ].filter(Boolean),
    build: {
      target: 'es2022',
      reportCompressedSize: false,
      esbuild: {
        legalComments: 'none',
        treeShaking: true,
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: '[hash].js',
          chunkFileNames: 'chunks/[name].[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          manualChunks: (id) => {
            if (!id.includes('node_modules')) return;
            const m = id.split('node_modules/')[1];
            const pkg = m.startsWith('@') ? m.split('/').slice(0, 2).join('/') : m.split('/')[0];
            if (/react-router|react-dom|react\b/.test(pkg)) return 'react';
            if (/^@mui\//.test(pkg) || /^@emotion\//.test(pkg)) return 'mui';
            if (/lucide/.test(pkg)) return 'icons';
            if (/react-ga4/.test(pkg)) return 'analytics';
            if (/nprogress/.test(pkg)) return 'progress';
            return 'vendor';
          },
        },
        treeshake: {
          moduleSideEffects: 'no-external',
        },
      },
      minify: 'esbuild',
      sourcemap: false,
    },
    css: {
      modules: {
        generateScopedName: () =>
          String.fromCharCode(97 + Math.floor(Math.random() * 17)) +
          Math.random().toString(36).substring(2, 8),
      },
    },
    server: {
      proxy: {
        '/assets/img': {
          target: 'https://dogeub-assets.pages.dev',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/assets\/img/, '/img'),
        },
        '/assets-fb': {
          target: 'https://dogeub-assets.pages.dev',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/assets-fb/, '/img/server'),
        },
      },
    },
    define: {
      __ENVIRONMENT__: JSON.stringify(environment),
      isStaticBuild: isStatic
    },
  };
});
