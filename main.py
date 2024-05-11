from website import create_app, socketio
from website.taskMaster import watch_inventory_changes
app = create_app()
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8080, debug=True)