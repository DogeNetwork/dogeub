import { useOptions } from '../utils/optionsContext';
import Disc from './Discord';
import clsx from 'clsx';
import { memo, useCallback } from 'react';

const Footer = memo(() => {
  const { options } = useOptions();

  const handleDs = useCallback(() => {
    window.open('/ds', '_blank');
  }, []);

  return (
    <div className="w-full fixed bottom-0 flex items-end justify-between p-2">
      <div
        className={clsx(
          'flex gap-1 items-center cursor-pointer',
          'hover:-translate-y-0.5 duration-200',
        )}
        onClick={handleDs}
      >
        <Disc className="w-4" fill={options.siteTextColor || '#a0b0c8'} />
        Discord
      </div>
      {options.donationBtn !== false && (
        <a href="https://ko-fi.com/I3I81MF4CH" target="_blank" rel="noopener noreferrer">
          <img
            src="https://img.buymeacoffee.com/button-api/?text=Support%20us&emoji=%F0%9F%92%99&slug=dogubdev&button_colour=5F7FFF&font_colour=ffffff&font_family=Inter&outline_colour=000000"
            alt="Support us"
            className="w-32 h-auto"
            loading="lazy"
          />
        </a>
      )}
    </div>
  );
});

Footer.displayName = 'Footer';
export default Footer;
