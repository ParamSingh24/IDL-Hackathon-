import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

/**
 * LiveTTSPlayer – mounts a Socket.IO listener for real-time TTS chunks
 * streamed from the Flask backend (`/voice` namespace). Each binary chunk
 * is decoded with Web Audio API and played immediately, giving near-instant
 * feedback without waiting for the whole file.
 *
 * Drop <LiveTTSPlayer /> once (e.g. in App.tsx) and it will work globally.
 */
export function LiveTTSPlayer() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Lazily create AudioContext on first user gesture if required by browser
    const getCtx = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      return audioCtxRef.current;
    };

    // Connect to same-origin Socket.IO server, namespace /voice
    const socket = io({ path: "/socket.io", transports: ["websocket"] ,
      // Tell Socket.IO we expect binary
      forceNew: true
    });
    socketRef.current = socket;

    socket.on("connect", () => console.log("[TTS] socket connected"));

    // Each chunk is sent as raw bytes (Uint8Array) from Python
    socket.on("tts_chunk", (data: ArrayBuffer) => {
      const ctx = getCtx();
      // Need to copy because ArrayBuffer is reused by socket.io
      const copy = data.slice(0);
      ctx.decodeAudioData(copy)
        .then(buffer => {
          const src = ctx.createBufferSource();
          src.buffer = buffer;
          src.connect(ctx.destination);
          src.start();
        })
        .catch(err => console.error("decodeAudioData error", err));
    });

    socket.on("tts_complete", () => console.log("[TTS] stream finished"));

    return () => {
      socket.disconnect();
    };
  }, []);

  return null; // no UI
}
