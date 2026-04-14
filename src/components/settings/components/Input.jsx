import clsx from 'clsx';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOptions } from '/src/utils/optionsContext';

const TextInput = ({ defValue, onChange, placeholder = 'Enter text', maxW = 40, validate }) => {
  const { options } = useOptions();
  const [value, setValue] = useState(defValue ?? '');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    setValue(defValue ?? '');
  }, [defValue]);

  useEffect(() => {
    let active = true;
    const trimmed = value.trim();

    if (typeof validate !== 'function' || !trimmed) {
      setStatus('idle');
      return () => {
        active = false;
      };
    }

    setStatus('pending');
    Promise.resolve(validate(trimmed))
      .then((result) => {
        if (!active) return;
        setStatus(result ? 'valid' : 'invalid');
      })
      .catch(() => {
        if (!active) return;
        setStatus('invalid');
      });

    return () => {
      active = false;
    };
  }, [validate, value]);

  const icon =
    status === 'valid' ? (
      <Check className="w-4 h-4 shrink-0 text-emerald-400" aria-label="Valid key" />
    ) : status === 'invalid' ? (
      <X className="w-4 h-4 shrink-0 text-red-400" aria-label="Invalid key" />
    ) : null;

  return (
    <div
      className={clsx('relative w-full', 'rounded-xl border')}
      style={{
        backgroundColor: options.settingsDropdownColor || '#1a2a42',
        maxWidth: `${maxW}rem`,
      }}
    >
      <div className={clsx('flex w-full h-10 items-center gap-2', 'p-2.5 pl-5 pr-3')}>
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
    </div>
  );
};

export default TextInput;
