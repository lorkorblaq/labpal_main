from celery import Celery
# to run celery
# celery -A celery_config.celery worker --pool=solo --loglevel=info
# CELERY_BROKER_URL = 'pyamqp://blaq:518Oloko.@localhost:5672//'
# CELERY_RESULT_BACKEND = 'rpc://'
CELERY_BROKER_URL = 'redis://localhost:6379//'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'

celery = Celery(
    'taskMaster', 
    broker=CELERY_BROKER_URL, 
    backend=CELERY_RESULT_BACKEND,
    include=['website.taskMaster']
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
