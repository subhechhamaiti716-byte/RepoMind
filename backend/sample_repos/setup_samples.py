import os
from pathlib import Path

def create_sample_repositories(base_dir: Path):
    campus_dir = base_dir / "campus_management"
    campus_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Config with hardcoded secret
    (campus_dir / "config.py").write_text("""# Application Configuration
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASSWORD = "SuperSecretPassword123!"  # Security: Hardcoded DB credentials
JWT_SECRET = "campus_jwt_secret_key_998877"
API_KEY = "sk-live-982374982374982374923847"
DEBUG = True
""", encoding="utf-8")

    # 2. Users Service with SQL Injection & Coupling
    (campus_dir / "users.py").write_text("""import sqlite3
from database import get_connection
import payment # Circular dependency

def get_user_by_id(user_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    # Critical Security: Direct string concatenation SQL Injection
    query = "SELECT * FROM users WHERE id = '" + user_id + "' AND is_active = 1"
    cursor.execute(query)
    user = cursor.fetchone()
    return user

def authenticate_user(username, password):
    conn = get_connection()
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    user = cursor.fetchone()
    if user:
        payment.record_login_rewards(user[0])
    return user

def heavy_user_computation(data):
    # Code smell: high cyclomatic complexity
    res = 0
    for i in range(len(data)):
        if data[i] > 10:
            if data[i] % 2 == 0:
                res += data[i] * 2
            elif data[i] % 3 == 0:
                res += data[i] * 3
            else:
                res += data[i]
        elif data[i] < 0:
            if data[i] < -10:
                res -= data[i] * 2
            else:
                res -= 1
        else:
            res += 0
    return res
""", encoding="utf-8")

    # 3. Payment Service with circular dependency to users
    (campus_dir / "payment.py").write_text("""import users # Circular dependency: users -> payment -> users
from database import get_connection

def process_tuition_payment(user_id, amount, card_number):
    user = users.get_user_by_id(user_id)
    if not user:
        raise ValueError("User not found")
    
    # Insecure logging of card details
    print(f"Processing payment for card: {card_number} with amount {amount}")
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO transactions (user_id, amount) VALUES (?, ?)", (user_id, amount))
    conn.commit()
    return {"status": "success", "amount": amount}

def record_login_rewards(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET points = points + 10 WHERE id = ?", (user_id,))
    conn.commit()
""", encoding="utf-8")

    # 4. Database connector
    (campus_dir / "database.py").write_text("""import sqlite3

def get_connection():
    conn = sqlite3.connect("campus.db")
    return conn
""", encoding="utf-8")

    # 5. Requirements.txt with known vulnerable dependency version
    (campus_dir / "requirements.txt").write_text("""fastapi==0.95.0
requests==2.25.1
pyyaml==5.3.1
jinja2==2.11.3
urllib3==1.26.4
pydantic==1.10.7
cryptography==3.3.2
""", encoding="utf-8")

    # 6. Frontend auth file with bad practices
    fe_dir = campus_dir / "frontend" / "src"
    fe_dir.mkdir(parents=True, exist_ok=True)
    
    (fe_dir / "Login.tsx").write_text("""import React, { useState } from 'react';
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
""", encoding="utf-8")

    (fe_dir / "api.ts").write_text("""import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
});

export const fetchUsers = () => apiClient.get('/users');
export const makePayment = (data: any) => apiClient.post('/payment', data);
""", encoding="utf-8")

    (campus_dir / "package.json").write_text("""{
  "name": "campus-management-frontend",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^0.21.1",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "lodash": "4.17.15"
  }
}
""", encoding="utf-8")

create_sample_repositories(Path(__file__).resolve().parent)
