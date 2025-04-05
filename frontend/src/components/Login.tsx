import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Flex } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoImage from "./assets/Frame.svg";
import LogoWord from "./assets/Note Genius.svg";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/auth/login",
        values
      );
      console.log("Login Successful:", response.data);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Failed:", error);
      alert("Login failed. Check credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="logo-wrapper">
        <img src={LogoImage} alt="Logo" className="login-logo" />
        <img src={LogoWord} alt="Logo-Word" className="login-logo-word" />
      </div>
      <Form
        name="login"
        initialValues={{ remember: true }}
        style={{ maxWidth: 360 }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Please input your Email!" }]}
          style={{ marginBottom: 10 }}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
          style={{ marginBottom: 20 }}
        >
          <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a href="#" className="forgot-password-link">
              Forgot password
            </a>
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
    </div>
  );
};

export default Login;