import { defineConfig, normalizePath } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react-swc';
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { logging, server as wisp } from '@mercuryworkshop/wisp-js/server';
import { createBareServer } from "@tomphttp/bare-server-node";
import { bareModulePath } from '@mercuryworkshop/bare-as-module3';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import dotenv from "dotenv";

dotenv.config();
const useBare = process.env.BARE === "false" ? false : true;

const __dirname = dirname(fileURLToPath(import.meta.url));
logging.set_level(logging.NONE);
let bare;

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
  threadPool: true,
  options: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    selfDefending: true,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayEncoding: [],
    stringArrayCallsTransform: false,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
    ignoreImports: true,
  },
};

export default defineConfig(({ command }) => {
  const environment = command === 'serve' ? 'dev' : 'stable';

  return {
    plugins: [
      react(),
      vitePluginBundleObfuscator(obf),
      viteStaticCopy({
        targets: [
          { src: [normalizePath(resolve(libcurlPath, '*'))], dest: 'libcurl' },
          { src: [normalizePath(resolve(baremuxPath, '*'))], dest: 'baremux' },
          { src: [normalizePath(resolve(scramjetPath, '*'))], dest: 'scram' },
          useBare && { src: [normalizePath(resolve(bareModulePath, '*'))], dest: 'baremod' },
          {
            src: [
              normalizePath(resolve(uvPath, 'uv.handler.js')),
              normalizePath(resolve(uvPath, 'uv.client.js')),
              normalizePath(resolve(uvPath, 'uv.bundle.js')),
              normalizePath(resolve(uvPath, 'sw.js')),
            ],
            dest: 'uv',
          },
        ].filter(Boolean),
      }),
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
      }
    ],
    build: {
      target: 'es2022',
      reportCompressedSize: false,
      esbuild: { 
        legalComments: 'none',
        treeShaking: true
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          loader: resolve(__dirname, 'src/static/loader.html'),
        },
        output: {
          entryFileNames: '[hash].js',
          chunkFileNames: 'chunks/[name].[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          manualChunks: (id) => {
            if (!id.includes('node_modules')) return;
            const m = id.split('node_modules/')[1];
            const pkg = m.startsWith('@') ? m.split('/').slice(0,2).join('/') : m.split('/')[0];
            if (/react-router|react-dom|react\b/.test(pkg)) return 'react';
            if (/^@mui\//.test(pkg) || /^@emotion\//.test(pkg)) return 'mui';
            if (/lucide/.test(pkg)) return 'icons';
            if (/react-ga4/.test(pkg)) return 'analytics';
            if (/nprogress/.test(pkg)) return 'progress';
            return 'vendor';
          },
        },
        treeshake: {
          moduleSideEffects: 'no-external'
        }
      },
      minify: 'esbuild',
      sourcemap: false
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
          target: 'https://dogeub-assets.ftp.sh',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/assets-fb/, ''),
        },
      },
    },
    define: {
      __ENVIRONMENT__: JSON.stringify(environment)
    }
  };
});