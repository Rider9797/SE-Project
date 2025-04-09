// components/Bar.tsx
import React from 'react';
import { Input, Button, Menu } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';

const Bar: React.FC = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <svg width="33" height="33" viewBox="0 0 33 33" fill="none">
            {/* Insert your SVG path here */}
          </svg>
        </div>
        <Input
          placeholder="Search notes..."
          suffix={<SearchOutlined style={{ color: 'white' }} />}
          className="search-input"
        />
      </div>

      <Button icon={<PlusOutlined />} className="new-note-btn">
        New Note
      </Button>

      <div className="all-notes-header">All Notes</div>

      <Menu
        theme="dark"
        mode="inline"
        className="notes-menu"
        items={[
          // Static example items
          { key: '1', label: 'My Goals for the Next Year' },
          { key: '2', label: 'Travel Itinerary' },
          { key: '3', label: 'Project Proposal' },
        ]}
      />

      <Menu
        theme="dark"
        mode="inline"
        className="bottom-menu"
        items={[
          { key: 'trash', icon: <DeleteOutlined />, label: 'Trash' },
          { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        ]}
      />
    </div>
  );
};

export default Bar;