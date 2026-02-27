import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, Moon, Sun, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow">
                <Sparkles size={16} />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                Resume<span className="text-primary-600">Match</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-gray-500" />}
            </button>

            {user && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-1.5 px-3 rounded-full bg-gray-50 dark:bg-gray-800">
                  <User size={16} />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
