import clsx from 'clsx';
import { useOptions } from '/src/utils/optionsContext';

const Button = ({ value, action, disabled = false, maxW = 40 }) => {
  const { options } = useOptions();

  return (
    <button
      onClick={action}
      className={clsx(
        'rounded-xl border text-[0.9rem] font-medium cursor-pointer',
        'flex items-center justify-center h-10 px-4 transition-opacity duration-150',
        'hover:opacity-80 active:opacity-90',
        disabled ? 'opacity-60' : undefined,
      )}
      style={{
        backgroundColor: options.settingsDropdownColor || '#1a2a42',
        maxWidth: `${maxW}rem`,
      }}
    >
      {value}
    </button>
  );
};

export default Button;
