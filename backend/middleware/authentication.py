from functools import wraps
from flask import request, jsonify, redirect
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from backend.config import redis_client

def authentication(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if the session cookie exists.
        session_id = request.cookies.get("session_id")
        if not session_id or not redis_client.exists(session_id):
            # If no valid session, redirect to login.
            return redirect("/auth/login")
        
        # Optionally, attach session data to the request here.
        return f(*args, **kwargs)
    
    return decorated_function
