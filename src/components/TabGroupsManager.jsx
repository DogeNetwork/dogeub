import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useOptions } from '/src/utils/optionsContext';
import { useState } from 'react';
import clsx from 'clsx';

const GroupRow = ({ group, idx, onChange, onDelete }) => {
  const [local, setLocal] = useState({ name: group.name || '', color: group.color || '#6b8cff' });
  const save = () => onChange(idx, { ...group, ...local });
  return (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-black/5">
      <input
        value={local.name}
        onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
        onBlur={save}
        className="px-2 py-1 rounded border bg-transparent"
      />
      <input
        type="color"
        value={local.color}
        onChange={(e) => setLocal((s) => ({ ...s, color: e.target.value }))}
        onBlur={save}
        className="w-9 h-9 p-0 rounded"
      />
      <div className="ml-auto text-sm text-neutral-400 cursor-pointer" onClick={() => onDelete(idx)}>
        Delete
      </div>
    </div>
  );
};

const TabGroupsManager = ({ state, set, groups, setGroups }) => {
  const { options, updateOption } = useOptions();
  const [localGroups, setLocalGroups] = useState(groups || []);

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
        <DialogPanel className="w-[34rem] p-5 rounded-xl relative flex flex-col gap-3 shadow-2xl" style={{ backgroundColor: options.quickModalBgColor || '#252f3e' }}>
          <DialogTitle className="text-[1rem] mb-1">Manage tab groups</DialogTitle>
          <div className="flex flex-col gap-2 max-h-[48vh] overflow-auto">
            {localGroups.map((g, i) => (
              <GroupRow key={g.id || i} group={g} idx={i} onChange={changeGroup} onDelete={deleteGroup} />
            ))}
            {localGroups.length === 0 && <div className="text-sm text-neutral-400">No groups yet — add one.</div>}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button className="px-3 py-1 rounded bg-neutral-700" onClick={addGroup}>
              + Add group
            </button>
            <div className="ml-auto">
              <button className="px-3 py-1 rounded bg-neutral-700" onClick={done}>
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
