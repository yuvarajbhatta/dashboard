import { useEffect, useMemo, useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

export function useThemeMode() {
  const themeMode = useDashboardStore((state) => state.themeMode);
  const [prefersDark, setPrefersDark] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(media.matches);
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = useMemo(() => {
    if (themeMode === 'auto') return prefersDark ? 'night' : 'day';
    return themeMode;
  }, [prefersDark, themeMode]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme === 'night' ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'night' ? '#030712' : '#f8fafc');
  }, [resolvedTheme]);

  return { themeMode, resolvedTheme };
}
