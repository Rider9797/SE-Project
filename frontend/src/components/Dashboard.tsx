// components/Dashboard.tsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  // Static data for demonstration
  const recentNotes = [
    { title: 'My Goals for the Next Year', date: '31/12/2022', preview: 'As the year comes to a...' },
    { title: 'Travel Itinerary', date: '17/4/2021', preview: 'Pack your Stuff we need t...' },
    { title: 'Project Proposal', date: '21/11/2022', preview: 'I should start Working o...' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Title level={2}>Recent Notes</Title>
      </div>

      <div className="notes-grid">
        {recentNotes.map((note, index) => (
          <Card key={index} className="note-card">
            <Title level={4} className="note-title">{note.title}</Title>
            <div className="note-date">{note.date}</div>
            <p className="note-preview">{note.preview}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;