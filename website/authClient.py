from flask import app, Blueprint, render_template, request, session, url_for, redirect, flash, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from .forms import RegistrationForm, LoginForm, Newpassword, LabForm, OrgForm
from .extensions import socketio, redis_client
from flask_socketio import send, emit
from .db_clinicalx import db_org_users, client
from bson import ObjectId
import requests
import os
import jwt
import datetime
from functools import wraps
from .mailer import welcomeMail, send_verification_email
import logging
from .celeryMasters.pickupMaster import watchCreatePickup
from flask import current_app
from bson.errors import InvalidId
import re
from .utils.tokens import generate_client_registration_url, decode_token
# from datetime import datetime
# from .celeryMasters.chatMaster import chat_watcher
# from .redis_config import redis_client

# Configure the logging settings
logging.basicConfig(filename='app.log', level=logging.INFO)

authClient = Blueprint("authClient", __name__, static_folder="static", template_folder="templates/templates_for_client/")

# USERS_COLLECTION = db['users']  
USERS_COLLECTION = db_org_users['users']  
# ORG_COLLECTION = db['org']
ORG_COLLECTION = db_org_users['org']

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'email' in session and 'token' in session:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('authClient.auth_page'))
    return decorated


def time_left_until_expiration(token, secret_key):
    try:
        decoded_token = jwt.decode(token, secret_key)
        expiration_time = datetime.datetime.fromtimestamp(decoded_token['exp'])
        # print(expiration_time)
        current_time = datetime.datetime.now()
        time_left = expiration_time - current_time
        return time_left
    except jwt.ExpiredSignatureError:
        # Token has already expired
        return datetime.timedelta(seconds=0)
    except jwt.InvalidTokenError:
        # Invalid token
        return None

@authClient.route("/signin-signup", methods=['GET'])
def auth_page():
    login_form = LoginForm()
    register_form = RegistrationForm()
    labform = LabForm()
    orgform = OrgForm()
    return render_template("authClient.html", login_form=login_form, register_form=register_form, orgform=orgform, labform=labform)

@authClient.route("/signin-signup", methods=['POST'])
def signup_signin():
    login_form = LoginForm()
    register_form = RegistrationForm()
    labform = LabForm()
    orgform = OrgForm()
    
    if 'signup' in request.form:
        ref_org_id = register_form.ref_org_id.data.strip()
        center = register_form.center_name.data.strip().lower()
        firstname = register_form.firstname.data.strip().lower()
        lastname = register_form.lastname.data.strip().lower()
        homeAddress = register_form.homeAddress.data.strip().lower()
        email = register_form.email.data.strip().lower()
        
        org = ORG_COLLECTION.find_one({'_id': ObjectId(ref_org_id)}, {'subscription': 1, 'users': 1, 'labs': 1})
        if not org:
            flash("Organisation not registered. Please confirm the Org. ID or contact referring Org.", "warning")
            return redirect(url_for('authClient.auth_page'))
        
        num_users = len(org.get('users', []))
        sub = org.get('subscription')
        user_limits = {'free': 20, 'Basic monthly plan': 45, 'Basic yearly plan': 45, 'Premium monthly plan ': 90, 'Premium yearly plan ': 90}

        if num_users >= user_limits.get(sub, float('inf')):
            plan_upgrades = {'free': 'Basic or Premium', 'basic': 'Premium', 'premium': 'Enterprise'}
            flash(f"This organization has reached the maximum number of {user_limits[sub]} users for their current plan. "
                  f"Please upgrade inform them to upgrade there plan to {plan_upgrades.get(sub, '')} to add more users.", "warning")
            return redirect(url_for('authClient.auth_page'))
        
    
        print(org)
        
        if USERS_COLLECTION.find_one({'email': email}):
            flash("A user with this email address already exists.", "danger")
            return redirect(url_for('authClient.auth_page'))
        
        url_address = generate_client_registration_url(ref_org_id, center, firstname, lastname, homeAddress, email)
        # url = f"https://labpal.com.ng/register-user?org_id={org_id}&lab_name={lab_name}&firstname={firstname}&lastname={lastname}&email={email}"
        print(url_address)
        send_verification_email(email, firstname, url_address)
        flash("Kindly check the inbox of the email you provided for verification to proceed", "success")
        return redirect(url_for('authClient.auth_page'))
    
    elif 'signin' in request.form:
        email = login_form.email.data.strip().lower()
        password = login_form.password.data

        user = USERS_COLLECTION.find_one({'email': email})
        if user and check_password_hash(user['password'], password):
            org_id = user.get('org_id')
            org = ORG_COLLECTION.find_one({'_id': ObjectId(org_id)}, {'org_name': 1, 'subscription':1})

            if not org:
                flash("Organisation not found.", "danger")
                return redirect(url_for('authClient.auth_page'))

            full_id = str(user['_id'])
            org_name = org.get('org_name')
            org_plan = org.get('subscription')
            role = user.get('role')
            center = user['center']
            firstname = user['firstname']
            lastname = user['lastname']
            name = f'{firstname} {lastname}'
            ip_address = request.remote_addr
            part_id = full_id[-7:]
            print(org_plan)
            logging.info(f"user:{name}, email:{email}, ip:{ip_address} at {datetime.datetime.now()}")

            session.update({
                'id': full_id,
                'org_id': org_id,
                'org_name': org_name,
                'center': center,
                'org_plan': org_plan,
                'role': role,
                'ip_address': ip_address,
                'logged_in': True,
                'part_id': part_id,
                'email': email,
                'firstname': firstname,
                'lastname': lastname,
                'name': name,
                'title': user.get('title', ""),
                'address': user.get('address', ""),
                'mobile': user.get('mobile', ""),
                'image': user.get('image', ""),
            })
            secret_key = "LVUC5jSkp7jjR3O-"
            token = jwt.encode({
                'email': email,
                'user': name,
                'exp': datetime.datetime.now() + datetime.timedelta(minutes=240)
            }, secret_key)
            session['time_left'] = time_left_until_expiration(token, secret_key)
            session['token'] = token

            response = make_response(redirect(url_for('viewsClient.home')))
            response.set_cookie('user_id', full_id)
            response.set_cookie('email', email)
            response.set_cookie('name', name)
            response.set_cookie('org_name', org_name)
            response.set_cookie('org_plan', org_plan)
            response.set_cookie('role', role)
            response.set_cookie('org_id', org_id)
            response.set_cookie('token', token)
            response.set_cookie('center', center)
            watchCreatePickup.delay(org_name, center, role)

            return response

        flash("Invalid login credentials.", "danger")
        return redirect(url_for('authClient.auth_page'))


