from .extensions import socketio
from flask_socketio import send, emit
from flask import request, session
from .redis_config import redis_client
from datetime import datetime

# users = []
# redis_client.set('foo', 'car')
# a=redis_client.get('foo')
# print(a)

@socketio.on('connect')
def handle_connect():
    print('Client events connected')
    user_id = session.get('id')  # Get the user ID from the session
    session_id = request.sid  # Get the session ID from the request
    
    # Check if user_id is already present in the 'users' hash
    if user_id in redis_client.hkeys('users'):
        print(f"User ID '{user_id}' already present in users hash.")
    else:
        # If user_id is not present, add it to the 'users' hash
        redis_client.hset('users', user_id, session_id)
        print(f"Added User ID '{user_id}' to users hash.")
    
    # Store session ID and user ID in the 'sessions' hash
    redis_client.hset('sessions', session_id, user_id)

    print('Users:', redis_client.hgetall('users'))


# @socketio.on('group_message')
# def handle_new_message(data):
#     print('New message:', data)
#     emit('group_chat', {'data': data}, broadcast=True)

@socketio.on('private_message')
def handle_private_message(data):
    payload = data['payload']
    recipient_id = data['recipient_id']
    sender_session_id = request.sid
    payload = {'senderName':session.get('name'), 
               'senderID':session.get('id'),
               'message':payload, 
               'timestamp':datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    # Get the recipient's session ID from the 'users' hash using their user ID
    recipient_session_id = redis_client.hget('users', recipient_id)
    print(f"Recipient ID: {recipient_id}, Recipient Session ID: {recipient_session_id}")

    if recipient_session_id:
        # Process when the recipient ID exists in the 'users' hash 
        emit('priv_chat', payload, room=[sender_session_id, recipient_session_id.decode('utf-8')])
    else:
        # Handle the case when the recipient ID does not exist in the 'users' hash
        print(f"Recipient ID '{recipient_id}' not found in users hash")


