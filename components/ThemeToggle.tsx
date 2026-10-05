"use client";
import { useSyncExternalStore } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

// Watch the "dark" class on <html> so the button stays in sync with it
const subscribe = ( onChange: () => void ) => {
  const observer = new MutationObserver( onChange );

  observer.observe( document.documentElement, { attributes : true, attributeFilter : ["class"] } );

  return () => observer.disconnect();
};

const getSnapshot = () => document.documentElement.classList.contains( "dark" );
const getServerSnapshot = () => false;

const iconClass = 'absolute size-4 transition-all duration-300 ease-out'

export default function ThemeToggle() {
  const isDark = useSyncExternalStore( subscribe, getSnapshot, getServerSnapshot );

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle( "dark", !isDark );
    localStorage.theme = !isDark ? "dark" : "light";
  };

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="relative flex size-10 items-center justify-center rounded-full text-black/70 hover:text-black hover:bg-light-secondary dark:text-white/70 dark:hover:text-white dark:hover:bg-dark-secondary transition-colors duration-200 cursor-pointer"
    >
      <FontAwesomeIcon
        icon={faSun}
        aria-hidden="true"
        className={cn( iconClass, isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100' )}
      />
      <FontAwesomeIcon
        icon={faMoon}
        aria-hidden="true"
        className={cn( iconClass, isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50' )}
      />
    </button>
  );
}
