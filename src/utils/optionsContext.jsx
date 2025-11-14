import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const OptionsContext = createContext();

const getStoredOptions = () => {
  try {
    return JSON.parse(localStorage.getItem('options') || '{}');
  } catch {
    return {};
  }
};

export const OptionsProvider = ({ children }) => {
  const [options, setOptions] = useState(getStoredOptions);

  useEffect(() => {
    try {
      localStorage.setItem('options', JSON.stringify(options));
    } catch {}
  }, [options]);

  const updateOption = useCallback((obj, immediate = true) => {
    if (!obj || typeof obj !== 'object') return;

    const current = getStoredOptions();
    const updated = { ...current, ...obj };

    try {
      localStorage.setItem('options', JSON.stringify(updated));
    } catch {}

    if (immediate) {
      setOptions((prev) => ({ ...prev, ...obj }));
    }
  }, []);

  const contextValue = useMemo(() => ({ options, updateOption }), [options, updateOption]);

  return <OptionsContext.Provider value={contextValue}>{children}</OptionsContext.Provider>;
};

export const useOptions = () => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error('useOptions must be used within an OptionsProvider');
  }
  return context;
};
