import React from 'react';
import { Button, Form, Input, Flex } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LogoImage from "./assets/Frame.svg";
import LogoWord from "./assets/Note Genius.svg";

const SignupForm: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/signup', values);
      console.log('Signup success:', response.data);
      alert('Signup successful! Please login.');
      navigate("/login");
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="logo-wrapper">
        <img src={LogoImage} alt="Logo" className="login-logo" />
        <img src={LogoWord} alt="Logo-Word" className="login-logo-word" />
      </div>
      
      <Form
        name="signup"
        onFinish={onFinish}
        style={{ maxWidth: 360 }}
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
          style={{ marginBottom: 10 }}
        >
          <Input prefix={<UserOutlined />} placeholder="Full Name" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Invalid email format' }
          ]}
          style={{ marginBottom: 10 }}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
          style={{ marginBottom: 10 }}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Passwords do not match!');
              },
            }),
          ]}
          style={{ marginBottom: 20 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 10 }}>
          <Button block type="primary" htmlType="submit" className="login-btn">
            Sign Up
          </Button>
        </Form.Item>

        <div className="existing-user-text" style={{ textAlign: 'center', marginBottom: 0, color: 'white' }}>
          <span>Already have an account?</span>
          <hr style={{ width: '100%', margin: '0px 0' }} />
        </div>

        <Form.Item style={{ marginTop: 10 }}>
          <Button block type="default" onClick={() => navigate("/")} className="signup-btn">
            Login Now
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignupForm;