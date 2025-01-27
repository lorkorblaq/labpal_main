import eventlet
eventlet.monkey_patch(socket=True)
from flask_mail import Mail
from flask_socketio import SocketIO
# from .redis_config import redis_client
from flask_socketio import SocketIO, send, emit
from redis import Redis
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())
password = os.getenv('PASSWORD')
redis_URL = os.getenv('REDIS_URL')
# redis_URL = os.getenv('REDIS_URL_LOCAL')

mail = Mail()
# socketio = SocketIO()
redis_client = Redis.from_url(redis_URL)

socketio = SocketIO(cors_allowed_origins="*", transports=['websocket','polling'], message_queue=redis_URL)
# socketio = SocketIO(cors_allowed_origins="*", transports=['websocket','polling'])

print('me',socketio)
