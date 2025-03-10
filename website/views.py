from flask import Blueprint, render_template, request, url_for, redirect, session, Response
import requests
from flask_cors import CORS
from .auth import auth_required
from flask_mail import Message, Mail
# from .extensions import socketio
from flask_socketio import send, emit
# from  .celeryMasters.inventoryMaster import *
from .forms import Newpassword
from .db_clinicalx import db_labpal
from pywebpush import webpush
from .subscription import add_subscription
from dotenv import load_dotenv, find_dotenv
import os, json
from .mailer import request_for_demo_mail

from .extensions import socketio
load_dotenv(find_dotenv())
valid_pub_key = os.getenv('VAPID_PUB_KEY')
valid_pri_key = os.getenv('VAPID_PRI_KEY')
RECAPTCHA_SECRET_KEY = os.getenv("GOOGLE_RECAPTCHA_SECRETKEY")  # Replace with your reCAPTCHA secret key

BASE = "https://labpal.com.ng/api"
views = Blueprint("views", __name__, static_folder="static", template_folder="templates")
CORS(views)
data=""


def login_required(route_func):
    def wrapper(*args, **kwargs):
        if 'email' in session:
            return redirect(url_for('views.home'))
        else:
            return render_template("/templates_for_landingpage/landingpage.html")
    return wrapper

@views.route("/",  strict_slashes=False)
@login_required
def landing():
    return render_template("/templates_for_landingpage/landingpage.html")

@views.route("/features",  strict_slashes=False)
def features():
    FEATURE = db_labpal['features']
    # FEATURE = db_admin['features']
    features = FEATURE.find()

    features_data = {}
      
    for feature in features:
        # Assuming each document has a key like 'feature' which contains the 'event' key
        event_data = feature['feature']
        print(event_data)
        features_data[event_data['event']] = event_data
    
    feature_name = request.args.get('feature')
    
    if feature_name in features_data:
        feature_info = features_data[feature_name]
        heading = feature_info['heading']
        feature1 = feature_info['feature1']
        feature2 = feature_info['feature2']
        feature3 = feature_info['feature3']
        link = feature_info['link']
    else:
        # Default or error handling
        heading = 'Default Heading'
        feature1 = 'Default Feature 1'
        feature2 = 'Default Feature 2'
        feature3 = 'Default Feature 3'
        link = 'GXJP7RRYUWw'
    return render_template("/templates_for_landingpage/features.html",heading=heading, feature1=feature1, feature2=feature2, feature3=feature3, link=link)

@views.route("/app",  strict_slashes=False)
@auth_required
def home():
    return render_template("index.html")

@views.route("/app/dashboard",  strict_slashes=False)
@auth_required
def dashboard():
    return render_template("/templates_for_dashboard/dashboard.html", data=data)

@views.route("/app/events",  strict_slashes=False)
@auth_required
def events():
    return render_template("/templates_for_events/events.html", data=data)

@views.route("/app/inventory",  strict_slashes=False)
@auth_required
def inventory():
    return render_template("inventory.html", data=data)

@views.route("/app/expiration",  strict_slashes=False)
@auth_required
def expiration():
    return render_template("expiration.html", data=data)
    
@views.route("/app/in-use", methods=['GET','POST'],  strict_slashes=False)
@auth_required
def put_in_use():
    return render_template("put-in-use.html", data=data)

@views.route("/app/channels",  strict_slashes=False)
@auth_required
def channels():
    return render_template("channels.html", data=data)

@views.route("/app/port",  strict_slashes=False)
@auth_required
def port():
    return render_template("port.html", data=data)

@views.route("/app/chat",  strict_slashes=False)
@auth_required
def chat():
    return render_template("/templates_for_messenger/messenger.html", data=data)

@views.route("/app/gpt",  strict_slashes=False)
@auth_required
def gpt():
    return render_template("/templates_for_gpt/gpt.html", data=data)

@views.route("/app/shipments",  strict_slashes=False)
@auth_required
def shipments():
    return render_template("/templates_for_shipments/shipments.html", data=data)

@views.route("/app/request-pickup",  strict_slashes=False)
@auth_required
def requestPickup():
    return render_template("/templates_for_request_pickup/request-pickup.html", data=data)

@views.route("/app/user-profile",  strict_slashes=False)
@auth_required
def userProfile():
    data ={
        "firstname": session['firstname'],
        "lastname": session['lastname'],
        "part_id": session['part_id'],
        "id": session['id'],
        "title": session['title'],
        "name": session['name'],
        "org_id": session['org_id'],
        "org_name": session['org_name'],
        "lab_name": session['lab_name'],
        "email": session['email'],
        "address": session['address'],
        "mobile": session['mobile']
    }
    print(data)
    return render_template("user-profile.html", data=data)

@views.route("/app/settings", methods=['GET'], strict_slashes=False)
@auth_required
def settings():
    new_pass = Newpassword()
    return render_template("settings.html", new_pass=new_pass, name=session['name'], email=session['email'])
# subscriptions = []

@views.route("/subscription", methods=["GET", "POST"])
def subscription():
    """
        POST creates a subscription
        GET returns vapid public key which clients uses to send around push notification
    """

    if request.method == "GET":
        return Response(response=json.dumps({"public_key": valid_pub_key}),
            headers={"Access-Control-Allow-Origin": "*"}, content_type="application/json")

    subscription = request.get_json()
    add_subscription(subscription)
    # db_labpal['subscriptions'].insert_one(subscription)
    # subscriptions.append(subscription)
    # print('subscrsi',subscriptions)
    return {"message": "Subscription added"}, 201

@views.route("/send_demo_request", methods=["POST"])
def send_demo_request():
    data = request.get_json()
    recaptcha_response = data.get("recaptcha")  # Get reCAPTCHA response from frontend
    # Verify reCAPTCHA with Google
    verify_url = "https://www.google.com/recaptcha/api/siteverify"
    response = requests.post(verify_url, data={
        "secret": RECAPTCHA_SECRET_KEY,
        "response": recaptcha_response
    })
    result = response.json()
    if not result.get("success"):
        return {"message": "reCAPTCHA verification failed"}, 400
    print(data)
    request_for_demo_mail(data)
    return {"message": "Request sent"}, 201

@socketio.on('message')
def handle_message(data):
    print(f"Message received: {data}")
    socketio.emit('response', {'message': f"Echo: {data}"})
