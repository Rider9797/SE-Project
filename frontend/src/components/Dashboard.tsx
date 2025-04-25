import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Note, authedApi } from './api';

const { Title } = Typography;

// Rayed's HTML-stripping helper
const stripHTML = (html: string) => html.replace(/<[^>]*>?/gm, '');

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');           // Rayed's token management
  const navigate = useNavigate();

  // Redirect on 401
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

  // My code's type-hinted fetch
  const fetchNotes = async () => {
    try {
      const res = await authedApi.get<Note[]>('/notes');
      setNotes(res.data);
    } catch (e) {
      console.error('Failed to fetch notes:', e);
    } finally {
      setLoading(false);
    }
  };

  // My delete-note handler + feedback
  const handleDeleteNote = async (id: string) => {
    try {
      await authedApi.delete(`/notes/${id}`);
      message.success('Note deleted');
      fetchNotes();
    } catch {
      message.error('Failed to delete note');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="empty-state">
          <div className="empty-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M49.3333 56H14.6667C13.9594 56 13.2811 55.719 12.781 55.219C12.281 54.7189 12 54.0406 12 53.3333V10.6667C12 9.95942 12.281 9.28115 12.781 8.78105C13.2811 8.28095 13.9594 8 14.6667 8H36L52 24V53.3333C52 54.0406 51.719 54.7189 51.219 55.219C50.7189 55.719 50.0406 56 49.3333 56Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M36 8V24H52"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M28 32H36"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M28 40H36"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <Title level={3} className="empty-title">
            Select a note to view
          </Title>
          <p className="empty-description">
            Choose a note from the list on the left to view its contents, or create a
            new note to add to your collection.
          </p>
        </div>

        <div className="recent-notes-section">
          <Title level={3} className="recent-notes-title">
            Recent Notes
          </Title>

          <div className="notes-grid">
            {loading ? (
              <div>Loading...</div>
            ) : (
              notes.map((note) => {
                const clean = stripHTML(note.content);
                const preview = clean.slice(0, 100) + (clean.length > 100 ? '…' : '');
                return (
                  <div
                    key={note._id}
                    className="note-card"
                    onClick={() => navigate(`/Dashboard/${note._id}/edit`)}
                  >
                    {/* Delete-note button */}
                    <Button
                      icon={<DeleteOutlined />}
                      className="note-card-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note._id);
                      }}
                      title="Delete Note"
                    />

                    <div className="note-card-content">
                      <div className="note-card-title">{note.title}</div>
                      <div className="note-card-date">
                        {new Date(note.created_at).toLocaleDateString()}
                      </div>
                      <div className="note-card-preview">{preview}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