@authClient.route('/register-user', methods=['GET', 'POST'])
def register_user():
    register_form = RegistrationForm()
    reg_token = request.args.get('token')
    if not reg_token:
        flash("Missing or invalid registration token.", "danger")
        return redirect(url_for('authClient.register_org'))
    
    # Decode the token
    payload = decode_token(reg_token)
    org_id = payload.get('org_id')
    center = payload.get('center')
    firstname = payload.get('firstname')
    lastname = payload.get('lastname')
    homeAddress = payload.get('homeAddress')
    email = payload.get('email')

    if request.method == 'POST':
        password = register_form.password.data
        confirm_password = register_form.confirm_password.data
        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return redirect(url_for('authClient.register_org',firstname=firstname, register_form=register_form))
        if password == confirm_password:
            hashed_password = generate_password_hash(password)
            # Register the user
            user_data = {
                "firstname": firstname,
                "lastname": lastname,
                "address": homeAddress,
                "email": email,
                "password": hashed_password,
                "role": "client",
                "org_id": org_id,
                "center": center,
                "created_at": datetime.datetime.now(),
            }
            user_id = USERS_COLLECTION.insert_one(user_data).inserted_id
            ORG_COLLECTION.find_one_and_update({"_id": ObjectId(org_id)}, {"$push": {"clients": str(user_id), "centers": center}})
            # Register the lab and organization
            welcomeMail(email, firstname)
            flash("Registration successful, you can now login", "success")
            return redirect(url_for('authClient.auth_page'))
    return render_template("reg_org.html", firstname=firstname, register_form=register_form)

@authClient.route('/logout', methods=['GET'])
def logout():
    # Assuming the token is sent in the request headers
    logging.info(f"{session['email']} logout, {session['ip_address']} at {datetime.datetime.now()}")
    session.clear()
    flash("You have been successfully logged out.", "success")
        # Delete the session key from Redis
    session_id = session.get('id')
    if session_id:
        session_key = f"labpal_session:{session_id}"
        redis_client.delete(session_key)
    
    response = make_response(redirect(url_for('authClient.auth_page')))
    for cookie in request.cookies:
        response.delete_cookie(cookie)
    return response

@authClient.route('confirm_password/settings', methods=['POST'], strict_slashes=False)
def password_reset():
    new_pass = Newpassword()
    if new_pass.validate_on_submit():
        current_password = new_pass.current_password.data
        new_password = new_pass.new_password.data
        confirm_password = new_pass.confirm_password.data
        
        if new_password != confirm_password:
            flash("Passwords do not match")
            return redirect(url_for('auth.password_reset'))

        user = USERS_COLLECTION.find_one({"email": session.get('email')})
        if user and check_password_hash(user['password'], current_password):
            hashed_password = generate_password_hash(new_password)
            USERS_COLLECTION.update_one({"email": session['email']}, {"$set": {"password": hashed_password}})
            flash("Password reset successful")
            return render_template("settings.html", new_pass=new_pass)
        else:
            flash("Invalid current password")
            return render_template("settings.html", new_pass=new_pass)
    else:
        flash("Please check your input and try again failed")
        return render_template("settings.html", new_pass=new_pass)