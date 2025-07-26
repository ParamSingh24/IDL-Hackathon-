import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthesis) {
      setError('Speech synthesis is not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setError('Error during speech synthesis');
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    synthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [synthesis]);

  const pause = useCallback(() => {
    if (synthesis && synthesis.speaking && !synthesis.paused) {
      synthesis.pause();
      setIsPaused(true);
    }
  }, [synthesis]);

  const resume = useCallback(() => {
    if (synthesis && synthesis.paused) {
      synthesis.resume();
      setIsPaused(false);
    }
  }, [synthesis]);

  const stop = useCallback(() => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [synthesis]);

  const togglePause = useCallback(() => {
    if (!synthesis) return;
    
    if (synthesis.paused) {
      resume();
    } else {
      pause();
    }
  }, [pause, resume, synthesis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthesis) {
        synthesis.cancel();
      }
    };
  }, [synthesis]);

  return {
    isSpeaking,
    isPaused,
    error,
    speak,
    pause,
    resume,
    stop,
    togglePause,
  };
};

export default useSpeechSynthesis;
