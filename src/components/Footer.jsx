import { useOptions } from '../utils/optionsContext';
import { Bookmark, HeartPlus } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import Disc from './Discord';
import clsx from 'clsx';
import BookmarksModal from './Bookmarks';
import AtBanner from './Banner';

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
    <div className="fixed bottom-0 left-0 z-50 w-full px-2 py-2">
      <div className="grid w-full grid-cols-3 items-end">
        {/* LEFT */}
        <div className="flex items-center justify-start">
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
              <HeartPlus className="w-4" />
              Support us
            </a>
          )}
        </div>

        {/* CENTER */}
        <div className="flex items-center justify-center">
          <AtBanner />
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-2">
          <div
            className={clsx(
              'flex gap-1 items-center cursor-pointer',
              'hover:-translate-y-0.5 duration-200',
            )}
            onClick={handleAboutBlank}
          >
            about:blank
          </div>

          <span className="text-gray-500">•</span>

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

          <span className="text-gray-500">•</span>

          <div
            className={clsx(
              'flex gap-1 items-center cursor-pointer',
              'hover:-translate-y-0.5 duration-200',
            )}
            onClick={() => setIsBookmarksOpen(true)}
          >
            <Bookmark className="w-4" />
            Bookmarks
          </div>
        </div>
      </div>

      <BookmarksModal isOpen={isBookmarksOpen} onClose={() => setIsBookmarksOpen(false)} />
    </div>
  );
});

Footer.displayName = 'Footer';
export default Footer;