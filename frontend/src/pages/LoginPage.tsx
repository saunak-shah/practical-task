// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(true);

  const navigate = useNavigate();  // Hook to navigate after login

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response: any = await axios.post("http://localhost:5000/api/users/login", values);
      message.success("Login successful");
      localStorage.setItem("token", response.data.token); // Save token in local storage
      localStorage.setItem("active", response.data.user.active);

      console.log(response.data)
      if(response.data.user.active){
        setActive(true);
      } else{
        setActive(false);
      }

      navigate('/') // Navigate to home page after successful login
    } catch (error) {
      message.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card title="Login" style={{ width: 400 }}>
        <Form name="login" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="emailID"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>
          <Form.Item>
            Don't have an account? <a href="/signup">Sign up</a>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
