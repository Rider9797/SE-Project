// components/MainLayout.tsx
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Modal, Input, message } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  SettingOutlined, 
  FileOutlined,
  MessageOutlined,
  SoundOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import '../styles/MainLayout.css';
import Logo from './assets/Frame.svg';
import axios from 'axios';
import { AxiosError } from 'axios';
import { authedApi, searchApi } from './api';

interface Note {
  _id: string;
  title: string;
  content: string;
  created_at: string;
}

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the note editor page
  const isNoteEditorPage = location.pathname.includes('/notes/') && location.pathname.includes('/edit');

  // Configure axios interceptor
  authedApi.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        message.warning('Session expired. Please log in again.');
        navigate('/');
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (token) {
      authedApi.defaults.headers['Authorization'] = `Bearer ${token}`;
      fetchNotes();
    } else {
      navigate('/');
    }
  }, [token]);

  const fetchNotes = async () => {
    try {
      const response = await authedApi.get('/notes');
      setNotes(response.data);
      setFilteredNotes(response.data);
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: { title: string }) => {
    try {
      const response = await authedApi.post('/notes/create', {
        title: values.title,
        content: ''
      });
      navigate(`/Dashboard/${response.data.note_id}/edit`);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Note created successfully!');
    } catch (error: unknown) {
      handleApiError(error, 'Failed to create note');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/auth/logout', {}, {
        withCredentials: true
      });
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      message.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  
    if (query.length < 3) {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  };
  
  const handleSearchSubmit = async (value: string) => {
    if (value.trim().length >= 3) {
      try {
        const response = await searchApi.get(`/search?q=${encodeURIComponent(value)}`);
        setFilteredNotes(response.data.notes);
      } catch (error) {
        message.warning('Search failed, using local results');
        const fallback = notes.filter(note =>
          note.title.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredNotes(fallback);
      }
    }
  };

  const handleApiError = (error: unknown, customMessage?: string) => {
    if (error instanceof AxiosError && error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          navigate('/');
          break;
        case 422:
          message.error('Invalid data provided');
          break;
        default:
          message.error(customMessage || 'An error occurred');
      }
    } else {
      message.error('An unknown error occurred');
    }
    console.error(error);
  };

  return (
    <div className="main-layout">
      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        open={isLogoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
        okText="Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>

      {/* New Note Modal */}
      <Modal
        title="Create New Note"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreate}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Title" autoFocus />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div 
            className="logo"
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <img src={Logo} alt="Logo" className="sidebar-logo" />
          </div>
          <div className="search-container">
            <Input.Search
              placeholder="Search notes..."
              allowClear
              value={searchQuery}
              onChange={handleSearchChange}
              onSearch={handleSearchSubmit}
              enterButton={<SearchOutlined />}
            />
          </div>
        </div>

        <div className="new-note-container">
          <Button
            className="new-note-btn"
            onClick={() => setIsModalVisible(true)}
            icon={<PlusOutlined />}
          >
            New Note
          </Button>
        </div>

        <div className="notes-section">
          <div className="all-notes-header">All Notes</div>
          
          {loading ? (
            <div className="loading-notes">Loading...</div>
          ) : (
            (searchQuery ? filteredNotes : notes).map((note) => (
              <div 
                key={note._id} 
                className={`note-item ${location.pathname.includes(note._id) ? 'active' : ''}`}
                onClick={() => navigate(`/Dashboard/${note._id}/edit`)}
              >
                <FileOutlined className="note-icon" />
                <span>{note.title}</span>
              </div>
            ))
          )}

          <div className="more-section">More</div>
          
          <div className="note-list-footer">
            <div className="note-item">
              <DeleteOutlined className="note-icon" />
              <span>Trash</span>
            </div>
            <div 
              className="note-item"
              onClick={() => setIsLogoutModalVisible(true)}
            >
              <SettingOutlined className="note-icon" />
              <span>Settings</span>
            </div>
          </div>

          {/* AI Tools Section - only visible on note editor pages */}
          {isNoteEditorPage && (
            <div className="ai-tools-section">
              <div className="note-item ai-tool-item">
                <MessageOutlined className="note-icon" />
                <span>Text-To-Speech</span>
              </div>
              <div className="note-item ai-tool-item">
                <SoundOutlined className="note-icon" />
                <span>Quiz-It</span>
              </div>
              <div className="note-item ai-tool-item">
                <FileTextOutlined className="note-icon" />
                <span>Summarize</span>
              </div>
            </div>
          )}

          <div 
            className="collapse-sidebar" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d={sidebarCollapsed ? "M9 18L15 12L9 6" : "M15 18L9 12L15 6"} stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;