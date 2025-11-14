import { useState } from 'react';
import clsx from 'clsx';
import theme from '/src/styles/theming.module.css';
import { useOptions } from '/src/utils/optionsContext';
import SettingsContainerItem from './settings/components/ContainerItem';
import * as settings from '/src/data/settings';
import PanicDialog from './PanicDialog';

const Type = ({ type, title }) => {
  const { options, updateOption } = useOptions();
  const settingsItems = type({ options, updateOption });
  const entries = Object.entries(settingsItems);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium mb-3 px-1">{title}</h2>
      <div className="rounded-xl overflow-visible">
        {entries.map(([key, setting], index) => (
          <SettingsContainerItem 
            key={key} 
            {...setting} 
            isFirst={index === 0}
            isLast={index === entries.length - 1}
          >
            {setting.desc}
          </SettingsContainerItem>
        ))}
      </div>
    </div>
  );
};

const Setting = ({ setting }) => {
  const { options, updateOption } = useOptions();
  const [panicOpen, setPanicOpen] = useState(false);

  const privSettings = settings.privacyConfig({
    options,
    updateOption,
    openPanic: () => setPanicOpen(true),
  });

  const scroll = clsx(
    'scrollbar scrollbar-track-transparent scrollbar-thin',
    options?.type === 'dark' || !options?.type
      ? 'scrollbar-thumb-gray-600'
      : 'scrollbar-thumb-gray-500',
  );

  const Container = ({ children }) => (
    <div
      className={clsx(
        theme[`theme-${options.theme || 'default'}`],
        'flex flex-1 flex-col overflow-y-auto py-6 px-4 sm:px-8 md:px-16',
        scroll,
      )}
    >
      {children}
      <PanicDialog state={panicOpen} set={setPanicOpen} />
    </div>
  );

  return (
    <Container>
      {setting === 'Privacy' && <Type type={() => privSettings} title="Privacy" />}
      {setting === 'Customize' && <Type type={settings.customizeConfig} title="Customize" />}
      {setting === 'Browsing' && <Type type={settings.browsingConfig} title="Browsing" />}
      {setting === 'Advanced' && <Type type={settings.advancedConfig} title="Advanced" />}
    </Container>
  );
};

export default Setting;
