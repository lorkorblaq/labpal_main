from website import create_app, socketio
from flask_cors import CORS

app = create_app()
CORS(app)
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8080, debug=True)
