import jwt
import datetime

SECRET_KEY = "989898"  # Replace with a strong secret key

def generate_registration_url(org_name, lab_name, firstname, lastname, email, url, org_id="null"):
    # Define the payload
    payload = {
        "org_id": org_id,
        "org_name": org_name,
        "lab_name": lab_name,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "exp": datetime.datetime.now() + datetime.timedelta(hours=6),  # Token expiration time
    }
    print(payload)
    # Encode the payload into a JWT
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    print(url)
    # Generate the URL with the token
    url_address = f"https://labpal.com.ng/{url}?token={token}"
    return url_address

def generate_client_registration_url(org_id, center_name, firstname, lastname, email):
    # Define the payload
    payload = {
        "org_id": org_id,
        "center_name": center_name,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "exp": datetime.datetime.now() + datetime.timedelta(hours=6),  # Token expiration time
    }
    print(payload)
    # Encode the payload into a JWT
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    url = "client/register-user"
    # Generate the URL with the token
    url_address = f"https://labpal.com.ng/{url}?token={token}"
    return url_address


def decode_token(token):
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}
