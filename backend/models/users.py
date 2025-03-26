from config import users_collection
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson.objectid import ObjectId

def create_user(username, email, password, name):
    # Check if the email already exists
    if users_collection.find_one({"email": email}):
        return None  # Email already in use
    
    # Hash the password
    hashed_password = generate_password_hash(password)
    user = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "name": name,
        "created_at": datetime.now(timezone.utc)
    }
    result = users_collection.insert_one(user)
    return str(result.inserted_id)

def get_user_by_email(email):
    return users_collection.find_one({"email": email})

def verify_user(email, password):
    user = get_user_by_email(email)
    if user and check_password_hash(user["password"], password):
        return user
    return None
