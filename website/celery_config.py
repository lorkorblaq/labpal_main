from celery import Celery
from .extensions import redis_client, redis_URL

celery = Celery(
    'main',
    backend=redis_URL,
    broker=redis_URL
)
celery.conf.update(
    task_routes={
        'website.celeryMasters.inventoryMaster.watch_inventory_changes': {'queue': 'inventory'},
        'website.celeryMasters.pickupMaster.watchCreatePickup': {'queue': 'createPickup'},
    },
    imports=('website.celeryMasters.inventoryMaster','website.celeryMasters.pickupMaster')
)

celery.conf.broker_connection_retry_on_startup = True