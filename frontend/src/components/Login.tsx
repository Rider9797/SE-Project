import React from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../utils/authorisation'; // Import auth utility

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/login', values, {
        withCredentials: true
      });
      
      // Store the received token
      // setAuthToken(response.data.access_token);
      localStorage.setItem('token', response.data.access_token);
      
      // Success feedback
      message.success('Login successful!');
      
      // Redirect to dashboard
      navigate('/Dashboard');
    } 
    
    catch (error) 
    {
      console.error('Login Failed:', error);
      message.error('Login failed. Please check your credentials.');
    }



    
  };

  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      style={{ maxWidth: 360 }}
      onFinish={onFinish}
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please input your Email!' },
          { type: 'email', message: 'Please enter a valid email!' }
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="Email" />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Please input your Password!' },
          { min: 6, message: 'Password must be at least 6 characters!' }
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>
      
      <Form.Item>
        <Flex justify="space-between" align="center">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <a href="">Forgot password</a>
        </Flex>
      </Form.Item>

        <Form.Item style={{ marginBottom: 10 }}>
          <Button block type="primary" htmlType="submit" className="login-btn">
            Log in
          </Button>
        </Form.Item>
        
        <div className="new-user-text" style={{ textAlign: 'center', marginBottom: 0, color: 'white' }}>
          <span>New user?</span>
          <hr style={{ width: '100%', margin: '0px 0' }} />
        </div>
        
        <Form.Item style={{ marginTop: 10 }}>
          <Button block type="default" onClick={() => navigate("/signup")} className="signup-btn">
            Create an Account
          </Button>
        </Form.Item>
      </Form>
  );
};

export default Login;