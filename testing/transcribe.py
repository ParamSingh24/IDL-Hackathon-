import asyncio
from sarvamai import AsyncSarvamAI
import base64
import sounddevice as sd
from scipy.io.wavfile import write
import os

API_KEY = "sk_lahp42w4_8K8JJohnNZZFOaNypvGOPINi"
AUDIO_FILE_PATH = 'recorded_audio.wav'
SAMPLE_RATE = 16000
DURATION = 5  # seconds

def record_audio():
    """Records audio from the microphone."""
    print(f"Recording for {DURATION} seconds...")
    try:
        audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16')
        sd.wait()
        write(AUDIO_FILE_PATH, SAMPLE_RATE, audio)
        print(f"Audio recorded and saved to {AUDIO_FILE_PATH}")
    except Exception as e:
        print(f"Error during audio recording: {e}")

async def transcribe_stream():
    """
    Connects to the Sarvam.ai speech-to-text streaming API and transcribes an audio file.
    """
    if not os.path.exists(AUDIO_FILE_PATH):
        print(f"Error: The audio file was not found at '{AUDIO_FILE_PATH}'.")
        return

    try:
        with open(AUDIO_FILE_PATH, "rb") as audio_file:
            audio_data = audio_file.read()

        client = AsyncSarvamAI(api_subscription_key=API_KEY)
        async with client.speech_to_text_streaming.connect(
          language_code="en-IN",
          model="saarika:v2.5",
          high_vad_sensitivity=True,
        ) as ws:
            await ws.transcribe(
                audio=base64.b64encode(audio_data).decode('utf-8'),
                encoding="audio/wav",
                sample_rate=SAMPLE_RATE
            )
            response = await ws.recv()
            print("Transcription result:", response)

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    record_audio()
    asyncio.run(transcribe_stream())