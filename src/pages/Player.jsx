import Nav from '../layouts/Nav';
import Breadcrumb from '../components/player/Breadcrumb';
import Loader from '../components/player/Loader';
import { useLocation } from 'react-router-dom';
import { useOptions } from '/src/utils/optionsContext';

const Player = () => {
  const { state: { app } = {} } = useLocation();
  const { options } = useOptions();

  return (
    <>
      <Nav />
      <div className="w-[80%] mx-auto flex flex-col gap-4 mt-4 mb-8">
        <Breadcrumb theme={options.theme} name={app.appName} />
        <Loader theme={options.theme} app={app} />
      </div>
    </>
  );
};

export default Player;
