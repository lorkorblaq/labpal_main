# celery -A website.celery_config.celery worker --pool=eventlet --loglevel=info -Q inventory
from ..extensions import socketio
from ..celery_config import celery
from ..db_clinicalx import client
from celery import shared_task

@celery.task()
def watch_inventory_changes(org_name, lab_name):
    org_db = client[f'{org_name}_db']
    pipeline = [{'$match': {'operationType': 'update'}}]
    while True:
        try:
            ITEMS_COLLECTION = org_db[f"{lab_name}_items"]
            with ITEMS_COLLECTION.watch(pipeline, full_document='updateLookup') as stream:
                print("watcher stocks")
                subject = "Stock Alert"
                for change in stream:
                    print(change)
                    if (
                        change['operationType'] == 'update' and
                        change['updateDescription']['updatedFields']['quantity'] <=
                        change['fullDocument']['reOrderLevel']
                    ):
                        item_name = change["fullDocument"]["item"]
                        stock_level = change["fullDocument"]["quantity"]
                        alert_message = f"{item_name} is below reorder level with {stock_level} vial(s) left, kindly restock"
                        socketio.emit('StaffNotifications', {'message': alert_message})
        except Exception as e:
            print(f"An error occurred: {e}")


# # @celery.task()
# # def chat_watcher():
# #     print("chat notification")
# #     # # socketio.emit('notifications', {'message': 'New message received'})
# #     print("New message received")
# #     pipeline = [{'$match': {'operationType': 'update'}}]
# #     while True:
# #         try:
# #             with ITEMS_COLLECTION.watch(pipeline, full_document='updateLookup') as stream:
# #                 print("watcher stocks")
# #         except Exception as e:
# #             print(f"An error occurred: {e}")