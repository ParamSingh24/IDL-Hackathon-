import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Mic, MicOff, Video, VideoOff, Settings, LogOut, Info,
  PauseCircle, PlayCircle, Hand, Check, X, MessageSquareQuote, FileText, Bot, BrainCircuit
} from "lucide-react";

// HELPER COMPONENT: Speaker Avatar (Central Stage)
const SpeakerAvatar = ({ speaker, isUser }) => (
  <div className="flex flex-col items-center gap-3 text-center w-40">
    <div
      className={`relative rounded-full border-4 p-1.5 transition-all duration-300 ${
        speaker.isSpeaking
          ? "border-green-400 shadow-[0_0_25px_rgba(52,211,73,0.6)]"
          : "border-gray-600/70"
      }`}
    >
      {/* Placeholder for video feed */}
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
        <Avatar className="w-full h-full">
          <AvatarImage src={speaker.avatarUrl} alt={speaker.name} className="object-cover" />
          <AvatarFallback className="text-4xl bg-gray-700">{speaker.name[0]}</AvatarFallback>
        </Avatar>
      </div>
      {/* Speaking/Mute Indicator */}
      <span
        className={`absolute -bottom-2 -right-2 w-10 h-10 flex items-center justify-center rounded-full border-4 border-[#0B1426] ${
          speaker.isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-700"
        }`}
      >
        {speaker.isSpeaking ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-gray-400" />}
      </span>
    </div>
    <div>
      <div className="text-lg font-bold text-white">{speaker.name}</div>
      <div className="text-sm text-cyan-300/80">{speaker.role}</div>
    </div>
  </div>
);

// HELPER COMPONENT: Timer Display
const TimerDisplay = ({ timeLeft, totalTime, isProtectedTime, isDebateActive, onToggleDebate }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / totalTime) * 100;

  return (
    <Card className="w-full max-w-md bg-[#1A2842]/80 border-gray-700 backdrop-blur-sm">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="text-center">
          <div className={`text-5xl font-mono tracking-tighter transition-colors ${isProtectedTime ? 'text-red-400' : 'text-white'}`}>
            {minutes}:{seconds < 10 ? '0' : ''}{seconds}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            {isProtectedTime ? "Protected Time" : "Open to POIs"}
          </div>
        </div>
        <div className="flex-grow">
          <Progress value={progress} className="h-2 [&>div]:bg-green-400" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0:00</span>
            <span>{Math.floor(totalTime / 60)}:00</span>
          </div>
        </div>
        <Button onClick={onToggleDebate} variant="ghost" size="icon" className="w-12 h-12 text-gray-300 hover:bg-gray-700/50 hover:text-white">
          {isDebateActive ? <PauseCircle className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
        </Button>
      </CardContent>
    </Card>
  );
};

// HELPER COMPONENT: Transcription Panel
const TranscriptionPanel = ({ transcriptions }) => (
    <Card className="h-full flex flex-col bg-[#111C33]/80 border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200"><MessageSquareQuote className="w-5 h-5"/>Live Transcription</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {transcriptions.map((t) => (
          <div key={t.id} className={`flex gap-3 text-sm ${t.speakerType === 'user' ? 'justify-end' : 'justify-start'}`}>
             {t.speakerType === 'ai' && <Avatar className="w-8 h-8"><AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=ai" /></Avatar>}
             <div className={`max-w-xl rounded-xl px-4 py-2 ${
                 t.isPOI ? 'bg-yellow-600/30 border border-yellow-500/50' :
                 t.speakerType === 'user' ? 'bg-blue-900/40' : 'bg-gray-700/40'
             }`}>
                <div className="font-bold text-gray-300 mb-1 flex items-center gap-2">{t.speaker}{t.isPOI && <span className="text-xs font-normal text-yellow-300">(POI)</span>}</div>
                <p className="text-gray-300/90">{t.text}</p>
             </div>
             {t.speakerType === 'user' && <Avatar className="w-8 h-8"><AvatarImage src="https://github.com/shadcn.png" /></Avatar>}
          </div>
        ))}
      </CardContent>
    </Card>
);

// HELPER COMPONENT: POI Controls
const POIControls = ({ isProtectedTime, onOfferPOI, currentSpeaker, poiRequests, onAcceptPOI, onRejectPOI }) => (
    <div className="bg-[#1A2842]/80 border border-gray-700/50 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {currentSpeaker.id !== "user_pm" ? (
             <Button onClick={onOfferPOI} disabled={isProtectedTime} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-md gap-2">
                <Hand className="w-5 h-5"/> Request POI
             </Button>
        ) : <div className="text-gray-400 text-sm">You are currently speaking.</div>}

        {poiRequests.length > 0 && currentSpeaker.id === "user_pm" && (
            <div className="flex flex-col gap-2 w-full sm:w-auto">
                <p className="text-sm text-yellow-300 font-semibold">POI Request from {poiRequests[0].fromRole}:</p>
                <div className="flex gap-2">
                    <Button onClick={() => onAcceptPOI(poiRequests[0].id)} size="sm" className="flex-grow bg-green-600 hover:bg-green-700 gap-1"><Check className="w-4 h-4"/> Accept</Button>
                    <Button onClick={() => onRejectPOI(poiRequests[0].id)} size="sm" className="flex-grow bg-red-600 hover:bg-red-700 gap-1"><X className="w-4 h-4"/> Reject</Button>
                </div>
            </div>
        )}
    </div>
);


