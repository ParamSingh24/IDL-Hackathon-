import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

// Types
import { 
  DebateConfig, 
  Speaker, 
  DebateMessage, 
  Difficulty,
  OpponentStyle
} from '@/types/debate';

// Hooks
import useDebateState from '@/hooks/useDebateState';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis';

// UI Components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Icons
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings, 
  Send, 
  X, 
  Check, 
  Clock, 
  Zap, 
  AlertCircle, 
  Info,
  Loader2,
  PlayCircle,
  PauseCircle,
  Hand,
  BrainCircuit,
  Download
} from 'lucide-react';

interface ChallengeDebateRoomProps {
  initialConfig?: Partial<DebateConfig>;
}

const defaultConfig: DebateConfig = {
  mode: 'challenge',
  timeLimit: 5, // minutes
  protectedTime: 30, // seconds
  poiEnabled: true,
  motion: 'This house believes that artificial intelligence will have a net positive impact on society',
  format: 'British Parliamentary',
  difficulty: 'intermediate',
  opponentStyle: 'logical',
};

const ChallengeDebateRoom = () => {
  const navigate = useRouter();
  const location = useRouter();
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
  const [isDebateActive, setIsDebateActive] = useState(true); // Start debate immediately
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(debateConfig.timeLimit);
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const [userNotes, setUserNotes] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const [debateHistory, setDebateHistory] = useState<DebateMessage[]>([]);
  const [poiQueue, setPoiQueue] = useState<{id: string, speaker: Speaker, timestamp: Date}[]>([]);
  
  // Speech recognition and synthesis
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize AI opponent
  const [aiOpponent] = useState<Speaker>({
    id: 'ai-opponent',
    name: 'AI Opponent',
    role: 'Opposition Leader',
    avatarUrl: '/ai-avatar.png',
    isSpeaking: false,
    isAI: true,
    speakingTime: 0,
    points: 0,
  });
  
  // Initialize user speaker
  const [userSpeaker] = useState<Speaker>({
    id: 'user',
    name: 'You',
    role: 'Prime Minister',
    avatarUrl: '/user-avatar.png',
    isSpeaking: false,
    isAI: false,
    speakingTime: 0,
    points: 0,
  });

  // Start the debate with AI opponent's opening statement
  useEffect(() => {
    if (isDebateActive && debateHistory.length === 0) {
      const openingStatement = `Welcome to the debate. The motion is: ${debateConfig.motion}. ` +
        `I'll be opposing this motion as the ${aiOpponent.role}. ` +
        `Let's have a productive debate!`;
      
      const aiMessage: DebateMessage = {
        id: Date.now().toString(),
        speaker: aiOpponent.name,
        text: openingStatement,
        timestamp: new Date(),
        isPOI: false,
        isRebuttal: false,
        isStrategy: false,
      };
      
      setDebateHistory([aiMessage]);
      speak(openingStatement);
      setCurrentSpeaker(userSpeaker); // User's turn to speak next
    }
  }, [isDebateActive, debateHistory.length]);

  // Process user message and generate AI response
  const processUserMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to history
    const userMessage: DebateMessage = {
      id: Date.now().toString(),
      speaker: userSpeaker.name,
      text: message,
      timestamp: new Date(),
      isPOI: false,
      isRebuttal: false,
      isStrategy: false,
    };
    
    setDebateHistory(prev => [...prev, userMessage]);
    setUserMessage('');
    
    // Show typing indicator
    const thinkingId = Date.now().toString();
    setDebateHistory(prev => [...prev, {
      id: thinkingId,
      speaker: aiOpponent.name,
      text: '...',
      timestamp: new Date(),
      isPOI: false,
      isRebuttal: false,
      isStrategy: false,
    }]);
    
    try {
      // Generate AI response
      const client = new SarvamAIClient({ 
        apiSubscriptionKey: process.env.NEXT_PUBLIC_SARVAM_API_KEY || ''
      });
      
      const response = await client.chat.completions({
        messages: [
          {
            role: "system",
            content: `You are a debate opponent in a ${debateConfig.format} debate. ` +
                    `The motion is: ${debateConfig.motion}. ` +
                    `You are the ${aiOpponent.role} and are ${debateConfig.opponentStyle} in your style. ` +
                    `Your difficulty level is ${debateConfig.difficulty}. ` +
                    `Respond concisely to the user's points.`
          },
          { role: "user", content: message },
        ],
      });
      
      const aiResponse = response.choices[0].message.content;
      
      // Replace typing indicator with actual response
      setDebateHistory(prev => 
        prev.filter(msg => msg.id !== thinkingId)
           .concat([{
             id: Date.now().toString(),
             speaker: aiOpponent.name,
             text: aiResponse,
             timestamp: new Date(),
             isPOI: false,
             isRebuttal: false,
             isStrategy: false,
           }])
      );
      
      // Speak the response if speech is enabled
      if (speechEnabled) {
        speak(aiResponse);
      } else {
        // If speech is disabled, it's still the user's turn
        setCurrentSpeaker(userSpeaker);
      }
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to get response from AI. Please try again.');
      setCurrentSpeaker(userSpeaker);
    }
  }, [speechEnabled, debateConfig, aiOpponent, userSpeaker]);
  
  // Handle form submission
  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim() || !currentSpeaker || currentSpeaker.isAI) return;
    
    processUserMessage(userMessage);
  };

  // Toggle speech recognition
  const toggleSpeechRecognition = useCallback(() => {
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-IN';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserMessage(transcript);
          processUserMessage(transcript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast.error('Error in speech recognition');
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        toast.error('Failed to start speech recognition');
      }
    }
  }, [isListening, processUserMessage]);
  
  // Toggle speech synthesis
  const toggleSpeechSynthesis = useCallback(() => {
    setSpeechEnabled(prev => {
      const newValue = !prev;
      if (!newValue && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsBotSpeaking(false);
      }
      return newValue;
    });
  }, []);

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle debate pause state
  const togglePause = useCallback(() => {
    if (isPaused) {
      // Resume timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleEndOfSpeech();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Pause timer
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setIsPaused(!isPaused);
  }, [isPaused]);

  // Handle end of speech
  const handleEndOfSpeech = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (!currentSpeaker) return;
    
    // If it was an AI's turn, process POI or move to next speaker
    if (currentSpeaker.isAI) {
      // For now, just toggle to user's turn
      setCurrentSpeaker(userSpeaker);
    } else {
      // User's turn ended, AI responds
      setCurrentSpeaker(aiOpponent);
      
      // Generate AI response based on debate history
      const debateContext = debateHistory
        .map(msg => `${msg.speaker}: ${msg.text}`)
        .join('\n');
      
      processUserMessage(debateContext);
    }
  }, [currentSpeaker, debateHistory, userSpeaker, aiOpponent]);

  // Speech synthesis function
  const speak = useCallback((text: string) => {
    if (!speechEnabled) return;
    if (!('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsBotSpeaking(true);
    utterance.onend = () => {
      setIsBotSpeaking(false);
      // Start listening for user response after AI finishes speaking
      if (speechEnabled) {
        startListening();
      }
    };
    
    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [speechEnabled]);

  // Speech recognition functions
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    
    if (isListening) return;
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-IN';
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserMessage(transcript);
      // Process user message and generate AI response
      processUserMessage(transcript);
    };
    
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast.error('Error in speech recognition');
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      toast.error('Failed to start speech recognition');
    }
  }, [SpeechRecognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Process user message and generate AI response
  const processUserMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to debate history
    const userMessage: DebateMessage = {
      id: Date.now().toString(),
      speaker: 'You',
      text: message,
      timestamp: new Date(),
      isPOI: false,
      isRebuttal: false,
      isStrategy: false
    };
    
    setDebateHistory(prev => [...prev, userMessage]);
    
    try {
      // Call AI to generate response
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
                     You are engaging in a debate with the user. Keep your responses concise and on-topic.`
          },
          { role: "user", content: message }
        ],
      });
      
      const aiResponse = response.choices[0].message.content;
      
      // Add AI response to debate history
      const aiMessage: DebateMessage = {
        id: (Date.now() + 1).toString(),
        speaker: 'AI Opponent',
        text: aiResponse,
        timestamp: new Date(),
        isPOI: false,
        isRebuttal: false,
        isStrategy: false
      };
      
      setDebateHistory(prev => [...prev, aiMessage]);
      
      // Speak the AI response
      speak(aiResponse);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to get AI response');
    }
  };

  // Start debate automatically when component mounts
  useEffect(() => {
    const startDebate = () => {
      if (!isDebateActive) {
        setIsDebateActive(true);
        
        // Start with an AI greeting
        const greeting = `Welcome to the debate challenge! The motion is: ${debateConfig.motion}. ` +
                        `I'll be your ${debateConfig.difficulty} level opponent. ` +
                        `Let's begin with your opening statement.`;
        
        const greetingMessage: DebateMessage = {
          id: 'greeting',
          speaker: 'AI Opponent',
          text: greeting,
          timestamp: new Date(),
          isPOI: false,
          isRebuttal: false,
          isStrategy: false
        };
        
        setDebateHistory([greetingMessage]);
        speak(greeting);
      }
    };

    // Small delay to ensure component is fully mounted
    const timer = setTimeout(startDebate, 1000);
    return () => clearTimeout(timer);
  }, [debateConfig.difficulty, debateConfig.format, debateConfig.motion, isDebateActive, speak]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synthesisRef.current) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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

