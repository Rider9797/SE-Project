<<<<<<< Updated upstream
// components/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Button, Input, Modal } from 'antd'; // Added Modal import
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
import { removeAuthToken } from '../utils/authorisation'; // Import auth utils
import axios from 'axios';
=======
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
>>>>>>> Stashed changes

const MainLayout: React.FC = () => {
  /* ──────────────── UI state ──────────────── */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
<<<<<<< Updated upstream
  const [searchVisible, setSearchVisible] = useState(false); // State for search visibility
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false); // Added for logout modal
  const location = useLocation(); // Get current location/route
  const navigate = useNavigate(); // Added for navigation
  
  // Check if we're on the note editor page - adjusted for your URL structure
  const isNoteEditorPage = location.pathname.includes('/dashboard/') && location.pathname.includes('/edit');

  // Toggle search field visibility
  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
=======
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  // NEW drawers
  const [isQuizVisible, setQuizVisible] = useState(false);
  const [isSummaryVisible, setSummaryVisible] = useState(false);

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
>>>>>>> Stashed changes
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
<<<<<<< Updated upstream
      await axios.post('http://127.0.0.1:5000/auth/logout', {}, {
        withCredentials: true
      });
      removeAuthToken();
      window.location.href = '/'; // Redirect to login
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="main-layout">
      {/* Add logout confirmation modal */}
=======
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
  const handleTextToSpeech = () => message.info('Text-to-Speech feature coming soon');
  const handleQuizIt = () => setQuizVisible(true);
  const handleSummarize = () => setSummaryVisible(true);

  /* ─────────────── render ─────────────── */
  return (
    <div className="main-layout">
      {/* ─── logout confirm ─── */}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

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
>>>>>>> Stashed changes
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* header */}
        <div className="sidebar-header">
<<<<<<< Updated upstream
          <div 
            className="logo"
            onClick={() => navigate('/dashboard')} // Add navigation to dashboard
            style={{ cursor: 'pointer' }}
          >
=======
          <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
>>>>>>> Stashed changes
            <img src={Logo} alt="Logo" className="sidebar-logo" />
          </div>
          <div className="search-container">
            {/* Animated search input */}
            <div className={`search-input-wrapper ${searchVisible ? 'visible' : ''}`}>
              <Input 
                placeholder="Search notes..." 
                className="search-input"
<<<<<<< Updated upstream
                autoFocus={searchVisible}
=======
                placeholder="Search notes..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchSubmit}
                onBlur={() => {
                  if (searchQuery.trim() === '') setIsSearchVisible(false);
                }}
>>>>>>> Stashed changes
              />
            </div>
            {/* Search icon is now a toggle button */}
            <SearchOutlined className="search-icon" onClick={toggleSearch} />
          </div>
        </div>

        {/* new note */}
        <div className="new-note-container">
          <Button className="new-note-btn">
            <PlusOutlined /> New Note
          </Button>
        </div>

        {/* notes list */}
        <div className="notes-section">
          <div className="all-notes-header">All Notes</div>
<<<<<<< Updated upstream
          
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
          
=======
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
>>>>>>> Stashed changes
          <div className="more-section">More</div>
          <div className="note-list-footer">
            <div className="note-item">
              <DeleteOutlined className="note-icon" />
              <span>Trash</span>
            </div>
<<<<<<< Updated upstream
            <div className="note-item"
              onClick={() => setIsLogoutModalVisible(true)} // Add logout modal trigger
            >
=======
            <div className="note-item" onClick={() => setIsSettingsVisible(true)}>
>>>>>>> Stashed changes
              <SettingOutlined className="note-icon" />
              <span>Settings</span>
            </div>
          </div>
<<<<<<< Updated upstream
          
          {/* AI Tools Section - only show on note editor page */}
          {isNoteEditorPage && (
            <div className="ai-tools-section">
              {/* <div className="tools-section-header">AI Tools</div> */}
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
=======

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
>>>>>>> Stashed changes
                <span>Summarize</span>
              </div>
            </div>
          )}
<<<<<<< Updated upstream
          
          <div 
            className="collapse-sidebar" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d={sidebarCollapsed ? "M9 18L15 12L9 6" : "M15 18L9 12L15 6"} stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
=======

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
>>>>>>> Stashed changes
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
      </Drawer>
    </div>
  );
};

export default MainLayout;
