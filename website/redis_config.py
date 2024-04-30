from flask_redis import FlaskRedis
from flask import Flask
app = Flask(__name__)

redis_client = FlaskRedis(app)
redis_client.init_app(app)
