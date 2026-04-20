import clsx from 'clsx';
import { Megaphone, X, Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOptions } from '../utils/optionsContext';

const DisableAds = ({ isOpen, onClose }) => {
  const { options } = useOptions();
  const [anim, setAnim] = useState(false);
  const [render, setRender] = useState(false);
  const [copied, setCopied] = useState(false);
  const dUrl = 'https://discord.gg/ZBef7HnAeg';

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setCopied(false);
      setTimeout(() => setAnim(true), 10);
    } else {
      setAnim(false);
      setTimeout(() => setRender(false), 200);
    }
  }, [isOpen]);

  const copyDiscordUrl = async () => {
    try {
      await navigator.clipboard.writeText(dUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (!render) return null;

  const light = options.type === 'light';
  const cardBg = options.settingsPanelItemBackgroundColor || (light ? '#f3f4f6' : '#ffffff0c');
  const cardBorder = options.paginationBorderColor || (light ? '#d1d5db' : '#374151');
  const mutedText = options.paginationTextColor || (light ? '#4b5563' : '#9ca3af');
  const actionColor = options.siteTextColor || '#a0b0c8';
  const badgeText = light ? '#111827' : '#ffffff';
  const badgeBg = actionColor;

  return createPortal(
    <div
      className={clsx(
        'fixed inset-0 z-9999 flex items-center justify-center p-4 transition-opacity',
        anim ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div
        className={clsx(
          'relative w-full max-w-2xl max-h-[80vh] rounded-lg border shadow-lg overflow-hidden transition-all',
          anim ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        )}
        style={{ backgroundColor: options.menuColor || '#1a252f' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: light ? '#e5e7eb' : '#374151' }}
        >
          <div className="flex items-center gap-2">
            <Megaphone size={18} />
            <h2 className="text-lg font-medium">Disable Ads</h2>
          </div>
          <button
            onClick={onClose}
            className={clsx('p-1 rounded-md', light ? 'hover:bg-gray-100' : 'hover:bg-[#ffffff0c]')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
          <div className="space-y-3">
            <p className="text-sm" style={{ color: mutedText }}>
              Follow these steps to disable ads:
            </p>

            <div
              className="rounded-md border p-3 flex items-start gap-3"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: badgeBg, color: badgeText }}
              >
                1
              </div>
              <div className="min-w-0 text-sm">
                <div className="font-medium">Join our Discord</div>
                  <div className="mt-1 flex items-center gap-2">
                    <a
                      href={dUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 rounded border break-all"
                      style={{
                        color: actionColor,
                        borderColor: cardBorder,
                        backgroundColor: options.paginationBgColor || cardBg,
                      }}
                    >
                      {dUrl}
                    </a>
                    <button
                      onClick={copyDiscordUrl}
                      className="text-xs px-2 py-1 rounded border inline-flex items-center gap-1"
                      style={{
                        color: actionColor,
                        borderColor: cardBorder,
                        backgroundColor: options.paginationBgColor || cardBg,
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
              </div>
            </div>

            <div
              className="rounded-md border p-3 flex items-start gap-3"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: badgeBg, color: badgeText }}
              >
                2
              </div>
              <div className="text-sm">
                <div className="font-medium">Obtain an ad key</div>
                <div className="mt-1" style={{ color: mutedText }}>
                  Ask in Discord and copy your ad key
                </div>
              </div>
            </div>

            <div
              className="rounded-md border p-3 flex items-start gap-3"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: badgeBg, color: badgeText }}
              >
                3
              </div>
              <div className="text-sm">
                <div className="font-medium">Add key in Settings</div>
                <div className="mt-1" style={{ color: mutedText }}>
                  Go to Settings &gt; Advanced and paste your ad key to disable ads.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DisableAds;
