import { useState, useRef, useEffect, useCallback } from 'react';
import { DebateConfig, Speaker, DebateMessage } from '@/types/debate';

export const useDebateState = (initialConfig: DebateConfig) => {
  // Debate state
  const [debateConfig, setDebateConfig] = useState<DebateConfig>(initialConfig);
  const [isDebateActive, setIsDebateActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialConfig.timeLimit * 60);
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [debateHistory, setDebateHistory] = useState<DebateMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // Initialize speakers based on debate config
  useEffect(() => {
    const initialSpeakers: Speaker[] = [
      {
        id: 'user',
        name: 'You',
        role: 'Debater',
        avatarUrl: '/avatars/user.png',
        isSpeaking: false,
        isAI: false,
        speakingTime: 0,
        points: 0,
      },
      {
        id: 'ai',
        name: 'AI Opponent',
        role: 'Opponent',
        avatarUrl: '/avatars/ai.png',
        isSpeaking: false,
        isAI: true,
        speakingTime: 0,
        points: 0,
      },
    ];
    
    setSpeakers(initialSpeakers);
    setCurrentSpeaker(initialSpeakers[0]); // User starts first
  }, []);

  // Timer logic
  useEffect(() => {
    if (isDebateActive && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleEndOfSpeech();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isDebateActive, isPaused, timeLeft]);

  // Handle end of speech
  const handleEndOfSpeech = useCallback(() => {
    if (!currentSpeaker) return;
    
    // Update speaking time for the current speaker
    const speakingTime = debateConfig.timeLimit * 60 - timeLeft;
    
    setSpeakers(prevSpeakers => 
      prevSpeakers.map(speaker => 
        speaker.id === currentSpeaker.id
          ? { ...speaker, speakingTime: speaker.speakingTime + speakingTime }
          : speaker
      )
    );
    
    // Switch to the next speaker
    const currentIndex = speakers.findIndex(s => s.id === currentSpeaker.id);
    const nextIndex = (currentIndex + 1) % speakers.length;
    setCurrentSpeaker(speakers[nextIndex]);
    
    // Reset timer for the next speaker
    setTimeLeft(debateConfig.timeLimit * 60);
    
    // If it's AI's turn, generate a response
    if (speakers[nextIndex].isAI) {
      generateAIResponse(debateHistory);
    }
  }, [currentSpeaker, debateConfig.timeLimit, timeLeft, speakers, debateHistory]);

  // Start the debate
  const startDebate = useCallback(() => {
    setIsDebateActive(true);
    setIsPaused(false);
    setTimeLeft(debateConfig.timeLimit * 60);
    
    // Add initial message to debate history
    const initialMessage: DebateMessage = {
      id: Date.now().toString(),
      speaker: 'System',
      text: `Debate started on the motion: ${debateConfig.motion}`,
      timestamp: new Date(),
      isPOI: false,
      isRebuttal: false,
      isStrategy: false,
    };
    
    setDebateHistory([initialMessage]);
  }, [debateConfig.motion, debateConfig.timeLimit]);

  // End the debate
  const endDebate = useCallback(() => {
    setIsDebateActive(false);
    setIsPaused(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Add final message to debate history
    const finalMessage: DebateMessage = {
      id: Date.now().toString(),
      speaker: 'System',
      text: 'Debate has ended',
      timestamp: new Date(),
      isPOI: false,
      isRebuttal: false,
      isStrategy: false,
    };
    
    setDebateHistory(prev => [...prev, finalMessage]);
  }, []);

  // Toggle pause state
  const togglePause = useCallback(() => {
    if (!isDebateActive) return;
    
    setIsPaused(prev => !prev);
  }, [isDebateActive]);

  // Generate AI response
  const generateAIResponse = useCallback(async (history: DebateMessage[]) => {
    if (!currentSpeaker?.isAI) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call to generate AI response
      // In a real implementation, this would call your AI service
      const response = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve("This is a simulated AI response. In a real implementation, this would come from your AI service.");
        }, 1500);
      });
      
      const aiMessage: DebateMessage = {
        id: Date.now().toString(),
        speaker: currentSpeaker.name,
        text: response,
        timestamp: new Date(),
        isPOI: false,
        isRebuttal: false,
        isStrategy: false,
      };
      
      setDebateHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSpeaker]);

  // Handle user message submission
  const handleSubmitMessage = useCallback((message: string) => {
    if (!message.trim() || !currentSpeaker || currentSpeaker.isAI) return;
    
    const userMessage: DebateMessage = {
      id: Date.now().toString(),
      speaker: currentSpeaker.name,
      text: message,
      timestamp: new Date(),
      isPOI: false,
      isRebuttal: false,
      isStrategy: false,
    };
    
    setDebateHistory(prev => [...prev, userMessage]);
    setUserMessage('');
    
    // If it's the user's turn and they send a message, switch to AI's turn
    if (!currentSpeaker.isAI) {
      const aiSpeaker = speakers.find(speaker => speaker.isAI);
      if (aiSpeaker) {
        setCurrentSpeaker(aiSpeaker);
        setTimeLeft(debateConfig.timeLimit * 60);
        generateAIResponse([...debateHistory, userMessage]);
      }
    }
  }, [currentSpeaker, debateConfig.timeLimit, debateHistory, generateAIResponse, speakers]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    debateConfig,
    isDebateActive,
    isPaused,
    timeLeft,
    currentSpeaker,
    speakers,
    debateHistory,
    userMessage,
    userNotes,
    isLoading,
    showStrategy,
    
    // Setters
    setUserMessage,
    setUserNotes,
    setShowStrategy,
    
    // Methods
    startDebate,
    endDebate,
    togglePause,
    handleSubmitMessage,
    handleEndOfSpeech,
    formatTime,
    generateAIResponse,
  };
};

export default useDebateState;
