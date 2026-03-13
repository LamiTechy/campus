// src/components/ThemeToggle.jsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ style = {} }) {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 40, height: 40,
        borderRadius: 12,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
        background: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
        color: dark ? '#4ade80' : '#16a34a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        ...style,
      }}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}