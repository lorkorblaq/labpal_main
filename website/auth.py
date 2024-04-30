from flask import app, Blueprint, render_template, request, session, url_for, redirect, flash, make_response,jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from .forms import RegistrationForm, LoginForm, Resetpassword
from .extensions import socketio
from flask_socketio import send, emit
from . import db_clinical
import requests
import os
import jwt
import datetime
from functools import wraps
from .mailer import *
import logging
# Configure the logging settings
logging.basicConfig(filename='app.log', level=logging.INFO)



# jwt = JWTManager()
API_BASE_URL = "http://13.53.70.208:3000/api/user/push/"

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates")


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'email' in session and 'token' in session:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('auth.auth_page'))
    return decorated

def time_left_until_expiration(token, secret_key):
    try:
        decoded_token = jwt.decode(token, secret_key)
        expiration_time = datetime.datetime.fromtimestamp(decoded_token['exp'])
        # print(expiration_time)
        current_time = datetime.datetime.utcnow()
        time_left = expiration_time - current_time
        return time_left
    except jwt.ExpiredSignatureError:
        # Token has already expired
        return datetime.timedelta(seconds=0)
    except jwt.InvalidTokenError:
        # Invalid token
        return None

USERS_COLLECTION = db_clinical['users']   
@auth.route("/signin-signup", methods=['GET'])
def auth_page():
    login_form = LoginForm()
    register_form = RegistrationForm()
    return render_template("auth.html", login_form=login_form, register_form=register_form)

@auth.route("/signin-signup", methods=['POST'])
def signup_signin():
    login_form = LoginForm()
    register_form = RegistrationForm()
    if 'signup' in request.form:
        # Form submission for sign up
        org_id = register_form.org_id.data
        firstname = register_form.firstname.data
        lastname = register_form.lastname.data
        email = register_form.email.data
        password = register_form.password.data
        confirm_password = register_form.confirm_password.data
        hashed_password = generate_password_hash(password)
        # if org_id is not 0:
        #     flash("Organisation not registered")
        #     return render_template("auth.html", login_form=login_form, register_form=register_form) 
        
        if USERS_COLLECTION.find_one({'email': email}):
            flash("Email already exists")
            return redirect(url_for('auth.auth_page'))
        elif password == confirm_password:
            hashed_password = generate_password_hash(password)
            form_data = {
                # "org_id": org_id,
                "firstname": firstname,
                "lastname": lastname,
                "email": email,
                "password": hashed_password,
            }
            name=firstname + " " + lastname
            # print(form_data)
            if USERS_COLLECTION.insert_one(form_data):
                flash("Successful,\n now login", "success")
                welcomeMail(email, name)
                return redirect(url_for('auth.auth_page'))
            else:
                flash("Failed to register user. Please try again.", "danger")
                return redirect(url_for('auth.auth_page'))
        else:
            flash("Passwords do not match.", "danger")
            return redirect(url_for('auth.auth_page'))
    elif 'signin' in request.form:
        email = login_form.email.data
        password = login_form.password.data
        # Fetch user from MongoDB based on the provided email
        user = USERS_COLLECTION.find_one({'email': email})
        if user is not None and check_password_hash(user['password'], password):
            identity ={}
            full_id = str(user['_id'])
            # session['session_id'] = session_id
            session['id'] = full_id
            data_user_session = {
                'session_id': 'session_id',
                'user_id': full_id
                }

            # socketio.emit('my_response', {'data': 'Connected'})

            ip_address = request.remote_addr
            # user_agent = request.user_agent.string
            full_id = str(user['_id'])
            part_id = full_id[-7:]
            firstname = user['firstname']
            lastname = user['lastname']
            name = firstname + " " + lastname
            logging.info(f"user:{name}, email:{email}, ip:{ip_address} at {datetime.datetime.utcnow()}")
            # Passwords match, allow login
            # auth.logger.info(f"User logged in: {session['email']}")

            # flash("Login successful!", "success")
            # Your redirect logic here, e.g., redirect to dashboard
            session['ip_address'] = ip_address
            session['logged_in'] = True
            session['id'] = full_id
            session['part_id'] = part_id
            session['email'] = email
            session['firstname'] = firstname
            session['lastname'] = lastname
            session['name'] = name
            session['title'] = user.get('title', "")
            session['org'] = user.get('org', "")
            session['address'] = user.get('address', "")
            session['mobile'] = user.get('mobile', "")
            session['image'] = user.get('image', "")

            # stockAlert(email, name)
            # watch_inventory_changes.delay(name, email)
            # print(watch_inventory_changes)
            secret_key = "LVUC5jSkp7jjR3O-"
            # secret_key = "LVUC5jSkp7jjR3O-"
            # print(secret_key)
            token = jwt.encode({
                'email': email, 
                'user': name, 
                'exp': str(datetime.datetime.now() + datetime.timedelta(minutes=240))
             }, 
            secret_key)
            session['time_left'] = time_left_until_expiration(token, secret_key)
            session['token'] = token
            # print(token)
            response = make_response(redirect(url_for('views.home')))
            response.set_cookie('user_id', full_id)
            response.set_cookie('email', email)
            response.set_cookie('name', name)
            # response.set_cookie('id', session_id)
            response.set_cookie('token', session['token'] )
            return response
            # return make_response
        else:
            # Either user does not exist or password is incorrect
            flash("Invalid login credentials.", "danger")
            return redirect(url_for('auth.auth_page'))

@auth.route('/logout', methods=['GET'])
def logout():
    # Assuming the token is sent in the request headers
    logging.info(f"{session['email']} logout, {session['ip_address']} at {datetime.datetime.utcnow()}")
    session.clear()
    flash("You have been successfully logged out.", "success")
    response = make_response(redirect(url_for('auth.auth_page')))
    response.delete_cookie('user_id')
    response.delete_cookie('email')
    response.delete_cookie('name')
    response.delete_cookie('token')
    return response

@auth.route('/reset-password', methods=['GET','POST'])
def password_reset():
    resetForm = Resetpassword()
    if request.method == 'POST':
        email = resetForm.email.data
        user = USERS_COLLECTION.find({"email":email})
        if user:
            flash("The reset link has been sent to your mail.")
            return redirect(url_for('auth.auth_page'))

        else:
            flash('Email address does not exist')
            return redirect(url_for('auth.password_reset'))

