import users # Circular dependency: users -> payment -> users
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
