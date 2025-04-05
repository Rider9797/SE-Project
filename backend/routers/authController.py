import os
import json
import redis
import os
from datetime import timedelta
from flask import Blueprint, request, jsonify, make_response, redirect
from flask_jwt_extended import create_access_token
# from flask_login import login_user
from models.users import create_user, verify_user
from config import redis_client

auth_routes = Blueprint("auth_routes", __name__)

# Configuration variables
# SECRET_KEY = os.getenv("SECRET_KEY", "your_default_secret")  # Should be set in .env
# ALGORITHM = "HS256"  # This is used by JWT functions if needed elsewhere
SESSION_DURATION = 3600  # 1 hour in seconds
SESSION_COOKIE_NAME = "session_id"

# def generate_csrf_token():
#     import secrets
#     return secrets.token_hex(16)

@auth_routes.route("/signup", methods=["POST"])
def signup():
    data = request.json
    required_fields = ["username", "email", "password", "name"]
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing fields"}), 400

    user_id = create_user(data["username"], data["email"], data["password"], data["name"])
    if not user_id:
        return jsonify({"msg": "Email already in use"}), 400

    return jsonify({"msg": "User registered", "user_id": user_id}), 201

@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Validate user credentials
    user = verify_user(email, password)
    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    user_id = str(user["_id"])


    # login_user(user, remember = True)
    # Generate a JWT token (for your internal use if needed)
    # access_token = create_access_token(identity=user_id, expires_delta=timedelta(seconds=25))
    
    
    # Here, we directly use user_id (no need to decode the token)
    username = user["username"] 
    access_token = create_access_token(identity=user_id, expires_delta=timedelta(minutes=25))
    # Create a session in Redis
    session_id = os.urandom(16).hex()
    session_data = {
        "username": username,
        "access_token": access_token
    }
    redis_client.setex(session_id, SESSION_DURATION, json.dumps(session_data))

    # Create a response indicating successful login and set a cookie with the session ID
    response = make_response(jsonify({"msg": "Login successful", "access_token": access_token}), 200)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        max_age=SESSION_DURATION,
        httponly=True,
        secure=True,
        samesite="None"
    )
    

    # response = make_response(redirect("/dummy"))
    # response.set_cookie(
    #     key=SESSION_COOKIE_NAME,
    #     value=session_id,
    #     max_age=SESSION_DURATION,
    #     httponly=True,
    #     secure=True,
    #     samesite="Lax"
    # )


    return response

@auth_routes.route("/logout", methods=["POST"])
def logout():
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id:
        redis_client.delete(session_id)
    response = make_response(jsonify({"msg": "Logged out successfully"}), 200)
    response.delete_cookie(SESSION_COOKIE_NAME)
    return response
