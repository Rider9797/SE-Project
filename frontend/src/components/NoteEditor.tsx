// components/NoteEditor.tsx
import React, { useState } from 'react';
import { Input, Button, Dropdown, Menu, Typography } from 'antd';
import { 
  BoldOutlined, 
  ItalicOutlined, 
  UnderlineOutlined, 
  AlignLeftOutlined,
  MoreOutlined,
  MessageOutlined,
  SoundOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import '../styles/NoteEditor.css';

const { Title } = Typography;

const NoteEditor: React.FC = () => {
  const [noteTitle, setNoteTitle] = useState('My Goals for the Next Year');
  const [noteContent, setNoteContent] = useState(`It's hard to believe that June is already over! Looking back on the month, there were a few highlights that stand out to me.

One of the best things that happened was getting promoted at work. I've been working really hard and it's great to see that effort recognized. It's also exciting to have more responsibility and the opportunity to contribute to the company in a bigger way. I'm looking forward to taking on new challenges and learning as much as I can in my new role.

I also had a great time on my vacation to Hawaii. The beaches were beautiful and I loved trying all of the different types of Hawaiian food. It was nice to relax and get away from the daily grind for a bit. I'm so grateful to have had the opportunity to take a trip like that.

On the downside, I feel like I didn't make as much progress on my fitness goals as I would have liked. I was really busy with work and didn't make it to the gym as often as I planned. I'm going to try to be more consistent in July and make exercise a higher priority. I know it will be good for my physical and mental health.

I also had a few rough patches in my relationships this month. I had a couple of misunderstandings with friends and it was hard to navigate those conflicts. But I'm glad we were able to talk things through and move past them. I value my relationships and I want to make sure I'm always working to be a good friend.

Overall, it was a good month with a mix of ups and downs. I'm looking forward to what July has in store! I'm hoping to make some more progress on my goals and spend quality time with the people I care about.`);

  const [date] = useState('21/06/2022');
  const [tags] = useState(['Personal']);
  
  // Format options
  const paragraphOptions = (
    <Menu items={[
      { key: '1', label: 'Paragraph' },
      { key: '2', label: 'Heading 1' },
      { key: '3', label: 'Heading 2' },
      { key: '4', label: 'Heading 3' },
    ]} />
  );

  return (
    <div className="note-editor-container">
      <div className="note-editor-header">
        <Input 
          className="note-title-input" 
          value={noteTitle} 
          onChange={(e) => setNoteTitle(e.target.value)}
          bordered={false}
          placeholder="Note Title"
        />
        
        <div className="note-meta">
          <div className="note-meta-item">
            <span className="meta-label">Date</span>
            <span className="meta-value">{date}</span>
          </div>
          
          <div className="note-meta-item">
            <span className="meta-label">Tags</span>
            <span className="meta-value">{tags.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="note-toolbar">
        <div className="toolbar-left">
          <Dropdown overlay={paragraphOptions} trigger={['click']}>
            <Button className="format-button">
              Paragraph <span className="dropdown-arrow">▼</span>
            </Button>
          </Dropdown>
          
          <Button className="format-button">
            16 <span className="dropdown-arrow">▼</span>
          </Button>
          
          <div className="format-actions">
            <Button className="icon-button"><BoldOutlined /></Button>
            <Button className="icon-button"><ItalicOutlined /></Button>
            <Button className="icon-button"><UnderlineOutlined /></Button>
          </div>
        </div>
        
        <div className="toolbar-right">
          <Button className="action-button" icon={<MessageOutlined />}>
            <span className="button-text">Text-To-Speech</span>
          </Button>
          <Button className="action-button" icon={<SoundOutlined />}>
            <span className="button-text">Quiz-It</span>
          </Button>
          <Button className="action-button" icon={<FileTextOutlined />}>
            <span className="button-text">Summarize</span>
          </Button>
        </div>
      </div>

      <div className="note-content-area">
        <textarea 
          className="note-content" 
          value={noteContent} 
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Start writing..."
        />
      </div>
    </div>
  );
};

export default NoteEditor;