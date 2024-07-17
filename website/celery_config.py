# import eventlet
# eventlet.monkey_patch()
from celery import Celery
from .redis_config import redis_client,redis_connection
from flask import Flask
# to run celery
# celery -A celery_config.celery worker --pool=solo --loglevel=info
# celery -A website.celery_config.celery worker --pool=eventlet --loglevel=info -Q inventory
# CELERY_BROKER_URL = 'pyamqp://blaq:518Oloko.@localhost:5672//'
# CELERY_RESULT_BACKEND = 'rpc://'
# CELERY_BROKER_URL = redis_connection
# CELERY_RESULT_BACKEND = redis_connection
    
# celery = Celery(
#     'main',
#     broker=CELERY_BROKER_URL,
#     backend=CELERY_RESULT_BACKEND,
# )
# celery.conf.update(
#     task_routes={
#         'website.celeryMasters.chatMaster.chat_watcher': {'queue': 'chat'},
#         'website.celeryMasters.inventoryMaster.watch_inventory_changes': {'queue': 'inventory'},
#     },
#     imports=('website.celeryMasters.inventoryMaster','website.celeryMasters.chatMaster')
# )


# def create_celery_app(app: Flask) -> Celery:
#     celery = Celery(
#         app.import_name,
#         backend=app.config['CELERY_RESULT_BACKEND'],
#         broker=app.config['CELERY_BROKER_URL']
#     )
#     celery.conf.update(app.config)
#     celery.autodiscover_tasks(['website.celeryMasters'], force=True)
    
#     class ContextTask(celery.Task):
#         def __call__(self, *args, **kwargs):
#             with app.app_context():
#                 return self.run(*args, **kwargs)
                
#     celery.Task = ContextTask
#     return celery

# # celery.conf.broker_connection_retry_on_startup = True