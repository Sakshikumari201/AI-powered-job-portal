import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-secondary-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 relative overflow-y-auto no-scrollbar outline-none p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
