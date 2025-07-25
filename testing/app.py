from flask import Flask, request, jsonify, send_from_directory
from sarvamai import SarvamAI
import os
from socketio_setup import socketio
from flask_cors import CORS # Import CORS
import os
from voice_assistant import run_voice_assistant, TTS_OUTPUT_PATH

app = Flask(__name__, static_folder='.')

# This enables CORS, allowing your frontend (from any origin) to make requests.
CORS(app, resources={r"/*": {"origins": "*"}}) # Allow all origins for all routes
# Attach SocketIO to Flask app
socketio.init_app(app)

# Ensure the TTS output directory exists
os.makedirs(os.path.dirname(os.path.abspath(TTS_OUTPUT_PATH)), exist_ok=True)

# New Chatbot Endpoint
@app.route('/api/chat', methods=['POST'])
def chat_handler():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message not provided'}), 400

    try:
        client = SarvamAI(api_subscription_key="sk_lahp42w4_8K8JJohnNZZFOaNypvGOPINi")
        response = client.chat.completions.create(
            model="meta/llama-2-70b-chat", # Or another suitable model
            messages=[
                {"role": "system", "content": "You are a helpful assistant specializing in debate topics, formats, and strategies."},
                {"role": "user", "content": data['message']}
            ],
            max_tokens=150,
            temperature=0.7
        )
        reply = response.choices[0].message.content
        return jsonify({'reply': reply})
    except Exception as e:
        print(f"Error calling SarvamAI: {e}")
        return jsonify({'error': 'Failed to get response from AI service'}), 500

@app.route('/audio/<path:filename>')
def serve_audio(filename):
    """Serves the generated audio file."""
    return send_from_directory('.', filename)

@app.route('/run-voice-assistant', methods=['POST'])
def run_voice_assistant_endpoint():
    """Endpoint to run the voice assistant."""
    try:
        result = run_voice_assistant()
        if 'error' in result:
            return jsonify(result), 500
        
        if result.get('audio_file') and os.path.exists(result['audio_file']):
            result['audio_url'] = f'/audio/{os.path.basename(result["audio_file"])}'
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in /run-voice-assistant endpoint: {str(e)}")
        return jsonify({
            'error': f'An unexpected error occurred: {str(e)}',
            'transcript': '',
            'response': 'An error occurred while processing your request.',
            'audio_url': None
        }), 500

if __name__ == '__main__':
    # Run with SocketIO for WebSocket support
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)