import { useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('larder-dark') === '1' ? 'dark' : 'light'
  );

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('larder-dark', '1');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('larder-dark', '0');
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
