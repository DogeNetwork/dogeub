import theming from '/src/styles/theming.module.css';
import clsx from 'clsx';
import { useOptions } from '/src/utils/optionsContext';

export const Controls = ({ icon: Icon, fn, size = 18, className }) => {
  const {
    options: { theme },
  } = useOptions();
  return (
    <div
      onClick={fn}
      className={clsx(
        'w-7 h-7 flex justify-center items-center rounded-md cursor-pointer hover:opacity-60',
        theming.appItemColor,
        theming[`theme-${theme || 'default'}`],
        className,
      )}
    >
      <Icon size={size} />
    </div>
  );
};
export default Controls;
