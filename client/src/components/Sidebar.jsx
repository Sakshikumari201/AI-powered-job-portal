import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Target, Briefcase, ListTodo, PenTool } from 'lucide-react';

const Sidebar = () => {
  // list of links for the sidebar
  const sidebarLinks = [
    { label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { label: 'Upload Resume', url: '/upload', icon: FileText },
    { label: 'Resume Builder', url: '/builder', icon: PenTool },
    { label: 'ATS Score & Gap', url: '/analysis', icon: Target },
    { label: 'Job Matches', url: '/jobs', icon: Briefcase },
    { label: 'Job Tracker', url: '/tracker', icon: ListTodo },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border hidden md:block flex-shrink-0 transition-colors duration-300">
      <div className="h-full flex flex-col py-6">
        <nav className="flex-1 px-4 space-y-1.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.label}
                to={link.url}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-r-xl rounded-l-sm text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm border-l-4 border-primary-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 border-l-4 border-transparent'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Branding/Footer */}
        <div className="px-4 pt-4 border-t border-gray-100 dark:border-dark-border">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            v2.0 • Build with ❤️
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
