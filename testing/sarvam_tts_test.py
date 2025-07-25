import asyncio
import base64
from sarvamai import AsyncSarvamAI, AudioOutput

async def tts_stream():
    client = AsyncSarvamAI(api_subscription_key="sk_lahp42w4_8K8JJohnNZZFOaNypvGOPINi")

    try:
        async with client.text_to_speech_streaming.connect(model="bulbul:v2") as ws:
            await ws.configure(target_language_code="en-IN", speaker="anushka")
            print("Sent configuration")

            text = "Hello! This is a test of Sarvam AI's text to speech capabilities."
            await ws.convert(text)
            print("Sent text message")

            await ws.flush()
            print("Flushed buffer")

            with open("output.mp3", "wb") as f:
                async for message in ws:
                    if isinstance(message, AudioOutput):
                        audio_chunk = base64.b64decode(message.data.audio)
                        f.write(audio_chunk)
                        f.flush()

            print("Audio generation complete. Saved to output.mp3.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(tts_stream())