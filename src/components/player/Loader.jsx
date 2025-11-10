import { useRef, useState, useEffect } from 'react';
import Control from './Controls';
import { Maximize2, SquareArrowOutUpRight, ZoomIn, ZoomOut } from 'lucide-react';
import InfoCard from './InfoCard';
import theming from '/src/styles/theming.module.css';
import clsx from 'clsx';

const Loader = ({ theme, app }) => {
  const gmRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const query = sessionStorage.getItem('query');
    if (!query) window.location.href = '/docs';
  }, []);

  const fs = () => gmRef.current?.requestFullscreen?.();

  const external = () => {
    sessionStorage.setItem('query', app?.url);
    window.open('/indev', '_blank');
  };

  const zoomIn = () => {
    if (!gmRef.current) return;
    // cap at 200
    const newZoom = Math.min(zoom + 0.1, 2);
    gmRef.current.style.zoom = newZoom;
    setZoom(newZoom);
  };

  const zoomOut = () => {
    if (!gmRef.current) return;
    const newZoom = Math.max(zoom - 0.1, 0.5); // min 50
    gmRef.current.style.zoom = newZoom;
    setZoom(newZoom);
  };

  return (
    <div
      className={clsx(
        'flex flex-col h-[calc(100vh-38px)] w-full rounded-xl',
        theming.appItemColor,
        theming[`theme-${theme || 'default'}`],
      )}
    >
      <div className="p-2 pl-1 border-b flex gap-2">
        <InfoCard app={app} theme={theme} />
      </div>

      <iframe
        src="/src/static/loader.html?ui=false"
        ref={gmRef}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full flex-grow"
      />

      <div className="p-2.5 flex gap-2 border-t">
        <Control icon={SquareArrowOutUpRight} fn={external} />
        <Control icon={ZoomIn} fn={zoomIn} className="ml-auto" />
        <Control icon={ZoomOut} fn={zoomOut} />
        <Control icon={Maximize2} fn={fs} />
      </div>
    </div>
  );
};

export default Loader;
