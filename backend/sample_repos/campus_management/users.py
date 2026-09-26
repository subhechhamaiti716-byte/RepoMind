import sqlite3
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
