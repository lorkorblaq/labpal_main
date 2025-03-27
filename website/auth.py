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
from functools import wraps
from .mailer import welcomeMail, send_verification_email, send_reset_password_mail
import logging
from .celeryMasters.inventoryMaster import watch_inventory_changes
from .celeryMasters.pickupMaster import watchCreatePickup
from flask import current_app
from bson.errors import InvalidId
import re
from .utils.tokens import generate_registration_url, decode_token, generate_reset_email_url
# from datetime import datetime
# from .celeryMasters.chatMaster import chat_watcher
# from .redis_config import redis_client

# Configure the logging settings
logging.basicConfig(filename='app.log', level=logging.INFO)

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates")

# USERS_COLLECTION = db['users']  
USERS_COLLECTION = db_org_users['users']  
# ORG_COLLECTION = db['org']
ORG_COLLECTION = db_org_users['org']

def create_demo_data(org_db, org_id, lab_name):
    # org_db[f'{lab_name}_events'].insert_many([
    #     {
    #     "user": "Demo User",
    #     "event_type": "qc",
    #     "created_at": datetime.now(),
    #     "date": datetime.now(),
    #     "machine": "Demo Machine",
    #     "items": ["Demo Item"],
    #     "rootCause": "Demo Root Cause",
    #     "subrootCause": "Demo Sub Root Cause",
    #     "rootCauseDescription": "Demo Root Cause Description",
    #     "actioning": "Demo Actioning"
    #     },
    #     {
    #         "user": "Demo User",
    #         "event_type": "machine",
    #         "created_at": datetime.now(),
    #         "category": "Troubleshooting",
    #         "machine": "Demo Machine",
    #         "datetime": datetime.now(),
    #         "resolved": True,
    #         "rootCause": "Demo Root Cause",
    #         "actioning": "Demo Actioning",
    #     },
    #     {
    #         "user": "Demo User",
    #         "event_type": "machine",
    #         "created_at": {"$date": "2024-09-01T04:32:15.460Z"},
    #         "category": "Maintenance",
    #         "machine": "DXI 800",
    #         "datetime": {"$date": "2024-09-02T04:31:00.000Z"},
    #         "frequency": ["Daily"],
    #         "comments": ""
    #     },
    #     {
    #         "user": "Demo User",
    #         "event_type": "operations",
    #         "created_at": {"$date": "2024-08-31T17:04:11.557Z"},
    #         "date": {"$date": "2024-08-31T00:00:00.000Z"},
    #         "occurrence": ["Demo Occurrence"],
    #         "actioning": "Demo Actioning",
    #     }
    #  ])
    #  not done
    org_db[f'{lab_name}_items'].insert_one({
        "bench": "Demo Bench",
        "category": "Demo Category",
        "item": "Demo Item",
        "vials/pack": 1,
        "tests/vial": 1,
        "quantity": 1,
        "reOrderLevel": 1,
        "class": "A",
        "tests/day": 1
    })
    
    # org_db['labs'].insert_one({
    #     "lab_name": "Demo Lab",
    #     "managers_email": "Demo@demo.com",
    #     "users": [],
    #     "created_at": {"$date": "2024-08-26T10:41:09.054Z"},
    #     "org_id": org_id
    # # })
    # org_db[f'{lab_name}_shipments'].insert_one({
    #     "created_by": "Demo User",
    #     "created_at": {"$date": "2024-08-26T10:41:09.054Z"},
    #     "shipment_id": "lcwylX7",
    #     "numb_of_packs": 3,
    #     "pickup_loc": "Demo Store",
    #     "dropoff_loc": "Demo Lab",
    #     "create_lat_lng": "6.5568768,3.3456128",
    #     "description": "Demo Description",
    #     "completed": "Yes",
    #     "picked_by": "Demo User1",
    #     "pickup_lat_lng": "6.5568768,3.3456128",
    #     "pickup_time": {"$date": "2024-08-26T10:41:26.381Z"},
    #     "updated_at": {"$date": "2024-08-26T10:51:01.759Z"},
    #     "dropoff_by": "Demo User2",
    #     "dropoff_lat_lng": "6.5568768,3.3456128",
    #     "dropoff_time": {"$date": "2024-08-26T10:51:01.759Z"},
    #     "duration": "0D:0H:9M:52S"
    # })
    org_db[f'{lab_name}_piu'].insert_one({
        "user": "Demo User",
        "item": "Demo Item",
        "bench": "Demo Bench",
        "machine": "Demo Machine",
        "lot_numb": "0000",
        "quantity": 1,
        "description": "Demo Description",
        "created_at": datetime.datetime.now()
    })
    # org_db[f'{lab_name}_machines'].insert_one({
    #     "created_at": {"$date": "2024-08-29T19:41:40.801Z"},
    #     "name": "Demo Machine",
    #     "serial_number": "00000abcde",
    #     "manufacturer": "Demo Manufacturer",
    #     "name_engineer": "Demo Engineer",
    #     "contact_engineer": "+234987654321"
    # })
    org_db[f'{lab_name}_channels'].insert_one({
        "user": "Olorunfemi Oloko",
        "item": "demo_item",
        "lot_numb": "0000",
        "direction": "To",
        "location": "Demo Store",
        "quantity": 3,
        "description": "Demo Description",
        "created_at": datetime.datetime.now()
    })
    # org_db[f'{lab_name}_lot_exp'].insert_one({
    #     "item": "Demo Item",
    #     "lot_numb": "0000",
    #     "expiration": {"$date": "2024-07-13T00:00:00.000Z"},
    #     "quantity": 1,
    #     "created_at": {"$date": "2024-07-11T22:42:13.309Z"}
    # })
      
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

