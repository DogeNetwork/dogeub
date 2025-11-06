import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useOptions } from '/src/utils/optionsContext';
import { Plus, CircleX, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import LinkDialog from './NewQuickLink';
import TabGroupsManager from './TabGroupsManager';

const QuickLinks = ({ cls, nav = true }) => {
  const { options, updateOption } = useOptions();
  const [fallback, setFallback] = useState({});
  const navigate = useNavigate();
  const g = (s) => {
    if (nav) {
      sessionStorage.setItem('query', s);
      navigate('/indev');
    } else {
      window.parent.tabManager.navigate(s);
    }
  };

  const defaultLinks = [
    { link: 'https://google.com', icon: 'https://google.com/favicon.ico', name: 'Google' },
    { link: 'https://facebook.com', icon: 'https://facebook.com/favicon.ico', name: 'Facebook' },
    { link: 'https://quora.com', icon: 'https://quora.com/favicon.ico', name: 'Quora' },
    { link: 'https://github.com', icon: 'https://github.com/favicon.ico', name: 'GitHub' },
  ];

  const stored = JSON.parse(localStorage.getItem('options') || '{}');
  const [quickLinks, setQuickLinks] = useState(() => stored.quickLinks ?? defaultLinks);
  const [tabGroups, setTabGroups] = useState(() => stored.tabGroups ?? null);
  const [isOpen, setOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [targetGroup, setTargetGroup] = useState(null); // index of the group to add new link into

  // If there are no tabGroups but there are quickLinks, migrate into a default group
  useEffect(() => {
    if (!tabGroups) {
      const opts = JSON.parse(localStorage.getItem('options') || '{}');
      if (opts.tabGroups) {
        setTabGroups(opts.tabGroups);
      } else if (opts.quickLinks) {
        const g = [{ id: 'default', name: 'Default', color: '#6b8cff', links: opts.quickLinks }];
        setTabGroups(g);
        updateOption({ tabGroups: g });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickLink = (arr) => {
    setQuickLinks(arr);
    updateOption({ quickLinks: arr });
  };

  // Persist quickLinks (backwards compatibility) if not using groups
  useEffect(() => {
    if (!tabGroups) updateOption({ quickLinks: quickLinks });
  }, [quickLinks]);

  const linkItem = clsx(
    'flex flex-col items-center justify-center relative group',
    `w-20 h-[5.5rem] rounded-md border-transparent cursor-pointer ${options.type == 'dark' ? 'border' : 'border-2'}`,
    `hover:backdrop-blur ${options.type == 'dark' ? 'hover:border-[#ffffff1c]' : 'hover:border-[#4f4f4f1c]'}`,
    'duration-200 ease-in-out',
  );

  const linkLogo = clsx('w-[2.5rem] h-[2.5rem] flex items-center justify-center', 'rounded-full bg-[#6d6d6d73]');

  const renderLinkItem = (link, i, onDelete) => (
    <div className={linkItem} key={i} onClick={() => g(link.link)}>
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete && onDelete();
        }}
        className={clsx('absolute -top-2 -right-2 opacity-0', 'group-hover:opacity-100 duration-200 ease')}
      >
        <CircleX size="16" className="opacity-50" />
      </div>
      <div className={linkLogo}>
        {fallback[i] ? (
          <Globe className="w-7 h-7" />
        ) : (
          <img src={link.icon} alt={link.name} className="w-7 h-7 object-contain" onError={() => setFallback((prev) => ({ ...prev, [i]: true }))} />
        )}
      </div>
      <div className="mt-3 text-sm font-medium text-center w-full px-1 overflow-hidden whitespace-nowrap text-ellipsis">{link.name}</div>
    </div>
  );

  // If groups exist, render grouped layout
  if (tabGroups && Array.isArray(tabGroups)) {
    return (
      <div className={clsx(!cls ? 'w-full max-w-[48rem] mx-auto mt-20' : cls)}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Tab groups</div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-1 rounded bg-neutral-700" onClick={() => setGroupsOpen(true)}>
              Manage groups
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {tabGroups.map((group, gi) => (
            <div key={group.id || gi} className="rounded-md border p-3">
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: 12, height: 12, backgroundColor: group.color || '#6b8cff', borderRadius: 4 }} />
                <div className="font-medium">{group.name || 'Group'}</div>
                <div className="ml-auto" />
              </div>

              <div className="flex flex-wrap gap-4">
                {group.links?.map((link, i) =>
                  renderLinkItem(link, `${gi}-${i}`, () => {
                    const next = tabGroups.map((g, idx) => (idx === gi ? { ...g, links: g.links.filter((_, j) => j !== i) } : g));
                    setTabGroups(next);
                    updateOption({ tabGroups: next });
                  }),
                )}

                <div className={`${linkItem} cursor-pointer`} onClick={() => {
                  // open new quick link for this group (use component state instead of document.dataset)
                  setTargetGroup(gi);
                  setOpen(true);
                }}>
                  <div className={linkLogo}>
                    <Plus className="w-7 h-7" />
                  </div>
                  <div className="mt-3 text-sm font-medium text-center">New</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <TabGroupsManager state={groupsOpen} set={setGroupsOpen} groups={tabGroups} setGroups={(g) => { setTabGroups(g); updateOption({ tabGroups: g }); }} />

        <LinkDialog
          state={isOpen}
          set={(v) => {
            setOpen(v);
            if (!v) setTargetGroup(null);
          }}
          onConfirm={(form) => {
            // if a targetGroup is set, add into that group's links, otherwise fallback to single-level quickLinks
            if (targetGroup !== null && Array.isArray(tabGroups)) {
              const next = tabGroups.map((g, idx) => (idx === targetGroup ? { ...g, links: [...(g.links || []), form] } : g));
              setTabGroups(next);
              updateOption({ tabGroups: next });
            } else {
              setQuickLinks((prev) => {
                const next = [...prev, form];
                updateOption({ quickLinks: next });
                return next;
              });
            }
            setTargetGroup(null);
          }}
        />
      </div>
    );
  }

  // fallback: render single-level quickLinks
  return (
    <div className={clsx('flex flex-wrap justify-center gap-4', !cls ? 'w-full max-w-[40rem] mx-auto mt-40' : cls)}>
      {quickLinks.map((link, i) => renderLinkItem(link, i, () => handleQuickLink(quickLinks.filter((_, j) => j !== i))))}

      <div className={`${linkItem} cursor-pointer`} onClick={() => setOpen(true)}>
        <div className={linkLogo}>
          <Plus className="w-7 h-7" />
        </div>
        <div className="mt-3 text-sm font-medium text-center">New</div>
      </div>

      <LinkDialog state={isOpen} set={setOpen} update={(form) => setQuickLinks([...quickLinks, form])} />
    </div>
  );
};

QuickLinks.displayName = 'QuickLinks';
export default QuickLinks;
