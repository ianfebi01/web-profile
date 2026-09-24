"use client";
import { useSyncExternalStore } from 'react'
import { Switch } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'

// Watch the "dark" class on <html> so the switch stays in sync with it
const subscribe = ( onChange: () => void ) => {
  const observer = new MutationObserver( onChange );

  observer.observe( document.documentElement, { attributes : true, attributeFilter : ["class"] } );

  return () => observer.disconnect();
};

const getSnapshot = () => document.documentElement.classList.contains( "dark" );
const getServerSnapshot = () => false;

export default function ThemeToggle() {
  const isDark = useSyncExternalStore( subscribe, getSnapshot, getServerSnapshot );

  const toggleDarkMode = ( checked: boolean ) => {
    document.documentElement.classList.toggle( "dark", checked );
    localStorage.theme = checked ? "dark" : "light";
  };

  return (
    <Switch
      checked={isDark}
      onChange={toggleDarkMode}
      aria-label="Toggle dark mode"
      className="group relative flex h-7 w-14 cursor-pointer items-center rounded-full bg-dark/50 p-1 ease-in-out focus:not-data-focus:outline-none data-checked:bg-white/10 data-focus:outline data-focus:outline-white"
    >
      <FontAwesomeIcon
        icon={faMoon}
        aria-hidden="true"
        className="absolute left-1.5 size-3.5 text-yellow-200 opacity-0 transition-opacity duration-200 group-data-checked:opacity-100"
      />
      <FontAwesomeIcon
        icon={faSun}
        aria-hidden="true"
        className="absolute right-1.5 size-3.5 text-white opacity-100 transition-opacity duration-200 group-data-checked:opacity-0"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none relative z-10 flex size-5 translate-x-0 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-7"
      >
      </span>
    </Switch>
  );
}
