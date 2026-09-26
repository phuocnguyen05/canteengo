export type ThemeMode = 'light' | 'dark';

export const applyTheme = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (mode === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }
  localStorage.setItem('themeMode', mode);
};

export const getSavedTheme = (): ThemeMode => {
  const saved = localStorage.getItem('themeMode') as ThemeMode | null;
  return saved === 'light' ? 'light' : 'dark'; // Mặc định dark
};

export const initTheme = () => {
  applyTheme(getSavedTheme());
};
