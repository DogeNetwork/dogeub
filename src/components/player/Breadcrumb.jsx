import { Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import theming from '/src/styles/theming.module.css';
import clsx from 'clsx';

const Breadcrumb = ({ theme, name }) => {
  const nav = useNavigate();
  // assuming you're coming from the gms page
  return (
    <div
      className={clsx(
        'flex h-2 w-fit max-w-72 px-3 p-4 items-center rounded-xl',
        theming.appItemColor,
        theming[`theme-${theme || 'default'}`],
      )}
    >
      <Gamepad2 size="16" /> &nbsp;
      <span className="hover:underline cursor-pointer" onClick={() => nav('/docs')}>
        Games
      </span>
      <span className="mx-1">&gt;</span>
      <span className="truncate">{name}</span>
    </div>
  );
};

export default Breadcrumb;
