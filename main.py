from website import create_app, socketio

app = create_app()
if __name__ == "__main__":
    socketio.run(app, host="13.53.70.208", port=8080, debug=True)
