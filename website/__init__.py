from flask import Flask, jsonify, request, url_for, redirect
from functools import wraps
from flask_redis import FlaskRedis# import jwt
from .redis_config import redis_client
# import os

from flask_mail import Mail
from datetime import timedelta
from celery_config import celery

from website.events import socketio
# from flask_socketio import SocketIO

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
# from dotenv import load_dotenv, find_dotenv
import os

password="518Oloko."
uri_development = "mongodb://localhost:27017"
uri_production = f"mongodb+srv://clinicalx:{password}@clinicalx.aqtbwah.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri_production, server_api=ServerApi('1'))
try:
    client.admin.command('ping')
    print("You successfully connected to Clinicalx MongoDB!")
except Exception as e:  
    print(f"error in connection:{e}")

db_clinical = client.clinicalx

app = Flask(__name__)
mail = Mail(app)
def create_app():
    socketio.init_app(app)
    from .views import views
    from .auth import auth
    from .settings import settings

    # from .notification import notification
    app.config['SECRET_KEY'] = 'LVUC5jSkp7jjR3O-'
    app.config['MAIL_SERVER'] = 'mail.digitalinkx.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USERNAME'] = 'alertclinicalx@digitalinkx.com'
    app.config['MAIL_PASSWORD'] = '518Oloko.'
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_DEFAULT_SENDER'] = ('Clinicalx','alertclinicalx@digitalinkx.com')
    app.config['SESSION_TYPE'] = 'redis'  # You can change this to other backends (e.g., 'redis')
    app.config['SESSION_REDIS'] = 'redis://localhost:6379/0'  # Replace with your Redis server URL  
    app.config['SESSION_PERMANENT'] = True  # Session will not expire on browser close
    app.config['SESSION_USE_SIGNER'] = True  # Sign the session cookie for added security
    app.config['SESSION_KEY_PREFIX'] = 'labpal'  # Change this to a unique string
    app.config['PERMANENT_SESSION_LIFETIME'] =  timedelta(hours=2)  # Set the session timeout
    # app.config['SESSION_FILE_DIR'] = '/tmp/sessions'  # Directory for storing session data

    app.config.update(
    CELERY_BROKER_URL='pyamqp://blaq:518Oloko.@localhost:5672//',
    CELERY_RESULT_BACKEND='rpc://'
    )
    celery.conf.update(app.config)


    
    # from .dashboard import dash
    # print(app.config)

    app.register_blueprint(views, url_prefix="")
    app.register_blueprint(settings, url_prefix="/settings")
    # app.register_blueprint(dash, url_prefix="/dashboard")

    app.register_blueprint(auth, url_prefix="")
    return app
