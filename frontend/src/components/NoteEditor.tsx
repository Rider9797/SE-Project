// components/NoteEditor.tsx
import React, { useState, useEffect } from 'react';
import { Button, Input, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
<<<<<<< HEAD

const { TextArea } = Input;

const NoteEditor: React.FC = () => {
    
=======
import { authedApi } from './Dashboard';
const { TextArea } = Input;

const NoteEditor: React.FC = () => {

>>>>>>> 30805fbddd32184003a0de7b5367d00328da1849
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // If editing existing note, fetch its data
<<<<<<< HEAD
      axios.get(`http://127.0.0.1:5000/notes/${id}`, { withCredentials: true })
=======
      // axios.get(`http://127.0.0.1:5000/notes/${id}`, { withCredentials: true })
      authedApi.get(`/notes/${id}`)
>>>>>>> 30805fbddd32184003a0de7b5367d00328da1849
        .then(res => {
          setTitle(res.data.title);
          setContent(res.data.content);
        })
        .catch(() => message.error('Failed to load note'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleSave = async () => {
    try {
      if (id) {
        // Update existing note
<<<<<<< HEAD
        await axios.put(`http://127.0.0.1:5000/notes/${id}`, 
          { title, content },
          { withCredentials: true }
        );
        message.success('Note updated!');
      } else {
        // Create new note (shouldn't happen here, but just in case)
        await axios.post('http://127.0.0.1:5000/notes', 
          { title, content },
          { withCredentials: true }
        );
=======
        // await axios.put(`http://127.0.0.1:5000/notes/${id}`, 
        //   { title, content },
        //   { withCredentials: true }
        // );
        await authedApi.put(`/notes/${id}`, { title, content });
        message.success('Note updated!');
      } else {
        // Create new note (shouldn't happen here, but just in case)
        // await axios.post('http://127.0.0.1:5000/notes', 
        //   { title, content },
        //   { withCredentials: true }
        // );
        await authedApi.post('/notes', { title, content });
>>>>>>> 30805fbddd32184003a0de7b5367d00328da1849
        message.success('Note created!');
      }
      navigate('/dashboard');
    } catch (error) {
      message.error('Failed to save note');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        style={{ marginBottom: '16px', fontSize: '1.5rem' }}
      />
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your note here..."
        autoSize={{ minRows: 15 }}
        style={{ marginBottom: '16px' }}
      />
      <Button type="primary" onClick={handleSave}>
        Save Note
      </Button>
    </div>
  );
};

export default NoteEditor;