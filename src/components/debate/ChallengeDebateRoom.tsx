import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SarvamAIClient } from "sarvamai";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PauseCircle,
  PlayCircle,
  Hand,
  Check,
  X,
  MessageSquareQuote,
  FileText,
  Bot,
  BrainCircuit,
  Download,
  Settings,
  LogOut,
  Info,
  Loader2,
  AlertCircle
} from "lucide-react";

interface DebateConfig {
  mode: 'challenge';
  timeLimit: number;
  protectedTime: number;
  poiEnabled: boolean;
  motion: string;
  format: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  opponentStyle: 'aggressive' | 'diplomatic' | 'logical' | 'emotional';
}

interface Speaker {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  isSpeaking: boolean;
  isAI: boolean;
  speakingTime: number;
  points: number;
}

interface DebateMessage {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  isPOI: boolean;
  isRebuttal: boolean;
  isStrategy: boolean;
}

const ChallengeDebateRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [debateConfig, setDebateConfig] = useState<DebateConfig>({
    mode: 'challenge',
    timeLimit: 300, // 5 minutes
    protectedTime: 30,
    poiEnabled: true,
    motion: location.state?.motion || 'This house would implement a universal basic income',
    format: location.state?.format || 'British Parliamentary',
    difficulty: location.state?.difficulty || 'intermediate',
    opponentStyle: location.state?.opponentStyle || 'logical',
  });

  // Debate state
  const [isDebateActive, setIsDebateActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(debateConfig.timeLimit);
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const [userNotes, setUserNotes] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const [debateHistory, setDebateHistory] = useState<DebateMessage[]>([]);
  const [poiQueue, setPoiQueue] = useState<{id: string, speaker: Speaker, timestamp: Date}[]>([]);
  
  // Speech recognition and synthesis
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

  // Debate participants
  const [speakers, setSpeakers] = useState<Speaker[]>([
    {
      id: "user_pm",
      name: "You",
      role: "Prime Minister",
      avatarUrl: "https://github.com/shadcn.png",
      isSpeaking: false,
      isAI: false,
      speakingTime: 0,
      points: 0
    },
    {
      id: "ai_lo",
      name: "Opposition Leader",
      role: "AI Opponent",
      avatarUrl: "/ai-avatar.png",
      isSpeaking: false,
      isAI: true,
      speakingTime: 0,
      points: 0
    },
    {
      id: "user_dpm",
      name: "Deputy PM",
      role: "Your Teammate",
      avatarUrl: "https://github.com/shadcn.png",
      isSpeaking: false,
      isAI: false,
      speakingTime: 0,
      points: 0
    },
    {
      id: "ai_member",
      name: "Opposition Member",
      role: "AI Teammate",
      avatarUrl: "/ai-avatar-2.png",
      isSpeaking: false,
      isAI: true,
      speakingTime: 0,
      points: 0
    }
  ]);

  // Initialize speech recognition
  useEffect(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserMessage(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Handle timer
  useEffect(() => {
    if (isDebateActive && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleEndOfSpeech();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDebateActive, isPaused, timeLeft]);

  // AI response generation
  const generateAIResponse = async (context: string, isRebuttal = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const client = new SarvamAIClient({ 
        apiSubscriptionKey: process.env.NEXT_PUBLIC_SARVAM_API_KEY || ""
      });

      const response = await client.chat.completions({
        messages: [
          { 
            role: "system", 
            content: `You are a debate opponent in a ${debateConfig.format} debate. 
                     Current motion: ${debateConfig.motion}
                     Difficulty: ${debateConfig.difficulty}
                     Style: ${debateConfig.opponentStyle}
                     ${isRebuttal ? 'This is a rebuttal to the previous point.' : ''}
                     Be concise, strategic, and ${debateConfig.opponentStyle} in your responses.`
          },
          { 
            role: "user", 
            content: context 
          },
        ],
      });

      return response.choices[0].message.content || "I don't have a response for that.";
    } catch (error) {
      console.error('Error generating AI response:', error);
      setError('Failed to generate AI response. Please try again.');
      return "I'm having trouble formulating a response right now.";
    } finally {
      setIsLoading(false);
    }
  };

  // Speech synthesis
  const speak = (text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      setError("Speech synthesis is not supported in your browser.");
      return;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    synthesisRef.current = utterance;
    
    utterance.onend = () => {
      setIsBotSpeaking(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setError('Error with speech synthesis.');
      setIsBotSpeaking(false);
    };
    
    setIsBotSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Failed to start speech recognition. Please ensure your microphone is connected.');
      }
    }
  };

  // Handle POI request
  const handleRequestPOI = () => {
    if (!currentSpeaker || !currentSpeaker.isAI) return;
    
    // Add POI to queue
    const newPOI = {
      id: `poi_${Date.now()}`,
      speaker: speakers.find(s => s.isAI && !s.isSpeaking) || speakers[1],
      timestamp: new Date()
    };
    
    setPoiQueue(prev => [...prev, newPOI]);
    
    // Notify user
    toast.success('POI Requested', {
      description: 'Waiting for the current speaker to finish...',
      duration: 3000
    });
  };

  // Handle end of speech
  const handleEndOfSpeech = async () => {
    if (!currentSpeaker) return;
    
    // Update speaker stats
    const updatedSpeakers = speakers.map(speaker => 
      speaker.id === currentSpeaker.id
        ? { ...speaker, isSpeaking: false, speakingTime: speaker.speakingTime + (debateConfig.timeLimit - timeLeft) }
        : speaker
    );
    
    setSpeakers(updatedSpeakers);
    
    // Add the speaker's final message to history if they were speaking
    if (currentSpeaker.isSpeaking) {
      const messageText = currentSpeaker.isAI ? 
        debateHistory[debateHistory.length - 1]?.text || "" : 
        userMessage;
      
      if (messageText) {
        const newMessage: DebateMessage = {
          id: `msg_${Date.now()}`,
          speaker: currentSpeaker.name,
          text: messageText,
          timestamp: new Date(),
          isPOI: false,
          isRebuttal: false,
          isStrategy: false
        };
        
        setDebateHistory(prev => [...prev, newMessage]);
      }
    }
    
    setCurrentSpeaker(null);
    
    // If it was an AI's turn, process POI or move to next speaker
    if (currentSpeaker.isAI) {
      if (poiQueue.length > 0) {
        // Handle POI
        const nextPOI = poiQueue[0];
        setPoiQueue(prev => prev.slice(1));
        
        // Set POI speaker as current
        setCurrentSpeaker(nextPOI.speaker);
        
        // Generate POI response
        const poiResponse = await generateAIResponse("The user has raised a point of information. Please respond concisely.", true);
        
        // Add to debate history
        const newMessage: DebateMessage = {
          id: `msg_${Date.now()}`,
          speaker: nextPOI.speaker.name,
          text: poiResponse,
          timestamp: new Date(),
          isPOI: true,
          isRebuttal: false,
          isStrategy: false
        };
        
        setDebateHistory(prev => [...prev, newMessage]);
        
        // Speak the POI
        speak(poiResponse, () => {
          // After POI, return to original speaker
          setCurrentSpeaker(currentSpeaker);
          setTimeLeft(debateConfig.timeLimit);
        });
      } else {
        // Move to next speaker
        const currentIndex = speakers.findIndex(s => s.id === currentSpeaker.id);
        const nextIndex = (currentIndex + 1) % speakers.length;
        setCurrentSpeaker(speakers[nextIndex]);
        setTimeLeft(debateConfig.timeLimit);
      }
    } else {
      // If user finished speaking, AI responds
      const nextSpeaker = speakers.find(s => s.isAI);
      if (nextSpeaker) {
        setCurrentSpeaker(nextSpeaker);
        setTimeLeft(debateConfig.timeLimit);
        
        // Generate AI response
        const aiResponse = await generateAIResponse(`The user said: "${userMessage}". Please respond to their points.`);
        
        // Add to debate history
        const newMessage: DebateMessage = {
          id: `msg_${Date.now()}`,
          speaker: nextSpeaker.name,
          text: aiResponse,
          timestamp: new Date(),
          isPOI: false,
          isRebuttal: true,
          isStrategy: false
        };
        
        setDebateHistory(prev => [...prev, newMessage]);
        
        // Speak the response
        speak(aiResponse, handleEndOfSpeech);
        
        // Clear user message after AI responds
        setUserMessage("");
      }
    }
  };

  // Start debate
  const startDebate = () => {
    setIsDebateActive(true);
    setCurrentSpeaker(speakers[0]); // Start with first speaker
    setTimeLeft(debateConfig.timeLimit);
    
    // Add welcome message
    const welcomeMessage: DebateMessage = {
      id: `msg_${Date.now()}`,
      speaker: "System",
      text: `Debate started on the motion: ${debateConfig.motion}`,
      timestamp: new Date(),
      isPOI: false,
      isRebuttal: false,
      isStrategy: false
    };
    
    setDebateHistory(prev => [welcomeMessage, ...prev]);
  };

  // Pause/resume debate
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (synthesisRef.current) {
        window.speechSynthesis.resume();
      }
    } else {
      setIsPaused(true);
      if (synthesisRef.current) {
        window.speechSynthesis.pause();
      }
    }
  };

  // End debate
  const endDebate = () => {
    setIsDebateActive(false);
    setCurrentSpeaker(null);
    setTimeLeft(0);
    
    if (synthesisRef.current) {
      window.speechSynthesis.cancel();
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    // Calculate scores (simplified)
    const updatedSpeakers = speakers.map(speaker => ({
      ...speaker,
      points: Math.floor(Math.random() * 50) + 50 // Random score for demo
    }));
    
    setSpeakers(updatedSpeakers);
    
    // Add end message
    const endMessage: DebateMessage = {
      id: `msg_${Date.now()}`,
      speaker: "System",
      text: "Debate has ended. Thank you for participating!",
      timestamp: new Date(),
      isPOI: false,
      isRebuttal: false,
      isStrategy: false
    };
    
    setDebateHistory(prev => [...prev, endMessage]);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle submit message
  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim() || !currentSpeaker || currentSpeaker.isAI) return;
    
    // Add user message to history
    const newMessage: DebateMessage = {
      id: `msg_${Date.now()}`,
      speaker: currentSpeaker.name,
      text: userMessage,
      timestamp: new Date(),
      isPOI: false,
      isRebuttal: false,
      isStrategy: false
    };
    
    setDebateHistory(prev => [...prev, newMessage]);
    
    // Process AI response
    await handleEndOfSpeech();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      {/* Error toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Challenge Debate</h1>
        <div className="flex items-center space-x-4">
          {isDebateActive ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={togglePause} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isPaused ? (
                  <PlayCircle className="w-4 h-4 mr-2" />
                ) : (
                  <PauseCircle className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Processing...' : isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={endDebate}
                disabled={isLoading}
              >
                End Debate
              </Button>
            </>
          ) : (
            <Button 
              onClick={startDebate}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4 mr-2" />
              )}
              Start Debate
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Speakers */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Speakers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {speakers.map((speaker) => (
                <div 
                  key={speaker.id} 
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    currentSpeaker?.id === speaker.id 
                      ? 'bg-blue-900/50 border border-blue-500' 
                      : 'bg-gray-700/50 hover:bg-gray-700/70'
                  }`}
                >
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarImage src={speaker.avatarUrl} alt={speaker.name} />
                    <AvatarFallback>{speaker.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{speaker.name}</div>
                    <div className="text-xs text-gray-400 truncate">{speaker.role}</div>
                  </div>
                  <div className="text-sm font-mono whitespace-nowrap ml-2">
                    {formatTime(speaker.speakingTime)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Timer */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-mono text-center mb-4">
                {formatTime(timeLeft)}
              </div>
              <div className="flex flex-col space-y-2">
                {!isDebateActive ? (
                  <Button 
                    onClick={startDebate} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <PlayCircle className="w-4 h-4 mr-2" />
                    )}
                    Start Debate
                  </Button>
                ) : (
                  <Button 
                    onClick={handleEndOfSpeech} 
                    disabled={!currentSpeaker || currentSpeaker.isAI || isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    End Speech
                  </Button>
                )}
                
                {isDebateActive && (
                  <Button 
                    variant="outline" 
                    onClick={togglePause}
                    disabled={!isDebateActive || isLoading}
                    className="w-full"
                  >
                    {isPaused ? (
                      <PlayCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <PauseCircle className="w-4 h-4 mr-2" />
                    )}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main debate area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Motion */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {debateConfig.motion}
              </CardTitle>
              <div className="text-center text-sm text-gray-400">
                {debateConfig.format} • {debateConfig.difficulty.charAt(0).toUpperCase() + debateConfig.difficulty.slice(1)} • {debateConfig.opponentStyle} opponent
              </div>
            </CardHeader>
          </Card>

          {/* Debate messages */}
          <Card className="bg-gray-800 border-gray-700 flex-1 flex flex-col h-[500px]">
            <CardHeader className="border-b border-gray-700 py-3">
              <CardTitle className="text-lg">Debate Flow</CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {debateHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p>Preparing debate...</p>
                    </div>
                  ) : (
                    <p>Debate will appear here. Click "Start Debate" to begin.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {debateHistory.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-4 rounded-lg ${
                        msg.isPOI 
                          ? 'bg-purple-900/30 border-l-4 border-purple-500' 
                          : msg.isRebuttal 
                            ? 'bg-blue-900/30 border-l-4 border-blue-500' 
                            : msg.speaker === 'System'
                              ? 'bg-gray-700/50 border-l-4 border-gray-500'
                              : 'bg-gray-700/50 border-l-4 border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{msg.speaker}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <div className="text-sm">{msg.text}</div>
                      {msg.isPOI && (
                        <div className="mt-1 text-xs text-purple-300">Point of Information</div>
                      )}
                      {msg.isRebuttal && (
                        <div className="mt-1 text-xs text-blue-300">Rebuttal</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* User input */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <form onSubmit={handleSubmitMessage} className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Textarea
                    placeholder="Type your argument or use voice input..."
                    className="min-h-[100px] bg-gray-700 border-gray-600 text-white"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    disabled={!currentSpeaker || currentSpeaker.isAI || !isDebateActive || isPaused}
                  />
                  <div className="flex flex-col space-y-2">
                    <Button 
                      type="button"
                      variant={isListening ? 'destructive' : 'outline'} 
                      size="icon"
                      onClick={toggleListening}
                      disabled={!currentSpeaker || currentSpeaker.isAI || !isDebateActive || isPaused}
                      className="h-10 w-10"
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="icon"
                      onClick={handleRequestPOI}
                      disabled={!currentSpeaker?.isAI || !isDebateActive || isPaused}
                      className="h-10 w-10"
                    >
                      <Hand className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    {currentSpeaker 
                      ? currentSpeaker.isAI 
                        ? 'AI is speaking...' 
                        : 'Your turn to speak'
                      : 'Debate not started'}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!userMessage.trim() || !currentSpeaker || currentSpeaker.isAI || !isDebateActive || isPaused}
                    className="ml-auto"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar - Notes & Strategy */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Your Notes</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Take notes during the debate..."
                className="min-h-[200px] bg-gray-700 border-gray-600 text-white"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader 
              className="pb-2 cursor-pointer" 
              onClick={() => setShowStrategy(!showStrategy)}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Strategy Assistant</CardTitle>
                <Button variant="ghost" size="sm">
                  <BrainCircuit className="w-4 h-4 mr-1" />
                  {showStrategy ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            {showStrategy && (
              <CardContent className="pt-0">
                <div className="text-sm text-gray-300 space-y-3">
                  <p><strong>Motion:</strong> {debateConfig.motion}</p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Points:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Focus on the core issue: {debateConfig.motion.split(' ').slice(0, 5).join(' ')}...</li>
                      <li>Anticipate {debateConfig.opponentStyle} counter-arguments</li>
                      <li>Use clear signposting for your points</li>
                      <li>Prepare responses to common POIs</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Opponent Style:</h4>
                    <div className="bg-gray-700/50 p-3 rounded-md">
                      {debateConfig.opponentStyle === 'aggressive' && (
                        <p>Your opponent will be direct and assertive. Stay calm and focus on logic.</p>
                      )}
                      {debateConfig.opponentStyle === 'diplomatic' && (
                        <p>Your opponent will be polite but firm. Watch for subtle rhetorical techniques.</p>
                      )}
                      {debateConfig.opponentStyle === 'logical' && (
                        <p>Your opponent will focus on reasoning and evidence. Be precise with your arguments.</p>
                      )}
                      {debateConfig.opponentStyle === 'emotional' && (
                        <p>Your opponent will appeal to emotions. Balance with facts and logic.</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDebateRoom;
