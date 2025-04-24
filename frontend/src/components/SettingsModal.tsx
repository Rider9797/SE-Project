// components/SettingsModal.tsx
import React, { useState, FC } from 'react';
import {
  SettingOutlined,
  UserOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Button, Modal } from 'antd';
import "../styles/SettingsModal.css";

type Tab = 'settings' | 'profile' | 'about' | 'help';

interface Props {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;           // ← new
}

const SettingsModal: FC<Props> = ({ open, onClose, onLogout }) => {
  const [tab, setTab] = useState<Tab>('profile');

  const renderBody = () => {
    switch (tab) {
      /* ---------- SETTINGS TAB ---------- */
      case 'settings':
        return (
          <>
            <h2 className="section-heading">General Settings</h2>

            {/* nice fat rounded-corner logout button */}
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              className="logout-btn"
              onClick={onLogout}
            >
              Log Out
            </Button>
          </>
        );

      /* ---------- PROFILE TAB ---------- */
      case 'profile':
        return (
          <>
            <h2 className="section-heading">User Name</h2>
            <h3 className="sub-heading">Account Security</h3>

            <p className="pair">
              <span className="label">Email</span>
              <span className="value">useremail@gmail.com</span>
            </p>

            <p className="pair">
              <span className="label">Password</span>
              <Button type="link" className="edit-link">
                Edit&nbsp;Password
              </Button>
            </p>
          </>
        );

      case 'about':
        return <h2 className="section-heading">About Us</h2>;
      case 'help':
        return <h2 className="section-heading">Help &amp; Support</h2>;
    }
  };

  return (
    <Modal
      width={920}
      open={open}
      onCancel={onClose}
      footer={null}
      closable
      className="settings-modal-root"
      destroyOnClose
    >
      <div className="settings-wrapper">
        {/* ───── Left rail ───── */}
        <aside className="settings-rail">
          {[
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
            { key: 'profile',  icon: <UserOutlined />,   label: 'Profile' },
            { key: 'about',    icon: <InfoCircleOutlined />, label: 'About Us' },
            { key: 'help',     icon: <QuestionCircleOutlined />, label: 'Help' },
          ].map(({ key, icon, label }) => (
            <div
              key={key}
              className={`rail-btn ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key as Tab)}
            >
              {icon} <span>{label}</span>
            </div>
          ))}

          <div className="rail-footer">© 2025 Note Genius</div>
        </aside>

        {/* ───── Right pane ───── */}
        <section className="settings-pane">{renderBody()}</section>
      </div>
    </Modal>
  );
};

export default SettingsModal;
