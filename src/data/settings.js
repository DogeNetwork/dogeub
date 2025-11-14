import { meta } from '/src/utils/config';
import {
  themeConfig,
  appsPerPageConfig,
  navScaleConfig,
  searchConfig,
  prConfig,
  designConfig,
} from '/src/utils/config';

export const privacyConfig = ({ options, updateOption, openPanic }) => ({
  1: {
    name: 'Site Title',
    desc: "This setting allows you to change the site's tab title and icon.",
    config: meta,
    value: (
      meta.find(
        (c) => c.value && typeof c.value === 'object' && c.value.tabName === options.tabName,
      ) || meta[0]
    ).value,
    type: 'select',
    action: (a) => {
      updateOption(a);
      import('/src/utils/utils.js').then(({ ckOff }) => ckOff());
    },
  },
  2: {
    name: 'Auto Cloak',
    desc: 'Automatically apply the selected cloak when you switch tabs, restore original when you return.',
    config: meta,
    value: !!options.clkOff,
    type: 'switch',
    action: (b) => {
      setTimeout(() => {
        updateOption({ clkOff: b });
        import('/src/utils/utils.js').then(({ ckOff }) => ckOff());
      }, 100);
    },
    disabled: !options.tabName || options.tabName == meta[0].value.tabName,
  },
  3: {
    name: 'Open in AB',
    desc: 'This will open the site into an about:blank tab. Make sure popups are enabled.',
    value: options.aboutBlank,
    type: 'switch',
    action: (b) => setTimeout(() => updateOption({ aboutBlank: b }), 100),
  },
  4: {
    name: 'Panic Key',
    desc: 'Enable or disable the panic key option.',
    value: !!options.panicToggleEnabled,
    type: 'switch',
    action: (b) => {
      setTimeout(() => {
        updateOption({ panicToggleEnabled: b });
        import('/src/utils/utils.js').then(({ panic }) => panic());
      }, 100);
    },
  },
  5: {
    name: 'Panic Shortcut',
    desc: 'Set a keybind/shortcut that redirects you to a page when pressed.',
    value: 'Set Key',
    type: 'button',
    action: openPanic,
    disabled: !!!options.panicToggleEnabled,
  },
});

export const customizeConfig = ({ options, updateOption }) => ({
  1: {
    name: 'Site Theme',
    desc: 'Customize the appearance of the website by selecting a theme.',
    config: themeConfig,
    value: find(themeConfig, (c) => c.value?.themeName === options.themeName, 0),
    type: 'select',
    action: (a) => updateOption(a),
  },
  2: {
    name: 'Background Design',
    desc: "Customize the site's background design.",
    config: designConfig,
    value: find(designConfig, (c) => c.value?.bgDesign === options.bgDesign, 0),
    type: 'select',
    action: (a) => updateOption(a),
  },
  3: {
    name: 'Apps per Page',
    desc: 'Number of apps to show per page ("All" will show everything).',
    config: appsPerPageConfig,
    value: find(appsPerPageConfig, (c) => c.value.itemsPerPage === (options.itemsPerPage ?? 20), 2),
    type: 'select',
    action: (a) => updateOption(a),
  },
  4: {
    name: 'Navigation Scale',
    desc: 'Scale navigation bar size (logo & font) globally.',
    config: navScaleConfig,
    value: find(navScaleConfig, (c) => c.value.navScale === (options.navScale ?? 1), 3),
    type: 'select',
    action: (a) => updateOption(a),
  },
  5: {
    name: 'Tabs Bar',
    desc: 'Show the tabs bar, allowing you to open multiple sites when browsing.',
    value: options.showTb ?? true,
    type: 'switch',
    action: (b) => setTimeout(() => updateOption({ showTb: b }), 100),
  },
  6: {
    name: 'Donation button',
    desc: 'Toggle whether you want the "Support us" button to show.',
    value: options.donationBtn ?? true,
    type: 'switch',
    action: (b) => setTimeout(() => updateOption({ donationBtn: b }), 100),
  },
});

export const browsingConfig = ({ options, updateOption }) => ({
  1: {
    name: 'Search Engine',
    desc: 'Choose the default search engine used for queries.',
    config: searchConfig,
    value: find(searchConfig, (c) => c.value?.engine === options.engine, 0),
    type: 'select',
    action: (a) => updateOption(a),
  },
  2: {
    name: 'Backend Engine',
    desc: 'Choose the default engine used for browsing.',
    config: prConfig,
    value: find(prConfig, (c) => c.value?.prType === options.prType, 0),
    type: 'select',
    action: (a) => updateOption(a),
  },
});

export const advancedConfig = ({ options, updateOption }) => ({
  1: {
    name: 'Confirm Leave',
    desc: 'Show a confirmation when attempting to leave the site.',
    value: !!options.beforeUnload,
    type: 'switch',
    action: (b) => {
      setTimeout(() => updateOption({ beforeUnload: b }));
      location.reload();
    },
  },
  2: {
    name: 'Wisp Config',
    desc: 'Configure the websocket server location.',
    value:
      options.wServer ||
      `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/wisp/`,
    type: 'input',
    action: (b) => updateOption({ wServer: b }),
  },
  3: {
    name: 'Reset Instance',
    desc: 'Clear your site data if you are having issues.',
    type: 'button',
    value: 'Reset Data',
    action: () => import('/src/utils/utils.js').then(({ resetInstance }) => resetInstance()),
  },
});

function find(config, predicate, fallbackIndex = 0) {
  const found = config.find(predicate);
  return found ? found.value : config[fallbackIndex].value; // fallback
}
