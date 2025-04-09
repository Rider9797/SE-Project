// components/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined, SettingOutlined, FileOutlined } from '@ant-design/icons';
import '../styles/MainLayout.css';
import Logo from './assets/Frame.svg';

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="main-layout">
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src={Logo} alt="Logo" className="sidebar-logo" />
          </div>
          <div className="search-container">
            <SearchOutlined className="search-icon" />
          </div>
        </div>

        <div className="new-note-container">
          <Button className="new-note-btn">
            <PlusOutlined /> New Note
          </Button>
        </div>

        <div className="notes-section">
          <div className="all-notes-header">All Notes</div>
          
          <div className="note-list-items">
            <div className="note-item active">
              <FileOutlined className="note-icon" />
              <span>My Goals for the Next Year</span>
            </div>
            <div className="note-item">
              <FileOutlined className="note-icon" />
              <span>Travel Itinerary</span>
            </div>
            <div className="note-item">
              <FileOutlined className="note-icon" />
              <span>Project Proposal</span>
            </div>
          </div>
          
          <div className="more-section">More</div>
          
          <div className="note-list-footer">
            <div className="note-item">
              <DeleteOutlined className="note-icon" />
              <span>Trash</span>
            </div>
            <div className="note-item">
              <SettingOutlined className="note-icon" />
              <span>Settings</span>
            </div>
          </div>
          
          <div 
            className="collapse-sidebar" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d={sidebarCollapsed ? "M9 18L15 12L9 6" : "M15 18L9 12L15 6"} stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div 
          className="collapse-sidebar" 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d={sidebarCollapsed ? "M9 18L15 12L9 6" : "M15 18L9 12L15 6"} 
              stroke="#4F4F4F" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;