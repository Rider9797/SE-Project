import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, Button, Dropdown, Menu, message } from 'antd';
import { 
  BoldOutlined, 
  ItalicOutlined, 
  UnderlineOutlined,
  CalendarOutlined,
  TagOutlined,
  MoreOutlined,
  FilePdfOutlined,
  SaveOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import '../styles/NoteEditor.css';
import { useParams, useNavigate } from 'react-router-dom';
import { authedApi } from './api';

const NoteEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<{
    _id: string;
    title: string;
    content: string;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await authedApi.get(`/notes/${id}`);
        setNote(response.data);
      } catch (error) {
        message.error('Failed to load note');
        navigate('/Dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNote();
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [id, navigate]);

  // Auto-save function
  const autoSaveNote = useCallback(async () => {
    if (!note || isSavingRef.current) return;

    isSavingRef.current = true;
    try {
      await authedApi.put(`/notes/${id}`, {
        title: note.title,
        content: note.content
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [id, note]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSaveNote();
    }, 2000);
  }, [autoSaveNote]);

  // Manual save function
  const handleManualSave = async () => {
    if (!note) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    try {
      message.loading({ content: 'Saving...', key: 'saveNote' });
      await authedApi.put(`/notes/${id}`, {
        title: note.title,
        content: note.content
      });
      message.success({ content: 'Note saved!', key: 'saveNote' });
    } catch (error) {
      message.error({ content: 'Failed to save note', key: 'saveNote' });
    }
  };

  const handleContentChange = (content: string) => {
    if (!note) return;
    setNote({ ...note, content });
    debouncedAutoSave();
  };

  const handleTitleChange = (title: string) => {
    if (!note) return;
    setNote({ ...note, title });
    debouncedAutoSave();
  };

  const handleDeleteNote = async () => {
    try {
      await authedApi.delete(`/notes/${id}`);
      message.success('Note deleted');
      navigate('/Dashboard');
    } catch (error) {
      message.error('Failed to delete note');
    }
  };

  const paragraphOptions = (
    <Menu>
      <Menu.Item key="p">Paragraph</Menu.Item>
      <Menu.Item key="h1">Heading 1</Menu.Item>
      <Menu.Item key="h2">Heading 2</Menu.Item>
      <Menu.Item key="h3">Heading 3</Menu.Item>
    </Menu>
  );
  
  // More options menu
  const moreOptions = (
    <Menu>
      <Menu.Item 
        key="save" 
        icon={<SaveOutlined />}
        onClick={handleManualSave}
      >
        Save Note
      </Menu.Item>
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        onClick={handleDeleteNote}
        danger
      >
        Delete Note
      </Menu.Item>
      <Menu.Item 
        key="pdf" 
        icon={<FilePdfOutlined />}
        disabled={isExporting}
        onClick={async () => {
          setIsExporting(true);
          try {
            const response = await fetch(`http://localhost:5000/api/notes/${id}/pdf`, {
              method: 'GET',
              credentials: 'include',
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch PDF');
            }
        
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
        
            const a = document.createElement('a');
            a.href = url;
            a.download = `note_${note?.title || 'untitled'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            message.success('PDF exported successfully!');
          } catch (error) {
            console.error('Error downloading PDF:', error);
            message.error('Failed to export PDF');
          } finally {
            setIsExporting(false);
          }
        }}
      >
        {isExporting ? 'Exporting...' : 'Export as PDF'}
      </Menu.Item>
    </Menu>
  );

  if (loading || !note) {
    return <div>Loading...</div>;
  }

  return (
    <div className="note-editor-container">
      <div className="note-editor-header">
        <div className="title-and-more">
          <Input 
            className="note-title-input" 
            value={note.title} 
            onChange={(e) => handleTitleChange(e.target.value)}
            bordered={false}
            placeholder="Note Title"
          />
          <Dropdown overlay={moreOptions} trigger={['click']} placement="bottomRight">
            <Button icon={<MoreOutlined />} className="more-options-btn" />
          </Dropdown>
        </div>
        
        <div className="meta-container">
          <div className="meta-item">
            <CalendarOutlined className="meta-icon" />
            <div className="meta-label">Date</div>
            <div className="meta-value">
              {new Date(note.created_at).toLocaleDateString()}
            </div>
          </div>
          
          <div className="meta-item">
            <TagOutlined className="meta-icon" />
            <div className="meta-label">Tags</div>
            <div className="meta-value">Personal</div>
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
      </div>

      <div className="note-content-area">
        <textarea 
          className="note-content" 
          value={note.content} 
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing..."
        />
      </div>
    </div>
  );
};

export default NoteEditor;