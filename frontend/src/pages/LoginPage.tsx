// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoginFormValues, LoginResponse } from "../interfaces/LoginInterface";
import { saveToLocalStorage } from "../global/common";  // Import the utility function

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    const apiUrl = process.env.REACT_APP_API_HOST;
    if (!apiUrl) {
      message.error("API host not configured");
      setLoading(false);
      return;
    }

    try {
      const response: LoginResponse = await axios.post(`${apiUrl}/api/users/login`, values);

      if (response && response.data) {
        message.success("Login successful");
        saveToLocalStorage("token", response.data.token);
        saveToLocalStorage("active", String(response.data.user.active));

        navigate("/");
      } else {
        message.error("Unexpected response structure");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error("Invalid credentials");
        } else {
          message.error("An error occurred. Please try again later.");
        }
      } else {
        console.error("Unexpected error:", error);
        message.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card title="Login" style={{ width: 400 }}>
        <Form name="login" onFinish={onFinish} layout="vertical">
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
            Don’t have an account? <a href="/signup">Sign up</a>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
