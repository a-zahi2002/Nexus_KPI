import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('nexus-theme');
    return (stored as Theme) || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  const toggleTheme = async (e?: React.MouseEvent) => {
    const isDark = theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    // Helper to perform the actual state update
    const updateTheme = () => {
      setTheme(nextTheme);
    };

    // If the browser doesn't support View Transitions, just update the state
    if (!document.startViewTransition || !e) {
      updateTheme();
      return;
    }

    // Get the click position, or default to center
    const x = e.clientX;
    const y = e.clientY;

    // Calculate the distance to the furthest corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Start the View Transition
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        updateTheme();
      });
    });

    // Wait for the pseudo-elements to be created
    await transition.ready;

    // Animate the circle clip-path
    // If going to dark, we clip the NEW view (dark) opening up
    // If going to light, we clip the NEW view (light) opening up
    // Actually, traditionally for this effect:
    // We animate the '::view-transition-new(root)' clip-path from 0 radius to full radius.

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        // Start the animation on the "new" snapshot, which is the incoming theme
        pseudoElement: '::view-transition-new(root)',
      }
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
