import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, List, Modal, Form, Input, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Note {
  _id: string;
  title: string;
  content: string;
  created_at: string;
}

// Create configured axios instance
export const authedApi = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  // Add response interceptor to handle 401s
  authedApi.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Full page reload clears state
      }
      return Promise.reject(error);
    }
  );



const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await authedApi.get('/notes'); // Using the configured instance
      setNotes(response.data);
    } catch (error) {
      message.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: { title: string }) => {
    try {
      const response = await authedApi.post('/notes', { 
        title: values.title, 
        content: '' 
      });
      
      navigate(`/notes/${response.data.note_id}/edit`);
      message.success('Note created successfully!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create note');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await authedApi.delete(`/notes/${id}`);
      message.success('Note deleted successfully');
      fetchNotes();
    } catch (error) {
      message.error('Failed to delete note');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: '16px' }}
      >
        Add Note
      </Button>

      <List
        loading={loading}
        grid={{ gutter: 16, column: 3 }}
        dataSource={notes}
        renderItem={(note) => (
          <List.Item>
            <Card
              title={note.title}
              actions={[
                <EditOutlined 
                  key="edit" 
                  onClick={() => navigate(`/notes/${note._id}/edit`)} 
                />,
                <DeleteOutlined 
                  key="delete" 
                  onClick={() => handleDelete(note._id)} 
                />
              ]}
            >
              <p>{note.content.substring(0, 100)}...</p>
              <p style={{ color: 'gray', fontSize: '12px' }}>
                {new Date(note.created_at).toLocaleString()}
              </p>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Create New Note"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreate}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Title" autoFocus />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;