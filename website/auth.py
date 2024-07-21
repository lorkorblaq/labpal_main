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
from .celeryMasters.inventoryMaster import watch_inventory_changes
from flask import current_app
from bson.errors import InvalidId
# from .celeryMasters.chatMaster import chat_watcher
# from .redis_config import redis_client

# Configure the logging settings
logging.basicConfig(filename='app.log', level=logging.INFO)


auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates")

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
            return redirect(url_for('auth.auth_page'))
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


@auth.route("/signin-signup", methods=['GET'])
def auth_page():
    login_form = LoginForm()
    register_form = RegistrationForm()
    labform = LabForm()
    orgform = OrgForm()
    return render_template("auth.html", login_form=login_form, register_form=register_form, orgform=orgform, labform=labform)

@auth.route("/signin-signup", methods=['POST'])
def signup_signin():
    login_form = LoginForm()
    register_form = RegistrationForm()
    labform = LabForm()
    orgform = OrgForm()
    
    if 'signup' in request.form:
        org_id = register_form.org_id.data
        lab_name = register_form.lab.data.strip().lower()
        firstname = register_form.firstname.data
        lastname = register_form.lastname.data
        email = register_form.email.data.strip().lower()
        try:
            org_object_id = ObjectId(org_id)
        except InvalidId:
            flash("Invalid organisation ID format. Please check your input.", "danger")
            return redirect(url_for('auth.auth_page'))
        
        org = ORG_COLLECTION.find_one({'_id': org_object_id}, {'subscription': 1, 'users': 1, 'labs': 1, 'org_name': 1})
        if not org:
            flash("Organisation not registered. Please confirm your org ID or register your Org.", "warning")
            return redirect(url_for('auth.auth_page'))
        
        num_users = len(org.get('users', []))
        sub = org.get('subscription')
        user_limits = {'free': 5, 'Basic monthly plan': 20, 'Basic yearly plan': 20, 'Premium monthly plan ': 45, 'Premium yearly plan ': 45}

        if num_users >= user_limits.get(sub, float('inf')):
            plan_upgrades = {'free': 'Basic or Premium', 'basic': 'Premium', 'premium': 'Enterprise'}
            flash(f"Your organization has reached the maximum number of {user_limits[sub]} users for the current plan. "
                  f"Please upgrade your plan to {plan_upgrades.get(sub, '')} to add more users.", "warning")
            return redirect(url_for('auth.auth_page'))
        

        if lab_name not in org.get('labs', []):
            flash("Laboratory not found. Please confirm your lab name or register your Lab.", "warning")
            return redirect(url_for('auth.auth_page'))
        
        if USERS_COLLECTION.find_one({'email': email}):
            flash("A user with this email address already exists.", "danger")
            return redirect(url_for('auth.auth_page'))
        

        org_name = org.get('org_name')
        url = f"https://labpal.com.ng/register-user?org_id={org_id}&lab_name={lab_name}&firstname={firstname}&lastname={lastname}&email={email}"
        send_verification_email(email, firstname, url)
        flash("Kindly check the inbox of the email you provided for verification to proceed", "success")
        return redirect(url_for('auth.auth_page'))
    
    elif 'signin' in request.form:
        email = login_form.email.data.strip().lower()
        password = login_form.password.data

        user = USERS_COLLECTION.find_one({'email': email})
        if user and check_password_hash(user['password'], password):
            org_id = user.get('org_id')
            org = ORG_COLLECTION.find_one({'_id': ObjectId(org_id)}, {'org_name': 1, 'subscription':1})

            if not org:
                flash("Organisation not found.", "danger")
                return redirect(url_for('auth.auth_page'))

            full_id = str(user['_id'])
            org_name = org.get('org_name')
            org_plan = org.get('subscription')
            role = user.get('role')
            lab_name = user.get('labs_access', [""])[0]
            ip_address = request.remote_addr
            firstname = user['firstname']
            lastname = user['lastname']
            name = f"{firstname} {lastname}"
            part_id = full_id[-7:]
            print(org_plan)
            logging.info(f"user:{name}, email:{email}, ip:{ip_address} at {datetime.datetime.now()}")

            session.update({
                'id': full_id,
                'org_id': org_id,
                'lab_name': lab_name,
                'org_name': org_name,
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
            print(session)
            secret_key = "LVUC5jSkp7jjR3O-"
            token = jwt.encode({
                'email': email,
                'user': name,
                'exp': datetime.datetime.now() + datetime.timedelta(minutes=240)
            }, secret_key)
            session['time_left'] = time_left_until_expiration(token, secret_key)
            session['token'] = token

            response = make_response(redirect(url_for('views.home')))
            response.set_cookie('user_id', full_id)
            response.set_cookie('email', email)
            response.set_cookie('name', name)
            response.set_cookie('org_name', org_name)
            response.set_cookie('org_plan', org_plan)
            response.set_cookie('role', role)
            response.set_cookie('org_id', org_id)
            response.set_cookie('lab_name', lab_name)
            response.set_cookie('lab_name', lab_name)
            response.set_cookie('token', token)
            watch_inventory_changes.delay(org_name, lab_name)
            return response

        flash("Invalid login credentials.", "danger")
        return redirect(url_for('auth.auth_page'))

    elif 'create org' in request.form:
        if orgform.validate_on_submit():
            org_name = orgform.org_name.data.strip().lower()
            lab_name = orgform.lab_name.data.strip().lower()            
            firstname = orgform.firstname.data
            lastname = orgform.lastname.data
            email = orgform.email.data.strip().lower()
            user = USERS_COLLECTION.find_one({'email': email})

            # try:
            if not user:
                # LABS_COLLECTION.insert_one(lab_data)
                if ORG_COLLECTION.find_one({'org_name': org_name}):
                    flash("Organization already exists, please provide another name.", "warning")
                    return redirect(url_for('auth.auth_page'))
                else:
                    url = f"https://labpal.com.ng/register-org?org_name={org_name}&lab_name={lab_name}&firstname={firstname}&lastname={lastname}&email={email}"
                    send_verification_email(email, firstname, url)
                    flash("Kindly check the inbox of the email you provided for verification to proceed", "success")
                    return redirect(url_for('auth.auth_page'))
            elif user:
                flash("This user already belongs to an Organisation.", "danger")
                return redirect(url_for('auth.auth_page'))
        else: 
            flash("Please fill in your data correctly", "danger")
            return redirect(url_for('auth.auth_page'))

    elif 'create lab' in request.form:
        lab_name = labform.lab_name.data.strip().lower()
        managers_email = labform.managers_email.data.strip().lower()
        
        # Use projection to fetch only the required fields
        user = USERS_COLLECTION.find_one({'email': managers_email}, {'org_id': 1, '_id': 1})

        if not user:
            flash("This user does not exist. Please register your organisation before proceeding.", "danger")
            return redirect(url_for('auth.auth_page'))

        org_id = user.get('org_id')
        user_id = user.get('_id')
        
        # Use projection to fetch only the required fields
        org = ORG_COLLECTION.find_one({'_id': ObjectId(org_id)}, {'subscription': 1, 'org_name': 1})

        if not org:
            flash("Organisation not found.", "danger")
            return redirect(url_for('auth.auth_page'))

        sub = org.get('subscription')
        org_name = org.get('org_name')
        org_db = client[f'{org_name}_db']
        ORG_LABS_COLLECTION = org_db['labs']
        
        # Check if lab already exists
        lab = ORG_LABS_COLLECTION.find_one({'lab_name': lab_name}, {'_id': 1})
        if lab:
            flash("Lab already exists, please provide another name.", "warning")
            return redirect(url_for('auth.auth_page'))
        
        if sub == "free":
            flash("You are on the free tier and entitled to only one Lab. Kindly upgrade to a Basic or Premium plan to proceed.", "warning")
            return redirect(url_for('auth.auth_page'))

        if sub == "Basic monthly plan" or sub == "Basic yearly plan":
            labs_count = ORG_LABS_COLLECTION.count_documents({})
            if labs_count >= 5:
                flash("You have reached the limit of 5 labs for a basic subscription. Please upgrade to Premium to create more labs.", "warning")
                return redirect(url_for('auth.auth_page'))
            
        if sub == "Premium monthly plan" or sub == "Premium yearly plan":
            labs_count = ORG_LABS_COLLECTION.count_documents({})
            if labs_count >= 10:
                flash("You have reached the limit of 10 labs for a premium subscription. Please upgrade to Enterprise to create more labs.", "warning")
                return redirect(url_for('auth.auth_page'))


        lab_data = {
            "lab_name": lab_name,
            "managers_email": managers_email,
            "users": [str(user_id)],
            "created_at": datetime.datetime.now(),
            "org_id": org_id
        }
        ORG_LABS_COLLECTION.insert_one(lab_data)
        USERS_COLLECTION.update_one({"email": managers_email}, {"$push": {"labs_access": lab_name}})
        ORG_COLLECTION.update_one({"_id": ObjectId(org_id)}, {"$push": {"labs": lab_name}})
        flash("Lab created successfully", "success")
        return redirect(url_for('auth.auth_page'))

       

@auth.route('/register-org', methods=['GET', 'POST'])
def register_org():
    register_form = RegistrationForm()
    org_name = request.args.get('org_name')
    lab_name = request.args.get('lab_name')
    firstname = request.args.get('firstname')
    lastname = request.args.get('lastname')
    email = request.args.get('email')

    if request.method == 'POST':
        password = register_form.password.data
        confirm_password = register_form.confirm_password.data
        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return redirect(url_for('auth.register_org', org_name=org_name, lab_name=lab_name, firstname=firstname, lastname=lastname, email=email))
        if password == confirm_password:
            hashed_password = generate_password_hash(password)
            # Register the user
            user_data = {
                "firstname": firstname,
                "lastname": lastname,
                "email": email,
                "password": hashed_password,
                "role": "creator",
                "created_at": datetime.datetime.now()
            }
            user_id = USERS_COLLECTION.insert_one(user_data).inserted_id
            print(user_id)
            # Register the lab and organization
            if user_id:
                print("this is org name:", org_name)
                org_db = client[f"{org_name}_db"]
                print("this is org db:",org_db)
                ORG_LABS_COLLECTION = org_db['labs']
                print("this is org labs collection", ORG_LABS_COLLECTION)
                org_data = {
                    "org_name": org_name,
                    "labs": [lab_name],
                    "subscription": "free",
                    "creator": str(user_id),
                    "creators_email": email,
                    "users": [str(user_id)],
                    "created_at": datetime.datetime.now(),
                }
                org_id = ORG_COLLECTION.insert_one(org_data).inserted_id
                print("this is org id:",org_id)
                lab_data = {
                    "lab_name": lab_name,
                    "managers_email": email,
                    "users": [str(user_id)],
                    "created_at": datetime.datetime.now(),
                    "org_id": str(org_id)
                }
                ORG_LABS_COLLECTION.insert_one(lab_data).inserted_id
                # print(lab)
                if org_id:
                    USERS_COLLECTION.update_one(
                        {"email": email},
                        {
                         "$set": {"org_id": str(org_id)},
                         "$push": {"labs_access": lab_name}
                        }
                    )
                    flash("Registration successful, you can now login", "success")
                    welcomeMail(email, firstname)
                    return redirect(url_for('auth.auth_page'))
                else:
                    flash("Failed to register organization. Please try again or contact support", "danger")
                    return redirect(url_for('auth.register_org'))
            else:
                flash("Failed to register user. Please try again or contact support", "danger")
                return redirect(url_for('auth.register_org'))

        else:
            flash(f"Failed to register. Error: ", "danger")
            return redirect(url_for('auth.register_org'))

    return render_template("reg_org.html", lab=lab_name, lastname=lastname, firstname=firstname, register_form=register_form)

@auth.route('/register-user', methods=['GET', 'POST'])
def register_user():
    register_form = RegistrationForm()
    org_id = request.args.get('org_id')
    lab_name = request.args.get('lab_name')
    firstname = request.args.get('firstname')
    lastname = request.args.get('lastname')
    email = request.args.get('email')
    print(org_id)

    if request.method == 'POST':
        password = register_form.password.data
        confirm_password = register_form.confirm_password.data
        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return redirect(url_for('auth.register_org', org_id=org_id, lab_name=lab_name, firstname=firstname, lastname=lastname, email=email, register_form=register_form))
        if password == confirm_password:
            hashed_password = generate_password_hash(password)
            # Register the user
            user_data = {
                "firstname": firstname,
                "lastname": lastname,
                "email": email,
                "password": hashed_password,
                "role": "user",
                "org_id": str(org_id),
                "created_at": datetime.datetime.now(),
                "labs_access": [lab_name]
            }
            user_id = USERS_COLLECTION.insert_one(user_data).inserted_id
            org_name = ORG_COLLECTION.find_one_and_update({"_id": ObjectId(org_id)}, {"$push": {"users": str(user_id)}}).get('org_name')
            # org_name = org.get('org_name')
            # Register the lab and organization
            org_db = client[f"{org_name}_db"]
            ORG_LABS_COLLECTION = org_db['labs']
            ORG_LABS_COLLECTION.update_one(
                {"lab_name": lab_name},
                {"$push": {"users": str(user_id)}}
            )
            welcomeMail(email, firstname)
            flash("Registration successful, you can now login", "success")
            return redirect(url_for('auth.auth_page'))
    return render_template("reg_org.html", org_id=org_id, lab_name=lab_name, firstname=firstname, lastname=lastname, email=email, register_form=register_form)


@auth.route('/subscription', methods=['GET', 'POST'])
def subscription():
    return render_template("subscription.html")

@auth.route('/logout', methods=['GET'])
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
    
    response = make_response(redirect(url_for('auth.auth_page')))
    for cookie in request.cookies:
        response.delete_cookie(cookie)
    return response

@auth.route('confirm_password/settings', methods=['POST'], strict_slashes=False)
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