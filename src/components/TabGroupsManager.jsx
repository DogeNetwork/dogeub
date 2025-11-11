import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useOptions } from '/src/utils/optionsContext';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import clsx from 'clsx';

const GroupRow = ({ group, idx, onChange, onDelete, isDarkTheme }) => {
  const [local, setLocal] = useState({ name: group.name || '', color: group.color || '#6b8cff' });
  const save = () => onChange(idx, { ...group, ...local });
  return (
    <div className={clsx('flex items-center gap-3 p-2 rounded', isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-black/5')}>
      <input
        value={local.name}
        onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
        onBlur={save}
        className={clsx('px-2 py-1 rounded border bg-transparent', isDarkTheme ? 'border-gray-600 text-white' : 'border-gray-300 text-black')}
      />
      <input
        type="color"
        value={local.color}
        onChange={(e) => setLocal((s) => ({ ...s, color: e.target.value }))}
        onBlur={save}
        className="w-9 h-9 p-0 rounded"
      />
      <button
        className={clsx('ml-auto p-1 rounded hover:opacity-70 transition-opacity', isDarkTheme ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600')}
        onClick={() => onDelete(idx)}
        title="Delete group"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const TabGroupsManager = ({ state, set, groups, setGroups }) => {
  const { options, updateOption } = useOptions();
  const [localGroups, setLocalGroups] = useState(groups || []);
  const isDarkTheme = options.type === 'dark' || !options.type;

  const addGroup = () => {
    const g = { id: Date.now().toString(), name: `Group ${localGroups.length + 1}`, color: '#6b8cff', links: [] };
    const next = [...localGroups, g];
    setLocalGroups(next);
    setGroups(next);
    updateOption({ tabGroups: next });
  };

  const changeGroup = (idx, g) => {
    const next = [...localGroups];
    next[idx] = g;
    setLocalGroups(next);
    setGroups(next);
    updateOption({ tabGroups: next });
  };

  const deleteGroup = (idx) => {
    const next = localGroups.filter((_, i) => i !== idx);
    setLocalGroups(next);
    setGroups(next);
    updateOption({ tabGroups: next });
  };

  const done = () => set(false);

  return (
    <Dialog open={state} onClose={() => set(false)} className="fixed inset-0 bg-black/40 z-50">
      <div className="flex justify-center items-center h-full">
        <DialogPanel
          className={clsx('w-[34rem] p-5 rounded-xl relative flex flex-col gap-3 shadow-2xl', isDarkTheme ? 'text-white' : 'text-black')}
          style={{
            backgroundColor: options.quickModalBgColor || (isDarkTheme ? '#252f3e' : '#f5f5f5'),
          }}
        >
          <DialogTitle className={clsx('text-[1rem] mb-1', isDarkTheme ? 'text-white' : 'text-gray-900')}>Manage tab groups</DialogTitle>
          <div className={clsx('flex flex-col gap-2 max-h-[48vh] overflow-auto', isDarkTheme ? 'border-gray-700' : 'border-gray-300')}>
            {localGroups.map((g, i) => (
              <GroupRow key={g.id || i} group={g} idx={i} onChange={changeGroup} onDelete={deleteGroup} isDarkTheme={isDarkTheme} />
            ))}
            {localGroups.length === 0 && (
              <div className={clsx('text-sm', isDarkTheme ? 'text-gray-400' : 'text-gray-500')}>No groups yet — add one.</div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              className={clsx(
                'px-3 py-1 rounded transition-opacity hover:opacity-80',
                isDarkTheme ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'
              )}
              onClick={addGroup}
            >
              + Add group
            </button>
            <div className="ml-auto">
              <button
                className={clsx(
                  'px-3 py-1 rounded transition-opacity hover:opacity-80',
                  isDarkTheme ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'
                )}
                onClick={done}
              >
                Done
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TabGroupsManager;
