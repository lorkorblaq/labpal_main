from flask_redis import FlaskRedis
from flask import Flask
# app = Flask(__name__)
import redis

# redis_client = FlaskRedis(app)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
if b'65ebaa02968dd0cc263cda6b' in redis_client.hkeys('users'):
    print(f"User ID present in users hash.")
# from flask_socketio import SocketIO
# from flask_mail import Mail
# import eventlet
# eventlet.monkey_patch(socket=True)

# mail = Mail()
# socketio = SocketIO(message_queue='redis://localhost:6379/0')