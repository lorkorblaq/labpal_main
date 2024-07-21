from datetime import timedelta
from flask import Flask
from .extensions import mail, socketio, redis_URL
from website.auth import auth
from website.settings import settings
from website.views import views
from flask_session import Session  
# from website.celery_config import make_celery
import redis
from dotenv import load_dotenv, find_dotenv
import os
load_dotenv(find_dotenv())
mongo_url = os.getenv('MONGO_URL')
secret_key = os.getenv('SECRET_KEY')
password = os.getenv('PASSWORD')
# redis_URL = 'redis://default:PghQh8AjOXYkUIMBrCJare4INQ89j5xR@redis-11786.c326.us-east-1-3.ec2.redns.redis-cloud.com:11786/0'
# redis_URL = 'redis://redis-server:6379/0' for docker
# redis_URL = 'redis://:518Oloko.@localhost:6379/0'
def create_app():
    app = Flask(__name__)
    # Configuration settings
    app.config['SECRET_KEY'] = secret_key
    app.config['MONGO_URI'] = "mongodb+srv://clinicalx:{password}@clinicalx.aqtbwah.mongodb.net/?retryWrites=true&w=majority"
    app.config['MAIL_SERVER'] = '51.195.190.75'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USERNAME'] = 'labpal@labpal.com.ng'
    app.config['MAIL_PASSWORD'] = password
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_DEFAULT_SENDER'] = ('LabPal','labpal@labpal.com.ng')
    app.config['MAIL_DEBUG'] = True
    app.config['SESSION_TYPE'] = 'redis'
    app.config['SESSION_REDIS'] = redis.from_url(redis_URL)
    app.config['SESSION_PERMANENT'] = True
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_KEY_PREFIX'] = 'labpal_session:'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=2)
    # app.config['CELERY_BROKER_URL'] = redis_connection
    app.config['REDIS_URL'] = redis_URL


    app.config['CELERY_BROKER_URL'] = redis_URL
    app.config['CELERY_RESULT_BACKEND'] = redis_URL

    Session(app)    

    socketio.init_app(app)
    mail.init_app(app)
    
    # celery = make_celery(app)


    # Register blueprints
    app.register_blueprint(views, url_prefix="")
    app.register_blueprint(settings, url_prefix="/settings")
    app.register_blueprint(auth, url_prefix="")
    return app

# def get_lab_name():
#     if session.get('lab'):
#         return session.get('lab')