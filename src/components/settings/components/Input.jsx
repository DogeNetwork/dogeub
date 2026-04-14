import clsx from 'clsx';
import { useOptions } from '/src/utils/optionsContext';

const TextInput = ({ defValue, onChange, placeholder = 'Enter text', maxW = 40, status }) => {
  const { options } = useOptions();

  const statusStyles =
    status === 'valid'
      ? {
          borderColor: '#22c55e66',
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
        }
      : status === 'invalid'
        ? {
            borderColor: '#ef444466',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
          }
        : null;

  return (
    <div
      className={clsx('relative w-full', 'rounded-xl border')}
      style={{
        backgroundColor: statusStyles?.backgroundColor || options.settingsDropdownColor || '#1a2a42',
        maxWidth: `${maxW}rem`,
        borderColor: statusStyles?.borderColor,
      }}
    >
      <div className={clsx('flex w-full h-10', 'p-2.5 pl-5')}>
        <input
          type="text"
          defaultValue={defValue}
          placeholder={placeholder}
          spellCheck="false"
          onBlur={(e) => onChange?.(e.target.value)}
          className="flex-1 min-w-0 text-[0.9rem] truncate bg-transparent outline-none"
        />
      </div>
    </div>
  );
};

export default TextInput;
