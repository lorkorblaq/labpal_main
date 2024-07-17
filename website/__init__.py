# import eventlet
# eventlet.monkey_patch(socket=True)
from datetime import timedelta
from flask import Flask
from .extensions import mail
from website.auth import auth
from website.settings import settings
from website.views import views
# from flask import session
# from website.celery_config import create_celery_app

def create_app():
    app = Flask(__name__)
    # Configuration settings
    app.config['SECRET_KEY'] = 'LVUC5jSkp7jjR3O-'
    app.config['MONGO_URI'] = "mongodb+srv://clinicalx:{password}@clinicalx.aqtbwah.mongodb.net/?retryWrites=true&w=majority"
    app.config['MAIL_SERVER'] = '51.195.190.75'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USERNAME'] = 'labpal@labpal.com.ng'
    app.config['MAIL_PASSWORD'] = '518Oloko.'
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_DEFAULT_SENDER'] = ('LabPal','labpal@labpal.com.ng')
    app.config['MAIL_DEBUG'] = True
    # app.config['SESSION_TYPE'] = 'redis'
    # app.config['SESSION_REDIS'] = redis_connection
    app.config['SESSION_PERMANENT'] = True
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_KEY_PREFIX'] = 'labpal'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=2)
    # app.config['CELERY_BROKER_URL'] = redis_connection
    # app.config['REDIS_URL'] = redis_connection

    # Initialize extensions
    
    # socketio.init_app(app)
    mail.init_app(app)
    # celery = create_celery_app(app)
    # with app.app_context():
    #     app.mail = mail
    #     try:
    #         with mail.connect() as conn:
    #             print("Connection established")
    #     except smtplib.SMTPException as e:
    #         print("Failed to establish connection")
    #         print(f"Error: {e}")
    #     except ConnectionRefusedError as e:
    #         print("Connection refused")
    #         print(f"Error: {e}")
    #     except Exception as e:
    #         print("An unexpected error occurred")
    #         print(f"Error: {e}")

    # Register blueprints
    app.register_blueprint(views, url_prefix="")
    app.register_blueprint(settings, url_prefix="/settings")
    app.register_blueprint(auth, url_prefix="")
    return app

# def get_lab_name():
#     if session.get('lab'):
#         return session.get('lab')