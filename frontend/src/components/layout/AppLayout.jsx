import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AnimatedBackground from '../background/AnimatedBackground';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#060913] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Living background */}
      <AnimatedBackground />

      {/* Role-based Dynamic Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar onOpenMobileMenu={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