// Toggle speech recognition
const toggleSpeechRecognition = () => {
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
};

// Toggle speech synthesis
const toggleSpeechSynthesis = () => {
  setSpeechEnabled(prev => !prev);
  if (!speechEnabled && !isBotSpeaking) {
    // If enabling speech and AI is not speaking, start listening
    startListening();
  }
};
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
                    <div className="text-xs text-gray-400">{speaker.role}</div>
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
                // Start debate function
                const startDebate = useCallback(() => {
                  setIsDebateActive(true);
                  setCurrentSpeaker(aiOpponent); // AI starts first
                  
                  // Start the timer
                  timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                      if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleEndOfSpeech();
                        return 0;
                      }
                      return prev - 1;
                    });
                  }, 1000);
                }, [aiOpponent]);

                // End debate function
                const endDebate = useCallback(() => {
                  setIsDebateActive(false);
                  setCurrentSpeaker(null);
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                  }
                  
                  // Stop any ongoing speech
                  if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  
                  // Stop any ongoing recognition
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.stop();
                    } catch (e) {
                      console.error('Error stopping speech recognition:', e);
                    }
                    setIsListening(false);
                  }
                }, []);

                // Handle POI request
                const handleRequestPOI = useCallback(() => {
                  if (!currentSpeaker || !currentSpeaker.isAI) return;
                  
                  const poiRequest: DebateMessage = {
                    id: `poi-${Date.now()}`,
                    speaker: userSpeaker.name,
                    text: 'Point of information requested',
                    timestamp: new Date(),
                    isPOI: true,
                    isRebuttal: false,
                    isStrategy: false,
                  };
                  
                  setDebateHistory(prev => [...prev, poiRequest]);
                  
                  // AI can choose to accept or reject the POI
                  const shouldAccept = Math.random() > 0.5;
                  
                  if (shouldAccept) {
                    const response: DebateMessage = {
                      id: `poi-resp-${Date.now()}`,
                      speaker: aiOpponent.name,
                      text: 'I will take your point of information.',
                      timestamp: new Date(),
                      isPOI: false,
                      isRebuttal: false,
                      isStrategy: false,
                    };
                    
                    setDebateHistory(prev => [...prev, response]);
                    speak(response.text);
                  }
                }, [currentSpeaker, userSpeaker, aiOpponent]);

                // Clean up on unmount
                useEffect(() => {
                  return () => {
                    if (timerRef.current) {
                      clearInterval(timerRef.current);
                    }
                    if (window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    }
                    if (recognitionRef.current) {
                      try {
                        recognitionRef.current.stop();
                      } catch (e) {
                        console.error('Error cleaning up speech recognition:', e);
                      }
                    }
                  };
                }, []);

                return (
                  <div className="min-h-screen bg-gray-900 text-white p-4">
                    <p><strong>Motion:</strong> {debateConfig.motion}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium">Key Points:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Focus on the core issue: {debateConfig.motion.split(' ').slice(0, 5).join(' ')}...</li>
                        <li>Anticipate {debateConfig.opponentStyle} counter-arguments</li>
                        <li>Use clear signposting for your points</li>
                        <li>Prepare responses to common POIs</li>
                      </ul>
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
      
      {/* Main content area */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - User info and controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Debate Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant={isDebateActive ? "destructive" : "default"}
                  onClick={isDebateActive ? endDebate : startDebate}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isDebateActive ? (
                    <X className="mr-2 h-4 w-4" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  {isDebateActive ? "End Debate" : "Start Debate"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={togglePause}
                  disabled={!isDebateActive || isLoading}
                  className="w-full"
                >
                  {isPaused ? (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <PauseCircle className="mr-2 h-4 w-4" />
                  )}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSpeechRecognition}
                  disabled={!isDebateActive || isPaused || isLoading}
                  className={`flex-1 ${isListening ? 'bg-blue-500 text-white' : ''}`}
                >
                  {isListening ? (
                    <Mic className="h-4 w-4 animate-pulse" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSpeechSynthesis}
                  disabled={!isDebateActive || isPaused || isLoading}
                  className={`flex-1 ${speechEnabled ? 'bg-green-500 text-white' : ''}`}
                >
                  {speechEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRequestPOI}
                  disabled={!isDebateActive || isPaused || isLoading || !currentSpeaker?.isAI}
                  className="flex-1"
                >
                  <Hand className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="pt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Time Remaining:</span>
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
                <Progress value={(timeLeft / debateConfig.timeLimit) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Debate Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="font-medium">Motion:</div>
                  <div className="text-gray-300">{debateConfig.motion}</div>
                </div>
                <div>
                  <div className="font-medium">Format:</div>
                  <div className="text-gray-300">{debateConfig.format}</div>
                </div>
                <div>
                  <div className="font-medium">Difficulty:</div>
                  <div className="text-gray-300 capitalize">{debateConfig.difficulty}</div>
                </div>
                <div>
                  <div className="font-medium">Opponent Style:</div>
                  <div className="text-gray-300 capitalize">
                    {debateConfig.opponentStyle}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main debate area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gray-800 border-gray-700 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Debate Flow</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-3.5rem)]">
              <div className="h-full overflow-y-auto pr-2 space-y-4">
                {debateHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageSquareQuote className="h-12 w-12 mb-2" />
                    <p>Start the debate to begin the conversation</p>
                  </div>
                ) : (
                  debateHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.speaker === userSpeaker.name
                          ? 'bg-blue-900/50 ml-8'
                          : message.speaker === aiOpponent.name
                          ? 'bg-gray-700/50 mr-8'
                          : 'bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">
                          {message.speaker}
                          {message.isPOI && (
                            <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full">
                              POI
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="text-sm">{message.text}</div>
                    </div>
                  ))
                )}
                {isBotSpeaking && (
                  <div className="p-3 rounded-lg bg-gray-700/50 mr-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <form onSubmit={handleSubmitMessage} className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Textarea
                    ref={inputRef}
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[60px] flex-1 bg-gray-700 border-gray-600 text-white"
                    disabled={!currentSpeaker || currentSpeaker.isAI || !isDebateActive || isPaused || isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitMessage(e as any);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      !userMessage.trim() ||
                      !currentSpeaker ||
                      currentSpeaker.isAI ||
                      !isDebateActive ||
                      isPaused ||
                      isLoading
                    }
                    className="h-[60px]"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div>
                    {isListening ? (
                      <span className="text-red-400 flex items-center">
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Listening...
                      </span>
                    ) : (
                      <span>Press the mic button or type to respond</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Speech: {speechEnabled ? 'On' : 'Off'}</span>
                    <span>•</span>
                    <span>{userMessage.length}/500</span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Right sidebar - Notes & Strategy */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Notes</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowStrategy(!showStrategy)}
                  className="h-8 w-8"
                >
                  {showStrategy ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <BrainCircuit className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showStrategy ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Debate Strategy</h4>
                    <div className="text-sm text-gray-300 space-y-2">
                      <p>• Focus on the key issues: {debateConfig.motion.split(' ').slice(0, 5).join(' ')}...</p>
                      <p>• Your role: {userSpeaker.role}</p>
                      <p>• Opponent style: {debateConfig.opponentStyle}</p>
                      <p>• Difficulty: {debateConfig.difficulty}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Talking Points</h4>
                    <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                      <li>Point 1: Define key terms</li>
                      <li>Point 2: Present your main arguments</li>
                      <li>Point 3: Rebut opponent's points</li>
                      <li>Point 4: Summarize and conclude</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <Textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Type your private notes here..."
                  className="min-h-[200px] bg-gray-700 border-gray-600 text-white"
                />
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const point = 'I would like to make a point about...';
                  setUserMessage(point);
                  inputRef.current?.focus();
                }}
                disabled={!isDebateActive || isPaused || isLoading}
              >
                <MessageSquareQuote className="mr-2 h-4 w-4" />
                Make a Point
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleRequestPOI}
                disabled={
                  !isDebateActive ||
                  isPaused ||
                  isLoading ||
                  !currentSpeaker?.isAI
                }
              >
                <Hand className="mr-2 h-4 w-4" />
                Request POI
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const rebuttal = 'I disagree with that point because...';
                  setUserMessage(rebuttal);
                  inputRef.current?.focus();
                }}
                disabled={!isDebateActive || isPaused || isLoading}
              >
                <MessageSquareQuote className="mr-2 h-4 w-4" />
                Rebuttal
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const summary = 'In summary, my key points were...';
                  setUserMessage(summary);
                  inputRef.current?.focus();
                }}
                disabled={!isDebateActive || isPaused || isLoading}
              >
                <MessageSquareQuote className="mr-2 h-4 w-4" />
                Summarize
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDebateRoom;

export default ChallengeDebateRoom;
