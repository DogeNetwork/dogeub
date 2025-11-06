import clsx from 'clsx';
import { useState, useMemo, useCallback } from 'react';
import Nav from '../layouts/Nav';
import theme from '../styles/theming.module.css';
import { Search, HatGlasses, Palette, Globe, Wrench } from 'lucide-react';
import { useOptions } from '/src/utils/optionsContext';
import RenderSetting from '../components/Settings';
import TabGroupsManager from '../components/TabGroupsManager';
import { privacyConfig, customizeConfig, browsingConfig, advancedConfig } from '/src/data/settings';

const configs = [
  { name: 'Privacy', icon: HatGlasses, keywords: ['title','cloak','cloaking','tab cloak','about','about:blank','blank'], fn: privacyConfig },
  { name: 'Customize', icon: Palette, keywords: ['theme','color','appearance','ui','interface','games','pages','apps','scale','nav','navigation bar','nav bar','navbar','size','donate','donation','tabs bar','tab bar'], fn: customizeConfig },
  { name: 'Browsing', icon: Globe, keywords: ['tabs','tab','proxy engine','search engine','scramjet','ultraviolet'], fn: browsingConfig },
  { name: 'Advanced', icon: Wrench, keywords: ['wisp','proxy','ultraviolet','bare','leave confirmation','debug','experimental','inspect','reset instance','clear cache'], fn: advancedConfig },
];

const Settings = () => {
  const { options, updateOption } = useOptions();
  const [q, setQ] = useState('');
  const [content, setContent] = useState('Privacy');
  const [groupsOpen, setGroupsOpen] = useState(false);

  const settings = useMemo(
    () => configs.map(({ fn, ...c }) => ({
      ...c,
      items: Object.values(fn({ options, updateOption })).map(({ name, desc }) => ({ name, desc })),
    })),
    [options, updateOption]
  );

  const fq = q.trim().toLowerCase();

  const filtered = useMemo(() =>
    !fq ? settings : settings.filter(({ name, keywords, items }) =>
      name.toLowerCase().includes(fq) ||
      keywords.some((kw) => kw.toLowerCase().includes(fq)) ||
      items.some((i) => i.name.toLowerCase().includes(fq))
    ), [settings, fq]);

  const matchCount = useMemo(() =>
    settings.reduce((c, s) => c + s.items.filter((i) => i.name.toLowerCase().includes(fq)).length, 0),
    [settings, fq]
  );

  const showKeywordTip = !!fq && filtered.length > 0 && !filtered.some(s => s.name.toLowerCase().includes(fq)) &&
    filtered.some(s => s.keywords.some(kw => kw.toLowerCase().includes(fq)));

  return (
    <div className="flex flex-col h-screen">
      <div className="shrink-0"><Nav /></div>

      <div className="flex flex-1 overflow-hidden">
        <div className={clsx(theme['settings-panelColor'], theme[`theme-${options.theme||'default'}`],'w-60 shrink-0 overflow-y-auto p-2 pt-3')}>
          <div className="flex items-center max-w-52 h-7 rounded-lg mx-auto px-2" style={{ backgroundColor: options.settingsSearchBar || '#3c475a' }}>
            <Search className="w-4 mr-1.5" />
            <input
              type="text"
              placeholder="Filter settings"
              className="bg-transparent outline-hidden w-full text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {showKeywordTip && <div className="mt-2 text-xs text-gray-400 text-center px-2">May contain what you're looking for</div>}
          {fq && matchCount > 1 && <div className="mt-2 text-xs text-gray-400 text-center px-2">Found {matchCount} matching settings</div>}

          <div className="flex flex-col gap-3 mt-5">
            {filtered.map(({ name, icon: Icon, items }) => {
              const matched = fq ? items.filter(i => i.name.toLowerCase().includes(fq)) : [];
              return (
                <div
                  key={name}
                  className={clsx('w-full flex flex-col rounded-xl duration-75 cursor-pointer px-5 py-2', content!==name && 'bg-transparent hover:bg-[#ffffff23]')}
                  style={{ backgroundColor: content===name ? options.settingsPanelItemBackgroundColor || '#405a77' : undefined }}
                  onClick={() => setContent(prev => prev===name ? '' : name)}
                >
                  <div className="flex items-center h-6">
                    <Icon className="w-5" />
                    <p className="mx-4">{name}</p>
                  </div>
                  {matched.length > 0 && <p className="ml-9 text-xs text-gray-400 truncate">{matched.map(i=>i.name).join(', ')}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <RenderSetting setting={content} openTabGroups={() => setGroupsOpen(true)} />
        <TabGroupsManager
          state={groupsOpen}
          set={setGroupsOpen}
          groups={options.tabGroups ?? []}
          setGroups={(g) => updateOption({ tabGroups: g })}
        />
      </div>
    </div>
  );
};

export default Settings;
