from celery import Celery
# to run celery
# celery -A celery_config.celery worker --loglevel=info
CELERY_BROKER_URL = 'pyamqp://blaq:518Oloko.@localhost:5672//'
CELERY_RESULT_BACKEND = 'rpc://'

celery = Celery(
    'main', 
    broker=CELERY_BROKER_URL, 
    backend=CELERY_RESULT_BACKEND,
    include=['website.taskMaster']
)
# celery.conf.broker_connection_retry_on_startup = True
