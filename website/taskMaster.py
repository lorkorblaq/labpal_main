from celery import shared_task
from .db_clinicalx import db
from .extensions import socketio
from .celery_config import celery
# from .mailer import mailer
# from .mailer import mailer
# from celery import shared_task

ITEMS_COLLECTION = db['items']
# # items = ITEMS_COLLECTION.find()
# app, celery = create_app()
@celery.task()
def watch_inventory_changes():
    pipeline = [{'$match': {'operationType': 'update'}}]
    while True:
        try:
            with ITEMS_COLLECTION.watch(pipeline, full_document='updateLookup') as stream:
                print("watcher stocks")
                subject = "Stock Alert"
                for change in stream:
                    print(change)
                    if (
                        change['operationType'] == 'update' and
                        change['updateDescription']['updatedFields']['in stock'] <=
                        change['fullDocument']['reOrderLevel']
                    ):
                        item_name = change["fullDocument"]["item"]
                        stock_level = change["fullDocument"]["in stock"]
                        alert_message = f"{item_name} is below reorder level with {stock_level} vial(s) left, kindly restock"
                        socketio.emit('notifications', {'message': alert_message})
                        # print(alert_message)  # Print for debugging purposes
        except Exception as e:
            print(f"An error occurred: {e}")
