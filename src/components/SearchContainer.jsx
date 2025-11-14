import clsx from 'clsx';
import { useState, useEffect, useRef, useCallback, useMemo, memo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideSearch, Earth } from 'lucide-react';
import { GlowWrapper } from '../utils/Glow';
import { useOptions } from '../utils/optionsContext';
import Logo from '../components/Logo';
import theme from '../styles/theming.module.css';
import 'movement.css';

const SearchContainer = memo(function SearchContainer({ logo = true, cls, nav = true }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);
  const latestQuery = useRef('');
  const navigate = useNavigate();
  const { options } = useOptions();

  const fetchResults = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    latestQuery.current = searchQuery;
    try {
      const response = await fetch('/return?q=' + encodeURIComponent(searchQuery));
      if (!response.ok) return setResults([]);

      const data = await response.json();
      if (latestQuery.current !== searchQuery) return;
      const list = Array.isArray(data) ? data.filter((i) => i.phrase).slice(0, 4) : [];
      startTransition(() => setResults(list));
    } catch {
      if (latestQuery.current === searchQuery) setResults([]);
    }
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const newQuery = e.target.value;
      setQuery(newQuery);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!newQuery.trim()) {
        latestQuery.current = '';
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(() => fetchResults(newQuery), 300);
    },
    [fetchResults],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== 'Enter') return;
      const trimmed = query.trim();
      if (!trimmed) return;

      if (nav) {
        sessionStorage.setItem('query', trimmed);
        navigate('/indev');
      } else {
        window.parent.tabManager.navigate(trimmed);
      }
    },
    [query, nav, navigate],
  );

  const handleResultClick = useCallback(
    (phrase) => {
      if (nav) {
        sessionStorage.setItem('query', phrase);
        navigate('/indev');
      } else {
        window.parent.tabManager.navigate(phrase);
      }
    },
    [nav, navigate],
  );

  useEffect(() => {
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, []);

  const placeholder = useMemo(
    () => `Search ${options.engineName || 'Google'} or type URL`,
    [options.engineName],
  );

  const iconSrc = useMemo(
    () =>
      options.engineIcon ??
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/120px-Google_Favicon_2025.svg.png',
    [options.engineIcon],
  );

  return (
    <div
      className={clsx(
        !cls ? 'absolute w-full px-20 py-4 flex flex-col items-center mt-8 z-50' : cls,
      )}
      data-m={!cls && 'bounce-up'}
      data-m-duration={!cls && '0.8'}
    >
      {logo && <Logo options="w-[15rem] h-30" />}
      <GlowWrapper
        glowOptions={{ color: options.glowWrapperColor || '255, 255, 255', size: 70, opacity: 0.2 }}
      >
        <div className="w-[40.625rem]">
          <div
            id="search-div"
            className={clsx(
              'flex items-center gap-3 shadow-xl pl-4 pr-4 w-full h-[3.41rem]',
              results.length ? 'rounded-t-[14px] rounded-b-none' : 'rounded-[14px]',
              theme[`searchBarColor`],
              theme[`theme-${options.theme || 'default'}`],
            )}
          >
            {iconSrc ? (
              <img src={iconSrc} className="w-5 h-5 shrink-0" alt="Search icon" loading="lazy" />
            ) : (
              <Earth size={22} />
            )}

            <input
              type="text"
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-hidden text-[16.5px] leading-[20px] placeholder:font-[Inter] placeholder:font-medium"
              autoComplete="off"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />

            <LucideSearch className="w-[1.08rem] h-[1.08rem] shrink-0" />
          </div>

          {results.length > 0 && (
            <div
              className={clsx(
                'shadow-xl mt-0 p-2 text-[14px] w-full rounded-b-[14px] space-y-1',
                theme[`searchResultStyle`],
                theme[`theme-${options.theme || 'default'}`],
              )}
            >
              {results.map((result) => (
                <div
                  key={result.phrase}
                  className="rounded-[9px] w-full h-11 hover:bg-[#d4d4d418] cursor-pointer duration-100 ease-in px-3 pl-2.5 flex items-center"
                  onClick={() => handleResultClick(result.phrase)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: '12px' }}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  <span className="text-[15px]">{result.phrase}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlowWrapper>
    </div>
  );
});

export default SearchContainer;
