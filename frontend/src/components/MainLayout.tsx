// components/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Bar from './Bar';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Bar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;