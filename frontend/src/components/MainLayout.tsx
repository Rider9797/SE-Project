import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Modal, Input, message } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  SettingOutlined, 
  FileOutlined,
  SignatureOutlined, // Added for Text-To-Speech
  SoundOutlined,  // Added for Quiz-It
  SolutionOutlined // Added for Summarize
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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the note editor page
  const isNoteEditorPage = location.pathname.includes('/Dashboard/') && location.pathname.includes('/edit');

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
  
  const handleSearchSubmit = async (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return;
    
    const value = searchQuery.trim();
    if (value.length >= 3) {
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

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      // Focus the input when search becomes visible
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input input') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 300);
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

  // Handlers for AI tools functionality
  const handleTextToSpeech = () => {
    message.info('Text-to-Speech feature coming soon');
    // Implement feature functionality here
  };

  const handleQuizIt = () => {
    message.info('Quiz-It feature coming soon');
    // Implement feature functionality here
  };

  const handleSummarize = () => {
    message.info('Summarize feature coming soon');
    // Implement feature functionality here
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
            <div className={`search-input-wrapper ${isSearchVisible ? 'visible' : ''}`}>
              <Input
                className="search-input"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchSubmit}
                onBlur={() => {
                  if (searchQuery.trim() === '') {
                    setIsSearchVisible(false);
                  }
                }}
              />
            </div>
            <SearchOutlined className="search-icon" onClick={toggleSearch} />
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
              <div 
                className="note-item ai-tool-item"
                onClick={handleTextToSpeech}
              >
                <SoundOutlined className="note-icon" />
                <span>Text-To-Speech</span>
              </div>
              <div 
                className="note-item ai-tool-item"
                onClick={handleQuizIt}
              >
                <SignatureOutlined className="note-icon" />
                <span>Quiz-It</span>
              </div>
              <div 
                className="note-item ai-tool-item"
                onClick={handleSummarize}
              >
                <SolutionOutlined className="note-icon" />
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