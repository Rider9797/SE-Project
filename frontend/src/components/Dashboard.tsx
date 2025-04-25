import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import { Note } from './api';
import { authedApi } from './api'

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  authedApi.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
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
  }, [token, navigate]);

  const fetchNotes = async () => {
    try {
      const response = await authedApi.get('/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

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
            ) : (
              notes.map((note) => (
                <div 
                  key={note._id} 
                  className="note-card" 
                  onClick={() => navigate(`/Dashboard/${note._id}/edit`)}
                >
                  <div className="note-card-content">
                    <div className="note-card-title">{note.title}</div>
                    <div className="note-card-date">
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                    <div className="note-card-preview">
                      {note.content.slice(0, 100)}{note.content.length > 100 ? '...' : ''}
                    </div>
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