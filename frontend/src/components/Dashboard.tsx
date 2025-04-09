// components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Form } from 'antd';
import axios from 'axios';
import {  Note } from './api';
import { AxiosError } from 'axios';
import { authedApi, searchApi } from './api'
// import { useNotes } from './useNotes';

const { Title } = Typography;



// export const authedApi = axios.create({
//   baseURL: 'http://127.0.0.1:5000/api',
//   withCredentials: true,
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('token')}`
//   }
// });

// export const searchApi = axios.create({
//   baseURL: 'http://127.0.0.1:5000/searches',
//   withCredentials: true,
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('token')}`
//   }
// });

const Dashboard: React.FC = () => {

  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();
  // Static data for demonstration
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

  // Pass token into the hook
  // useEffect(() => {
  //   if (token) {
  //     // Call fetchNotes only after the token is available
  //     const { notes, loading } = useNotes(token);
  //   } else {
  //     navigate('/'); // Redirect if no token found
  //   }
  // }, [token, navigate]);

  // if (loading) {
  //   return <div>Loading...</div>; // Show loading indicator while fetching notes
  // }

  useEffect(() => {
    if (token) {
      authedApi.defaults.headers['Authorization'] = `Bearer ${token}`;
      fetchNotes();
      // handleCreate();
    }
    else {
      console.log("red")
      navigate('/')
    }

  }, [token]);



  // const fetchNotes = async () => {
  //   try {
  //     const response = await authedApi.get('/notes'); // Using the configured instance
  //     setNotes(response.data);
  //   } catch (error) {
  //     console.log('Failed to fetch notes');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Import AxiosError type
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



  // const handleDelete = async (id: string) => {
  //   try {
  //     await authedApi.delete(`/notes/${id}`);
  //     console.log('Note deleted successfully');
  //     fetchNotes(setNotes, setLoading);
  //   } catch (error) {
  //     console.log('Failed to delete note');
  //   }
  // };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M49.3333 56H14.6667C13.9594 56 13.2811 55.719 12.781 55.219C12.281 54.7189 12 54.0406 12 53.3333V10.6667C12 9.95942 12.281 9.28115 12.781 8.78105C13.2811 8.28095 13.9594 8 14.6667 8H36L52 24V53.3333C52 54.0406 51.719 54.7189 51.219 55.219C50.7189 55.719 50.0406 56 49.3333 56Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M36 8V24H52" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M28 32H36" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M28 40H36" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <Title level={3} className="empty-title">Select a note to view</Title>
          <p className="empty-description">
            Choose a note from the list on the left to view its contents, or create a
            new note to add to your collection.
          </p>
        </div>

        <div className="recent-notes-section">
          <Title level={3} className="recent-notes-title">Recent Notes</Title>

          <div className="notes-grid">
            {loading ? (
              <div>Loading...</div>
            ) :(
              notes.map((note) => (
                <div key={note._id} className="note-card" onClick={() => navigate(`/notes/${note._id}/edit`)}>
                  <div className="note-card-content">
                    <div className="note-card-title">{note.title}</div>
                    <div className="note-card-date">{note.created_at}</div>
                    <div className="note-card-preview">{note.content.slice(0, 10)}{note.content.length > 10 ? '...' : ''}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;