// HELPER COMPONENT: Sidebar Panels
const NotesPanel = ({ notes, onNotesChange }) => (
    <Card className="bg-[#1A2842] border-gray-700">
      <CardHeader><CardTitle className="flex items-center gap-2 text-gray-200"><FileText className="w-5 h-5"/>My Notes</CardTitle></CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Type your arguments, rebuttals, and POIs here..."
          className="h-48 bg-[#0B1426] border-gray-600 text-gray-300 resize-none"
        />
      </CardContent>
    </Card>
);

const SpeakerOrderPanel = ({ speakers, currentSpeakerIndex }) => (
    <Card className="bg-[#1A2842] border-gray-700">
      <CardHeader><CardTitle className="flex items-center gap-2 text-gray-200"><Bot className="w-5 h-5"/>Speaker Order</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {speakers.map((s, index) => (
            <li key={s.id} className={`flex items-center gap-3 p-2 rounded-md transition-all ${
              index === currentSpeakerIndex ? 'bg-green-500/20 ring-1 ring-green-400' :
              index < currentSpeakerIndex ? 'opacity-50' : ''
            }`}>
              <Avatar className="w-8 h-8"><AvatarImage src={s.avatarUrl} /></Avatar>
              <div className="flex-grow">
                  <div className={`font-semibold ${index === currentSpeakerIndex ? 'text-green-300' : 'text-gray-300'}`}>{s.name}</div>
                  <div className="text-xs text-gray-400">{s.role}</div>
              </div>
              {index === currentSpeakerIndex && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
);

const FeedbackPanel = ({ mode }) => (
    <Card className="bg-[#1A2842] border-gray-700">
        <CardHeader><CardTitle className="flex items-center gap-2 text-gray-200"><BrainCircuit className="w-5 h-5"/>AI Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            {mode === 'practice' &&
                <div className="bg-blue-900/50 p-3 rounded-lg text-sm text-blue-200">
                    <p className="font-bold mb-1">Coaching Tip:</p>
                    <p>Remember to signpost your arguments clearly. Start with "My first point is..."</p>
                </div>
            }
            <div>
                <h4 className="font-semibold text-gray-300 mb-2">Live Delivery Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Pace: <span className="font-mono text-green-300">145 WPM</span></p>
                    <p>Clarity: <span className="font-mono text-green-300">92%</span></p>
                    <p>Fillers: <span className="font-mono text-yellow-300">3 uh/ums</span></p>
                    <p>Tone: <span className="font-mono text-cyan-300">Assertive</span></p>
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-gray-300 mb-2">Post-Speech Summary (Previous Speaker)</h4>
                <p className="text-sm text-gray-400">Strong opening, but the second argument lacked sufficient evidence. The rebuttal to the POI was effective.</p>
            </div>
        </CardContent>
    </Card>
);

// MAIN COMPONENT
export function LiveDebateRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Comprehensive State Management
  const [debateConfig, setDebateConfig] = useState(() => location.state?.debateConfig || {
    motion: "This House Would Implement a Universal Basic Income",
    format: "British Parliamentary",
    mode: "challenge", // 'practice', 'challenge', 'learning', 'quick'
    timeLimit: 7,
  });

  const [speakers, setSpeakers] = useState([
      { id: "user_pm", name: "You", role: "Prime Minister", avatarUrl: "https://github.com/shadcn.png", isSpeaking: false },
      { id: "ai_lo", name: "AI Opponent", role: "Leader of Opposition", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ai1", isSpeaking: false },
      // Add other speakers for a full BP debate
      { id: "ai_dpm", name: "AI Partner", role: "Deputy Prime Minister", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ai2", isSpeaking: false },
      { id: "ai_dlo", name: "AI Opponent", role: "Deputy Leader of Opposition", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ai3", isSpeaking: false },
      // ... and so on for Member roles
  ]);

  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(debateConfig.timeLimit * 60);
  const [isDebateActive, setIsDebateActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [notes, setNotes] = useState("");
  const [poiRequests, setPoiRequests] = useState([]); // {id: number, fromRole: string}
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // --- Mode-specific state for Learning Mode ---
  const [selectedSkill, setSelectedSkill] = useState('Rebuttal Making');
  const skillOptions = [
    'Rebuttal Making',
    'Speech Openings',
    'Logical Consistency',
    'POI Handling',
  ];

  const [transcriptions] = useState([
     // Sample transcriptions from prompt
     { id: "1", speaker: "You", text: "Honorable chair, distinguished colleagues, my team firmly believes that banning social media would be a monumental step towards reclaiming public discourse and mental well-being.", timestamp: new Date(), speakerType: "user", isPOI: false },
     { id: "2", speaker: "AI Opponent", text: "While my colleague raises interesting points, we must consider the fundamental principles of free speech and modern activism.", timestamp: new Date(), speakerType: "ai", isPOI: false },
     { id: "3", speaker: "You", text: "Point of information! Isn't the concept of 'free speech' being weaponized on these platforms?", timestamp: new Date(), speakerType: "user", isPOI: true },
  ]);

  // --- Learning Mode Streaming State ---
  const [liveTranscript, setLiveTranscript] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [learningError, setLearningError] = useState<string | null>(null);
  const sttSocketRef = useRef<WebSocket | null>(null);
  const ttsSocketRef = useRef<WebSocket | null>(null);


  // 2. Derived State using useMemo for efficiency
  const totalTime = useMemo(() => (debateConfig.timeLimit || 7) * 60, [debateConfig.timeLimit]);
  const isProtectedTime = useMemo(() => timeLeft > totalTime - 60 || timeLeft < 60, [timeLeft, totalTime]);
  const currentSpeaker = useMemo(() => speakers[currentSpeakerIndex], [speakers, currentSpeakerIndex]);

  // Mode options for buttons
  const modeOptions = [
    {
      key: 'practice',
      label: 'Practice Mode',
      desc: 'AI guides you step-by-step with real-time coaching',
    },
    {
      key: 'challenge',
      label: 'Challenge Mode',
      desc: 'Debate against a skilled AI opponent at full intensity',
    },
    {
      key: 'learning',
      label: 'Learning Mode',
      desc: 'Focus on specific skills with targeted feedback',
    },
    {
      key: 'quick',
      label: 'Quick Debate',
      desc: 'Jump straight into a casual debate round',
    },
  ];

  // Parliament format options
  const formatOptions = [
    { key: 'British Parliamentary', label: 'BP' },
    { key: 'Asian Parliamentary', label: 'AP' },
    { key: 'World Schools', label: 'WSDC' },
  ];

  // 3. Effects for Core Logic
  // Update speaker's `isSpeaking` status
  useEffect(() => {
    setSpeakers(prev => prev.map((char, index) => ({
      ...char,
      isSpeaking: index === currentSpeakerIndex,
    })));
  }, [currentSpeakerIndex]);

  // Main debate timer
  useEffect(() => {
    if (!isDebateActive || timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isDebateActive, timeLeft]);

  // Auto-advance to next speaker
  useEffect(() => {
    if (timeLeft === 0 && isDebateActive) {
      if (currentSpeakerIndex < speakers.length - 1) {
        // Here you would trigger post-speech feedback analysis
        console.log(`Speech ended for ${currentSpeaker.role}. Advancing.`);
        setCurrentSpeakerIndex(prev => prev + 1);
        setTimeLeft(totalTime);
      } else {
        console.log("Debate has concluded.");
        setIsDebateActive(false);
        navigate("/feedback"); // Navigate to post-debate summary
      }
    }
  }, [timeLeft, isDebateActive, currentSpeakerIndex, speakers.length, totalTime, currentSpeaker.role, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showFormatDropdown) return;
    const handleClick = (e) => {
      if (!(e.target.closest && e.target.closest('.relative')))
        setShowFormatDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFormatDropdown]);


  // 4. Handlers for User Interaction
  const handleExitDebate = () => navigate("/feedback");
  const handleEndSpeech = () => setTimeLeft(0);
  const handleOfferPOI = () => {
    console.log("POI offered by user");
    // In a real app, this would be sent via websockets to the current speaker
    // For demo, we simulate the AI receiving it and deciding
    setTimeout(() => {
        alert("AI Opponent rejects your POI.");
    }, 1500);
  };
   const handleAIAcceptsPOI = () => {
    // This would be triggered by an AI event
    setPoiRequests(prev => [...prev, {id: Date.now(), fromRole: "Leader of Opposition"}]);
  }
  const handleAcceptPOI = (id) => {
    // Logic to handle accepting a POI: start 15s timer, mute user, etc.
    alert("You accepted the POI. The opponent has 15 seconds.");
    setPoiRequests(prev => prev.filter(p => p.id !== id));
  }
  const handleRejectPOI = (id) => {
    alert("You rejected the POI.");
    setPoiRequests(prev => prev.filter(p => p.id !== id));
  }

  // Voice recording handlers for learning mode
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.start();
    setRecording(true);
    setIsDebateActive(false); // End timer when user starts interacting with AI
  };

  const stopRecording = async () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // Add a helper for safe fetch with error handling
  const API_BASE = `http://${window.location.hostname}:4001`;
  async function safeFetchJson(url: string, options?: RequestInit) {
    try {
      // If url starts with /api, prepend API_BASE
      const fullUrl = url.startsWith('/api') ? `${API_BASE}${url}` : url;
      const res = await fetch(fullUrl, options);
      if (!res.ok) {
        const text = await res.text();
        console.error(`API error for ${url}:`, res.status, text);
        throw new Error(`API error: ${res.status} ${text}`);
      }
      // Try to parse JSON, but handle empty body
      const text = await res.text();
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error(`Failed to parse JSON from ${url}:`, text);
        throw new Error('Invalid JSON response');
      }
    } catch (err) {
      console.error('Fetch failed:', url, err);
      throw err;
    }
  }

  // --- Start Streaming STT ---
  async function startLearningStreaming() {
    setLearningError(null);
    setLiveTranscript("");
    setStreaming(true);
    try {
      // Get mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ws = new WebSocket(`ws://${window.location.hostname}:4001/api/streaming/transcribe`);
      sttSocketRef.current = ws;
      let transcript = "";
      ws.onopen = () => {
        // Start recording and send audio chunks
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === 1) {
            e.data.arrayBuffer().then((buf) => {
              ws.send(JSON.stringify({ type: 'audio', data: { audio: Array.from(new Uint8Array(buf)), encoding: 'LINEAR16', sample_rate: 16000 } }));
            });
          }
        };
        recorder.start(250); // send every 250ms
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'transcript' && msg.data?.text) {
            transcript = msg.data.text;
            setLiveTranscript(transcript);
          }
        } catch {}
      };
      ws.onerror = (e) => {
        setLearningError('Speech-to-text streaming error. Falling back to batch mode.');
        stopLearningStreaming();
      };
      ws.onclose = () => {
        // No action needed
      };
    } catch (err) {
      setLearningError('Microphone error or streaming not supported.');
      setStreaming(false);
    }
  }

  // --- Stop Streaming STT ---
    async function stopLearningStreaming() {
    setStreaming(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (sttSocketRef.current) {
      sttSocketRef.current.close();
      sttSocketRef.current = null;
    }

    if (liveTranscript.trim()) {
      await handleTranscript(liveTranscript);
    } else {
      setLearningError('No transcript captured.');
    }
  }

  // --- Send transcript to AI and play TTS (streaming preferred) ---
  

  // --- Batch TTS Fallback ---
    function b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  const handleTranscript = async (transcript: string) => {
    setLearningError(null);
    try {
      const res = await safeFetchJson(`${API_BASE}/api/learning-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      const { answer, audio } = res;
      setAiAnswer(answer);

      if (audio && audio.audioContent) {
                        const audioBlob = b64toBlob(audio.audioContent, 'audio/mpeg');
        const url = URL.createObjectURL(audioBlob);
        setAiAudioUrl(url);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = url;
          audioPlayerRef.current.play();
        }
      }
    } catch (err) {
      console.error('Error in handleTranscript:', err);
      setLearningError('Failed to process your request. Please try again.');
    }
  };


  return (
    <div className="min-h-screen bg-[#0B1426] text-gray-200 flex flex-col font-sans">
      {/* Top Bar: Motion, Format, Mode */}
      <header className="bg-[#1A2842] p-3 text-sm flex flex-col sm:flex-row justify-between items-center shadow-md z-10 gap-2">
        <div className="font-semibold text-white mb-2 sm:mb-0">
          <span className="text-gray-400">Motion:</span> {debateConfig.motion}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {/* Parliament Format Dropdown */}
          <div className="relative mr-2">
            <button
              onClick={() => setShowFormatDropdown((prev) => !prev)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 flex items-center gap-2
                bg-cyan-400 text-black border-cyan-400 shadow-lg`}
              title="Change Parliament Format"
            >
              {formatOptions.find(f => f.key === debateConfig.format)?.label || 'Format'}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showFormatDropdown && (
              <div className="absolute left-0 mt-2 w-40 bg-[#22345A] border border-gray-700 rounded-lg shadow-lg z-20">
                {formatOptions.map((format) => (
                  <button
                    key={format.key}
                    onClick={() => {
                      setDebateConfig((prev) => ({ ...prev, format: format.key }));
                      setShowFormatDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold rounded-lg transition-all
                      ${debateConfig.format === format.key ? 'bg-cyan-400 text-black' : 'text-cyan-200 hover:bg-cyan-700/40 hover:text-white'}`}
                  >
                    {format.label} <span className="ml-2 text-xs text-gray-400">{format.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="hidden sm:inline h-4 w-px bg-gray-600 mx-2"></span>
          {/* Mode Switch Buttons */}
          <div className="flex flex-wrap gap-2">
            {modeOptions.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setDebateConfig((prev) => ({ ...prev, mode: mode.key }))}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border-2 focus:outline-none focus:ring-2 focus:ring-cyan-400
                  ${debateConfig.mode === mode.key
                    ? 'bg-yellow-400 text-black border-yellow-400 shadow-lg'
                    : 'bg-[#22345A] text-gray-200 border-gray-600 hover:bg-cyan-700/40 hover:text-white'}
                `}
                title={mode.desc}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        {/* Mode Description */}
        <div className="w-full sm:w-auto mt-2 sm:mt-0 text-xs text-cyan-200 text-center">
          {modeOptions.find((m) => m.key === debateConfig.mode)?.desc}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col lg:flex-row flex-grow p-4 gap-4 max-w-screen-2xl w-full mx-auto">
        {/* Left/Central Column */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          {/* 1. Central Debate Stage */}
          <section className="flex justify-around items-start p-4 bg-[#111C33]/50 rounded-lg">
             {/* Only show the User and their direct opponent on the main stage */}
             <SpeakerAvatar speaker={speakers[0]} isUser={true} />
             <div className="text-5xl font-thin text-gray-600 pt-12">VS</div>
             <SpeakerAvatar speaker={speakers[1]} isUser={false} />
          </section>

          {/* --- MODE-SPECIFIC UI: PRACTICE MODE --- */}
          {debateConfig.mode === 'practice' && (
            <section className="bg-blue-900/30 border border-blue-400/30 rounded-lg p-4 mb-2 flex flex-col gap-2 animate-fade-in">
              <div className="font-bold text-blue-200 flex items-center gap-2"><BrainCircuit className="w-5 h-5"/>AI Coach:</div>
              <div className="text-blue-100 text-sm">{`Step: ${currentSpeaker.role === 'Prime Minister' ? 'Introduce your main arguments now.' : 'Prepare to rebut the previous speech.'}`}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">Request Hint</Button>
                <Button size="sm" className="bg-cyan-800 hover:bg-cyan-900 text-white">See Example</Button>
                <Button size="sm" className="bg-cyan-800 hover:bg-cyan-900 text-white">Show Template</Button>
              </div>
              <div className="mt-2 text-xs text-blue-200">AI will give live suggestions and micro-feedback after each segment.</div>
            </section>
          )}

          {/* --- MODE-SPECIFIC UI: LEARNING MODE --- */}
          {debateConfig.mode === 'learning' && (
            <section className="bg-purple-900/30 border border-purple-400/30 rounded-lg p-4 mb-2 flex flex-col gap-2 animate-fade-in">
              <div className="font-bold text-purple-200 flex items-center gap-2"><BrainCircuit className="w-5 h-5"/>Skill Drill:</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <label className="text-xs text-purple-100">Choose Skill:</label>
                <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} className="bg-[#1A2842] text-purple-200 border border-purple-400 rounded px-2 py-1 text-xs">
                  {skillOptions.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                </select>
              </div>
              <div className="text-purple-100 text-sm mt-2">{`Drill: Practice ${selectedSkill.toLowerCase()}.`}</div>
              <div className="mt-2 text-xs text-purple-200">AI will give skill-specific feedback and track your progress.</div>
              {/* Voice input button and AI response */}
              <div className="mt-4 flex flex-col gap-2 items-start">
                                <Button onClick={streaming ? stopLearningStreaming : startLearningStreaming} className={streaming ? "bg-red-600" : "bg-green-600"}>
                  {streaming ? "Stop Listening" : "Start Listening"}
                </Button>
                {aiAnswer && (
                  <div className="mt-2 p-2 bg-purple-950/60 rounded text-purple-100 max-w-lg">
                    <b>AI Answer:</b> {aiAnswer}
                  </div>
                )}
                {aiAudioUrl && (
                  <audio src={aiAudioUrl} controls autoPlay className="mt-2" />
                )}
              </div>
            </section>
          )}

          {/* --- MODE-SPECIFIC UI: CHALLENGE MODE --- */}
          {debateConfig.mode === 'challenge' && (
            <section className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4 mb-2 flex flex-col gap-2 animate-fade-in">
              <div className="font-bold text-yellow-200 flex items-center gap-2"><Bot className="w-5 h-5"/>Challenge Mode:</div>
              <div className="text-yellow-100 text-sm">Debate against a skilled AI opponent. No coaching or hints during speeches.</div>
              <div className="mt-2 text-xs text-yellow-200">Judge-style feedback will be provided after each round.</div>
            </section>
          )}

          {/* --- MODE-SPECIFIC UI: QUICK DEBATE --- */}
          {debateConfig.mode === 'quick' && (
            <section className="bg-green-900/20 border border-green-400/30 rounded-lg p-4 mb-2 flex flex-col gap-2 animate-fade-in">
              <div className="font-bold text-green-200 flex items-center gap-2"><Bot className="w-5 h-5"/>Quick Debate:</div>
              <div className="text-green-100 text-sm">Jump straight into a casual debate round. Minimal setup, fast feedback.</div>
              <div className="mt-2 text-xs text-green-200">A brief summary will be provided after the debate.</div>
            </section>
          )}

          {/* 2. Timer (hide in learning mode) */}
          {debateConfig.mode !== 'learning' && (
            <section className="flex justify-center">
              <TimerDisplay
                timeLeft={timeLeft}
                totalTime={totalTime}
                isProtectedTime={isProtectedTime}
                isDebateActive={isDebateActive}
                onToggleDebate={() => setIsDebateActive(p => !p)}
              />
            </section>
          )}

          {/* 3. Transcription Panel */}
          <section className="flex-grow min-h-[300px]">
          <TranscriptionPanel transcriptions={transcriptions} />
          </section>

          {/* 4. Main Action Controls */}
           <section className="flex flex-col gap-3">
          <POIControls
            isProtectedTime={isProtectedTime}
            onOfferPOI={handleOfferPOI}
                currentSpeaker={currentSpeaker}
                poiRequests={poiRequests}
                onAcceptPOI={handleAcceptPOI}
                onRejectPOI={handleRejectPOI}
              />
              {currentSpeaker.id === "user_pm" && (
                <Button onClick={handleEndSpeech} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg">
                  End My Speech
                </Button>
              )}
                {/* Demo button to simulate AI offering a POI to the user */}
               <Button onClick={handleAIAcceptsPOI} variant="outline" size="sm" className="max-w-xs mx-auto border-yellow-500 text-yellow-500">
                  (Demo: AI Offers POI)
                </Button>
            </section>
              </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-4">
            {/* 5. Session Controls */}
            <Card className="bg-[#1A2842] border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Settings/>Controls</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                    <Button variant={isMuted ? "destructive" : "outline"} onClick={() => setIsMuted(!isMuted)} className="h-12 bg-transparent hover:bg-gray-700/50 border-gray-600 gap-2">{isMuted ? <MicOff/> : <Mic/>} {isMuted ? "Unmute" : "Mute"}</Button>
                    <Button variant={!isVideoOn ? "destructive" : "outline"} onClick={() => setIsVideoOn(!isVideoOn)} className="h-12 bg-transparent hover:bg-gray-700/50 border-gray-600 gap-2">{isVideoOn ? <Video/> : <VideoOff/>} {isVideoOn ? "Video Off" : "Video On"}</Button>
                    <Button variant="outline" className="h-12 bg-transparent hover:bg-gray-700/50 border-gray-600 gap-2"><Info/> Format Rules</Button>
                    <Button variant="destructive" onClick={handleExitDebate} className="h-12 gap-2"><LogOut/> Exit Debate</Button>
            </CardContent>
          </Card>

            {/* 6. AI Feedback Panel */}
            <FeedbackPanel mode={debateConfig.mode} />

            {/* 7. Speaker Order */}
            <SpeakerOrderPanel speakers={speakers} currentSpeakerIndex={currentSpeakerIndex} />

            {/* 8. Notes Panel */}
          <NotesPanel notes={notes} onNotesChange={setNotes} />
        </aside>
      </main>
    </div>
  );
}