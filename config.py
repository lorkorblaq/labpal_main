from api.engine import db_clinical
class Config(object):
    DEBUG = False
    TESTING = False
    SECRET_KEY = 'LVUC5jSkp7jjR3O-'
    MONGO_URI = "mongodb://localhost:27017/production_db"

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    
class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    MONGO_URI = "mongodb://localhost:27017/test_db"