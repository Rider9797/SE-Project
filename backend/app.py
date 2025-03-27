from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from dotenv import load_dotenv
import os
from config import SECRET_KEY, redis_client  # import config variables and clients
from routers.authController import auth_routes

load_dotenv()  # Ensure env variables are loaded

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
CORS(app)

jwt = JWTManager(app)

app.register_blueprint(auth_routes, url_prefix='/auth')

if __name__ == '__main__':
    app.run(debug=True)

