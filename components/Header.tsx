
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../App';
import { HomeIcon, DashboardIcon, ModelsIcon, AboutIcon, SunIcon, MoonIcon } from './Icons';

const navLinks = [
  { to: '/', text: 'Home', icon: HomeIcon },
  { to: '/dashboard', text: 'Dashboard', icon: DashboardIcon },
  { to: '/models', text: 'Models', icon: ModelsIcon },
  { to: '/about', text: 'About', icon: AboutIcon },
];

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const baseLinkClasses = "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const inactiveLinkClasses = "text-gray-700 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-dark-border";
  const activeLinkClasses = "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300";
  
  return (
    <header className="sticky top-0 z-50 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-light-border dark:border-dark-border shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <ModelsIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Traffic AI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map(({ to, text, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
              >
                <Icon size={18} />
                <span>{text}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon size={20} /> : <SunIcon size={20} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Nav */}
      <nav className="md:hidden flex items-center justify-around p-2 border-t border-light-border dark:border-dark-border">
          {navLinks.map(({ to, text, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex flex-col items-center p-2 rounded-lg ${isActive ? activeLinkClasses : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Icon size={22} />
              <span className="text-xs mt-1">{text}</span>
            </NavLink>
          ))}
      </nav>
    </header>
  );
};

export default Header;