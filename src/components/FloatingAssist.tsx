import { useState, useRef } from "react";
import { Mic, Volume2, ChevronLeft, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FloatingAssist = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const SpeechRecognition: any =
    (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const recognizerRef = useRef<any>(null);

  const togglePanel = () => setOpen(!open);

  const startListening = () => {
    if (!SpeechRecognition) return alert("Speech Recognition not supported in this browser");
    if (listening) {
      recognizerRef.current?.stop();
      setListening(false);
      return;
    }

    if (!recognizerRef.current) {
      recognizerRef.current = new (SpeechRecognition as any)();
      recognizerRef.current.lang = "en-US";
      recognizerRef.current.interimResults = false;
      recognizerRef.current.onresult = (e: any) => {
        const text: string = e.results[0][0].transcript;
        const lower = text.toLowerCase();
        console.log("Voice command:", lower);
        const routes: Record<string,string> = {
          dashboard: "/",
          home: "/",
          practice: "/practice",
          analytics: "/analytics",
          learning: "/learning",
          "daily challenge": "/daily-challenge",
          challenge: "/daily-challenge",
          tournaments: "/tournaments",
          tournament: "/tournaments",
          settings: "/settings",
        };
        for (const key in routes) {
          if (lower.includes(key)) {
            navigate(routes[key]);
            return;
          }
        }
      };
      recognizerRef.current.onend = () => setListening(false);
    }
    recognizerRef.current.start();
    setListening(true);
  };


  const readAloud = () => {
    if (!("speechSynthesis" in window)) return alert("Speech Synthesis not supported");
    const selection = window.getSelection()?.toString();
    if (!selection) {
      alert("Select the text you want to hear and click Read Aloud again.");
      return;
    }
    const utter = new SpeechSynthesisUtterance(selection);
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };


  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {open && (
        <div className="mb-2 flex flex-col gap-2 bg-[#0A0A0A] border border-gray-700 p-3 rounded-lg shadow-lg animate-fade-in">
          <button
            onClick={startListening}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white text-sm"
          >
            <Mic className="w-4 h-4" /> {listening ? "Listening..." : "Voice Navigate"}
          </button>
          <button
            onClick={readAloud}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white text-sm"
          >
            <Volume2 className="w-4 h-4" /> Read Aloud
          </button>
        </div>
      )}
      <button
        onClick={togglePanel}
        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all text-primary-foreground"
      >
        {open ? <ChevronLeft className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
      </button>
    </div>
  );
};
