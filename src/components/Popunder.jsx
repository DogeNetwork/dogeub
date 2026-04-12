import { useEffect } from 'react';
import usePopunderStore from '../utils/hooks/popunder/usePopunderStore';

const INT = 90_000;

const P_un = () => {
  const isVisible = usePopunderStore((state) => state.isVisible);
  const show = usePopunderStore((state) => state.show);
  const consumeClick = usePopunderStore((state) => state.consumeClick);

  useEffect(() => {
    show();
    const every = setInterval(show, INT);

    return () => {
      clearInterval(every);
    };
  }, [show]);

  useEffect(() => {
    if (!isVisible) return;

    const onClickCapture = (event) => {
      consumeClick();
      window.open(POPUNDER_URL, '_blank', 'noopener,noreferrer');
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('click', onClickCapture, true);
    return () => window.removeEventListener('click', onClickCapture, true);
  }, [isVisible, consumeClick]);

  return null;
};

export default P_un;