import { BareMuxConnection } from '@mercuryworkshop/bare-mux';
import * as contentObserver from './content_observer';
import { setupHotkeys } from './hotkeys';
import { CONFIG } from './config';
import { logUtils } from '/src/utils/utils';
import 'movement.css';

const createIframe = (url, manager, tab, srcPrefix = '') => {
  const f = document.createElement('iframe');
  Object.assign(f, {
    id: `iframe-${tab.id}`,
    className: manager.fCss,
    src: srcPrefix + url,
  });
  Object.assign(f.style, {
    zIndex: '10',
    opacity: '1',
    pointerEvents: 'auto',
  });
  manager.ic.appendChild(f);
  return f;
};

export const TYPE = {
  scr: {
    create: (url, manager, tab) => {
      const sf = scr.createFrame();
      manager.frames[tab.id] = sf;
      const frame = sf.frame;
      frame.id = `iframe-${tab.id}`;
      frame.className = manager.fCss;
      frame.style.zIndex = 10;
      frame.style.opacity = '1';
      frame.style.pointerEvents = 'auto';
      manager.ic.appendChild(frame);
      sf.go(url);
      manager.addLoadListener(tab.id);
    },
    navigate: (url, manager, tab, iframe) => {
      if (manager.frames[tab.id]) manager.frames[tab.id].go(url);
      else if (iframe) {
        const sf = scr.createFrame(iframe);
        manager.frames[tab.id] = sf;
        sf.go(url);
      }
    },
  },

  uv: {
    create: (url, manager, tab) => createIframe(manager.enc(url), manager, tab, '/uv/service/'),
    navigate: (url, manager, tab, iframe) =>
      iframe && (iframe.src = '/uv/service/' + manager.enc(url)),
  },

  uv1: {
    create: (url, manager, tab) => createIframe(manager.enc(url), manager, tab, '/assignments/'),
    navigate: (url, manager, tab, iframe) =>
      iframe && (iframe.src = '/assignments/' + manager.enc(url)),
  },

  auto: {
    create: (url, manager, tab) => {
      const matched = manager.filter?.find((f) => url.toLowerCase().includes(f.url.toLowerCase()));
      return TYPE[
        matched?.type ||
          (manager.filter?.some(
            (f) => f.type === 'scr' && url.toLowerCase().includes(f.url.toLowerCase()),
          )
            ? 'scr'
            : 'uv')
      ].create(url, manager, tab);
    },
    navigate: (url, manager, tab, iframe) => {
      const matched = manager.filter?.find((f) => url.toLowerCase().includes(f.url.toLowerCase()));
      return TYPE[
        matched?.type ||
          (manager.filter?.some(
            (f) => f.type === 'scr' && url.toLowerCase().includes(f.url.toLowerCase()),
          )
            ? 'scr'
            : 'uv')
      ].navigate(url, manager, tab, iframe);
    },
  },
};

