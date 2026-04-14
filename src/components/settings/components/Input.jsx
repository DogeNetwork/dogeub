import clsx from 'clsx';
import { Check, X } from 'lucide-react';
import { useOptions } from '/src/utils/optionsContext';

const TextInput = ({ defValue, onChange, placeholder = 'Enter text', maxW = 40, status }) => {
  const { options } = useOptions();

  const statusIcon =
    status === 'valid'
      ? <Check size={16} className="text-green-500" />
      : status === 'invalid'
        ? <X size={16} className="text-red-500" />
        : undefined;

  return (
    <div
      className={clsx('relative w-full', 'rounded-xl border')}
      style={{
        backgroundColor: options.settingsDropdownColor || '#1a2a42',
        maxWidth: `${maxW}rem`,
      }}
    >
      <div className={clsx('flex w-full h-10', 'p-2.5 pl-5 pr-10')}>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          spellCheck="false"
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => onChange?.(e.target.value)}
          className="flex-1 min-w-0 text-[0.9rem] truncate bg-transparent outline-none"
        />
        {icon}
      </div>

      {statusIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center" aria-hidden="true">
          {statusIcon}
        </div>
      )}
    </div>
  );
};

export default TextInput;
