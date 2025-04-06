import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Card, List, Modal, Form, Input, Space, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AxiosError } from 'axios';

const { Sider, Content } = Layout;

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

// Create configured axios instance

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
    if (token) {
      authedApi.defaults.headers['Authorization'] = `Bearer ${token}`;
      fetchNotes();
      // handleCreate();
    }
    else {
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
    } catch (error: unknown) {
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
    <Layout style={{ minHeight: '100vh', background: '#181818' }}>
      {/* Left Sidebar */}
      <Sider width={300} style={{
        background: '#181818',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ padding: '20px' }}>
          {/* Search Bar */}
          <Input.Search
            placeholder="Search notes..."
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          />

          {/* New Note Button */}
          <Button
            block
            icon={<PlusOutlined />}
            style={{
              margin: '15px 0',
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
            onClick={() => setIsModalVisible(true)}
          >
            New Note
          </Button>

          {/* Notes List */}
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', padding: '10px 0' }}>
            All Notes
          </div>
          <Menu
            theme="dark"
            mode="inline"
            style={{ background: 'transparent' }}
          >
            {notes.map(note => (
              <Menu.Item
                key={note._id}
                icon={<FileOutlined />}
                onClick={() => navigate(`/notes/${note._id}/edit`)}
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                {note.title}
              </Menu.Item>
            ))}
          </Menu>

          {/* Bottom Menu */}
          <Menu
            theme="dark"
            mode="inline"
            style={{
              background: 'transparent',
              position: 'absolute',
              bottom: 0,
              width: '100%'
            }}
          >
            <Menu.Item key="trash" icon={<DeleteOutlined />}>
              Trash
            </Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />}>
              Settings
            </Menu.Item>
          </Menu>
        </div>
      </Sider>

      {/* Main Content Area */}
      <Layout style={{ background: '#1f1f1f' }}>
        <Content style={{ padding: '40px' }}>
          {/* Empty State */}
          {notes.length === 0 && (
            <div style={{
              textAlign: 'center',
              maxWidth: '600px',
              margin: '100px auto',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
              <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '16px' }}>
                Select a note to view
              </h2>
              <p>
                Choose a note from the list on the left to view its contents,
                or create a new note to add to your collection.
              </p>
            </div>
          )}

          {/* Recent Notes Grid */}
          {notes.length > 0 && (
            <div>
              <h3 style={{
                color: 'white',
                fontSize: '24px',
                marginBottom: '30px'
              }}>
                Recent Notes
              </h3>
              <Row gutter={[24, 24]}>
                {notes.map(note => (
                  <Col span={8} key={note._id}>
                    <Card
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '15px'
                      }}
                    >
                      <h4 style={{ color: 'white' }}>{note.title}</h4>
                      <div style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        {new Date(note.created_at).toLocaleDateString()}
                      </div>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginTop: '8px'
                      }}>
                        {note.content.substring(0, 100)}...
                      </p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Content>
      </Layout>

      {/* Create Note Modal */}
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
    </Layout>
  );
};

export default Dashboard;