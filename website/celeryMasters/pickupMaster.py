# celery -A website.celery_config.celery worker --pool=eventlet --loglevel=info -Q createPickup
from ..extensions import socketio
from ..celery_config import celery
from ..db_clinicalx import client
from flask import request

connected_users = {}


@socketio.on('pickUp')
def handle_event(data):
    role = get_role_from_request()
    print(f"User connected with SID: {request.sid} and role: {role}")
    connected_users[request.sid] = role
    print(connected_users)
    socketio.emit('pickUp', {'response': data})

@celery.task()
def watchCreatePickup(org_name, center, role):
    print('celeryOrgname',org_name)
    org_db = client[f'{org_name}_db']
    pipeline = [{'$match': {'operationType': 'insert'}}]
    while True:
        try:
            REQUEST_PICKUP = org_db["request_pickup"]
            with REQUEST_PICKUP.watch(pipeline) as stream:
                print("watcher pickup")
                subject = "Pickup Alert"
                print(center)
                print(role)
                for change in stream:
                    print(change)
                    created_by = change["fullDocument"]["created_by"]
                    samples_number = change ["fullDocument"]["numb_of_samples"]
                    alert_message = f"{created_by} of {center} just requested for pickup of {samples_number} samples"
                    # if role != 'client':
                    socketio.emit('StaffNotifications', {'subject':subject,'message': alert_message})
                 
        except Exception as e:
            print(f"An error occurred: {e}")


def get_role_from_request():
    role = request.args.get('role')

    if role:
        return role
    else:
        return 'guest'