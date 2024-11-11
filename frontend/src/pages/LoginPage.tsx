import React, { useState } from "react";
import axios from "axios";
import crypto from "crypto";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Helper function to generate the Digest Authentication hash
  const generateDigestHash = (username: string, password: any, realm: string, nonce: string, method: string, uri: string) => {
    const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex');
    const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');
    return crypto.createHash('md5').update(`${ha1}:${nonce}:${ha2}`).digest('hex');
  };

  const handleLogin = async () => {
    const username = email;
    const realm = 'Test'; // The same as in the server-side
    const nonce = 'gu7dt$hwl@1s'; // Get this from the `WWW-Authenticate` header from the server
    const method = 'POST'; // The HTTP method being used (POST in this case)
    const uri = '/api/users/login'; // The request URI
  
    // Generate the response hash using the helper function
    const responseHash = generateDigestHash(username, password, realm, nonce, method, uri);
  
    // Make the request with the Digest Authentication header
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', {}, {
        headers: {
          'Authorization': `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${responseHash}", qop="auth"`
        }
      });
      console.log(res.data);
    } catch (error) {
      console.error("Authentication failed", error);
    }
  };
  

  return (
    <div>
      <input 
        type="emailID" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password" 
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;
