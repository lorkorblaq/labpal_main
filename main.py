from website import create_app
# from website.extensions import socketio
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)