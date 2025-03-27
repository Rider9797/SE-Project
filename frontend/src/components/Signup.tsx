import React from 'react';
import { Button, Form, Input } from 'antd';
import axios from 'axios';

const SignupForm: React.FC = () => {
  const onFinish = async (values: any) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/signup', values);
      console.log('Signup success:', response.data);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <Form name="signup" onFinish={onFinish} style={{ maxWidth: 400 }}>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please input your name!' }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="username"
        label="Username"
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="email"
        label="E-mail"
        rules={[{ type: 'email', required: true, message: 'Please input a valid email!' }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please input your password!' }]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>
      
      <Form.Item
        name="confirm"
        label="Confirm Password"
        dependencies={['password']}
        hasFeedback
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match!'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit">Sign Up</Button>
      </Form.Item>
    </Form>
  );
};

export default SignupForm;
