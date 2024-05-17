from celery import shared_task
from .db_clinicalx import db
from .extensions import socketio
from .celery_config import celery


ITEMS_COLLECTION = db['items']

@celery.task()
def chat_watcher():
    print("chat notification")
    # socketio.emit('notifications', {'message': 'New message received'})
    print("New message received")

    pipeline = [{'$match': {'operationType': 'update'}}]
    while True:
        try:
            with ITEMS_COLLECTION.watch(pipeline, full_document='updateLookup') as stream:
                print("watcher stocks")

        except Exception as e:
            print(f"An error occurred: {e}")