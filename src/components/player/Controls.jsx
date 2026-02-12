import theming from '/src/styles/theming.module.css';
import clsx from 'clsx';
import { useOptions } from '/src/utils/optionsContext';

export const Controls = ({ icon: Icon, fn, size = 18, className, children }) => {
  const {
    options: { theme },
  } = useOptions();
  return (
    <div
      onClick={fn}
      className={clsx(
        'h-7 flex justify-center items-center rounded-md cursor-pointer hover:opacity-60',
        children ? 'px-2 gap-2 min-w-7' : 'w-7',
        theming.appItemColor,
        theming[`theme-${theme || 'default'}`],
        className,
      )}
    >
      <Icon size={size} className="shrink-0" />
      {children}
    </div>
  );
};
export default Controls;
