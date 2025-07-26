import { useEffect, useRef, useState } from "react";

import { X, MessageCircle, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { SarvamAIClient } from "sarvamai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";



interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export const NewChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [pending, setPending] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const recognizerRef = useRef<any>(null);

  const cleanTextForSpeech = (text: string): string => {
    if (!text) return '';
    
    // First, clean up common markdown and special characters
    let cleaned = text
      // Remove markdown formatting
      .replace(/[#*_~`\[\](){}<>\|\\]/g, '')
      // Remove special characters that might cause issues
      .replace(/[^\w\s.,!?:;'-]/g, ' ')
      // Fix spacing around punctuation
      .replace(/\s*([.,!?:;])\s*/g, '$1 ')
      // Fix multiple spaces
      .replace(/\s+/g, ' ')
      // Fix multiple periods
      .replace(/\.{2,}/g, '.')
      // Fix spacing at start/end
      .trim();
    
    // Capitalize first letter of each sentence
    cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (match) => 
      match.toUpperCase()
    );
    
    // Ensure proper spacing after punctuation
    cleaned = cleaned
      .replace(/([.,!?:;])([^\s])/g, '$1 $2')
      .replace(/([.,!?:;])\s+([.,!?:;])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  };

  const speak = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    
    const cleanedText = cleanTextForSpeech(text);
    console.log('Original text:', text);
    console.log('Cleaned text:', cleanedText);
    
    // Don't try to speak empty text
    if (!cleanedText || !cleanedText.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create new utterance with cleaned text
    const utter = new SpeechSynthesisUtterance(cleanedText);
    
    // Set voice properties
    utter.rate = 0.9; // Slightly slower for better clarity
    utter.pitch = 1.0;
    
    // Try to find the best available voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer natural-sounding voices
      const naturalVoice = voices.find(v => 
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('samantha')
      );
      
      // Fallback to first available English voice
      const enVoice = naturalVoice || 
                     voices.find(v => v.lang.startsWith('en-')) || 
                     voices[0];
                     
      if (enVoice) {
        utter.voice = enVoice;
        console.log('Using voice:', enVoice.name);
      }
    }
    
    // Speak the cleaned text
    window.speechSynthesis.speak(utter);
  };
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleListen = () => {
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (!recognizerRef.current) {
      recognizerRef.current = new SpeechRecognition();
      recognizerRef.current.continuous = true; // Keep listening for pauses
      recognizerRef.current.interimResults = true; // Get interim results
      recognizerRef.current.lang = 'en-IN';
      
      let finalTranscript = '';
      let silenceTimer: NodeJS.Timeout;
      
      recognizerRef.current.onresult = (e: any) => {
        clearTimeout(silenceTimer); // Reset the silence timer when we get new input
        
        // Process all results
        let interimTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript = transcript;
          }
        }
        
        // Update input field with current transcript
        if (inputRef.current) {
          inputRef.current.value = finalTranscript + interimTranscript;
        }
        
        // Set a timer to stop listening after a period of silence (1.5 seconds)
        silenceTimer = setTimeout(() => {
          if (listening) {
            recognizerRef.current?.stop();
          }
        }, 1500);
      };

      recognizerRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setListening(false);
      };

      recognizerRef.current.onend = () => {
        setListening(false);
        // If we have a final transcript, send it
        if (finalTranscript.trim()) {
          sendMsg();
        }
      };
    }

    if (listening) {
      recognizerRef.current.stop();
    } else {
      // Reset the final transcript when starting new recognition
      recognizerRef.current.start();
      setListening(true);
      if (inputRef.current) inputRef.current.value = '';
    }
  }
  const bodyRef = useRef<HTMLDivElement>(null);

  const sendMsg = async () => {
    const text = inputRef.current?.value.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    if (inputRef.current) inputRef.current.value = "";

    setPending(true);
    try {
      const client = new SarvamAIClient({ apiSubscriptionKey: "sk_lahp42w4_8K8JJohnNZZFOaNypvGOPINi" });
      const response = await client.chat.completions({
        messages: [
          { role: "system", content: "You are a debate coach AI. Provide concise, practical arguments, structure, evidence tips, and psychological techniques (framing, tone, persuasion) to help the user win debates." },
          { role: "user", content: text },
        ],
      });

      // Clean up the response by removing special characters and extra spaces
      let reply = response.choices[0].message.content
        .replace(/[\*_~`#^\[\](){}<>\|\/\\]/g, '') // Remove markdown and special chars
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s+([.,!?])/g, '$1') // Remove space before punctuation
        .trim();
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (speechEnabled) speak(reply);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I ran into an error. Please try again." }]);
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  // submit on Enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && open && document.activeElement === inputRef.current) {
        sendMsg();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, messages]);

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center space-y-2">
        {open && (
          <div className="bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleListen}
                className={`p-3 rounded-full flex items-center justify-center ${
                  listening
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {listening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-3 rounded-full flex items-center justify-center ${
                  !speechEnabled ? 'bg-muted' : 'bg-primary text-primary-foreground'
                }`}
              >
                {speechEnabled ? (
                  <Volume2 className="w-6 h-6" />
                ) : (
                  <VolumeX className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none"
        >
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Slide-in Panel */}
      {open && (
        <Card className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 w-[90vw] sm:w-[40rem] h-[500px] flex flex-col shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-5 z-[60]">
          <div className="p-4 border-b flex flex-col items-center space-y-2">
            <h3 className="font-semibold text-lg">Debate Assistant</h3>
            <div className="flex items-center justify-center w-full space-x-4">
              <div className="flex-1 max-w-[200px] bg-muted/50 rounded-full p-1 flex items-center justify-center">
                <button
                  onClick={() => {
                    setSpeechEnabled(prev => {
                      const next = !prev;
                      if (!next) {
                        window.speechSynthesis.cancel();
                      } else {
                        // speak last assistant message if available
                        const last = messages.slice().reverse().find(m => m.role === 'assistant');
                        if (last) speak(last.content);
                      }
                      return next;
                    });
                  }}
                  className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center space-x-2 ${
                    speechEnabled
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {speechEnabled ? 
                    <><Volume2 className="w-4 h-4" /> <span>Listening</span></> : 
                    <><VolumeX className="w-4 h-4" /> <span>Muted</span></>
                  }
                </button>
              </div>
              <div className="flex-1 max-w-[200px] bg-muted/50 rounded-full p-1">
                <button
                  onClick={toggleListen}
                  className={`w-full py-2 px-4 rounded-full flex items-center justify-center space-x-2 ${
                    listening
                      ? 'bg-destructive text-destructive-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {listening ? (
                    <><MicOff className="w-4 h-4" /> <span>Stop</span></>
                  ) : (
                    <><Mic className="w-4 h-4" /> <span>Speak</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending && <p className="text-muted-foreground text-xs animate-pulse">Assistant is typing…</p>}
          </div>
          <div className="p-3 border-t bg-background flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask about debates…"
              className="flex-1"
              disabled={pending}
              autoFocus
            />
            <Button onClick={sendMsg} disabled={pending}>Send</Button>
          </div>
        </Card>
      )}
    </>
  );
};