class TabManager {
  constructor(arr) {
    const stored = JSON.parse(localStorage.getItem('options')) || {};

    Object.assign(this, {
      unsupported: CONFIG.unsupported,
      filter: CONFIG.filter,
      options: stored,
      prType: stored.prType || 'auto',
      search: stored.engine || 'https://www.google.com/search?q=',
      newTabUrl: '/new',
      newTabTitle: 'New Tab',
      enc: arr[0],
      dnc: arr[1],
      frames: {},
      tabs: [{ id: 1, title: 'New Tab', url: '/new', active: true }],
      history: new Map(),
      urlTrack: new Map(),
      nextId: 2,
      maxTabs: 10,
      minW: 50,
      maxW: 200,
      urlInterval: 1000,
    });

    const els = ['tabs-cont', 'tab-btn', 'fcn', 'url', 'class-portal'].reduce(
      (acc, id) => ({ ...acc, [id]: document.getElementById(id) }),
      {},
    );

    Object.assign(this, {
      tc: els['tabs-cont'],
      ab: els['tab-btn'],
      ic: els['fcn'],
      ui: els['url'],
      bg: els['class-portal'],
      fCss: 'w-full h-full border-0 absolute top-0 left-0 z-0 transition-opacity duration-200 ease-in-out opacity-0 pointer-events-none',
    });

    this.ab.onclick = () => this.add();

    this.tc.onclick = (e) => {
      const el = e.target.closest('.close-tab, .tab-item');
      if (!el) return;
      const id = +el.dataset.tabId;
      el.classList.contains('close-tab') ? this.close(id) : this.activate(id);
    };

    if (this.ui) {
      this.ui.value = this.isNewTab(this.tabs[0].url) ? '' : this.tabs[0].url;
      this.ui.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = this.ui.value.trim();
          this.updateUrl(val);
          if (val !== 'tabs://new') this.ui.value = this.formatInputUrl(val);
          this.ui.blur();
        }
      });
    }

    window.addEventListener('resize', () => {
      this.updateAddBtn();
      this.updateWidths();
    });

    this.render();
    this.createIframes();
    this.updateAddBtn();
    this.startTracking();
    contentObserver.init();
    setupHotkeys();

    window.tabManager = this;
  }

  ex = (() => {
    const endpoints = Object.values(TYPE)
      .map((p) => {
        switch (p) {
          case TYPE.scr:
            return 'scramjet';
          case TYPE.uv:
            return 'uv/service';
          case TYPE.uv1:
            return 'assignments';
          default:
            return null;
        }
      })
      .filter(Boolean)
      .join('|');
    const regex = new RegExp(`^https?:\/\/[^\/]+\/(${endpoints})\/`, 'i');
    return (url) => this.dnc(url.replace(regex, ''));
  })();

  showBg = (c) => {
    this.bg.style.opacity = c ? '1' : '0';
    this.bg.style.pointerEvents = c ? 'auto' : 'none';
  };

  escapeHTML = (str) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  };

  formatInputUrl = (input, search = this.search) =>
    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/i.test(input)
      ? /^https?:\/\//.test(input)
        ? input
        : 'https://' + input
      : search + encodeURIComponent(input);

  domain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return this.newTabTitle;
    }
  };

  isNewTab = (url) => url === this.newTabUrl;

  active = () => this.tabs.find((t) => t.active);

  setFrameState = (tabId, active) => {
    const f = document.getElementById(`iframe-${tabId}`);
    if (!f) return;
    f.style.zIndex = active ? 10 : 0;
    f.style.opacity = active ? '1' : '0';
    f.style.pointerEvents = active ? 'auto' : 'none';
    f.classList.toggle('f-active', active);
  };

  showActive = () => {
    const activeTab = this.active();
    this.tabs.forEach((t) => this.setFrameState(t.id, t === activeTab));
  };

  startTracking = () => this.tabs.forEach((t) => this.track(t.id));

  track = (id) => {
    if (this.urlTrack.has(id)) clearInterval(this.urlTrack.get(id));
    const iv = setInterval(() => this.checkStudentUrl(id), this.urlInterval);
    this.urlTrack.set(id, iv);
  };

  stopTrack = (id) => {
    if (this.urlTrack.has(id)) {
      clearInterval(this.urlTrack.get(id));
      this.urlTrack.delete(id);
    }
  };

  createIframes = () => {
    this.tabs.forEach((t) => {
      if (!document.getElementById(`iframe-${t.id}`)) {
        const f = document.createElement('iframe');
        f.id = `iframe-${t.id}`;
        f.className = this.fCss;
        f.style.zIndex = 0;
        if (this.isNewTab(t.url)) {
          f.src = t.url;
          f.onload = () => {
            try {
              contentObserver.unbind();
              contentObserver.bind();
            } catch {}
          };
        }
        this.ic.appendChild(f);
      }
    });
    this.showActive();
  };

  back = () => {
    const activeTab = this.active();
    if (!activeTab) return;

    const hist = this.history.get(activeTab.id);
    if (!hist || hist.position <= 0) {
      console.info('[info] back(): no history to go back');
      return;
    }

    hist.position--;
    const decodedUrl = hist.urls[hist.position];
    if (decodedUrl) {
      const handler = TYPE[this.prType] || TYPE.auto;
      const iframe = document.getElementById(`iframe-${activeTab.id}`);
      handler.navigate(decodedUrl, this, activeTab, iframe);
      if (this.ui) this.ui.value = decodedUrl;
      console.log('[info] back(): navigated to', decodedUrl);
      this.emitNewFrame();
    }
  };

  forward = () => {
    const activeTab = this.active();
    if (!activeTab) return;

    const hist = this.history.get(activeTab.id);
    if (!hist || hist.position >= hist.urls.length - 1) {
      console.info('[info] forward(): no history to go forward');
      return;
    }

    hist.position++;
    const decodedUrl = hist.urls[hist.position];
    if (decodedUrl) {
      const handler = TYPE[this.prType] || TYPE.auto;
      const iframe = document.getElementById(`iframe-${activeTab.id}`);
      handler.navigate(decodedUrl, this, activeTab, iframe);
      if (this.ui) this.ui.value = decodedUrl;
      console.log('[info] forward(): navigated to', decodedUrl);
      this.emitNewFrame();
    }
  };

  reload = () => {
    const activeTab = this.active();
    if (!activeTab) return;
    const iframe = document.getElementById(`iframe-${activeTab.id}`);
    if (!iframe) return;
    try {
      iframe.contentWindow.location.reload();
    } catch (err) {
      console.warn('[err] reload():', err);
    }
  };

  navigate = (input) => {
    if (!input) return;
    this.updateUrl(input);
  };

  addLoadListener = (id) => {
    const f = document.getElementById(`iframe-${id}`);
    if (!f || f.hasListener) return;
    f.hasListener = true;
    f.addEventListener('load', () => {
      const t = this.tabs.find((t) => t.id === id);
      if (!t) return;
      try {
        const newUrl = f.contentWindow.location.href;
        if (newUrl && newUrl !== t.url && newUrl !== 'about:blank')
          this.updateTabMeta(t, f, newUrl);
      } catch {}
    });
  };

  checkStudentUrl = (id) => {
    const t = this.tabs.find((t) => t.id === id);
    const f = document.getElementById(`iframe-${id}`);
    if (!t?.url || !f || t.url === this.newTabUrl) return;
    try {
      const { href: newUrl } = f.contentWindow.location;
      if (newUrl && newUrl !== t.url && newUrl !== 'about:blank') {
        this.updateTabMeta(t, f, newUrl);
        contentObserver.unbind?.();
        contentObserver.bind?.();
      }
    } catch {
      this.addLoadListener(id);
    }
  };

  updateTabMeta = (t, f, newUrl) => {
    try {
      const doc = f.contentDocument || f.contentWindow.document;
      if (
        doc?.body?.innerText?.includes('Error processing your request') ||
        doc?.body?.innerText?.includes('Scramjet v2.0.0-alpha (build f9f5232)')
      ) {
        f.style.opacity = 0;
        f.contentWindow.location.reload();
        f.style.opacity = 1;
        return;
      }
    } catch {}

    const decodedUrl = this.ex(newUrl);
    const hist = this.history.get(t.id) || { urls: [decodedUrl], position: 0 };

    if (!this.history.has(t.id)) {
      this.history.set(t.id, hist);
    } else if (hist.urls[hist.position] !== decodedUrl) {
      hist.urls.length = hist.position + 1;
      hist.urls.push(decodedUrl);
      hist.position++;
    }

    t.url = newUrl;

    const updateTitle = (tries = 10) => {
      const ttl = f.contentDocument?.title?.trim();
      if (ttl) {
        t.title = ttl.length > 20 ? ttl.slice(0, 20) + '...' : ttl;
        this.render();
      } else if (tries > 0) {
        setTimeout(() => updateTitle(tries - 1), 100);
      } else {
        t.title = this.domain(newUrl);
        this.render();
      }
    };

    updateTitle();

    if (t.active && this.ui && t.url !== this.newTabUrl) {
      this.ui.value = decodedUrl;
      this.showBg(false);
      this.emitNewFrame();
    }
  };

  add = () => {
    if (this.tabs.length >= this.maxTabs) return;
    this.tabs.forEach((t) => (t.active = false));
    const t = {
      id: this.nextId++,
      title: this.newTabTitle,
      url: this.newTabUrl,
      active: true,
      justAdded: true,
    };
    this.tabs.push(t);
    this.render();
    this.createIframes();
    this.updateAddBtn();
    this.track(t.id);
    if (this.ui) this.ui.value = '';
    this.emitNewFrame();
  };

  close = (id) => {
    if (this.tabs.length === 1) return;
    const i = this.tabs.findIndex((t) => t.id === id);
    if (i === -1) return;
    const wasActive = this.tabs[i].active;
    this.tabs.splice(i, 1);
    this.stopTrack(id);
    this.history.delete(id);
    document.getElementById(`iframe-${id}`)?.remove();
    if (wasActive) {
      const newIdx = Math.min(i, this.tabs.length - 1);
      this.tabs.forEach((t) => (t.active = false));
      this.tabs[newIdx].active = true;
      this.showActive();
      if (this.ui)
        this.ui.value = this.isNewTab(this.tabs[newIdx].url) ? '' : this.ex(this.tabs[newIdx].url);
      this.emitNewFrame();
    }
    this.render();
    this.updateAddBtn();
    this.updateWidths();
  };

  activate = (id) => {
    if (this.active()?.id === id) return;
    this.tabs.forEach((t) => (t.active = t.id === id));
    this.render();
    this.showActive();
    if (this.ui) {
      const activeTab = this.active();
      this.ui.value = activeTab && !this.isNewTab(activeTab.url) ? this.ex(activeTab.url) : '';
    }
    this.emitNewFrame();
  };

  returnMeta = () => {
    const t = this.active();
    if (!t) return { name: '', url: '' };
    const url = t.url && !this.isNewTab(t.url) ? this.ex(t.url) : '';
    return { name: t.title || '', url };
  };

  emitNewFrame = () => {
    const t = this.active();
    const meta = this.returnMeta();
    const detail = { ...meta, tabId: t?.id };
    const ev = new CustomEvent('newFrame', { detail });
    try {
      document.dispatchEvent(ev);
    } catch (err) {}
    try {
      window.dispatchEvent(ev);
    } catch (err) {}
  };

  updateUrl = async (input) => {
    if (!input) return;
    const t = this.active();
    if (!t) return;
    if (this.unsupported.some((s) => input.includes(s))) {
      alert(`The website "${input}" is not supported at this time`);
      return;
    }

    if (input === 'tabs://new') {
      document.getElementById(`iframe-${t.id}`)?.remove();
      const f = document.createElement('iframe');
      f.id = `iframe-${t.id}`;
      f.className = this.fCss;
      f.style.zIndex = 10;
      f.style.opacity = '1';
      f.style.pointerEvents = 'auto';
      f.src = this.newTabUrl;
      this.ic.appendChild(f);
      t.url = this.newTabUrl;
      t.title = this.newTabTitle;
      if (this.ui) this.ui.value = '';
      f.onload = () => {
        try {
          contentObserver.unbind();
          contentObserver.bind();
        } catch {}
      };
      this.showActive();
      this.render();
      return;
    }

    const url = this.formatInputUrl(input);
    this.showBg(false);
    const handler = TYPE[this.prType] || TYPE.auto;
    const f = document.getElementById(`iframe-${t.id}`);
    if (this.isNewTab(t.url)) {
      document.getElementById(`iframe-${t.id}`)?.remove();
      handler.create(url, this, t);
    } else handler.navigate(url, this, t, f);

    t.url = url;
    try {
      t.title = new URL(url).hostname.replace('www.', '');
    } catch {
      t.title = input;
    }
    this.showActive();
    this.render();
    if (t.active) this.emitNewFrame();
  };

  getTabWidth = () => {
    const w = this.tc.offsetWidth || 800;
    return Math.min(this.maxW, Math.max(this.minW, w / this.tabs.length));
  };

  updateWidths = () => {
    const w = this.getTabWidth();
    this.tc.querySelectorAll('.tab-item').forEach((el) => {
      el.style.width = w + 'px';
      el.style.minWidth = this.minW + 'px';
    });
  };

  updateAddBtn = () => {
    const dis = this.tabs.length >= this.maxTabs || this.getTabWidth() <= this.minW;
    this.ab.disabled = dis;
    this.ab.classList.toggle('opacity-50', dis);
    this.ab.classList.toggle('cursor-not-allowed', dis);
    this.ab.classList.toggle('hover:bg-[#b6bfc748]', !dis);
    this.ab.classList.toggle('active:bg-[#d8e4ee6e]', !dis);
    this.ab.title = dis ? `Maximum ${this.maxTabs} tabs allowed` : 'Add new tab';
  };

  render = (() => {
    const tabTemplate = (t, w, i, op, showClose) =>
      `
      <div ${t.justAdded ? 'data-m="bounce-up" data-m-duration="0.2"' : ''} 
           class="tab-item relative flex items-center rounded-b-none justify-between pl-2.5 pr-1.5 py-[0.28rem] rounded-[6px] cursor-pointer transition-all duration-200 ease-in-out ${
             t.active
               ? `border border-b-0 text-[${op.bodyText || '#8a9bb8'}]`
               : 'hover:bg-[#cccccc2f]'
           } ${i === 0 ? 'ml-0' : '-ml-px'}" 
           style="width:${w}px;min-width:${this.minW}px;background-color:${t.active ? op.urlBarBg || '#1d303f' : undefined}" 
           data-tab-id="${t.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe-icon lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        <span class="text-[12px] font-medium truncate flex-1 mr-2 ml-1.5" title="${this.escapeHTML(t.title)}">${this.escapeHTML(t.title)}</span>
        ${showClose ? `<button class="close-tab shrink-0 w-4 h-4 rounded-full hover:bg-[#b6bfc748] active:bg-[#d0dbe467] flex items-center justify-center transition-colors" data-tab-id="${t.id}" title="Close ${this.escapeHTML(t.title)}"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>` : ''}
      </div>`.trim();

    return function () {
      const w = this.getTabWidth();
      const op = JSON.parse(localStorage.getItem('options') || '{}');
      const showClose = this.tabs.length > 1;

      this.tc.innerHTML = this.tabs.map((t, i) => tabTemplate(t, w, i, op, showClose)).join('');

      this.tabs.forEach((t) => delete t.justAdded);
    };
  })();
}

