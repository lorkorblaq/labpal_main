from celery import Celery
from .extensions import redis_client, redis_URL

celery = Celery(
    'main',
    backend=redis_URL,
    broker=redis_URL
)
celery.conf.update(
    task_routes={
        'website.celeryMasters.chatMaster.chat_watcher': {'queue': 'chat'},
        'website.celeryMasters.inventoryMaster.watch_inventory_changes': {'queue': 'inventory'},
    },
    imports=('website.celeryMasters.inventoryMaster','website.celeryMasters.chatMaster')
)

celery.conf.broker_connection_retry_on_startup = True