# from functools import wraps
# from flask import request, jsonify, redirect
# from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
# from config import redis_client

# def authentication(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         # Check if the session cookie exists.
#         session_id = request.cookies.get("session_id")
#         if not session_id or not redis_client.exists(session_id):
#             # If no valid session, redirect to login.
#             return redirect("/auth/login")
        
#         # Optionally, attach session data to the request here.
#         return f(*args, **kwargs)
    
#     return decorated_function
from functools import wraps
from flask import request, jsonify,redirect
from config import redis_client

def get_current_user():
    """Retrieves the user session from Redis using session ID from cookies."""
    
    session_id = request.cookies.get("session_id")  # Extract session ID from cookies
    if not session_id:
        return None  # No session means the user is not authenticated

    user = redis_client.get(session_id)
    if not user:
        return None  # Invalid or expired session

    return eval(user)  # Convert the stored string back to a Python dictionary

def authenticate_user(f):
    """Decorator to enforce authentication on protected routes."""
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return redirect("/auth/login")  # Return 401 if not authenticated
        return f(user, *args, **kwargs)  # Pass user object to the actual function

    return decorated_function
