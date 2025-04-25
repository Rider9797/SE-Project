import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, Button, Dropdown, Menu, message } from 'antd';
import {
  CalendarOutlined,
  TagOutlined,
  MoreOutlined,
  FilePdfOutlined,
  SaveOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import '../styles/NoteEditor.css';
import { useParams, useNavigate } from 'react-router-dom';
import { authedApi } from './api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/* ---------- custom dark toolbar ---------- */
const QuillToolbar: React.FC = () => (
  <div id="note-toolbar" className="custom-quill-toolbar">
    <select className="ql-header" defaultValue="">
      <option value="">Normal</option>
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
  </div>
);

/* ---------- Quill config ---------- */
const quillModules = { toolbar: { container: '#note-toolbar' }, clipboard: { matchVisual: false } };
const quillFormats = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'clean'];

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

/* ────────────────────────────────────────────────────────── */
const NoteEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);

  /* ---------- fetch note ---------- */
  useEffect(() => {
    if (!id) return;
    const fetchNote = async () => {
      try {
        setLoading(true);
        const { data } = await authedApi.get<Note>(`/notes/${id}`);
        setNote(data);
      } catch {
        message.error('Failed to load note');
        navigate('/Dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  /* ---------- auto-save helpers ---------- */
  const persistNote = useCallback(async () => {
    if (!note || isSaving.current) return;
    isSaving.current = true;
    try {
      await authedApi.put(`/notes/${id}`, { title: note.title, content: note.content });
    } finally {
      isSaving.current = false;
    }
  }, [id, note]);

  const debounceSave = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(persistNote, 1500);
  }, [persistNote]);

  /* ---------- field handlers ---------- */
  const handleTitleChange = (value: string) => {
    if (!note) return;
    setNote({ ...note, title: value });
    debounceSave();
  };

  const handleContentChange = (html: string) => {
    if (!note) return;
    setNote({ ...note, content: html });
    debounceSave();
  };

  /* ---------- manual save / delete ---------- */
  const handleManualSave = async () => {
    if (!note) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    try {
      message.loading({ content: 'Saving…', key: 'saveNote' });
      await authedApi.put(`/notes/${id}`, { title: note.title, content: note.content });
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

  /* ---------- dropdown ---------- */
  const moreMenu = (
    <Menu>
      <Menu.Item key="save" icon={<SaveOutlined />} onClick={handleManualSave}>
        Save Note
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={handleDeleteNote}>
        Delete Note
      </Menu.Item>
      <Menu.Item
        key="pdf"
        icon={<FilePdfOutlined />}
        disabled={isExporting}
        onClick={async () => {
          if (!note) return;
          setIsExporting(true);
          try {
            const res = await fetch(`http://localhost:5000/api/notes/${id}/pdf`, { credentials: 'include' });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `note_${note.title || 'untitled'}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          } catch {
            message.error('PDF export failed');
          } finally {
            setIsExporting(false);
          }
        }}
      >
        {isExporting ? 'Exporting…' : 'Export as PDF'}
      </Menu.Item>
    </Menu>
  );

  /* ---------- render ---------- */
  if (loading || !note) return <div className="note-loading">Loading…</div>;

  const createdDate = new Date(note.created_at).toLocaleDateString();
  const tagString = note.ai_tag
  ? Object.values(note.ai_tag).filter(Boolean).join(', ')
  : '—';



  return (
    <div className="note-editor-container">
      {/* ───── HEADER ───── */}
      <div className="note-editor-header">
        <div className="title-and-more">
          <Input
            className="note-title-input"
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            bordered={false}
            placeholder="Untitled"
          />
          <Dropdown overlay={moreMenu} trigger={['click']} placement="bottomRight">
            <Button icon={<MoreOutlined />} className="more-options-btn" />
          </Dropdown>
        </div>

        <div className="meta-container">
          <div className="meta-item">
            <CalendarOutlined className="meta-icon" />
            <span className="meta-label">Date:&nbsp;</span>
            <span className="meta-value">{createdDate}</span>
          </div>
          <div className="meta-item">
            <TagOutlined className="meta-icon" />
            <span className="meta-label">Tags:&nbsp;</span>
            <span className="meta-value">{tagString}</span>
          </div>
        </div>
      </div>

      {/* ───── EDITOR ───── */}
      <div className="note-content-area">
        <QuillToolbar />
        <ReactQuill
          theme="snow"
          value={note.content}
          onChange={handleContentChange}
          modules={quillModules}
          formats={quillFormats}
          placeholder="Start writing…"
        />
      </div>
    </div>
  );
};

export default NoteEditor;
