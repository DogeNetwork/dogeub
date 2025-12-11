import Nav from '../layouts/Nav';
import { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOptions } from '/src/utils/optionsContext';
import { Bookmark, Plus, Pencil, Trash2, Globe, Folder, ChevronDown, Search } from 'lucide-react';
import clsx from 'clsx';
import theme from '../styles/theming.module.css';
import AddBookmark from '../components/AddBookmark';
import EditBookmark from '../components/EditBookmark';

const Bookmarks = memo(() => {
  const { options, updateOption } = useOptions();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('options'))?.bookmarks || [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [menuOpen, setMenuOpen] = useState(null);
  const [dialog, setDialog] = useState({ add: false, edit: false, index: null });
  const [fallback, setFallback] = useState({});
  const menuRef = useRef(null);
  const folderRef = useRef(null);
  const [showFolders, setShowFolders] = useState(false);

  useEffect(() => {
    updateOption({ bookmarks });
  }, [bookmarks, updateOption]);

  useEffect(() => {
    const close = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(null);
      if (!folderRef.current?.contains(e.target)) setShowFolders(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const folders = useMemo(() => {
    const folderSet = new Set(bookmarks.map((b) => b.folder || 'Uncategorized'));
    return ['All', ...Array.from(folderSet).sort()];
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    if (selectedFolder !== 'All') {
      filtered = filtered.filter((b) => (b.folder || 'Uncategorized') === selectedFolder);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.link.toLowerCase().includes(query) ||
          (b.folder || 'Uncategorized').toLowerCase().includes(query),
      );
    }

    return filtered.sort((a, b) => {
      if (a.folder !== b.folder) {
        return (a.folder || 'Uncategorized').localeCompare(b.folder || 'Uncategorized');
      }
      return a.name.localeCompare(b.name);
    });
  }, [bookmarks, selectedFolder, searchQuery]);

  const go = useCallback(
    (url) => {
      sessionStorage.setItem('query', url);
      navigate('/indev');
    },
    [navigate],
  );

  const searchBarCls = useMemo(
    () => clsx(theme.appsSearchColor, theme[`theme-${options.theme || 'default'}`]),
    [options.theme],
  );

  const linkItem = clsx(
    'flex flex-col items-center justify-center relative group w-20 h-[5.5rem] rounded-md border-transparent cursor-pointer duration-200 ease-in-out',
    options.type === 'dark' ? 'border hover:border-[#ffffff1c]' : 'border-2 hover:border-[#4f4f4f1c]',
    'hover:backdrop-blur',
  );
  const linkLogo = 'w-[2.5rem] h-[2.5rem] flex items-center justify-center rounded-full bg-[#6d6d6d73]';

  const scrollCls = clsx(
    'scrollbar scrollbar-thin scrollbar-track-transparent',
    !options?.type || options.type === 'dark'
      ? 'scrollbar-thumb-gray-600'
      : 'scrollbar-thumb-gray-500',
  );

  const groupedBookmarks = useMemo(() => {
    const grouped = {};
    filteredBookmarks.forEach((bookmark) => {
      const folder = bookmark.folder || 'Uncategorized';
      if (!grouped[folder]) {
        grouped[folder] = [];
      }
      grouped[folder].push(bookmark);
    });
    return grouped;
  }, [filteredBookmarks]);

  return (
    <>
      <Nav />
      <div className={clsx('flex flex-col h-screen overflow-hidden')}>
        <div className={clsx('flex-1 overflow-y-auto', scrollCls)}>
          <div className="w-full px-4 py-4 flex flex-col items-center gap-4 mt-3">
            <div className="w-full max-w-[800px] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'relative flex items-center gap-2.5 rounded-[10px] px-3 flex-1 h-11',
                    searchBarCls,
                  )}
                >
                  <Search className="w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search bookmarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
                <div ref={folderRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFolders((s) => !s)}
                    className={clsx(
                      'flex items-center gap-2 rounded-[10px] px-3 h-11 border',
                      searchBarCls,
                    )}
                  >
                    <Folder size={16} />
                    <span className="text-sm">{selectedFolder}</span>
                    <ChevronDown
                      size={14}
                      className={showFolders ? 'rotate-180 transition-transform' : 'transition-transform'}
                    />
                  </button>
                  {showFolders && (
                    <ul
                      className={clsx(
                        'absolute right-0 top-[calc(100%+0.5rem)] z-20 w-48 rounded-md border border-white/15 shadow-lg p-1 max-h-64 overflow-y-auto',
                        searchBarCls,
                        scrollCls,
                      )}
                      role="listbox"
                    >
                      {folders.map((folder) => (
                        <li
                          key={folder}
                          role="option"
                          aria-selected={selectedFolder === folder}
                          onClick={() => {
                            setSelectedFolder(folder);
                            setShowFolders(false);
                          }}
                          className="px-2 py-1.5 rounded text-[0.8rem] cursor-pointer transition-colors text-inherit hover:bg-[#ffffff12]"
                        >
                          {folder}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  onClick={() => setDialog({ add: true, edit: false, index: null })}
                  className={clsx(
                    'flex items-center gap-2 rounded-[10px] px-4 h-11 border',
                    searchBarCls,
                    'hover:opacity-80 transition-opacity',
                  )}
                >
                  <Plus size={16} />
                  <span className="text-sm">Add</span>
                </button>
              </div>

              {filteredBookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bookmark className="w-16 h-16 opacity-50 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {searchQuery || selectedFolder !== 'All' ? 'No bookmarks found' : 'No bookmarks yet'}
                  </p>
                  <p className="text-sm opacity-70 mb-4">
                    {searchQuery || selectedFolder !== 'All'
                      ? 'Try adjusting your search or folder filter'
                      : 'Add your first bookmark to get started'}
                  </p>
                  {!searchQuery && selectedFolder === 'All' && (
                    <button
                      onClick={() => setDialog({ add: true, edit: false, index: null })}
                      className={clsx(
                        'px-4 py-2 rounded-lg border',
                        searchBarCls,
                        'hover:opacity-80 transition-opacity',
                      )}
                    >
                      Add Bookmark
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6 pb-8">
                  {Object.entries(groupedBookmarks).map(([folder, folderBookmarks]) => (
                    <div key={folder} className="flex flex-col gap-3">
                      {selectedFolder === 'All' && (
                        <div className="flex items-center gap-2 px-2">
                          <Folder size={16} className="opacity-70" />
                          <h2 className="text-lg font-medium">{folder}</h2>
                          <span className="text-sm opacity-60">({folderBookmarks.length})</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4">
                        {folderBookmarks.map((bookmark, i) => {
                          const globalIndex = bookmarks.findIndex((b) => b.id === bookmark.id);
                          return (
                            <div
                              key={bookmark.id || i}
                              className={linkItem}
                              onClick={() => go(bookmark.link)}
                            >
                              <div
                                ref={menuOpen === globalIndex ? menuRef : null}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpen(menuOpen === globalIndex ? null : globalIndex);
                                }}
                                className={clsx(
                                  'absolute -top-2 -right-2 duration-200 ease z-10',
                                  menuOpen === globalIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                                )}
                              >
                                <div className="w-6 h-6 rounded-full bg-[#6d6d6d73] flex items-center justify-center hover:bg-[#6d6d6d99] transition-colors">
                                  <Pencil size="12" className="opacity-70" />
                                </div>
                                {menuOpen === globalIndex && (
                                  <div
                                    className="absolute top-7 right-0 rounded-md shadow-lg border border-white/10 py-1 w-[101px] z-50"
                                    style={{ backgroundColor: options.quickModalBgColor || '#252f3e' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => {
                                        setDialog({ add: false, edit: true, index: globalIndex });
                                        setMenuOpen(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-[0.74rem] flex items-center gap-2 hover:bg-white/10 duration-150 text-left"
                                    >
                                      <Pencil size="14" /> Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        setBookmarks(bookmarks.filter((_, j) => j !== globalIndex));
                                        setMenuOpen(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-[0.74rem] flex items-center gap-2 hover:bg-white/10 duration-150 text-left text-red-400"
                                    >
                                      <Trash2 size="14" /> Remove
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className={linkLogo}>
                                {fallback[globalIndex] ? (
                                  <Globe className="w-7 h-7" />
                                ) : (
                                  <img
                                    key={bookmark.icon}
                                    src={bookmark.icon}
                                    alt={bookmark.name}
                                    className="w-7 h-7 object-contain"
                                    loading="lazy"
                                    onError={() => setFallback((p) => ({ ...p, [globalIndex]: true }))}
                                  />
                                )}
                              </div>
                              <div className="mt-3 text-sm font-medium text-center w-full px-1 overflow-hidden whitespace-nowrap text-ellipsis">
                                {bookmark.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddBookmark
        state={dialog.add}
        set={(v) => setDialog({ ...dialog, add: v })}
        update={(form) => setBookmarks([...bookmarks, form])}
      />
      <EditBookmark
        state={dialog.edit}
        set={(v) => setDialog({ ...dialog, edit: v })}
        initialData={dialog.index != null ? bookmarks[dialog.index] : null}
        update={(form) => {
          const updated = [...bookmarks];
          updated[dialog.index] = { ...updated[dialog.index], ...form };
          setBookmarks(updated);
        }}
      />
    </>
  );
});

Bookmarks.displayName = 'Bookmarks';
export default Bookmarks;

