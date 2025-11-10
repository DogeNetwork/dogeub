import { startTransition } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ReactGA from 'react-ga4';
import App from './App';

typeof window != 'undefined' &&
  ('requestIdleCallback' in window
    ? requestIdleCallback(() => ReactGA.initialize('G-HWLK0PZVBM'))
    : setTimeout(() => ReactGA.initialize('G-HWLK0PZVBM'), 0));

const root = createRoot(document.getElementById('root'));

startTransition(() => {
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
});
