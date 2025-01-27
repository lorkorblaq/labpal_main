from datetime import timedelta
from flask import Flask
from .extensions import mail, socketio, redis_URL
from .auth import auth
from .authClient import authClient
from .settings import settings
from .views import views
from .viewsClient import viewsClient

from flask_session import Session  
# from website.celery_config import make_celery
import redis
from dotenv import load_dotenv, find_dotenv
import os
load_dotenv(find_dotenv())
mongo_url = os.getenv('URI_PRODUCTION')
# mongo_url = os.getenv('URI_DEVELOPMENT')

secret_key = os.getenv('SECRET_KEY')
password = os.getenv('PASSWORD')
mail_password = os.getenv('MAIL_PASSWORD')
def create_app():
    app = Flask(__name__)
    # Configuration settings
    app.config['SECRET_KEY'] = secret_key
    app.config['MONGO_URI'] = mongo_url
    
    # Email configuration for AWS SES SMTP
    app.config['MAIL_SERVER'] = 'email-smtp.eu-west-1.amazonaws.com'
    app.config['MAIL_PORT'] = 465  # TLS Wrapper port
    app.config['MAIL_USERNAME'] = 'AKIAYDWHTGGLELRQDSFC'  # Replace with your SMTP username
    app.config['MAIL_PASSWORD'] = mail_password  # Replace with your SMTP password
    app.config['MAIL_USE_SSL'] = True  # Using SSL on port 465
    app.config['MAIL_USE_TLS'] = False  # SSL and TLS are mutually exclusive here
    app.config['MAIL_DEFAULT_SENDER'] = ('LabPal', 'noreply@labpal.com.ng')
    app.config['MAIL_SUPPRESS_SEND'] = False
    app.config['MAIL_ASCII_ATTACHMENTS'] = False
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
    app.register_blueprint(viewsClient, url_prefix="")
    app.register_blueprint(settings, url_prefix="/settings")
    app.register_blueprint(auth, url_prefix="")
    app.register_blueprint(authClient, url_prefix="/client")
    return app

# def get_lab_name():
#     if session.get('lab'):
#         return session.get('lab')



# docker tag lorkorblaq/labpal_redis:latest public.ecr.aws/a3h1q7q4/labpal/redis:latest

