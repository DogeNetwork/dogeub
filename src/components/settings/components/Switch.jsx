import { Switch } from '@headlessui/react';
import { useState } from 'react';
import { useOptions } from '/src/utils/optionsContext';

export default function SwitchComponent({ action, value }) {
  const { options } = useOptions();
  const [enabled, setEnabled] = useState(value);
  const switchChange = (value) => {
    setEnabled(value);
    action(value);
  };
  return (
    <Switch
      checked={enabled}
      onChange={switchChange}
      className="group relative flex h-7 w-14 cursor-pointer rounded-full p-1 ease-in-out focus:outline-none"
      style={{
        backgroundColor: enabled
          ? options.switchEnabledColor || '#4c6c91'
          : options.switchColor || '#ffffff1a',
        transition: 'background-color 0.2s ease-in-out',
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-7"
      />
    </Switch>
  );
}
