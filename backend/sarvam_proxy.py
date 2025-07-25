from fastapi import FastAPI, WebSocket
import websockets
import asyncio
import os

app = FastAPI()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "sk_lahp42w4_8K8JJohnNZZFOaNypvGOPINi")
SARVAM_WS_URL = "wss://api.sarvam.ai/v1/streaming?language=en"

@app.websocket("/api/streaming/proxy")
async def websocket_proxy(ws_browser: WebSocket):
    await ws_browser.accept()
    async with websockets.connect(
        SARVAM_WS_URL,
        extra_headers={"Authorization": f"Bearer {SARVAM_API_KEY}"}
    ) as ws_sarvam:
        async def browser_to_sarvam():
            while True:
                data = await ws_browser.receive_bytes()
                await ws_sarvam.send(data)
        async def sarvam_to_browser():
            while True:
                data = await ws_sarvam.recv()
                await ws_browser.send_bytes(data if isinstance(data, bytes) else data.encode())
        await asyncio.gather(browser_to_sarvam(), sarvam_to_browser()) 