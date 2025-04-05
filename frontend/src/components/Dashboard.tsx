import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, List, Modal, Form, Input, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AxiosError } from 'axios'; 
import Login from "./Login.tsx";

interface Note {
  _id: string;
  title: string;
  content: string;
  created_at: string;
}

// Create configured axios instance


// const createAuthedApi = (token: string | null, navigate: Function) => {
//   const authedApi = axios.create({
//     baseURL: 'http://127.0.0.1:5000/api',
//     withCredentials: true,
//   });

//   // Set the Authorization header dynamically
//   if (token) {
//     authedApi.defaults.headers['Authorization'] = `Bearer ${token}`;
//   }

//   // Add response interceptor to handle 401s
//   authedApi.interceptors.response.use(
//     response => response,
//     (error: AxiosError) => {
//       if (error.response?.status === 401) {
//         localStorage.removeItem('token');
//         console.log('Session expired. Please log in again.');
//         // Redirect to login page using react-router-dom's navigate function
//         navigate('/Login');
//       }
//       return Promise.reject(error);
//     }
//   );

//   return authedApi;
// };
// const authedApi = new createAuthedApi();
  // const navigate = useNavigate();

  export const authedApi = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  // Add response interceptor to handle 401s
  // authedApi.interceptors.response.use(
  //   response => response,
  //   error => {
  //     if (error.response?.status === 401) {
  //       localStorage.removeItem('token');
  //       console.log('Session expired. Please log in againw.');
  //       navigate('/'); // Full page reload clears state
  //     }
  //     return Promise.reject(error);
  //   }
  // );


const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  // const authedApi = axios.create({
  //   baseURL: 'http://127.0.0.1:5000/api',
  //   withCredentials: true,
    // headers: {
    //   Authorization: `Bearer ${localStorage.getItem('token')}`
    // }
  // });
  
  // // Add response interceptor to handle 401s
  authedApi.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        console.log('Session expired. Please log in againw.');
        navigate('/'); // Full page reload clears state
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (token){
      authedApi.defaults.headers['Authorization'] = `Bearer ${token}`;
      fetchNotes();
      // handleCreate();
    }
    else
    {
      navigate('/')
    }
    
  }, [token]);


  // const fetchNotes = async () => {
  //   try {
  //     const response = await authedApi.get('/notes'); // Using the configured instance
  //     setNotes(response.data);
  //   } catch (error) {
  //     message.error('Failed to fetch notes');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Import AxiosError type

  const fetchNotes = async () => {
    try {
      const response = await authedApi.get('/notes'); // Using the configured instance
      setNotes(response.data);
    } catch (error: unknown) {
      // Type assertion to handle error as AxiosError
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401) {
          // Token might have expired or is invalid, so redirect to login
          console.log('Session expired. Please log i4n again.');
          localStorage.removeItem('token');
          navigate('/')
        } else if (error.response.status === 422) {
          // Handle 422 Unprocessable Entity error if needed
          console.log('Invalid data provided');
        } else {
          // Handle other errors
          message.error(`Failed to fetch notes. Status Code: ${error.response.status}`);
        }
      } else {
        message.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleCreate = async (values: { title: string }) => {
    try {
      const response = await authedApi.post('/notes/create', {
        title: values.title,
        content: ''
      });

      navigate(`/notes/${response.data.note_id}/edit`);
      message.success('Note created successfully!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error:unknown) {
      console.error("Error:");
      // message.error('Failed to create note');
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401) {
          // Token might have expired or is invalid, so redirect to login
          console.log('Session expired. Please log i6n again.');
          localStorage.removeItem('token');
          navigate('/')
        } else if (error.response.status === 422) {
          // Handle 422 Unprocessable Entity error if needed
          console.log('Invalid data provided');
        } else {
          // Handle other errors
          message.error(`Failed to fetch notes. Status Code: ${error.response.status}`);
        }
      }
      
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