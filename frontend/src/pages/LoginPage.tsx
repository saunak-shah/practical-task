// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoginFormValues, LoginResponse } from "../interfaces/LoginInterface";
import { saveToLocalStorage } from "../global/common";  // Import the utility function
// import crypto from 'crypto';
import CryptoJS from 'crypto-js';


async function fetchProtectedResource() {
  try {
    let response = await fetch('http://localhost:5000/protected-resource', {
      method: 'GET',  // Explicitly set to avoid preflight request
      credentials: 'include'  // if cookies or credentials are needed
    });

    if (response.status === 401) {
      // Get nonce from server's response header
      const authHeader: any = response.headers.get('www-authenticate');
      if (!authHeader) throw new Error("WWW-Authenticate header not found");

      const nonce = authHeader.match(/nonce="([^"]+)"/)[1];
      const username = "username";
      const password = "password";

      // Hash password and generate response hash
      const passwordHash = CryptoJS.SHA256(password).toString();
      const cnonce = CryptoJS.lib.WordArray.random(16).toString();
      
      const ha1 = `${username}:${nonce}:${cnonce}:${passwordHash}`;
      const ha2 = `GET:/protected-resource`;
      const responseHash = CryptoJS.MD5(`${CryptoJS.MD5(ha1)}:${nonce}:${cnonce}:${CryptoJS.MD5(ha2)}`).toString();

      // Attempt authentication with generated hash
      const authString = `Digest username="${username}", realm="Protected Area", nonce="${nonce}", uri="/protected-resource", response="${responseHash}", opaque="2929b8e007e9c3edd69d915068815d71", qop=auth, nc=00000001, cnonce="${cnonce}"`;
      
      response = await fetch('http://localhost:5000/protected-resource', {
        method: 'GET',
        headers: { Authorization: authString }
      });
    }

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      console.error('Access denied');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


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
      fetchProtectedResource()
      // await loginWithDigest(values.emailID, values.password)
      /* const response: LoginResponse = await axios.post(`${apiUrl}/api/users/login`, values);

      if (response && response.data) {
        message.success("Login successful");
        saveToLocalStorage("token", response.data.token);
        saveToLocalStorage("active", String(response.data.user.active));

        navigate("/");
      } else {
        message.error("Unexpected response structure");
      } */
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
