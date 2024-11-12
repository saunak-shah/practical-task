// src/pages/SignUpPage.tsx
import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SignUpFormValues } from "../interfaces/SignUpInterface";

const SignUpPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: SignUpFormValues) => {
    setLoading(true);

    const apiUrl = process.env.REACT_APP_API_HOST;
    if (!apiUrl) {
      message.error("API host not configured");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${apiUrl}/api/users/signup`, values);
      message.success("Sign Up successful!");
      navigate("/login");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.status === 400 ? "Invalid data provided" : "Error during Sign Up";
        message.error(errorMessage);
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
      <Card title="Sign Up" style={{ width: 400 }}>
        <Form name="signup" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: "Please input your full name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="emailID"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[{ required: true, message: "Please input your phone number!" }]}
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
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[{ required: true, message: "Please confirm your password!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign Up
            </Button>
          </Form.Item>
          <Form.Item>
            Already have an account? <a href="/login">Login</a>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SignUpPage;
