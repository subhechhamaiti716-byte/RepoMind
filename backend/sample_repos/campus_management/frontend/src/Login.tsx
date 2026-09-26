import React, { useState } from 'react';
import axios from 'axios';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Insecure token storage & plain logging
    console.log("Submitting login credentials: ", email, password);
    const res = await axios.post('/api/v1/auth/login', { email, password });
    localStorage.setItem('auth_token', res.data.token);
  };

  return (
    <div className="login-form">
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
};
