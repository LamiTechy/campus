// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Apply theme to DOM — called on init AND on every change
function applyTheme(dark) {
  const html = document.documentElement;
  const body = document.body;
  const bg = dark ? '#0a0a0a' : '#f8fafc';
  const color = dark ? '#ffffff' : '#0f172a';

  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  html.style.backgroundColor = bg;
  html.style.color = color;
  body.style.backgroundColor = bg;
  body.style.color = color;
  // Prevent Paystack iframe from resetting these
  body.style.setProperty('background-color', bg, 'important');
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('cp_theme');
    return saved ? saved !== 'light' : true; // default dark
  });

  useEffect(() => {
    localStorage.setItem('cp_theme', dark ? 'dark' : 'light');
    applyTheme(dark);

    // Re-apply after Paystack iframe closes (it manipulates body styles)
    const observer = new MutationObserver(() => applyTheme(dark));
    observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });

    return () => observer.disconnect();
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