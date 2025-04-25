import React, { useEffect, useState } from 'react';
import {
  SettingOutlined, UserOutlined, InfoCircleOutlined,
  QuestionCircleOutlined, LogoutOutlined
} from '@ant-design/icons';
import { Button, Modal, Switch, Divider, Input, Form, message, Spin } from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import { useFeatures } from '../contexts/FeatureFlags';
import { authedApi } from './api';                  // ← uses new instance
import '../styles/SettingsModal.css';

type Tab = 'settings' | 'profile' | 'about' | 'help';
interface Props { open: boolean; onClose: () => void; onLogout: () => void; }

const SettingsModal: React.FC<Props> = ({ open, onClose, onLogout }) => {
  const [tab, setTab] = useState<Tab>('settings');
  const { theme, toggleTheme } = useTheme();
  const { aiTools, toggleAi } = useFeatures();

  /* -------- Profile state -------- */
  const [profile, setProfile] = useState<{ username: string; email: string }>();
  const [loadingProf, setLoadingProf] = useState(false);

  useEffect(() => {
    if (open && tab === 'profile') {
      setLoadingProf(true);
      authedApi
        .get('/profile')
        .then(({ data }) => setProfile(data))
        .catch(() => message.error('Failed to load profile'))
        .finally(() => setLoadingProf(false));
    }
  }, [open, tab]);

  /* ---------- Password change ---------- */
  const changePassword = async (vals: { current: string; next: string }) => {
    try {
      await authedApi.post('/change-password', vals);
      message.success('Password updated');
    } catch {
      message.error('Current password incorrect');
    }
  };

  const renderBody = () => {
    switch (tab) {
      case 'settings':
        return (
          <>
            <h2 className="section-heading">General Settings</h2>

            <div className="pair">
              <span className="label">Dark Mode</span>
              <Switch checked={theme === 'dark'} onChange={toggleTheme} />
            </div>

            <div className="pair">
              <span className="label">AI Features</span>
              <Switch checked={aiTools} onChange={toggleAi} />
            </div>

            <Divider />

            <Button danger type="primary" icon={<LogoutOutlined />} className="logout-btn" onClick={onLogout}>
              Log Out
            </Button>
          </>
        );

      case 'profile':
        if (loadingProf) return <Spin />;
        return (
          <>
            <h2 className="section-heading">Profile</h2>

            <p className="pair">
              <span className="label">Username</span>
              <span className="value">{profile?.username || '—'}</span>
            </p>
            <p className="pair">
              <span className="label">Email</span>
              <span className="value">{profile?.email || '—'}</span>
            </p>

            <Divider />

            <Form onFinish={changePassword} layout="vertical">
              <Form.Item
                name="current"
                label="Current password"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="next"
                label="New password"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </>
        );

      case 'help':
        return (
          <>
            <h2 className="section-heading">Need a hand?</h2>
            <p style={{ color: 'var(--fg-muted)' }}>
              • Click <strong>New Note</strong> to start writing.<br />
              • Auto-save after 1½ s of pause or&nbsp;<kbd>Ctrl&nbsp;+&nbsp;S</kbd>.<br />
              • Three-dot menu in the editor = save / delete / PDF export.<br />
              • Tap the magnifier to search notes.<br />
              • Still stuck? See contact info in “About Us”.
            </p>
          </>
        );

      case 'about':
        return (
          <>
            <h2 className="section-heading">Contact Us</h2>
            <Divider />
            <p className="pair">
              <span className="label">Email</span>
              <span className="value">jakeminhas91@gmail.com</span>
            </p>
            <p className="pair">
              <span className="label">Phone</span>
              <span className="value">030&nbsp;8082&nbsp;2227</span>
            </p>
          </>
        );
    }
  };

  return (
    <Modal width={920} open={open} onCancel={onClose} footer={null} className="settings-modal-root" destroyOnClose>
      <div className="settings-wrapper">
        {/* -------- Left rail -------- */}
        <aside className="settings-rail">
          {[
            { k: 'settings', icon: <SettingOutlined />, label: 'Settings' },
            { k: 'profile', icon: <UserOutlined />, label: 'Profile' },
            { k: 'about', icon: <InfoCircleOutlined />, label: 'About Us' },
            { k: 'help', icon: <QuestionCircleOutlined />, label: 'Help' }
          ].map(({ k, icon, label }) => (
            <div key={k} className={`rail-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k as Tab)}>
              {icon}
              <span>{label}</span>
            </div>
          ))}

          <div className="rail-footer">© 2025 Note Genius</div>
        </aside>

        {/* -------- Right-hand pane -------- */}
        <section className="settings-pane">{renderBody()}</section>
      </div>
    </Modal>
  );
};

export default SettingsModal;
