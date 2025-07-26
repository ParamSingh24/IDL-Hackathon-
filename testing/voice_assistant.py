import base64
import sounddevice as sd
import os
import asyncio
import traceback
from scipy.io.wavfile import write
from sarvamai import SarvamAI, AsyncSarvamAI, AudioOutput
from socketio_setup import socketio
import requests

# --- Configuration ---
API_KEY = "sk_lahp42w4_8K8JJohnNZZFOaNypvGOPINi"
AUDIO_FILE_PATH = 'recorded_audio.wav'
TTS_OUTPUT_PATH = 'tts_response.mp3'
SAMPLE_RATE = 16000
DURATION = 10  # seconds

def record_audio():
    """Records audio from the microphone."""
    print(f"Recording for {DURATION} seconds...")
    try:
        audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16')
        sd.wait()
        write(AUDIO_FILE_PATH, SAMPLE_RATE, audio)
        print(f"Audio recorded and saved to {AUDIO_FILE_PATH}")
        return True
    except Exception as e:
        print(f"Error during audio recording: {e}")
        return False

def transcribe_audio():
    """Transcribes the recorded audio using SarvamAI."""
    print("Starting transcription...")
    if not os.path.exists(AUDIO_FILE_PATH):
        print(f"Error: Audio file not found at {AUDIO_FILE_PATH}")
        return None

    async def _transcribe_task():
        try:
            with open(AUDIO_FILE_PATH, "rb") as audio_file:
                base64_chunk = base64.b64encode(audio_file.read()).decode('utf-8')

            client = AsyncSarvamAI(api_subscription_key=API_KEY)
            async with client.speech_to_text_streaming.connect(
                language_code="en-IN",
                model="saarika:v2.5",
            ) as ws:
                await ws.transcribe(
                    audio=base64_chunk,
                    encoding="audio/wav",
                    sample_rate=SAMPLE_RATE
                )
                response = await ws.recv()
                print(f"Full API Response from Transcription: {response}")
                transcript = getattr(response.data, 'transcript', None) if hasattr(response, 'data') else None
                print(f"Extracted transcript: {transcript}")
                return transcript
        except Exception as e:
            print(f"Error in transcription task: {e}")
            return None

    return asyncio.run(_transcribe_task())

async def _text_to_speech_async(text: str, output_path: str = TTS_OUTPUT_PATH, *, pitch: float = 0.0, pace: float = 1.0):
    """Generate speech from text.

    Parameters
    ----------
    text : str
        Input text.
    output_path : str
        Destination MP3/WAV file path.
    pitch : float, optional
        Voice tone. Range -0.75 (deeper) .. 0.75 (sharper). Default 0.0.
    pace : float, optional
        Speech speed. Range 0.3 (slow) .. 3.0 (fast). Default 1.0.
    """
    # --- Clip values to Sarvam recommended ranges ---
    pitch = max(-0.75, min(0.75, pitch))
    pace = max(0.3, min(3.0, pace))
    """Generate speech audio asynchronously and save it to `output_path`."""
    try:
        client = AsyncSarvamAI(api_subscription_key=API_KEY)
        async with client.text_to_speech_streaming.connect(model="bulbul:v2") as ws:
            await ws.configure(target_language_code="en-IN", speaker="anushka", pitch=pitch, pace=pace)
            await ws.convert(text)
            await ws.flush()
            async for message in ws:
                if isinstance(message, AudioOutput):
                    audio_chunk = base64.b64decode(message.data.audio)
                    # Stream chunk to client in real time
                    socketio.emit('tts_chunk', audio_chunk, namespace='/voice')
        # Notify clients that TTS stream is done
        socketio.emit('tts_complete', namespace='/voice')
        print(f"TTS audio streamed to client")
        return output_path
    except Exception as e:
        print(f"Error in async TTS: {e}")
        return None


def text_to_speech_sync(text: str, output_path: str = TTS_OUTPUT_PATH, *, pitch: float = 0.0, pace: float = 1.0):
    """Synchronous wrapper around the async TTS helper for convenience."""
    print("Starting text-to-speech...")
    try:
        return asyncio.run(_text_to_speech_async(text, output_path, pitch=pitch, pace=pace))
    except RuntimeError:
        # If we're already inside an event loop (e.g., Flask with async support), create a new loop.
        return asyncio.new_event_loop().run_until_complete(_text_to_speech_async(text, output_path, pitch=pitch, pace=pace))

def get_chat_response(question):
    """Gets a response from the SarvamAI chat model."""
    print("Getting chat response...")
    try:
        context = ""
        if os.path.exists("debate_context.txt"):
            with open("debate_context.txt", "r", encoding="utf-8") as f:
                context = f.read()

        client = SarvamAI(api_subscription_key=API_KEY)
        messages = []
        if context:
            messages.append({"role": "system", "content": context})
        messages.append({"role": "user", "content": question})

        # **THIS IS THE FINAL CORRECTED API CALL BASED ON YOUR DOCUMENTATION**
        response = client.chat.completions(messages=messages)
        
        message = response.choices[0].message.content
        print("Assistant:", message)
        return message
    except Exception as e:
        print(f"--- DETAILED ERROR in get_chat_response ---")
        traceback.print_exc()
        print(f"-------------------------------------------")
        return "I am sorry, an error occurred while I was thinking."

def run_voice_assistant():
    """Main function to run the voice assistant pipeline."""
    if not record_audio():
        return {"error": "Failed to record audio."}

    transcript = transcribe_audio()
    if not transcript:
        return {"error": "Failed to transcribe audio. The speech might be unclear or an API error occurred."}

    response_text = get_chat_response(transcript)
    if not response_text:
        return {"error": "Failed to get a chat response."}

    text_to_speech_sync(response_text, pace=0.9)

    return {
        "transcript": transcript,
        "response": response_text,
    }

if __name__ == "__main__":
    result = run_voice_assistant()
    print("\n--- Voice Assistant Result ---")
    print(result)