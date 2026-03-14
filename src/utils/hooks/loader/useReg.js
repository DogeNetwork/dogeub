import { useEffect } from 'react';
import { BareMuxConnection } from 'bare-mux-fork';
import { useOptions } from '/src/utils/optionsContext';
import { fetchW as returnWServer } from './findWisp';
import { makecodec } from './of';
import store from './useLoaderStore';

export default function useReg() {
  const { options } = useOptions();
  const ws = `${location.protocol == 'http:' ? 'ws:' : 'wss:'}//${location.host}/wisp/`;
  const sws = isStaticBuild ? [
    { path: new URL('./sw.js', location.href).href, scope: new URL('./portal/k12/', location.href).href },
    { path: new URL('./s_sw.js', location.href).href, scope: new URL('./ham/', location.href).href }
  ] : [
    { path: new URL('/sw.js', location.origin).href, scope: new URL('/portal/k12/', location.origin).href },
    { path: new URL('/s_sw.js', location.origin).href, scope: new URL('/ham/', location.origin).href }
  ];
  const setWispStatus = store((s) => s.setWispStatus);

  useEffect(() => {
    const init = async () => {
      if (!window.scr) {
        const script = document.createElement('script');
        script.src = isStaticBuild
          ? new URL('./eggs/scramjet.all.js', location.href).pathname
          : '/eggs/scramjet.all.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const { ScramjetController } = $scramjetLoadController();

      const hamPrefix = isStaticBuild
        ? new URL('./ham/', location.href).pathname
        : '/ham/';
      const eggsPath = isStaticBuild
        ? new URL('./eggs/', location.href).pathname
        : '/eggs/';

      window.scr = new ScramjetController({
        prefix: hamPrefix,
        files: {
          wasm: eggsPath + 'scramjet.wasm.wasm',
          all: eggsPath + 'scramjet.all.js',
          sync: eggsPath + 'scramjet.sync.js',
        },
        flags: { rewriterLogs: false, scramitize: false, cleanErrors: true, sourcemaps: true },
        codec: makecodec()
      });

      window.scr.init();

      for (const sw of sws) {
        try {
          await navigator.serviceWorker.register(
            sw.path,
            sw.scope ? { scope: sw.scope } : undefined,
          );
        } catch (err) {
          console.warn(`SW reg err (${sw.path}):`, err);
        }
      }

      const baremuxPath = isStaticBuild
        ? new URL('./baremux/worker.js', location.href).href
        : new URL('/baremux/worker.js', location.origin).href;
      const connection = new BareMuxConnection(baremuxPath);
      isStaticBuild && setWispStatus('init');
      let socket = null;
      try {
        socket = isStaticBuild ? await returnWServer() : null;
      } catch (e) {
        socket = null;
      }
      const activeWisp = options.wServer != null && options.wServer !== ''
        ? options.wServer
        : socket;
      isStaticBuild && (!activeWisp ? setWispStatus(false) : setWispStatus(true));

      if (isStaticBuild && !activeWisp) {
        return;
      }

      const libcurlPath = isStaticBuild
        ? new URL('./libcurl/index.mjs', location.href).pathname
        : '/libcurl/index.mjs';
      await connection.setTransport(libcurlPath, [
        {
          wisp: isStaticBuild ? activeWisp : ws,
        },
      ]);
    };

    init();
  }, [options.wServer]);
}
