import Routing from './Routing';
import ReactGA from 'react-ga4';
import Loader from './pages/Loader';
import lazyLoad from './lazyWrapper';
import NotFound from './pages/NotFound';
import { useEffect, useMemo, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { OptionsProvider, useOptions } from './utils/optionsContext';
import { initPreload } from './utils/preload';
import { designConfig as bgDesign } from './utils/config';
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
const New = lazyLoad(() => import('./pages/New'));

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
  useTracking();

  const pages = useMemo(
    () => [
      { path: '/', element: <Home /> },
      { path: '/materials', element: <Apps /> },
      { path: '/docs', element: <Apps2 /> },
      { path: '/docs/r', element: <Player /> },
      { path: '/indev', element: <Loader /> },
      { path: '/settings', element: <Settings /> },
      { path: '/new', element: <New /> },
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
