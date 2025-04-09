// components/Dashboard.tsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  // Static data for demonstration
  const recentNotes = [
    { title: 'My Goals for the Next Year', date: '31/12/2022', preview: 'As the year comes to a...' },
    { title: 'Travel Itinerary', date: '17/4/2021', preview: 'Pack your Stuff we need t...' },
    { title: 'Project Proposal', date: '21/11/2022', preview: 'I should start Working o...' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M49.3333 56H14.6667C13.9594 56 13.2811 55.719 12.781 55.219C12.281 54.7189 12 54.0406 12 53.3333V10.6667C12 9.95942 12.281 9.28115 12.781 8.78105C13.2811 8.28095 13.9594 8 14.6667 8H36L52 24V53.3333C52 54.0406 51.719 54.7189 51.219 55.219C50.7189 55.719 50.0406 56 49.3333 56Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M36 8V24H52" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M28 32H36" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M28 40H36" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            {recentNotes.map((note, index) => (
              <div key={index} className="note-card">
                <div className="note-card-content">
                  <div className="note-card-title">{note.title}</div>
                  <div className="note-card-date">{note.date}</div>
                  <div className="note-card-preview">{note.preview}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;