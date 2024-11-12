// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoginFormValues, LoginResponse } from "../interfaces/LoginInterface";
import { saveToLocalStorage } from "../global/common";
import crypto from 'crypto';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  /* const getProtectedResource = async (): Promise<Response> => {
    return fetch('http://localhost:5000/protected-resource', {
        method: 'GET',
        credentials: 'include', // Important for sending cookies or authentication headers
    });
  }; */
  const loginWithDigest = async (username: string, password: string) => {
    const response = await axios.get('http://localhost:5000/protected-resource', {
      headers: { 'Authorization': `Digest username="${username}"` },
      validateStatus: (status) => status === 401 || status === 200 // Allow 401 and 200 statuses
    });
  
    if (response.status === 401) {
      // Extract the nonce from the WWW-Authenticate header
      const nonce = response.headers['www-authenticate'].match(/nonce="([^"]+)"/)[1];
      console.log(nonce)
      const ha1 = crypto.createHash('md5').update(`${username}:${'Protected Area'}:${password}`).digest('hex');
      console.log("ha1ha1ha1ha1ha1ha1ha1ha1ha1ha1", ha1)

      const ha2 = crypto.createHash('md5').update(`GET:/protected-resource`).digest('hex');
      console.log("ha2ha2ha2ha2ha2ha2ha2ha2ha2ha2ha2ha2", ha2)
      
      const responseHash = crypto.createHash('md5').update(`${ha1}:${nonce}:00000001:${ha2}`).digest('hex');
      console.log("responseHashresponseHash", responseHash)
      
      const result = await axios.get('http://localhost:5000/protected-resource', {
        headers: {
          'Authorization': `Digest username="${username}", realm="Protected Area", nonce="${nonce}", uri="/protected-resource", response="${responseHash}", qop="auth", nc="00000001", cnonce="cnonce123"`
        }
      });
  
      if (result.status === 200) {
        console.log("Access granted to protected resource.");
      }
    }
  };
  

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    const apiUrl = process.env.REACT_APP_API_HOST;
    if (!apiUrl) {
      message.error("API host not configured");
      setLoading(false);
      return;
    }
    try {

      
    const res = await loginWithDigest(values.emailID, values.password);
    console.log("res=====================", res)



    // const res = await getProtectedResource();


      
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
