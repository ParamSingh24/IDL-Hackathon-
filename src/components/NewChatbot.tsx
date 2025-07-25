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

  const speak = (text: string) => {
    if (!speechEnabled) return;
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleListen = () => {
    if (!SpeechRecognition) return alert('Speech recognition not supported in this browser');
    if (!recognizerRef.current) {
      recognizerRef.current = new SpeechRecognition();
      recognizerRef.current.continuous = false;
      recognizerRef.current.lang = 'en-IN';
      recognizerRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (inputRef.current) inputRef.current.value = transcript;
      };
      recognizerRef.current.onerror = () => setListening(false);
      recognizerRef.current.onend = () => setListening(false);
    }
    if (listening) {
      recognizerRef.current.stop();
      setListening(false);
    } else {
      recognizerRef.current.start();
      setListening(true);
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

      let reply = response.choices[0].message.content;
      reply = reply.replace(/\*\*/g, "");
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
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none z-50"
      >
        {open ? <X /> : <MessageCircle />}
      </button>

      {/* Slide-in Panel */}
      {open && (
        <Card className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 w-[90vw] sm:w-96 h-[500px] flex flex-col shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-5 z-[60]">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-center flex-1">Debate Assistant</h3>
            <button
              onClick={() => {
                setSpeechEnabled(prev => {
                  const next = !prev;
                  if (!next) {
                    window.speechSynthesis.cancel();
                  } else {
                    // speak last assistant message if available
                    const last = messages.slice().reverse().find(m=>m.role==='assistant');
                    if (last) speak(last.content);
                  }
                  return next;
                });
              }}
              className="p-1" >
              {speechEnabled ? <Volume2 className="w-5 h-5"/> : <VolumeX className="w-5 h-5"/>}
            </button>
            <button onClick={toggleListen} className="p-1 ml-2">
              {listening ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
            </button>
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