window.addEventListener('load', async () => {
  window.scr = null;
  const { ScramjetController } = $scramjetLoadController();
  const connection = new BareMuxConnection('/baremux/worker.js');
  const { log, warn, error } = logUtils;

  const getOption = (key, fallback) => {
    const item = JSON.parse(localStorage.getItem('options') || '{}')[key];
    return item !== '' && item ? item : fallback;
  };

  const ws = getOption('wServer', CONFIG.ws);
  const transport = CONFIG.transport;
  let c = self.__uv$config;

  const setTransport = async () => {
    try {
      await connection.setTransport(transport, [{ wisp: ws }]);
      log(`Set transport: ${transport}`);
    } catch (e) {
      error('setTransport failed:', e);
      throw e;
    }
  };

  await setTransport();

  window.scr = new ScramjetController({
    files: {
      wasm: '/scram/scramjet.wasm.wasm',
      all: '/scram/scramjet.all.js',
      sync: '/scram/scramjet.sync.js',
    },
    flags: { rewriterLogs: false, scramitize: false, cleanErrors: true, sourcemaps: true },
  });

  try {
    await scr.init();
    log('scr.init() complete');
  } catch (err) {
    error('scr.init() failed:', err);
    throw err;
  }

  const sws = [{ path: '/s_sw.js', scope: '/scramjet/' }, { path: '/uv/sw.js' }];

  for (const sw of sws) {
    try {
      await navigator.serviceWorker.register(sw.path, sw.scope ? { scope: sw.scope } : undefined);
    } catch (err) {
      warn(`SW reg err (${sw.path}):`, err);
    }
  }

  await setTransport();

  let tabManager;
  try {
    tabManager = new TabManager([c.encodeUrl, c.decodeUrl]);
  } catch (err) {
    error('TabManager init failed:', err);
    throw err;
  }

  const query = sessionStorage.getItem('query');
  if (query) {
    tabManager.navigate(query);
    sessionStorage.removeItem('query');
  }

  setInterval(setTransport, 30000);

  const domMap = {
    'tabs-btn': () => document.getElementById('tb')?.classList.toggle('hidden'),
    'tbtog': () => {
      document.getElementById('tb')?.classList.add('hidden');
      if (!localStorage.getItem('tip0')) {
        document.dispatchEvent(
          new CustomEvent('basecoat:toast', {
            detail: {
              config: {
                category: 'info',
                title: 'Tips Notifier',
                duration: Math.pow(6400, 2),
                description: 'You can hide the tab bar automatically in Settings!',
                cancel: { label: 'Got it!' },
              },
            },
          }),
        );
        localStorage.setItem('tip0', '1');
      }
    },
    'n-bk': () => tabManager.back(),
    'n-fw': () => tabManager.forward(),
    'n-rl': () => tabManager.reload(),
  };

  (tabManager.options.showTb ?? true) && domMap['tabs-btn']();
  Object.entries(domMap).forEach(([id, fn]) =>
    document.getElementById(id)?.addEventListener('click', fn),
  );

  document.getElementById('bookmark-btn').addEventListener('click', () => {
    const bookmark = document.getElementById('bookmark');
    const setBookmark = (add) => {
      const old = JSON.parse(localStorage.getItem('options'));
      const metaInfo = tabManager.returnMeta();
      const result = {
        ...old,
        quickLinks: add
          ? [...old.quickLinks, { link: metaInfo.url, icon: 'null', name: metaInfo.name }]
          : old.quickLinks.filter((q) => !(q.link === metaInfo.url && q.name === metaInfo.name)),
      };
      localStorage.setItem('options', JSON.stringify(result));
    };

    if (bookmark.getAttribute('fill') === 'currentColor') {
      bookmark.setAttribute('fill', 'none');
      setBookmark(false);
    } else {
      bookmark.setAttribute('fill', 'currentColor');
      setBookmark(true);
    }
  });

  document.addEventListener('newFrame', (e) => {
    const bookmark = document.getElementById('bookmark');
    const options = JSON.parse(localStorage.getItem('options')) || { quickLinks: [] };
    bookmark.setAttribute(
      'fill',
      options.quickLinks.some((q) => q.link === e.detail.url) ? 'currentColor' : 'none',
    );
  });
});
