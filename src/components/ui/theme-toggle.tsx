'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [hasMounted, setHasMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleToggleTheme = (): void => {
    const currentActiveTheme = theme === 'system' ? resolvedTheme : theme;
    const nextTheme = currentActiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  if (!hasMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme placeholder"
        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </Button>
    );
  }

  const isDarkMode = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
    >
      {isDarkMode ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-700 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
};
