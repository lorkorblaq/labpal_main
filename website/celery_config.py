from celery import Celery
# to run celery
# celery -A celery_config.celery worker --pool=solo --loglevel=info
# celery -A website.celery_config.celery worker --pool=solo --loglevel=info -Q chat_watcher/inventory
# CELERY_BROKER_URL = 'pyamqp://blaq:518Oloko.@localhost:5672//'
# CELERY_RESULT_BACKEND = 'rpc://'
CELERY_BROKER_URL = 'redis://localhost:6379//'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'

celery = Celery(
    'main',
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
)
celery.conf.update(
    task_routes={
        'website.chatMaster.chat_watcher': {'queue': 'chat'},
        'website.taskMaster.watch_inventory_changes': {'queue': 'inventory'},
    },
    imports=('website.taskMaster','website.chatMaster')
)

# def make_celery(app):
#     celery = Celery(
#         app.import_name,
#         broker=app.config['CELERY_BROKER_URL'],
#         backend=app.config['CELERY_RESULT_BACKEND']
#     )

#     celery.conf.update(app.config)
#     return celery
# print(celery)
celery.conf.broker_connection_retry_on_startup = True
