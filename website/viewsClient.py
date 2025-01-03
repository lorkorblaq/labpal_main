from flask import Blueprint, render_template, request, url_for, redirect, session, Response
import requests
from flask_cors import CORS
from .authClient import auth_required
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
load_dotenv(find_dotenv())
valid_pub_key = os.getenv('VAPID_PUB_KEY')
valid_pri_key = os.getenv('VAPID_PRI_KEY')

BASE = "https://labpal.com.ng/api"
viewsClient = Blueprint("viewsClient", __name__, static_folder="static", template_folder="templates/templates_for_client")
CORS(viewsClient)
data=""

def login_required(route_func):
    def wrapper(*args, **kwargs):
        if 'email' in session:
            return redirect(url_for('viewsClient.home'))
        else:
            return render_template("/templates_for_landingpage/landingpage.html")
    return wrapper

@viewsClient.route("/",  strict_slashes=False)
@login_required
def landing():
    return render_template("/templates_for_landingpage/landingpage.html")


@viewsClient.route("/app/client",  strict_slashes=False)
@auth_required
def home():
    return render_template("/clientIndex.html")

# @viewsClient.route("/app/client/user-profile",  strict_slashes=False)
# @auth_required
# def clientUserProfile():
#     data ={
#         "firstname": session['firstname'],
#         "lastname": session['lastname'],
#         "part_id": session['part_id'],
#         "id": session['id'],
#         "title": session['title'],
#         "name": session['name'],
#         "org_id": session['org_id'],
#         "org_name": session['org_name'],
#         "lab_name": session['lab_name'],
#         "email": session['email'],
#         "address": session['address'],
#         "mobile": session['mobile']
#     }
#     print(data)
#     return render_template("user-profile.html", data=data)

# @viewsClient.route("/app/client/settings", methods=['GET'], strict_slashes=False)
# @auth_required
# def clientSettings():
#     new_pass = Newpassword()
#     return render_template("settings.html", new_pass=new_pass, name=session['name'], email=session['email'])
# # subscriptions = []


# @viewsClient.route("/app/chat",  strict_slashes=False)
# @auth_required
# def chat():
#     return render_template("/templates_for_messenger/messenger.html", data=data)

# @viewsClient.route("/app/gpt",  strict_slashes=False)
# @auth_required
# def gpt():
#     return render_template("/templates_for_gpt/gpt.html", data=data)

# @viewsClient.route("/app/request-pickup",  strict_slashes=False)
# @auth_required
# def logistics():
#     return render_template("/pickup.html", data=data)

@viewsClient.route("/app/pickup",  strict_slashes=False)
@auth_required
def requestPickup():
    return render_template("/pickup.html", data=data)

# @viewsClient.route("/app/user-profile",  strict_slashes=False)
# @auth_required
# def userProfile():
#     data ={
#         "firstname": session['firstname'],
#         "lastname": session['lastname'],
#         "part_id": session['part_id'],
#         "id": session['id'],
#         "title": session['title'],
#         "name": session['name'],
#         "org_id": session['org_id'],
#         "org_name": session['org_name'],
#         "lab_name": session['lab_name'],
#         "email": session['email'],
#         "address": session['address'],
#         "mobile": session['mobile']
#     }
#     print(data)
#     return render_template("user-profile.html", data=data)

# @viewsClient.route("/app/settings", methods=['GET'], strict_slashes=False)
# @auth_required
# def settings():
#     new_pass = Newpassword()
#     return render_template("settings.html", new_pass=new_pass, name=session['name'], email=session['email'])
# # subscriptions = []

