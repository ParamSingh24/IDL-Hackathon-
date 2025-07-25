import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { SarvamAIClient } from "sarvamai";
import multer from "multer";
import fs from "fs";
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Placeholder for debate room endpoints (to be expanded)
app.post('/api/debate/start', (req, res) => {
  // Start a new debate session
  res.json({ success: true, roomId: 'demo-room' });
});

// WebSocket server for real-time debate events (port 4001)
try {
  const wss = new WebSocketServer({ port: 4001 });
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      // Broadcast received message to all clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(message);
        }
      });
    });
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to debate room WebSocket.' }));
  });
} catch (err) {
  if (err.code === 'EADDRINUSE') {
    console.error('WebSocket port 4001 already in use. Skipping WebSocket server startup.');
  } else {
    throw err;
  }
}

const API_KEY = process.env.SARVAM_API_KEY;
const upload = multer({ dest: "uploads/" });

// Batch STT endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    console.error('No audio file uploaded.');
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }
  try {
    console.log('Received file:', req.file.originalname, req.file.mimetype, req.file.path, req.file.size);
    let mimetype = req.file.mimetype;
    // Strictly correct mimetype if not allowed
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3', 'audio/x-mp3',
      'audio/wav', 'audio/x-wav', 'audio/wave',
      'audio/aac', 'audio/x-aac', 'audio/aiff', 'audio/x-aiff',
      'audio/ogg', 'audio/opus', 'audio/flac', 'audio/x-flac',
      'audio/mp4', 'audio/x-m4a', 'audio/amr', 'audio/x-ms-wma',
      'audio/webm', 'video/webm'
    ];
    if (!allowedTypes.includes(mimetype)) {
      if (req.file.originalname.endsWith('.wav')) {
        console.warn('Correcting mimetype to audio/wav');
        mimetype = 'audio/wav';
      } else if (req.file.originalname.endsWith('.webm')) {
        console.warn('Correcting mimetype to audio/webm');
        mimetype = 'audio/webm';
      } else if (req.file.originalname.endsWith('.mp3')) {
        console.warn('Correcting mimetype to audio/mp3');
        mimetype = 'audio/mp3';
      }
      req.file.mimetype = mimetype;
    }
    console.log('Final mimetype:', mimetype);
    const client = new SarvamAIClient({ apiSubscriptionKey: API_KEY });
    console.log('Calling Sarvam with model:', "saarika:v2.5");
    const response = await client.speechToText.transcribe({
      file: fs.createReadStream(req.file.path),
      model: "saarika:v2.5",
      language_code: "hi-IN"
    });
    fs.unlinkSync(req.file.path);
    console.log('Sarvam response:', response);
    res.json({ transcript: response });
  } catch (error) {
    console.error('Error in /api/transcribe:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch TTS endpoint
app.post('/api/text-to-speech', async (req, res) => {
  const { text, target_language_code } = req.body;
  if (!text || !target_language_code) {
    return res.status(400).json({ error: 'text and target_language_code required' });
  }
  try {
    const client = new SarvamAIClient({ apiSubscriptionKey: API_KEY });
    const response = await client.textToSpeech.convert({
      text,
      target_language_code,
    });
    res.json({ audio: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Learning Mode AI endpoint
app.post('/api/learning-ai', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: 'transcript is required' });
  }
  try {
    const answer = `You said: "${transcript}". That's an interesting point. When considering this, have you thought about the long-term implications?`;

    const client = new SarvamAIClient({ apiSubscriptionKey: API_KEY });
    const ttsResponse = await client.textToSpeech.convert({
      text: answer,
      target_language_code: 'hi-IN',
    });

    res.json({ answer, audio: ttsResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Streaming Proxy Endpoints ---
const server = http.createServer(app);

// Sarvam Streaming STT Proxy
server.on('upgrade', async (request, socket, head) => {
  if (request.url === '/api/streaming/transcribe') {
    const wss = new WebSocketServer({ noServer: true });
    wss.handleUpgrade(request, socket, head, (ws) => {
      (async () => {
        try {
          const client = new SarvamAIClient({ apiSubscriptionKey: API_KEY });
          // Connect to Sarvam streaming STT
          const sarvamSocket = await client.speechToTextStreaming.connect({ 'language-code': 'hi-IN' });

          // Forward messages from frontend to Sarvam
          ws.on('message', (msg) => {
            // Only support { type: 'audio', data: { audio, sample_rate, encoding } }
            try {
              const parsed = JSON.parse(msg.toString());
              if (parsed.type === 'audio') {
                const audioBuffer = Buffer.from(parsed.data.audio);
                sarvamSocket.transcribe({ ...parsed.data, audio: audioBuffer });
              } else {
                ws.send(JSON.stringify({ type: 'error', error: 'Only type "audio" is supported for STT streaming.' }));
              }
            } catch (e) {
              ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
            }
          });

          // Forward messages from Sarvam to frontend
                    sarvamSocket.on('message', (message) => {
            // Forward message as is, assuming it's a stringified JSON
            ws.send(message.toString());
          });
          sarvamSocket.on('close', (event) => {
            ws.close();
          });
          sarvamSocket.on('error', (err) => {
            ws.send(JSON.stringify({ type: 'error', error: err.message }));
            ws.close();
          });
          ws.on('close', () => {
            sarvamSocket.close();
          });
        } catch (err) {
          socket.destroy();
        }
      })();
    });
    return;
  }
  if (request.url === '/api/streaming/tts') {
    const wss = new WebSocketServer({ noServer: true });
    wss.handleUpgrade(request, socket, head, (ws) => {
      (async () => {
        try {
          const client = new SarvamAIClient({ apiSubscriptionKey: API_KEY });
          // Connect to Sarvam streaming TTS
          const sarvamSocket = await client.textToSpeechStreaming.connect({ model: 'bulbul:v2' });

          ws.on('message', (msg) => {
            // Expect JSON: { type: 'config'|'text'|'flush'|'ping', data: ... }
            try {
              const parsed = JSON.parse(msg.toString());
              if (parsed.type === 'configureConnection') {
                sarvamSocket.configureConnection(parsed.data);
              } else if (parsed.type === 'convert') {
                sarvamSocket.convert(parsed.data);
              } else if (parsed.type === 'flush') {
                sarvamSocket.flush();
              } else {
                ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
              }
            } catch (e) {
              ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
            }
          });

                    sarvamSocket.on('message', (message) => {
            // Forward message as is, assuming it's a stringified JSON
            ws.send(message.toString());
          });
          sarvamSocket.on('close', (event) => {
            ws.close();
          });
          sarvamSocket.on('error', (err) => {
            ws.send(JSON.stringify({ type: 'error', error: err.message }));
            ws.close();
          });
          ws.on('close', () => {
            sarvamSocket.close();
          });
        } catch (err) {
          socket.destroy();
        }
      })();
    });
    return;
  }
  if (request.url === '/api/streaming/translate') {
    const wss = new WebSocketServer({ noServer: true });
    wss.handleUpgrade(request, socket, head, (ws) => {
      (async () => {
        try {
          const client = new SarvamAIClient({ apiSubscriptionKey: API_KEY });
          // Connect to Sarvam streaming STT Translate
          const sarvamSocket = await client.speechToTextTranslateStreaming.connect({ model: 'saaras:v2.5', high_vad_sensitivity: true, vad_signals: true });

          // Forward messages from frontend to Sarvam
          ws.on('message', (msg) => {
            try {
              const parsed = JSON.parse(msg.toString());
              if (parsed.audio) {
                sarvamSocket.send({
                  audio: parsed.audio
                });
              } else {
                ws.send(JSON.stringify({ type: 'error', error: 'Only audio messages are supported for STT translation streaming.' }));
              }
            } catch (e) {
              ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
            }
          });

          // Forward messages from Sarvam to frontend
                    sarvamSocket.on('message', (message) => {
            // Forward message as is, assuming it's a stringified JSON
            ws.send(message.toString());
          });
          sarvamSocket.on('close', (event) => {
            ws.close();
          });
          sarvamSocket.on('error', (err) => {
            ws.send(JSON.stringify({ type: 'error', error: err.message }));
            ws.close();
          });
          ws.on('close', () => {
            sarvamSocket.close();
          });
        } catch (err) {
          socket.destroy();
        }
      })();
    });
    return;
  }
});

// Start HTTP server (not app.listen)
server.listen(PORT, () => {
  console.log(`Debate backend listening on port ${PORT}`);
  console.log(`WebSocket server running on port 4001`);
}); 