from flask import Flask
from flask_jwt_extended import JWTManager

import dotenv
from dotenv import load_dotenv
import os
from config import SECRET_KEY, redis_client  # import config variables and clients
from routers.authController import auth_routes

load_dotenv()  # Ensure env variables are loaded

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

jwt = JWTManager(app)

app.register_blueprint(auth_routes, url_prefix='/auth')


try:
    redis_client.ping()
    print("✅ Successfully connected to Redis!")
except Exception as e:
    print(f"❌ Redis Connection Error: {e}")

if __name__ == '__main__':
    app.run(debug=True)

