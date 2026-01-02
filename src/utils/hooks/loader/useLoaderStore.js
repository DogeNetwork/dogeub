import { create } from 'zustand';

const store = create((set) => ({
  tabs: [
    {
      title: 'New Tab',
      id: crypto.randomUUID(),
      url: 'tabs://new',
      active: true,
      history: ['tabs://new'],
      historyIndex: 0,
      isLoading: false,
    },
  ],
  frameRefs: null,
  showTabs: false,
  showMenu: false,
  iframeUrls: {},
  activeFrameRef: null,
  showUI: true,
  toggleUI: () => set((state) => ({ showUI: !state.showUI })),
  setShowTabs: (value) => set({ showTabs: value }),
  toggleTabs: () => set((state) => ({ showTabs: !state.showTabs })),
  toggleMenu: () => set((state) => ({ showMenu: !state.showMenu })),
  setFrameRefs: (refs) => set({ frameRefs: refs }),
  addTab: (tab) =>
    set((state) => ({
      tabs: [
        ...state.tabs,
        {
          ...tab,
          history: [tab.url || 'tabs://new'],
          historyIndex: 0,
          isLoading: false,
        },
      ],
    })),
  removeTab: (tabId) => set((state) => ({ tabs: state.tabs.filter(({ id }) => id != tabId) })),
  setActive: (tabId) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => ({ ...tab, active: tab.id === tabId })),
    })),
  //this makes the tab BEFORE The matching tab active (all others false)
  setLastActive: (tabId) =>
    set((state) => {
      const index = state.tabs.findIndex((tab) => tab.id === tabId);
      const prevIndex = index > 0 ? index - 1 : index + 1;

      return {
        tabs: state.tabs.map((tab, i) => ({ ...tab, active: i === prevIndex })),
      };
    }),
  //this updates url property of matching tab and merges
  updateUrl: (tabId, url, addToHistory = true) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;

        if (addToHistory) {
          //FORWARD history gets removed -- & add new url
          const newHistory = [...tab.history.slice(0, tab.historyIndex + 1), url];
          return {
            ...tab,
            url,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            isLoading: url !== 'tabs://new',
          };
        }
        return { ...tab, url, isLoading: url !== 'tabs://new' };
      }),
    })),
  updateTitle: (tabId, title) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, title } : tab)),
    })),
  setLoading: (tabId, isLoading) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, isLoading } : tab)),
    })),
  refreshTab: (tabId) => {
    const state = store.getState();
    const iframe = state.frameRefs?.current?.[tabId];
    if (iframe?.contentWindow) {
      iframe.contentWindow.location.reload();
    }
  },
  goBack: (tabId, onNewTab) => {
    set((state) => {
      const updatedTbs = state.tabs.map((tab) => {
        if (tab.id !== tabId || tab.historyIndex <= 0) return tab;

        const newIndex = tab.historyIndex - 1;
        const newUrl = tab.history[newIndex];

        if (newUrl === 'tabs://new' && onNewTab) {
          onNewTab();
        }

        return {
          ...tab,
          url: newUrl,
          historyIndex: newIndex,
          isLoading: true,
        };
      });

      const tab = updatedTbs.find((t) => t.id === tabId);
      const newIframeUrls = tab ? { ...state.iframeUrls, [tabId]: tab.url } : state.iframeUrls;

      return { tabs: updatedTbs, iframeUrls: newIframeUrls };
    });
  },
  goForward: (tabId) => {
    set((state) => {
      const updatedTbs = state.tabs.map((tab) => {
        if (tab.id !== tabId || tab.historyIndex >= tab.history.length - 1) return tab;

        const newIndex = tab.historyIndex + 1;
        return {
          ...tab,
          url: tab.history[newIndex],
          historyIndex: newIndex,
          isLoading: true,
        };
      });

      const tab = updatedTbs.find((t) => t.id === tabId);
      const newIframeUrls = tab ? { ...state.iframeUrls, [tabId]: tab.url } : state.iframeUrls;

      return { tabs: updatedTbs, iframeUrls: newIframeUrls };
    });
  },
  setIframeUrl: (tabId, url) =>
    set((state) => ({
      iframeUrls: {
        ...state.iframeUrls,
        [tabId]: url,
      },
    })),
  updateActiveFrameRef: (ref) => set({ activeFrameRef: ref }),
  clearStore: ({ showTb }) =>
    set(() => ({
      tabs: [
        {
          title: 'New Tab',
          id: crypto.randomUUID(),
          url: 'tabs://new',
          active: true,
          history: ['tabs://new'],
          historyIndex: 0,
          isLoading: false,
        },
      ],
      frameRefs: null,
      showTabs: showTb,
      iframeUrls: {},
    })),
}));

export default store;
