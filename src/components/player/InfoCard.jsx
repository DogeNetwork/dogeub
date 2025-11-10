import theming from '/src/styles/theming.module.css';
import clsx from 'clsx';

const InfoCard = ({ app, theme }) => {
  return (
    <div
      className={clsx(
        'flex h-16 w-full p-4 items-center rounded-xl',
        theming[`theme-${theme || 'default'}`],
      )}
    >
      <img src={app?.icon} className="w-12 h-12 rounded-md object-cover" />
      <div className="ml-4 flex flex-col gap-1">
        <p className="font-bold">{app?.appName || 'Unknown App'}</p>
        <span className="text-ellipsis">{app?.desc || 'No description available.'}</span>
      </div>
    </div>
  );
};

export default InfoCard;
