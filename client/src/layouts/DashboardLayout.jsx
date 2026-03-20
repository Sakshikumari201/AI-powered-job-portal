import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CanvasBackground from '../components/CanvasBackground';

const DashboardLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-secondary-50 dark:bg-dark-bg transition-colors duration-300" style={{ position: 'relative' }}>
      {/* Canvas animation layer */}
      <CanvasBackground />

      {/* UI layer — sits on top of canvas */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 relative overflow-y-auto no-scrollbar outline-none p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
