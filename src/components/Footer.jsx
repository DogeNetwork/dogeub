import { useOptions } from '../utils/optionsContext';
import { Bookmark, HeartPlus } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import Disc from './Discord';
import clsx from 'clsx';
import BookmarksModal from './Bookmarks';
// import AtBanner from './Banner';
const Footer = memo(() => {
  const { options } = useOptions();
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const handleDs = useCallback(() => {
    window.open('/ds', '_blank');
  }, []);
  const handleAboutBlank = useCallback(() => {
    import('/src/utils/utils.js').then(({ openAboutBlankPopup }) => openAboutBlankPopup(true));
  }, []);
  return (
    <div className="w-full fixed bottom-0 flex items-end justify-between p-2">
      {' '}
      {options.donationBtn !== false && (
        <a
          href="https://ko-fi.com/I3I81MF4CH"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'flex gap-1 items-center cursor-pointer',
            'hover:-translate-y-0.5 duration-200',
          )}
        >
          {' '}
          <HeartPlus className="w-4" /> Support us{' '}
        </a>
      )}{' '}
      <div className="flex gap-2 items-center">
        {' '}
        <div
          className={clsx(
            'flex gap-1 items-center cursor-pointer',
            'hover:-translate-y-0.5 duration-200',
          )}
          onClick={handleAboutBlank}
        >
          {' '}
          about:blank{' '}
        </div>{' '}
        <span className="text-gray-500">•</span>{' '}
        <div
          className={clsx(
            'flex gap-1 items-center cursor-pointer',
            'hover:-translate-y-0.5 duration-200',
          )}
          onClick={handleDs}
        >
          {' '}
          <Disc className="w-4" fill={options.siteTextColor || '#a0b0c8'} /> Discord{' '}
        </div>{' '}
        <span className="text-gray-500">•</span>{' '}
        <div
          className={clsx(
            'flex gap-1 items-center cursor-pointer',
            'hover:-translate-y-0.5 duration-200',
          )}
          onClick={() => setIsBookmarksOpen(true)}
        >
          {' '}
          <Bookmark className="w-4" /> Bookmarks{' '}
        </div>{' '}
      </div>{' '}
      <BookmarksModal isOpen={isBookmarksOpen} onClose={() => setIsBookmarksOpen(false)} />{' '}
    </div>
  );
});
Footer.displayName = 'Footer';
export default Footer;
