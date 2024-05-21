from flask_socketio import SocketIO
from flask_mail import Mail
import eventlet
from .redis_config import redis_client
eventlet.monkey_patch(socket=True)


mail = Mail()
# socketio = SocketIO()
socketio = SocketIO(message_queue='redis://localhost:6379/0')
print(socketio)

