declare global {
  interface Window {
    tabManager?: any;
  }
}

const urlBar = document.getElementById('d-url');
const tabBar = document.getElementById('tb');

const addTab = (): void => {
  if (urlBar) document.getElementById('tab-btn')?.click();

  if (tabBar && tabBar.classList.contains('hidden')) document.getElementById('tabs-btn')?.click();
};

const clearTabs = (): void => {
  const urlInput = document.getElementById('url') as HTMLInputElement | null;
  const tabBarEl = document.getElementById('tb');
  const urlBarEl = document.getElementById('d-url');

  if (!urlBarEl || !tabBarEl) return;

  let btn: Element | null;
  while ((btn = document.querySelector('button.close-tab'))) {
    (btn as HTMLElement).click();
  }
  if (urlInput) {
    urlInput.value = 'tabs://new';
    window.tabManager?.updateUrl('tabs://new');
  }

  document.dispatchEvent(
    new CustomEvent('basecoat:toast', {
      detail: {
        config: {
          category: 'success',
          title: 'All Tabs Cleared!',
          description: 'URL input has been reset.',
          cancel: { label: 'Dismiss' },
        },
      },
    }),
  );
};

const fullscreen = (): void => {
  if (!document.fullscreenElement) {
    const iframe = document.body as HTMLElement | null;
    if (!iframe) return;

    const req =
      iframe.requestFullscreen ||
      (iframe as any).webkitRequestFullscreen ||
      (iframe as any).msRequestFullscreen;

    if (req) {
      (req as Function).call(iframe);

      document.dispatchEvent(
        new CustomEvent('basecoat:toast', {
          detail: {
            config: {
              category: 'success',
              title: 'Fullscreen Mode',
              description: 'Press esc key to exit fullscreen mode.',
              cancel: { label: 'Dismiss' },
            },
          },
        }),
      );
    }
  }
};

const hideBar = () => {
  urlBar?.remove();
  tabBar?.remove();
  document.dispatchEvent(
    new CustomEvent('basecoat:toast', {
      detail: {
        config: {
          category: 'success',
          title: 'Hide Bar',
          description: 'The URL & tab bar has been hidden. Refresh the page to re-enable them.',
          duration: 5000,
          cancel: { label: 'Dismiss' },
        },
      },
    }),
  );
};

const devTools = (): void => {
  const iframe = document.querySelector('iframe.f-active') as HTMLIFrameElement | null;
  if (!iframe || !iframe.contentDocument || !iframe.contentWindow) return;

  const erudaEl = iframe.contentDocument.getElementById('eruda');
  if (erudaEl && erudaEl.shadowRoot) {
    (iframe.contentWindow as any).eruda.destroy();
  } else {
    const s = iframe.contentDocument.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/eruda';
    s.onload = () => {
      const cw = iframe.contentWindow as any;
      cw.eruda.init();
      cw.eruda.show();
      cw.eruda.show('resources');
      const erudaRoot = iframe.contentDocument!.getElementById('eruda')!.shadowRoot;
      erudaRoot?.querySelector('div.eruda-entry-btn')?.remove();
    };
    iframe.contentDocument.body.appendChild(s);
    document.dispatchEvent(
      new CustomEvent('basecoat:toast', {
        detail: {
          config: {
            category: 'warning',
            title: 'Enabled DevTools',
            description: 'To close DevTools, press alt + i.',
            duration: 25000,
            cancel: { label: 'Dismiss' },
          },
        },
      }),
    );
  }
};

const handleHotkey = (
  key: string,
  alt: boolean,
  shift: boolean,
  ctrl: boolean,
  meta: boolean,
): void => {
  if (alt && !shift && !ctrl && !meta) {
    if (key === 'n') {
      addTab();
    } else if (key === 'c') {
      clearTabs();
    } else if (key === 'z') {
      hideBar();
    } else if (key === 'i') {
      devTools();
    }
    // prob adding more
  } else if (shift && !alt && !ctrl && !meta) {
    if (key === 'f') {
      fullscreen();
    }
  }
};

const hotkeyHandler = (e: KeyboardEvent): void => {
  const key = e.key.toLowerCase();
  handleHotkey(key, e.altKey, e.shiftKey, e.ctrlKey, e.metaKey);
};

export function setupHotkeys(): void {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('ui') !== 'false') {
    window.addEventListener('keydown', hotkeyHandler);

    window.addEventListener('message', (e: MessageEvent) => {
      if (e.data && e.data.type === 'hotkey') {
        const { key, altKey, shiftKey, ctrlKey, metaKey } = e.data;
        handleHotkey(key, altKey, shiftKey, ctrlKey, metaKey);
      }
    });

    const hotkeyBtn = [
      { id: 't-clear', action: () => clearTabs() },
      { id: 't-add', action: () => addTab() },
      { id: 't-fs', action: () => fullscreen() },
      { id: 'rm-bar', action: () => hideBar() },
      {
        id: 'return',
        action: () => window.parent.postMessage({ action: 'navigate', to: '/' }, '*'),
      },
      { id: 't-dev', action: () => devTools() },
    ];

    for (let i = 0; i < hotkeyBtn.length; i++) {
      document.getElementById(hotkeyBtn[i].id)?.addEventListener('click', () => {
        hotkeyBtn[i].action();
      });
    }
  } else (document.getElementById('tb')?.remove(), document.getElementById('d-url')?.remove());
}
