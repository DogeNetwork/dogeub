import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useOptions } from '../utils/optionsContext';

const calc = (hex, alpha = 0.5) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

const NotFound = () => {
  const loc = useLocation();
  const nav = useNavigate();
  const { options } = useOptions();
  const mainText = options.siteTextColor ?? '#a0b0c8';

  const colorConfig = {
    text: mainText,
    textMuted: calc(mainText, 0.5),
  };

  useEffect(() => {
    if (loc.pathname.includes('ham/') || loc.pathname.includes('portal/k12/')) {
      return;
    }
    nav('/');
  }, [loc, nav]);

  if (loc.pathname.includes('ham/') || loc.pathname.includes('portal/k12/')) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ fontFamily: 'SFProText, system-ui, sans-serif' }}
      >
        <h1 className="text-2xl font-medium mb-2" style={{ color: colorConfig.text }}>
          Whoops, something broke!
        </h1>
        <p
          onClick={() => location.reload()}
          className="cursor-pointer underline"
          style={{ color: colorConfig.textMuted }}
        >
          Please refresh here
        </p>
      </div>
    );
  }

  return null;
};

export default NotFound;
