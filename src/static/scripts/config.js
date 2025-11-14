import apps from '/src/data/apps.json';

const gFilters = (apps.games || [])
  .filter((game) => /^https?:\/\//.test(game.url))
  .map((game) => ({
    url: new URL(game.url).hostname.replace(/^www\./, ''),
    type: 'scr',
  }));

export const CONFIG = {
  bUrl: '/seal/',
  ws: `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/wisp/`,
  transport: '/libcurl/index.mjs',
  baremod: '/baremod/index.mjs',
  unsupported: [],
  filter: [
    { url: 'neal.fun', type: 'scr' },
    { url: 'geforcenow.com', type: 'scr' },
    { url: 'spotify.com', type: 'scr' },
    ...gFilters,
  ],
};
