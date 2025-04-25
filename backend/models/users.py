from config import users_collection
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime,timezone
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

def get_user_by_id(uid):
    return users_collection.find_one({"_id": ObjectId(uid)})

def update_password(uid, current_pw, new_pw):
    user = get_user_by_id(uid)
    if not user or not check_password_hash(user["password"], current_pw):
        return False
    users_collection.update_one(
        {"_id": ObjectId(uid)},
        {"$set": {"password": generate_password_hash(new_pw)}}
    )
    return True