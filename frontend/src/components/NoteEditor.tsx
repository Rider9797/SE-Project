<<<<<<< Updated upstream
import React, { useState } from 'react';
import { Input, Button, Dropdown, Menu, Typography } from 'antd';
import { 
  BoldOutlined, 
  ItalicOutlined, 
  UnderlineOutlined,
  CalendarOutlined,
  TagOutlined,
  MoreOutlined
} from '@ant-design/icons';
import '../styles/NoteEditor.css';

const { Title } = Typography;

const NoteEditor: React.FC = () => {
  const [noteTitle, setNoteTitle] = useState('My Goals for the Next Year');
  const [noteContent, setNoteContent] = useState(`It's hard to believe that June is already over! Looking back on the month, there were a few highlights that stand out to me.

One of the best things that happened was getting promoted at work. I've been working really hard and it's great to see that effort recognized. It's also exciting to have more responsibility and the opportunity to contribute to the company in a bigger way. I'm looking forward to taking on new challenges and learning as much as I can in my new role.
=======
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
  DeleteOutlined,
} from '@ant-design/icons';
import '../styles/NoteEditor.css';
import { useParams, useNavigate } from 'react-router-dom';
import { authedApi } from './api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/* ---------- custom dark toolbar markup ---------- */
const QuillToolbar = () => (
  <div id="note-toolbar" className="custom-quill-toolbar">
    {/* paragraph / heading selector */}
    <select className="ql-header" defaultValue="0">
      <option value="0">Normal</option>
      <option value="1">Heading 1</option>
      <option value="2">Heading 2</option>
      <option value="3">Heading 3</option>
    </select>

    {/* inline-style buttons */}
    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />

    {/* list buttons */}
    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />

    {/* clear-format button */}
    <button className="ql-clean" />
  </div>
);

/* ---------- Quill config ---------- */
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

/* ────────────────────────────────────────────────────────── */

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

  /* ---------- fetch note ---------- */
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
>>>>>>> Stashed changes

I also had a great time on my vacation to Hawaii. The beaches were beautiful and I loved trying all of the different types of Hawaiian food. It was nice to relax and get away from the daily grind for a bit. I'm so grateful to have had the opportunity to take a trip like that.

On the downside, I feel like I didn't make as much progress on my fitness goals as I would have liked. I was really busy with work and didn't make it to the gym as often as I planned. I'm going to try to be more consistent in July and make exercise a higher priority. I know it will be good for my physical and mental health.

<<<<<<< Updated upstream
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

  // More options menu
  const moreOptions = (
    <Menu items={[
      { key: '1', label: 'Delete Note' },
      { key: '2', label: 'Duplicate Note' },
      { key: '3', label: 'Export as PDF' },
    ]} />
  );

=======
  /* ---------- auto-save helpers ---------- */
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

  /* ---------- field handlers ---------- */
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

  /* ---------- manual save / delete ---------- */
  const handleManualSave = async () => {
    if (!note) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      message.loading({ content: 'Saving…', key: 'saveNote' });
      await authedApi.put(`/notes/${id}`, {
        title: note.title,
        content: note.content,
      });
      message.success({ content: 'Note saved!', key: 'saveNote' });
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

  /* ---------- dropdown menus ---------- */
  const moreMenu = (
    <Menu>
      <Menu.Item key="save" icon={<SaveOutlined />} onClick={handleManualSave}>
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
            const res = await fetch(
              `http://localhost:5000/api/notes/${id}/pdf`,
              { credentials: 'include' },
            );
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
        }}
      >
        {isExporting ? 'Exporting…' : 'Export as PDF'}
      </Menu.Item>
    </Menu>
  );

  /* ---------- render ---------- */
  if (loading || !note) return <div>Loading…</div>;

>>>>>>> Stashed changes
  return (
    <div className="note-editor-container">
      {/* ─────── HEADER ─────── */}
      <div className="note-editor-header">
        <div className="title-and-more">
<<<<<<< Updated upstream
          <Input 
            className="note-title-input" 
            value={noteTitle} 
            onChange={(e) => setNoteTitle(e.target.value)}
            bordered={false}
            placeholder="Note Title"
          />
          
          <Dropdown overlay={moreOptions} trigger={['click']} placement="bottomRight">
=======
          <Input
            className="note-title-input"
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            bordered={false}
            placeholder="Note Title"
          />
          <Dropdown
            overlay={moreMenu}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="note-dropdown"
          >
>>>>>>> Stashed changes
            <Button icon={<MoreOutlined />} className="more-options-btn" />
          </Dropdown>
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

      {/* ─────── EDITOR ─────── */}
      <div className="note-content-area">
<<<<<<< Updated upstream
        <textarea 
          className="note-content" 
          value={noteContent} 
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Start writing..."
=======
        <QuillToolbar />
        <ReactQuill
          theme="snow"
          value={note.content || ''}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          placeholder="Start writing…"
>>>>>>> Stashed changes
        />
      </div>
    </div>
  );
};

export default NoteEditor;
