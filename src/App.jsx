import Routing from './Routing';
import ReactGA from 'react-ga4';
import Search from './pages/Search';
import lazyLoad from './lazyWrapper';
import NotFound from './pages/NotFound';
import { useEffect, useMemo, memo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Popunder from './components/Popunder';
import { OptionsProvider, useOptions } from './utils/optionsContext';
import { initPreload } from './utils/preload';
import { designConfig as bgDesign } from './utils/config';
import useReg from './utils/hooks/loader/useReg';
import { isPopunderKeyValid } from './utils/hooks/loader/findWisp';
import './index.css';
import 'nprogress/nprogress.css';

const importHome = () => import('./pages/Home');
const importApps = () => import('./pages/Apps');
const importGms = () => import('./pages/Apps2');
const importSettings = () => import('./pages/Settings');

const Home = lazyLoad(importHome);
const Apps = lazyLoad(importApps);
const Apps2 = lazyLoad(importGms);
const Settings = lazyLoad(importSettings);
const Player = lazyLoad(() => import('./pages/Player'));

initPreload('/materials', importApps);
initPreload('/docs', importGms);
initPreload('/settings', importSettings);
initPreload('/', importHome);

function useTracking() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname });
  }, [location]);
}

const ThemedApp = memo(() => {
  const { options } = useOptions();
  const popunderFeatureEnabled = POPUNDER_ENABLED === 'true';
  const popunderKey = options.popunderKey?.trim() || '';
  const [popunderKeyCheck, setPopunderKeyCheck] = useState(() => ({
    key: popunderKey,
    status: popunderKey ? 'pending' : 'idle',
  }));
  useReg();
  useTracking();

  useEffect(() => {
    if (!popunderFeatureEnabled) {
      setPopunderKeyCheck({ key: '', status: 'idle' });
      return;
    }

    if (!popunderKey) {
      setPopunderKeyCheck({ key: '', status: 'idle' });
      return;
    }

    let active = true;
    setPopunderKeyCheck({ key: popunderKey, status: 'pending' });

    isPopunderKeyValid(popunderKey)
      .then((isValid) => {
        if (!active) return;
        setPopunderKeyCheck({ key: popunderKey, status: isValid ? 'valid' : 'invalid' });
      })
      .catch(() => {
        if (!active) return;
        setPopunderKeyCheck({ key: popunderKey, status: 'invalid' });
      });

    return () => {
      active = false;
    };
  }, [popunderFeatureEnabled, popunderKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAdsDisabled = async (key) => {
      if (!popunderFeatureEnabled) return true;

      let storedKey = '';

      try {
        const options = JSON.parse(localStorage.getItem('options') || '{}');
        storedKey = typeof options.popunderKey === 'string' ? options.popunderKey.trim() : '';
      } catch {
        storedKey = '';
      }

      const normalizedKey = typeof key === 'string' ? key.trim() : '';
      const keyToCheck = normalizedKey || storedKey;

      if (!keyToCheck) return false;
      return isPopunderKeyValid(keyToCheck);
    };

    window.checkAdsDisabled = checkAdsDisabled;

    return () => {
      if (window.checkAdsDisabled === checkAdsDisabled) {
        delete window.checkAdsDisabled;
      }
    };
  }, [popunderFeatureEnabled]);

  const showPopunder =
    popunderFeatureEnabled &&
    (!popunderKey || (popunderKeyCheck.key === popunderKey && popunderKeyCheck.status === 'invalid'));

  const pages = useMemo(
    () => [
      { path: '/', element: <Home /> },
      { path: '/materials', element: <Apps /> },
      { path: '/docs', element: <Apps2 /> },
      { path: '/docs/r', element: <Player /> },
      { path: '/search', element: <Search />},
      { path: '/settings', element: <Settings /> },
      { path: '/portal/k12/*', element: <NotFound /> },
      { path: '/ham/*', element: <NotFound /> },
      { path: '*', element: <NotFound /> },
    ],
    [],
  );

  const backgroundStyle = useMemo(() => {
    const bgDesignConfig =
      options.bgDesign === 'None'
        ? 'none'
        : (
            bgDesign.find((d) => d.value.bgDesign === options.bgDesign) || bgDesign[0]
          ).value.getCSS?.(options.bgDesignColor || '102, 105, 109') || 'none';

    return `
      body {
        color: ${options.siteTextColor || '#a0b0c8'};
        background-image: ${bgDesignConfig};
        background-color: ${options.bgColor || '#111827'};
      }
    `;
  }, [options.siteTextColor, options.bgDesign, options.bgDesignColor, options.bgColor]);

  return (
    <>
      <Routing pages={pages} />
      {showPopunder ? <Popunder /> : null}
      <style>{backgroundStyle}</style>
    </>
  );
});

ThemedApp.displayName = 'ThemedApp';

const App = () => (
  <OptionsProvider>
    <ThemedApp />
  </OptionsProvider>
);

export default App;
