import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Modal, Drawer, Input, message } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  FileOutlined,
  SignatureOutlined, // Quiz-It
  SoundOutlined,     // Text-To-Speech
  SolutionOutlined,  // Summarize
} from '@ant-design/icons';
import '../styles/MainLayout.css';
import Logo from './assets/Frame.svg';
import axios, { AxiosError } from 'axios';
import { authedApi, searchApi } from './api';
import SettingsModal from './SettingsModal';

/* ───────────────────────── types ───────────────────────── */
interface Note {
  _id: string;
  title: string;
  content: string;
  created_at: string;
}

const MainLayout: React.FC = () => {
  /* ──────────────── UI state ──────────────── */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  // NEW drawers
  const [isQuizVisible, setQuizVisible] = useState(false);
  const [isSummaryVisible, setSummaryVisible] = useState(false);
  const [quizContent, setQuizContent] = useState('');
  const [summaryContent, setSummaryContent] = useState('');

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [token] = useState<string | null>(localStorage.getItem('token'));

  const navigate = useNavigate();
  const location = useLocation();
  const isNoteEditorPage =
    location.pathname.includes('/Dashboard/') && location.pathname.includes('/edit');

  /* ─────────────── axios guard ─────────────── */
  authedApi.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        message.warning('Session expired. Please log in again.');
        navigate('/');
      }
      return Promise.reject(err);
    },
  );

  /* ─────────────── lifecycle ──────────────── */
  useEffect(() => {
    if (token) {
      authedApi.defaults.headers['Authorization'] = `Bearer ${token}`;
      fetchNotes();
    } else {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ────────────── helpers ────────────── */
  const fetchNotes = async () => {
    try {
      const { data } = await authedApi.get('/notes');
      setNotes(data);
      setFilteredNotes(data);
    } catch (e) {
      handleApiError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error: unknown, custom?: string) => {
    if (error instanceof AxiosError && error.response) {
      const { status } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else message.error(custom || 'An error occurred');
    } else message.error('An unknown error occurred');
    console.error(error);
  };

  /* ────────── create + logout ────────── */
  const handleCreate = async (v: { title: string }) => {
    try {
      const { data } = await authedApi.post('/notes/create', {
        title: v.title,
        content: '',
      });
      navigate(`/Dashboard/${data.note_id}/edit`);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Note created successfully!');
    } catch (e) {
      handleApiError(e, 'Failed to create note');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/auth/logout', {}, { withCredentials: true });
      localStorage.removeItem('token');
      navigate('/');
    } catch (e) {
      message.error('Logout failed');
      console.error(e);
    }
  };

  /* ───────────── search box ───────────── */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 3)
      setFilteredNotes(notes.filter((n) => n.title.toLowerCase().includes(q.toLowerCase())));
  };

  const handleSearchSubmit = async (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return;
    const q = searchQuery.trim();
    if (q.length < 3) return;
    try {
      const { data } = await searchApi.get(`/search?q=${encodeURIComponent(q)}`);
      setFilteredNotes(data.notes);
    } catch {
      message.warning('Search failed, showing local matches');
      setFilteredNotes(notes.filter((n) => n.title.toLowerCase().includes(q.toLowerCase())));
    }
  };

  const toggleSearch = () => {
    setIsSearchVisible((v) => !v);
    if (!isSearchVisible)
      setTimeout(() => {
        (document.querySelector('.search-input input') as HTMLInputElement)?.focus();
      }, 300);
  };

  /* ───────────── AI tools ───────────── */
  const handleTextToSpeech = async () => {
    try {
      const noteId = location.pathname.split('/Dashboard/')[1].split('/')[0];
      const response = await authedApi.get(`/notes/${noteId}/tts`, {
        responseType: 'blob',
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `note_${noteId}.MP3`); // 👈 ensure lowercase .mp3
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      message.error('Failed to download text-to-speech audio.');
      console.error('TTS error:', error);
    }
  };
  const handleQuizIt = async () => {
    try {
      const noteId = location.pathname.split('/Dashboard/')[1].split('/')[0];
      const response = await authedApi.get(`/notes/${noteId}/quiz`);
      setQuizContent(response.data.quiz);
      setQuizVisible(true);
    } catch (error) {
      message.error("Failed to generate quiz.");
      console.error("Quiz generation error:", error);
    }
  };  
  const handleSummarize = async () => {
    try {
      const noteId = location.pathname.split('/Dashboard/')[1].split('/')[0];
      const response = await authedApi.get(`/notes/${noteId}/summary`);
      setSummaryContent(response.data.summary);
      setSummaryVisible(true);
    } catch (error) {
      message.error("Failed to generate summary.");
      console.error("summary generation error:", error);
    }
  };  
  /* ─────────────── render ─────────────── */
  return (
    <div className="main-layout">
      {/* ─── logout confirm ─── */}
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

      {/* ─── create note ─── */}
      <Modal
        title="Create New Note"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreate}>
          <Form.Item name="title" rules={[{ required: true, message: 'Please enter a title' }]}>
            <Input placeholder="Title" autoFocus />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── sidebar ─── */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* header */}
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
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
                  if (searchQuery.trim() === '') setIsSearchVisible(false);
                }}
              />
            </div>
            <SearchOutlined className="search-icon" onClick={toggleSearch} />
          </div>
        </div>

        {/* new note */}
        <div className="new-note-container">
          <Button
            className="new-note-btn"
            onClick={() => setIsModalVisible(true)}
            icon={<PlusOutlined />}
          >
            New Note
          </Button>
        </div>

        {/* notes list */}
        <div className="notes-section">
          <div className="all-notes-header">All Notes</div>
          {loading ? (
            <div className="loading-notes">Loading...</div>
          ) : (
            (searchQuery ? filteredNotes : notes).map((n) => (
              <div
                key={n._id}
                className={`note-item ${location.pathname.includes(n._id) ? 'active' : ''}`}
                onClick={() => navigate(`/Dashboard/${n._id}/edit`)}
              >
                <FileOutlined className="note-icon" />
                <span>{n.title}</span>
              </div>
            ))
          )}

          {/* footer */}
          <div className="more-section">More</div>
          <div className="note-list-footer">
            <div className="note-item">
              <DeleteOutlined className="note-icon" />
              <span>Trash</span>
            </div>
            <div className="note-item" onClick={() => setIsSettingsVisible(true)}>
              <SettingOutlined className="note-icon" />
              <span>Settings</span>
            </div>
          </div>

          {/* AI tools (editor only) */}
          {isNoteEditorPage && (
            <div className="ai-tools-section">
              <div className="note-item ai-tool-item" onClick={handleTextToSpeech}>
                <SoundOutlined className="note-icon" />
                <span>Text-To-Speech</span>
              </div>
              <div className="note-item ai-tool-item" onClick={handleQuizIt}>
                <SignatureOutlined className="note-icon" />
                <span>Quiz-It</span>
              </div>
              <div className="note-item ai-tool-item" onClick={handleSummarize}>
                <SolutionOutlined className="note-icon" />
                <span>Summarize</span>
              </div>
            </div>
          )}

          {/* collapse */}
          <div className="collapse-sidebar" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d={sidebarCollapsed ? 'M9 18L15 12L9 6' : 'M15 18L9 12L15 6'}
                stroke="#4F4F4F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="main-content">
        <Outlet />
      </div>

      {/* settings */}
      <SettingsModal
        open={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onLogout={handleLogout}
      />

      {/* ─── Quiz-It drawer ─── */}
      <Drawer
        className="side-drawer"
        title="Quiz-It"
        placement="right"
        width="35vw"
        open={isQuizVisible}
        onClose={() => setQuizVisible(false)}
        destroyOnClose
      >
        {/* TODO: Quiz-It UI */}
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {quizContent || 'Generating quiz...'}
        </div>
      </Drawer>

      {/* ─── Summarize drawer ─── */}
      <Drawer
        className="side-drawer"
        title="Summarize"
        placement="right"
        width="35vw"
        open={isSummaryVisible}
        onClose={() => setSummaryVisible(false)}
        destroyOnClose
      >
        {/* TODO: Summarize UI */}
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {summaryContent || 'Generating summary...'}
        </div>
      </Drawer>
    </div>
  );
};

export default MainLayout;
