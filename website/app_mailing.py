from flask import app, Blueprint, render_template, request, session, url_for, redirect, flash, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from .forms import RegistrationForm, LoginForm, Newpassword, LabForm, OrgForm, Resetpassword
from .extensions import socketio, redis_client
from flask_socketio import send, emit
from .db_clinicalx import db_org_users, client
from bson import ObjectId
import requests
import os
import jwt
import datetime
from flask_cors import CORS
from functools import wraps
from .mailer import app_mail
import logging
from .celeryMasters.inventoryMaster import watch_inventory_changes
from .celeryMasters.pickupMaster import watchCreatePickup
from flask import current_app
from bson.errors import InvalidId
import re
from .utils.tokens import generate_registration_url, decode_token, generate_reset_email_url

BASE = "https://labpal.com.ng/api"
app_mailing = Blueprint("app_mailing", __name__, static_folder="static", template_folder="templates")
CORS(app_mailing)
data=""

@app_mailing.route("/mailing/shipments/created", methods=["POST"])
def shipments_created():
    data = request.get_json()
    print(data)
    app_mail(data, subject="New shipments created")
    return {"message": "Request sent"}, 201

@app_mailing.route("/mailing/shipments/recieved", methods=["POST"])
def shipments_received():
    data = request.get_json()
    print(data)
    app_mail(data, subject=f"Shipments with {data.id} has been Received")
    return {"message": "Request sent"}, 201

# @app_mailing.route("/mailing/shipments/recieved", methods=["POST"])
# def shipments_received():
#     data = request.get_json()
#     print(data)
#     app_mail(data, subject=f"Shipments with {data.id} has been Received")
#     return {"message": "Request sent"}, 201