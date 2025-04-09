// components/MainLayout.tsx
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button, Form, Modal, Input } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined, SettingOutlined, FileOutlined } from '@ant-design/icons';
import '../styles/MainLayout.css';
import { useNavigate } from 'react-router-dom';
import Logo from './assets/Frame.svg';
import axios from 'axios';
import { Note } from './api';
import { AxiosError } from 'axios';
import { authedApi, searchApi } from './api'
// import { useNotes } from './useNotes';


const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  authedApi.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        console.log('Session expired. Please log in againw.');
        navigate('/'); // Full page reload clears state
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (token) {
      authedApi.defaults.headers['Authorization'] = `Bearer ${token}`;
      fetchNotes();
      // handleCreate();
    }
    else {
      console.log("blue")
      navigate('/')
    }

  }, [token]);

  // if (loading) {
  //   return <div>Loading...</div>; // Show loading indicator while fetching notes
  // }

  const fetchNotes = async () => {
    try {
      const response = await authedApi.get('/notes'); // Using the configured instance
      setNotes(response.data);
    } catch (error: unknown) {
      // Type assertion to handle error as AxiosError
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401) {
          // Token might have expired or is invalid, so redirect to login
          console.log('Session expired. Please log i4n again.');
          localStorage.removeItem('token');
          navigate('/')
        } else if (error.response.status === 422) {
          // Handle 422 Unprocessable Entity error if needed
          console.log('Invalid data provided');
        } else {
          // Handle other errors
          console.log(`Failed to fetch notes. Status Code: ${error.response.status}`);
        }
      } else {
        console.log('An unknown error occurred');
      }
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

      navigate(`/notes/${response.data.note_id}/edit`);
      console.log('Note created successfully!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: unknown) {
      console.error("Error:");
      // message.error('Failed to create note');
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401) {
          // Token might have expired or is invalid, so redirect to login
          console.log('Session expired. Please log i6n again.');
          localStorage.removeItem('token');
          navigate('/')
        } else if (error.response.status === 422) {
          // Handle 422 Unprocessable Entity error if needed
          console.log('Invalid data provided');
        } else {
          // Handle other errors
          console.log(`Failed to fetch notes. Status Code: ${error.response.status}`);
        }
      }

    }

  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  
    // Short queries – filter locally
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
        // const response = await authedApi.get('/search');
        setFilteredNotes(response.data.notes); // assuming backend returns { notes: [...] }
      } catch (error: unknown) {
        console.log('Search failed, falling back to local filter.');
        const fallback = notes.filter(note =>
          note.title.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredNotes(fallback);
      }
    }
  };
  

  return (
    <div className="main-layout">
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src={Logo} alt="Logo" className="sidebar-logo" />
          </div>
          <div className="search-container">
            <Input.Search
            placeholder="Search notes..."
            allowClear
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={handleSearchSubmit}
          />
          </div>
        </div>

        <div className="new-note-container">
          <Button
            className="new-note-btn"
            onClick={() => setIsModalVisible(true)}
          >
            <PlusOutlined /> New Note
          </Button>
        </div>

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


        <div className="notes-section">
          <div className="all-notes-header">Notes</div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            notes.length > 0 ? (
              (searchQuery ? filteredNotes : notes).map((note: Note) => (
                <div key={note._id} className="note-item">
                  <FileOutlined className="note-icon" />
                  <span>{note.title}</span>
                </div>
            ))
            ) : (
            <p>No notes available.</p> // If no notes are found
            )
          )}

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
              <path d={sidebarCollapsed ? "M9 18L15 12L9 6" : "M15 18L9 12L15 6"} stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    </div >
  );
};

export default MainLayout;