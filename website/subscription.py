import logging
from .db_clinicalx import db_labpal
from pywebpush import webpush, WebPushException
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
VAPID_CLAIMS = {"sub": "mailto:labpal@labpal.com.ng"}
valid_pub_key = os.getenv('VAPID_PUB_KEY')
valid_pri_key = os.getenv('VAPID_PRI_KEY')

subscriptions = db_labpal['subscriptions']
def send_push_notifications(data):
    subscription_list = list(subscriptions.find({}))
    try:
        subscription_list = list(subscriptions.find({}))
    except Exception as e:
        print(f"Failed to fetch subscriptions: {e}")
        return
    print(subscription_list)
    for subscription in subscription_list:
        try:
            print(f"Processing subscription: {subscription}")
            subscription_info = {
                "endpoint": subscription["endpoint"],
                "keys": {
                    "p256dh": subscription["keys"]["p256dh"],
                    "auth": subscription["keys"]["auth"]
                }
            }
            send_web_push(subscription_info, data)
        except WebPushException as ex:
            if ex.response and ex.response.status_code == 410:
                remove_subscription(subscription)
                logger.info(f"Removed invalid subscription: {subscription['_id']}")
        except KeyError as ke:
            print(f"Key error in subscription: {ke}")
        except TypeError as te:
            print(f"Type error in subscription: {te}")

def add_subscription(subscription_info):
    existing_subscription = subscriptions.find_one({"endpoint": subscription_info["endpoint"]})
    if existing_subscription:
        logger.info("Subscription already exists.")
    else:
        subscriptions.insert_one(subscription_info)
        logger.info("Subscription added.")

def remove_subscription(subscription_info):
    try:
        result = subscriptions.delete_one({"endpoint": subscription_info["endpoint"]})
        if result.deleted_count > 0:
            logger.info("Subscription removed.")
        else:
            logger.info("Subscription not found.")
    except Exception as e:
        logger.error(f"Failed to remove subscription: {e}")

def send_web_push(subscription, message):
    try:
        response = webpush(
            subscription_info=subscription,
            data=message,
            vapid_private_key=valid_pri_key,
            vapid_claims=VAPID_CLAIMS
        )
        print(f"Push sent successfully: {response}")
    except WebPushException as ex:
        print(f"Failed to send push: {ex}")
        raise ex