# # celery -A website.celery_config.celery worker --pool=eventlet --loglevel=info -Q inventory
# from celery import shared_task
# from ..db_clinicalx import db_org_users, client
# from ..extensions import socketio
# from ..celery_config import celery
# from flask import session
# # from main import app

# @shared_task
# def watch_inventory_changes(lab_name):
#     pipeline = [{'$match': {'operationType': 'update'}}]
#     while True:
#         try:
#             ITEMS_COLLECTION = lab_name["items"]
#             with ITEMS_COLLECTION.watch(pipeline, full_document='updateLookup') as stream:
#                 print("watcher stocks")
#                 subject = "Stock Alert"
#                 for change in stream:
#                     print(change)
#                     if (
#                         change['operationType'] == 'update' and
#                         change['updateDescription']['updatedFields']['in stock'] <=
#                         change['fullDocument']['reOrderLevel']
#                     ):
#                         item_name = change["fullDocument"]["item"]
#                         stock_level = change["fullDocument"]["in stock"]
#                         alert_message = f"{item_name} is below reorder level with {stock_level} vial(s) left, kindly restock"
#                         socketio.emit('notifications', {'message': alert_message})
#                         # print(alert_message)  # Print for debugging purposes
#         except Exception as e:
#             print(f"An error occurred: {e}")


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