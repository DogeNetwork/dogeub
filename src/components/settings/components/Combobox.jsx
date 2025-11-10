import clsx from 'clsx';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import { useOptions } from '/src/utils/optionsContext';

const ComboBox = ({
  config = [],
  selectedValue,
  action,
  maxW = 40,
  placeholder = 'Choose an option',
}) => {
  const { options } = useOptions();
  const [query, setQuery] = useState('');

  const getOptionId = (val) =>
    val && typeof val === 'object' ? val.themeName || val.id || JSON.stringify(val) : val;

  const filteredOptions =
    query === ''
      ? config
      : config.filter(({ option }) => option.toLowerCase().includes(query.toLowerCase()));

  const scroll = clsx(
    'scrollbar scrollbar-track-transparent scrollbar-thin',
    options?.type === 'dark' || !options?.type
      ? 'scrollbar-thumb-gray-600'
      : 'scrollbar-thumb-gray-500',
  );

  return (
    <Combobox
      value={selectedValue}
      onChange={action}
      by={(a, b) => getOptionId(a) === getOptionId(b)}
    >
      <div
        className={clsx('relative w-full', 'rounded-xl border')}
        style={{
          backgroundColor: options.settingsDropdownColor || '#162337',
          maxWidth: `${maxW}rem`,
        }}
      >
        <div className={clsx('flex w-full h-10', 'p-2.5 pl-5')}>
          <ComboboxInput
            displayValue={(value) => {
              if (!value) return '';
              const found = config.find((c) => getOptionId(c.value) === getOptionId(value));
              return found ? `${found.option} (selected)` : '';
            }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={clsx(
              'flex-1 min-w-0',
              'text-[0.88rem] truncate',
              'bg-transparent outline-none',
            )}
            spellCheck={false}
          />

          <ComboboxButton
            className={clsx(
              'flex flex-shrink-0 items-center justify-center',
              'px-1',
              'cursor-pointer',
            )}
          >
            <ChevronDown size={17} />
          </ComboboxButton>
        </div>

        {filteredOptions.length !== 0 && (
          <ComboboxOptions
            className={clsx(
              'absolute left-0 top-full z-10 mt-1',
              'flex flex-col gap-1',
              'w-full max-h-60 overflow-auto',
              'rounded-[0.8rem] border bg-inherit p-[0.4rem] shadow-lg',
              scroll,
            )}
          >
            {filteredOptions.map((cfg) => (
              <ComboboxOption
                value={cfg.value}
                key={getOptionId(cfg.value)}
                className={clsx(
                  'flex items-center',
                  'cursor-pointer hover:bg-[#ffffff15]',
                  'px-2 py-2 rounded-md',
                )}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={clsx('flex items-center justify-center', 'w-[20px] flex-shrink-0')}
                    >
                      {selected && <Check size={16} />}
                    </span>
                    <p className={clsx('flex-1 min-w-0 ml-2', 'truncate text-[0.88rem]')}>
                      {cfg.option}
                    </p>
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
};

export default ComboBox;
