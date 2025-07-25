"""Shared SocketIO instance for real-time audio streaming."""
from flask_socketio import SocketIO

# Create the SocketIO instance without an app – we will attach it in app.py
socketio = SocketIO(cors_allowed_origins="*")
