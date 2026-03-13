// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('cp_theme') !== 'light';
  });

  useEffect(() => {
    localStorage.setItem('cp_theme', dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = () => setDark(p => !p);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Theme tokens — use these everywhere
export const t = (dark) => ({
  bg:        dark ? '#0a0a0a' : '#f8fafc',
  bgCard:    dark ? '#111111' : '#ffffff',
  bgHover:   dark ? '#1a1a1a' : '#f1f5f9',
  border:    dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0',
  text:      dark ? '#ffffff' : '#0f172a',
  textSub:   dark ? 'rgba(255,255,255,0.45)' : '#64748b',
  textMuted: dark ? 'rgba(255,255,255,0.25)' : '#94a3b8',
  input:     dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
  inputBorder: dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
  green:     '#16a34a',
  greenLight: dark ? 'rgba(22,163,74,0.15)' : '#f0fdf4',
  greenText:  dark ? '#4ade80' : '#16a34a',
  shadow:    dark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
});