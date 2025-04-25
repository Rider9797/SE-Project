import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, Button, message } from 'antd';
import {
  // BoldOutlined,
  // ItalicOutlined,
  // UnderlineOutlined,
  CalendarOutlined,
  TagOutlined,
  SaveOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  // PictureOutlined,
} from '@ant-design/icons';
import '../styles/NoteEditor.css';
import { useParams, useNavigate } from 'react-router-dom';
import { authedApi } from './api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/* ---------- custom dark toolbar markup ---------- */
const QuillToolbar = () => (
  <div id="note-toolbar" className="custom-quill-toolbar">
    <select className="ql-header" defaultValue="0">
      <option value="0">Normal</option>
      <option value="1">Heading 1</option>
      <option value="2">Heading 2</option>
      <option value="3">Heading 3</option>
    </select>
    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />
    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />
    <button className="ql-clean" />
    <button className="multimedia-btn">
      <span className="multimedia-icon">
        <img src="/media-icon.svg" alt="" />
      </span>
      Add Multimedia
    </button>
  </div>
);

const modules = {
  toolbar: { container: '#note-toolbar' },
  clipboard: { matchVisual: false },
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'clean',
];
/* ---------- local types ---------- */
interface Note {
  _id: string;
  title: string;
  content: string;
  created_at: string;
  tags?: string[];
  ai_tag?: {
    main_subject?: string;
    overarching_scheme?: string;
    sub_topic?: string;
  };
}

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
  const [date] = useState(() => new Date().toLocaleDateString());
  const [tags] = useState(['Personal']);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

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
    fetchNote();
  }, [id, navigate]);

  const persistNote = useCallback(async () => {
    if (!note || isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      await authedApi.put(`/notes/${id}`, {
        title: note.title,
        content: note.content,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [id, note]);

  const debounceSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(persistNote, 2000);
  }, [persistNote]);

  const handleTitleChange = (title: string) => {
    if (!note) return;
    setNote({ ...note, title });
    debounceSave();
  };

  const handleContentChange = (content: string) => {
    if (!note) return;
    setNote({ ...note, content });
    debounceSave();
  };

  const handleManualSave = async () => {
    if (!note) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    try {
      message.loading({ content: 'Saving…', key: 'saveNote' });
      await authedApi.put(`/notes/${id}`, {
        title: note.title,
        content: note.content,
      });
      message.success({ content: 'Note saved!', key: 'saveNote' });
      await authedApi.post(`/notes/${id}/autotag`);
      message.success({ content: 'AI Tags generated!', key: 'autoTag' });

      // Fetch updated tags
      const { data } = await authedApi.get(`/notes/${id}/gettags`);
      const { main_subject, overarching_scheme, sub_topic } = data.tags;
      setNote((prevNote) =>
        prevNote
          ? {
              ...prevNote,
              ai_tag: { main_subject, overarching_scheme, sub_topic },
            }
          : prevNote
      );


    message.success({ content: 'Note saved with updated tags!', key: 'saveNote' });

    } catch {
      message.error({ content: 'Failed to save', key: 'saveNote' });
    }
  };

  const handleDeleteNote = async () => {
    try {
      await authedApi.delete(`/notes/${id}`);
      message.success('Note deleted');
      navigate('/Dashboard');
    } catch {
      message.error('Failed to delete note');
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${id}/pdf`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note_${note?.title || 'untitled'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('PDF export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // const handleAddMultimedia = () => {
  //   message.info('Multimedia upload functionality coming soon');
  // };

  if (loading || !note) return <div>Loading…</div>;
  
  const createdDate = new Date(note.created_at).toLocaleDateString();
  const tagString = note.ai_tag
  ? Object.values(note.ai_tag).filter(Boolean).join(', ')
  : '—';



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
          <div className="action-buttons">
            <Button 
              icon={<SaveOutlined />} 
              className="action-btn save-btn" 
              onClick={handleManualSave}
              title="Save Note"
            />
            <Button 
              icon={<FilePdfOutlined />} 
              className="action-btn export-btn" 
              onClick={handleExportPdf}
              loading={isExporting}
              title="Export as PDF"
            />
            <Button 
              icon={<DeleteOutlined />} 
              className="action-btn delete-btn" 
              onClick={handleDeleteNote}
              title="Delete Note"
            />
          </div>
        </div>

        <div className="meta-container">
          <div className="meta-item">
            <CalendarOutlined className="meta-icon" />
            <div className="meta-label">Date</div>
            <div className="meta-value">{date}</div>
          </div>
          <div className="meta-item">
            <TagOutlined className="meta-icon" />
            <div className="meta-label">Tags</div>
            <div className="meta-value">{tags.join(', ')}</div>
          </div>
        </div>
      </div>

      <div className="note-content-area">
        <QuillToolbar />
        <ReactQuill
          theme="snow"
          value={note.content || ''}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          placeholder="Start writing…"
        />
      </div>
    </div>
  );
};

export default NoteEditor;