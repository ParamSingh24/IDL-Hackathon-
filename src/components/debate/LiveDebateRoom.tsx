import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface DebateConfig {
  mode: 'learning' | 'challenge' | 'practice' | 'quick';
  timeLimit: number;
  protectedTime: number;
  poiEnabled: boolean;
  motion?: string;
  format?: string;
}
import { SarvamAIClient } from "sarvamai";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Mic, MicOff, Video, VideoOff, Settings, LogOut, Info, Volume2,
  PauseCircle, PlayCircle, Hand, Check, X, MessageSquareQuote, FileText, Bot, BrainCircuit, Download
} from "lucide-react";

interface Speaker {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  isSpeaking: boolean;
}

interface SpeakerAvatarProps {
  speaker: Speaker;
  isUser: boolean;
}

// HELPER COMPONENT: Speaker Avatar (Central Stage)
const SpeakerAvatar = ({ speaker, isUser }: SpeakerAvatarProps) => (
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

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  isProtectedTime: boolean;
  isDebateActive: boolean;
  onToggleDebate: () => void;
}

// HELPER COMPONENT: Timer Display
const TimerDisplay = ({ timeLeft, totalTime, isProtectedTime, isDebateActive, onToggleDebate }: TimerDisplayProps) => {
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
const NotesPanel = ({ notes, onNotesChange }) => {
  const handleDownload = () => {
    const blob = new Blob([notes || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'debate_notes.txt';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Card className="bg-[#1A2842] border-gray-700">
      <CardHeader><CardTitle className="flex items-center gap-2 text-gray-200"><FileText className="w-5 h-5"/>My Notes</CardTitle></CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Type your arguments, rebuttals, and POIs here..."
          className="h-48 bg-[#0B1426] border-gray-600 text-gray-300 resize-none"
        />
        <Button onClick={handleDownload} variant="outline" size="sm" className="mt-3 gap-2 w-full">
          <Download className="w-4 h-4" /> Download Notes
        </Button>
      </CardContent>
    </Card>
);
};

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

  // --- State for the debate room ---
  const [debateConfig, setDebateConfig] = useState<DebateConfig>({
    mode: 'learning',
    timeLimit: 7,
    protectedTime: 1,
    poiEnabled: true,
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
  const [isReading, setIsReading] = useState(false);
  const [showFormatRules, setShowFormatRules] = useState(false);
  
  // AI and streaming states
  const [learningError, setLearningError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Text-to-speech function
  const readAloud = (text?: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    // If text is provided, use it; otherwise, try to get selected text
    const content = text || window.getSelection()?.toString();
    
    if (!content) {
      alert('Please select some text first or provide text to read');
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Create and speak the utterance
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsReading(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
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

  // --- Voice Interaction State ---
  const recognitionRef = useRef<any>(null);
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Speak text using Chrome's TTS
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle voice input
  const toggleListening = () => {
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';
      
      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setUserInput(transcript);
        handleUserQuery(transcript);
      };
      
      recognitionRef.current.onerror = (e: any) => {
        console.error('Speech recognition error', e.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setUserInput("");
      setBotResponse("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Handle user query with Sarvam AI
  const handleUserQuery = async (query: string) => {
    if (!query.trim()) return;
    
    setIsPending(true);
    setBotResponse("");
    
    try {
      const client = new SarvamAIClient({ 
        apiSubscriptionKey: "sk_lahp42w4_8K8JJohnNZZFOaNypvGOPINi" 
      });
      
      const response = await client.chat.completions({
        messages: [
          { 
            role: "system", 
            content: "You are a debate coach AI. Provide concise, practical arguments, structure, evidence tips, and psychological techniques (framing, tone, persuasion) to help the user win debates." 
          },
          { 
            role: "user", 
            content: query 
          },
        ],
      });

      const reply = response.choices[0].message.content?.replace(/\*\*/g, "") || "I couldn't process that request.";
      setBotResponse(reply);
      speak(reply);
    } catch (error) {
      console.error('Error calling Sarvam API:', error);
      const errorMessage = "Sorry, I'm having trouble connecting to the assistant. Please try again later.";
      setBotResponse(errorMessage);
      speak(errorMessage);
    } finally {
      setIsPending(false);
    }
  };


  // 2. Derived State using useMemo for efficiency
  const totalTime = useMemo(() => (debateConfig.timeLimit || 7) * 60, [debateConfig.timeLimit]);
  const isProtectedTime = useMemo(() => timeLeft > totalTime - 60 || timeLeft < 60, [timeLeft, totalTime]);
  const currentSpeaker = useMemo(() => speakers[currentSpeakerIndex], [speakers, currentSpeakerIndex]);

  // Mode options for buttons
  const modeOptions = [
    {
      key: 'practice',
      label: 'Practice Mode',
      desc: '(Coming Soon) Guided coaching with real-time feedback',
      future: true,
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
      desc: '(Coming Soon) Instant casual debate round',
      future: true,
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
  type DebateMode = 'learning' | 'challenge' | 'practice' | 'quick';
  
  const handleModeChange = (modeKey: string, future?: boolean) => {
    if (future) {
      if (modeKey === 'practice') {
        alert('Practice Mode will be available soon! Here you will be able to practice debates with advanced coaching tools. In the meantime, please use Learning or Challenge mode for debate practice.');
      } else if (modeKey === 'quick') {
        alert('Quick Debate Mode will be available soon for fast practice rounds. For now, try Learning or Challenge mode to practice.');
      }
      return;
    }
    
    // Ensure modeKey is one of the allowed values
    const validModes: readonly DebateMode[] = ['learning', 'challenge', 'practice', 'quick'];
    if (!validModes.includes(modeKey as DebateMode)) {
      console.error(`Invalid mode: ${modeKey}`);
      return;
    }
    
    const newMode = modeKey as DebateMode;
    setDebateConfig((prev: DebateConfig) => ({
      ...prev,
      mode: newMode
    }));
  };
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

  // --- Start Streaming STT (Sarvam Production Integration) ---
  async function startLearningStreaming() {
    setLearningError(null);
    setLiveTranscript("");
    setAiAnswer("");
    setAiAudioUrl("");
    setIsStreaming(true);
    
    try {
      // Make the request to the Flask backend
      const res = await fetch('http://127.0.0.1:5000/run-voice-assistant', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Get the response data
      const data = await res.json();
      
      // Update the UI with the transcript and response
      setLiveTranscript(data.transcript || "");
      setAiAnswer(data.response || "");
      
      // If there's an audio URL in the response, play it
      if (data.audio_url) {
        // Create the full URL if it's a relative path
        const fullAudioUrl = data.audio_url.startsWith('http') 
          ? data.audio_url 
          : `http://127.0.0.1:5000${data.audio_url}`;
        
        setAiAudioUrl(fullAudioUrl);
        
        // Play the audio
        const audio = new Audio(fullAudioUrl);
        audio.preload = 'auto';
        audio.onerror = (e) => {
          console.error("Error loading audio:", e);
          setLearningError("Could not load the audio response.");
        };
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Error playing audio:", e);
            setLearningError("Could not play the audio response. Please check your audio settings.");
          });
        }
      }
      
    } catch (e: any) {
      console.error("Error calling voice assistant:", e);
      setLearningError(e.message || "An error occurred while processing your request.");
    } finally {
      setIsStreaming(false);
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
                onClick={() => handleModeChange(mode.key, mode.future)}
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
            <main className="flex flex-col lg:flex-row flex-grow p-4 gap-4 w-full">
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
            <section className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-lg border border-purple-500/30">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-3">Voice Assistant</h3>
                <p className="text-purple-200 mb-6">Click the button below to speak with the AI assistant</p>
                
                {/* Voice Input Button */}
                <button
                  onClick={toggleListening}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg'
                  }`}
                  disabled={isSpeaking}
                >
                  {isListening ? (
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-white rounded-full mb-1 animate-pulse"></div>
                      <span className="text-white text-sm">Listening...</span>
                    </div>
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
                
                {/* User Input Display */}
                {userInput && (
                  <div className="mt-6 w-full max-w-2xl bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                    <p className="text-purple-200 text-sm font-medium mb-1">You said:</p>
                    <p className="text-white">{userInput}</p>
                  </div>
                )}
                
                {/* Bot Response */}
                {botResponse && (
                  <div className="mt-4 w-full max-w-2xl bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-blue-200 text-sm font-medium">Assistant:</p>
                      {isSpeaking ? (
                        <button 
                          onClick={stopSpeaking}
                          className="text-blue-300 hover:text-white text-xs flex items-center gap-1"
                        >
                          <PauseCircle className="w-4 h-4" /> Stop
                        </button>
                      ) : null}
                    </div>
                    <p className="text-white">{botResponse}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* --- MODE-SPECIFIC UI: CHALLENGE MODE --- */}
          {debateConfig.mode === 'challenge' && (
            <section className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-6 mb-2 flex flex-col gap-6 items-center animate-fade-in">
              <div className="w-full flex flex-col gap-2 text-center">
                <div className="font-bold text-yellow-200 flex items-center gap-2 justify-center"><Bot className="w-5 h-5"/>Challenge Mode</div>
                <div className="text-yellow-100 text-sm">Debate against a skilled AI opponent. No coaching or hints during speeches.</div>
                <div className="mt-1 text-xs text-yellow-200">Judge-style feedback will be provided after each round.</div>
              </div>
              
              {/* Voice Input Button for Challenge Mode */}
              <div className="flex flex-col items-center gap-4 w-full">
                <button
                  onClick={toggleListening}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                      : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-lg'
                  }`}
                  disabled={isSpeaking}
                >
                  {isListening ? (
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-white rounded-full mb-1 animate-pulse"></div>
                    </div>
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </button>
                <p className="text-yellow-200 text-sm">
                  {isListening ? 'Listening...' : 'Tap to speak'}
                </p>
                
                {/* User Input Display */}
                {userInput && (
                  <div className="w-full max-w-2xl bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30 mt-2">
                    <p className="text-yellow-200 text-sm font-medium mb-1">You said:</p>
                    <p className="text-white text-sm">{userInput}</p>
                  </div>
                )}
              </div>
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
                    <Button variant="outline" onClick={() => setShowFormatRules(true)} className="h-12 bg-transparent hover:bg-gray-700/50 border-gray-600 gap-2"><Info/> Format Rules</Button>
                    <Button variant="destructive" onClick={handleExitDebate} className="h-12 gap-2"><LogOut/> Exit Debate</Button>
            </CardContent>
          </Card>

            {/* Sidebar Panels Order */}
            {debateConfig.mode === 'learning' ? (
              <>
                {/* Notes Panel comes first in learning mode */}
                <NotesPanel notes={notes} onNotesChange={setNotes} />
                {/* Speaker Order remains in middle */}
                <SpeakerOrderPanel speakers={speakers} currentSpeakerIndex={currentSpeakerIndex} />
                {/* AI Analysis moved to bottom */}
                <FeedbackPanel mode={debateConfig.mode} />
              </>
            ) : (
              <>
                {/* Default order for other modes */}
                <FeedbackPanel mode={debateConfig.mode} />
                <SpeakerOrderPanel speakers={speakers} currentSpeakerIndex={currentSpeakerIndex} />
                <NotesPanel notes={notes} onNotesChange={setNotes} />
              </>
            )}
        </aside>
      </main>

      {/* Format Rules Modal */}
      {showFormatRules && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowFormatRules(false)}>
          <div className="bg-[#1A2842] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Debate Format Rules</h2>
              <button 
                onClick={() => setShowFormatRules(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* British Parliament Format */}
              <div className="bg-[#111C33] p-4 rounded-lg border border-blue-500/30">
                <h3 className="text-xl font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                  British Parliament Format
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-900/30 rounded border border-blue-500/30">
                    <h4 className="font-medium text-blue-200">Opening Government (OG)</h4>
                    <ul className="mt-2 text-sm text-gray-300 space-y-1 pl-4 list-disc">
                      <li>Prime Minister (PM) - 7 min</li>
                      <li>Deputy Prime Minister (DPM) - 7 min</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-900/30 rounded border border-blue-500/30">
                    <h4 className="font-medium text-blue-200">Opening Opposition (OO)</h4>
                    <ul className="mt-2 text-sm text-gray-300 space-y-1 pl-4 list-disc">
                      <li>Leader of Opposition (LO) - 7 min</li>
                      <li>Deputy Leader of Opposition (DLO) - 7 min</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-900/30 rounded border border-blue-500/30">
                    <h4 className="font-medium text-blue-200">Closing Government (CG)</h4>
                    <ul className="mt-2 text-sm text-gray-300 space-y-1 pl-4 list-disc">
                      <li>Member of Government (MG) - 7 min</li>
                      <li>Government Whip (GW) - 7 min</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-900/30 rounded border border-blue-500/30">
                    <h4 className="font-medium text-blue-200">Closing Opposition (CO)</h4>
                    <ul className="mt-2 text-sm text-gray-300 space-y-1 pl-4 list-disc">
                      <li>Member of Opposition (MO) - 7 min</li>
                      <li>Opposition Whip (OW) - 7 min</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Asian Parliament Format */}
              <div className="bg-[#111C33] p-4 rounded-lg border border-amber-500/30">
                <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                  Asian Parliament Format
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-amber-900/20 rounded border border-amber-500/30">
                    <h4 className="font-medium text-amber-200">Prime Minister (PM) - 7 min</h4>
                    <p className="mt-1 text-sm text-amber-100/80">Define and interpret the motion, present the government case.</p>
                  </div>
                  <div className="p-3 bg-amber-900/20 rounded border border-amber-500/30">
                    <h4 className="font-medium text-amber-200">Leader of Opposition (LO) - 7 min</h4>
                    <p className="mt-1 text-sm text-amber-100/80">Refute the PM's case, present opposition's stance.</p>
                  </div>
                  <div className="p-3 bg-amber-900/20 rounded border border-amber-500/30">
                    <h4 className="font-medium text-amber-200">Deputy Prime Minister (DPM) - 7 min</h4>
                    <p className="mt-1 text-sm text-amber-100/80">Rebuild government case, respond to LO's arguments.</p>
                  </div>
                  <div className="p-3 bg-amber-900/20 rounded border border-amber-500/30">
                    <h4 className="font-medium text-amber-200">Deputy Leader of Opposition (DLO) - 7 min</h4>
                    <p className="mt-1 text-sm text-amber-100/80">Rebuild opposition case, respond to DPM.</p>
                  </div>
                  <div className="p-3 bg-amber-900/20 rounded border border-amber-500/30">
                    <h4 className="font-medium text-amber-200">Government Whip (GW) - 4 min</h4>
                    <p className="mt-1 text-sm text-amber-100/80">Summarize the debate from government's perspective.</p>
                  </div>
                  <div className="p-3 bg-amber-900/20 rounded border border-amber-500/30">
                    <h4 className="font-medium text-amber-200">Opposition Whip (OW) - 4 min</h4>
                    <p className="mt-1 text-sm text-amber-100/80">Summarize the debate from opposition's perspective.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded">
              <h4 className="font-medium text-blue-200 mb-2">Points of Information (POIs)</h4>
              <p className="text-sm text-gray-300">
                POIs can be offered between the 1st and 6th minute of each speech (except reply speeches).
                Speakers should accept at least 2 POIs during their speech.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}