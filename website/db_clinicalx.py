from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv, find_dotenv
import os
load_dotenv(find_dotenv())

# uri_production = os.getenv('URI_DEVELOPMENT')
uri_production = os.getenv('URI_PRODUCTION')
# MongoDB connection
client = MongoClient(uri_production, server_api=ServerApi('1'))
try:
    client.admin.command('ping')
    print("You successfully connected to Clinicalx MongoDB!")
except Exception as e:  
    print(f"error in connection:{e}")

db_admin = client.admin
db_labpal = client.labpal
db_org_users = client.org_users
# print(db_org_users) 