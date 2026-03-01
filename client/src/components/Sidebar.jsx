import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Target, Briefcase, ListTodo, PenTool } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Resume', path: '/upload', icon: FileText },
    { name: 'Resume Builder', path: '/builder', icon: PenTool },
    { name: 'ATS Score & Gap', path: '/analysis', icon: Target },
    { name: 'Job Matches', path: '/jobs', icon: Briefcase },
    { name: 'Job Tracker', path: '/tracker', icon: ListTodo },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border hidden md:block flex-shrink-0 transition-colors duration-300">
      <div className="h-full flex flex-col py-6">
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div className="px-4 pt-4 border-t border-gray-100 dark:border-dark-border">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Powered by AI • v2.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