@auth.route("/staff/signin-signup", methods=['GET'])
def auth_page():
    login_form = LoginForm()
    register_form = RegistrationForm()
    labform = LabForm()
    orgform = OrgForm()
    return render_template("auth.html", login_form=login_form, register_form=register_form, orgform=orgform, labform=labform)

@auth.route("/staff/signin-signup", methods=['POST'])
def signup_signin():
    login_form = LoginForm()
    register_form = RegistrationForm()
    labform = LabForm()
    orgform = OrgForm()
    resetpassword = Resetpassword()
    
    if 'signup' in request.form:
        org_id = register_form.org_id.data
        lab_name = register_form.lab.data.strip().lower().replace(' ', '_')
        firstname = register_form.firstname.data.strip().lower()
        lastname = register_form.lastname.data.strip().lower()
        email = register_form.email.data.strip().lower()
        print(lab_name)
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
        user_limits = {'free': 3, 'Basic monthly plan': 20, 'Basic yearly plan': 20, 'Premium monthly plan ': 45, 'Premium yearly plan ': 45}

        if num_users >= user_limits.get(sub, float('inf')):
            plan_upgrades = {'free': 'Basic or Premium', 'basic': 'Premium', 'premium': 'Enterprise'}
            flash(f"Your organization has reached the maximum number of {user_limits[sub]} users for the current plan. "
                  f"Please upgrade your plan to {plan_upgrades.get(sub, '')} to add more users.", "warning")
            return redirect(url_for('auth.auth_page'))
        
    
        print(org)
        if lab_name not in org.get('labs', []):
            flash("Laboratory not found. Please confirm your lab name or register your Lab.", "warning")
            return redirect(url_for('auth.auth_page'))
        
        if USERS_COLLECTION.find_one({'email': email}):
            flash("A user with this email address already exists.", "danger")
            return redirect(url_for('auth.auth_page'))
        

        org_name = org.get('org_name')
        print(lab_name)
        url = "register-user"
        url_address = generate_registration_url(org_name, lab_name, firstname, lastname, email, url, org_id)
        # url = f"https://labpal.com.ng/register-user?org_id={org_id}&lab_name={lab_name}&firstname={firstname}&lastname={lastname}&email={email}"
        print(url_address)
        send_verification_email(email, firstname, url_address)
        flash("Kindly check the inbox of the email you provided for verification to proceed", "success")
        return redirect(url_for('auth.auth_page'))
    
    elif 'signin' in request.form:
        email = login_form.email.data.strip().lower()
        password = login_form.password.data

        user = USERS_COLLECTION.find_one({'email': email})
        if user and check_password_hash(user['password'], password):
            org_id = user.get('org_id')
            org = ORG_COLLECTION.find_one({'_id': ObjectId(org_id)}, {'org_name': 1, 'subscription':1, 'services':1})

            if not org:
                flash("Organisation not found.", "danger")
                return redirect(url_for('auth.auth_page'))

            full_id = str(user['_id'])
            org_name = org.get('org_name')
            org_plan = org.get('subscription')
            org_services = org.get('services', [""])
            role = user.get('role')
            center = user.get('center', "")
            lab_name = user.get('labs_access', [""])[0]

            ip_address = request.remote_addr
            firstname = user['firstname']
            lastname = user['lastname']
            name = f'{firstname} {lastname}'
            part_id = full_id[-7:]
            print('org serv', org_services)
            logging.info(f"user:{name}, email:{email}, ip:{ip_address} at {datetime.datetime.now()}")

            session.update({
                'id': full_id,
                'org_id': org_id,
                'org_plan': org_plan,
                'org_name': org_name,
                'org_services': org_services,
                'lab_name': lab_name,
                'role': role,
                'ip_address': ip_address,
                'logged_in': True,
                'part_id': part_id,
                'email': email,
                'firstname': firstname,
                'lastname': lastname,
                'name': name,
                'center': center,
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
            response.set_cookie('org_services', ','.join(org_services).replace('"', ''))            # response.set_cookie('lab_name', lab_name)
            response.set_cookie('lab_name', lab_name)

            response.set_cookie('token', token)
            watch_inventory_changes.delay(org_name, lab_name)
            watchCreatePickup.delay(org_name, center, role)
            return response

        flash("Invalid login credentials.", "danger")
        return redirect(url_for('auth.auth_page'))

    elif 'create org' in request.form:
        if orgform.validate_on_submit():
            org_name = orgform.org_name.data.strip().lower().replace(' ', '_')
            lab_name = orgform.lab_name.data.strip().lower().replace(' ', '_')       
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
                    # url = f"https://labpal.com.ng/register-org?org_name={org_name}&lab_name={lab_name}&firstname={firstname}&lastname={lastname}&email={email}"
                    url = "register-org"
                    reg_url = generate_registration_url(org_name, lab_name, firstname, lastname, email, url)
                    print(reg_url)
                    send_verification_email(email, firstname, reg_url)
                    flash("Kindly check the inbox of the email you provided for verification to proceed", "success")
                    return redirect(url_for('auth.auth_page'))
            elif user:
                flash("This user already belongs to an Organisation.", "danger")
                return redirect(url_for('auth.auth_page'))
        else: 
            flash("Please fill in your data correctly", "danger")
            return redirect(url_for('auth.auth_page'))

    elif 'create lab' in request.form:
        region = labform.region.data
        area = labform.area.data.strip().lower().replace(' ', '_')
        lab_name = labform.lab_name.data.strip().lower().replace(' ', '_')
        managers_email = labform.managers_email.data.strip().lower()
        password = labform.password.data
        
        # Use projection to fetch only the required fields
        user = USERS_COLLECTION.find_one({'email': managers_email}, {'org_id': 1, '_id': 1, "password": 1, "role": 1})

        if not user:
            flash("This user does not exist. Please register your organisation before proceeding.", "danger")
            return redirect(url_for('auth.auth_page'))
        if user.get('role') != 'creator' and user.get('role') != 'user':
            flash("This user does not have the required permissions to create a lab.", "danger")
            return redirect(url_for('auth.auth_page'))

        if check_password_hash(user['password'], password):
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
                if labs_count >= 15:
                    flash("You have reached the limit of 15 labs for a premium subscription. Please upgrade to Enterprise to create more labs.", "warning")
                    return redirect(url_for('auth.auth_page'))


            lab_data = {
                "region": region,
                "area": area,
                "lab_name": lab_name,
                "users": [str(user_id)],
                "created_at": datetime.datetime.now(),
                "org_id": org_id
            }
            ORG_LABS_COLLECTION.insert_one(lab_data)
            USERS_COLLECTION.update_one({"email": managers_email}, {"$push": {"labs_access": lab_name}})
            ORG_COLLECTION.update_one({"_id": ObjectId(org_id)}, {"$push": {"labs": lab_name}})
            flash("Lab created successfully", "success")
            return redirect(url_for('auth.auth_page'))
        
        flash("Invalid login credentials.", "danger")
        return redirect(url_for('auth.auth_page'))

@auth.route('/register-org', methods=['GET', 'POST'])
def register_org():
    register_form = RegistrationForm()
    reg_token = request.args.get('token')
    if not reg_token:
        flash("Missing or invalid registration token.", "danger")
        return redirect(url_for('auth.register_org'))
    # Decode the token
    payload = decode_token(reg_token)
    org_name = payload.get('org_name')
    lab_name = payload.get('lab_name')
    firstname = payload.get('firstname')
    lastname = payload.get('lastname')
    email = payload.get('email')
    if request.method == 'POST':
        password = register_form.password.data
        confirm_password = register_form.confirm_password.data
        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return redirect(url_for('auth.register_org', token=reg_token, register_form=register_form))
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
                # sanitized_org_name = re.sub(r'[^\w]', '_', org_name)  # Replaces any character that is not alphanumeric or underscore
                # org_db_name = f"{sanitized_org_name}_db"
                # print("this is org name:", org_name)
                org_db = client[f"{org_name}_db"]
                print("this is org db:",org_db)
                ORG_LABS_COLLECTION = org_db['labs']
                print("this is org labs collection", ORG_LABS_COLLECTION)
                org_data = {
                    "org_name": org_name,
                    "labs": [lab_name, 'central_store'],
                    "subscription": "free",
                    "creator": str(user_id),
                    "creators_email": email,
                    "users": [str(user_id)],
                    "created_at": datetime.datetime.now(),
                }
                org_id = ORG_COLLECTION.insert_one(org_data).inserted_id
                print("this is org id:",org_id)
                lab_data = [ {
                    "lab_name": lab_name,
                    "region": 'central',
                    "area": 'central',
                    "managers_email": email,
                    "users": [str(user_id)],
                    "created_at": datetime.datetime.now(),
                    "org_id": str(org_id)
                },
                {
                    "lab_name": 'central_store',
                    "region": 'central',
                    "area": 'central',
                    "managers_email": email,
                    "users": [str(user_id)],
                    "created_at": datetime.datetime.now(),
                    "org_id": str(org_id)
                }]
                ORG_LABS_COLLECTION.insert_many(lab_data)
                # print(lab)
                if org_id:
                    USERS_COLLECTION.update_one(
                        {"email": email},
                        {
                         "$set": {"org_id": str(org_id)},
                         "$push": {"labs_access": {"$each": [lab_name, 'central_store']}}
                        }
                    )
                    flash("Registration successful, you can now login", "success")
                    # create_demo_data(org_db, org_id, lab_name)
                    welcomeMail(email, firstname)
                    return redirect(url_for('auth.auth_page'))
                else:
                    flash("Failed to register organization. Please try again or contact support", "danger")
                    return redirect(url_for('auth.register_org', token=reg_token, register_form=register_form))
            else:
                flash("Failed to register user. Please try again or contact support", "danger")
                return redirect(url_for('auth.register_org', token=reg_token, register_form=register_form))

        else:
            flash(f"Failed to register. Error: ", "danger")
            return redirect(url_for('auth.register_org', token=reg_token, register_form=register_form))

    # return render_template("reg_org.html", lab=lab_name, lastname=lastname, firstname=firstname, register_form=register_form)
    return render_template("templates_for_auth/reg_org.html", token=reg_token, firstname=firstname ,register_form=register_form)

@auth.route('/register-user', methods=['GET', 'POST'])
def register_user():
    register_form = RegistrationForm()
    reg_token = request.args.get('token')
    if not reg_token:
        flash("Missing or invalid registration token.", "danger")
        return redirect(url_for('auth.register_org'))
    
    # Decode the token
    payload = decode_token(reg_token)
    org_id = payload.get('org_id')
    lab_name = payload.get('lab_name')
    firstname = payload.get('firstname')
    lastname = payload.get('lastname')
    email = payload.get('email')

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
                "role": "staff",
                "org_id": str(org_id),
                "created_at": datetime.datetime.now(),
                "labs_access": [lab_name]
            }
            user_id = USERS_COLLECTION.insert_one(user_data).inserted_id
            org_name = ORG_COLLECTION.find_one_and_update({"_id": ObjectId(org_id)}, {"$push": {"users": str(user_id)}}).get('org_name')
            # org_name = org.get('org_name')
            # Register the lab and organization
            org_db = client[f"{org_name}"]
            ORG_LABS_COLLECTION = org_db['labs']
            ORG_LABS_COLLECTION.update_one(
                {"lab_name": lab_name},
                {"$push": {"users": str(user_id)}}
            )
            welcomeMail(email, firstname)
            flash("Registration successful, you can now login", "success")
            return redirect(url_for('auth.auth_page'))
    return render_template("templates_for_auth/reg_org.html", firstname=firstname, register_form=register_form)

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
    
@auth.route('/send_reset_link', methods=['POST'], strict_slashes=False)
def send_verification():
    email = request.form.get('email')
    print(email)
    user = USERS_COLLECTION.find_one({'email': email})
    if user:
        firstname = user.get('firstname')
        reg_url = generate_reset_email_url(firstname, email)
        send_reset_password_mail(email, firstname, reg_url)
        return "Kindly check the inbox of the email you provided for verification to proceed"
    else:
        return "This email does not exist."
    
@auth.route('/reset-password', methods=['GET', 'POST'], strict_slashes=False)
def reset_password():
    newpassword = Newpassword()
    token = request.args.get('token')
    if not token:
        flash("Missing or invalid password reset token.", "danger")
        return redirect(url_for('auth.auth_page'))
    # Decode the token
    payload = decode_token(token)
    email = payload.get('email')
    firstName = payload.get('firstname')
    print(firstName)
    if request.method == 'POST':
        password = newpassword.new_password.data
        confirm_password = newpassword.confirm_password.data
        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return redirect(url_for('auth.reset_password', token=token, newpassword=newpassword, firstName=firstName))
        if password == confirm_password:
            hashed_password = generate_password_hash(password)
            # Register the user
            user = USERS_COLLECTION.find_one_and_update({"email": email}, {"$set": {"password": hashed_password}})
            if user:
                flash("Password reset successful, you can now login", "success")
                return redirect(url_for('auth.auth_page'))
            else:
                flash("Failed to reset password. Please try again or contact support", "danger")
                return redirect(url_for('auth.reset_password', token=token, newpassword=newpassword, firstName=firstName))
        else:
            flash(f"Failed to reset password. Error: ", "danger")
            return redirect(url_for('auth.reset_password', token=token, newpassword=newpassword, firstName=firstName))
    return render_template("templates_for_auth/reset_password.html", token=token, newpassword=newpassword, firstName=firstName)

@auth.route('/get-labs', methods=['GET'])
def get_labs():
    org_id = request.args.get('org_id')  # Get the org_id from the query parameter
    if not org_id:
        return {"error": "Organization ID is required"}, 400

    try:
        org_object_id = ObjectId(org_id)
        org = ORG_COLLECTION.find_one({'_id': org_object_id}, {'labs': 1})
        print(org)
        if org:
            labs = org.get('labs', [])
            return {"labs": labs}, 200
        else:
            return {"error": "Organization not found"}, 404
    except InvalidId:
        return {"error": "Invalid Organization ID format"}, 400
