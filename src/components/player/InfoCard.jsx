import theming from '/src/styles/theming.module.css';
import clsx from 'clsx';
import { useOptions } from '/src/utils/optionsContext';

const InfoCard = ({ app, theme }) => {
  const { options } = useOptions();
  const shrinkHeader = options.shrinkHeader ?? false;

  return (
    <div
      className={clsx(
        'flex w-full items-center rounded-xl overflow-hidden',
        shrinkHeader ? 'h-8 px-2' : 'h-13 p-2.5 py-7',
        theming[`theme-${theme || 'default'}`],
      )}
    >
      <img 
        src={app?.icon} 
        className={clsx('rounded-md object-cover', shrinkHeader ? 'w-8 h-8' : 'w-12 h-12')} 
      />
      <div 
        className={clsx(
          'ml-4 flex', 
          shrinkHeader ? 'flex-row items-center gap-2 overflow-hidden whitespace-nowrap' : 'flex-col gap-1'
        )}
      >
        <p className="font-bold whitespace-nowrap">{app?.appName || 'Unknown App'}</p>
        <span className={clsx('text-ellipsis', shrinkHeader && 'overflow-hidden truncate opacity-80 text-sm')}>
          {app?.desc || 'No description available.'}
        </span>
      </div>
    </div>
  );
};

export default InfoCard;
