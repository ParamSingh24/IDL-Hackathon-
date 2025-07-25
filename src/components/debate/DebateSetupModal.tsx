
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Users,
  Clock,
  Brain,
  Shuffle,
  Settings,
  Play,
  BookOpen,
  Globe,
  Languages,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Eye,
  Volume2,
  MessageCircle,
  Captions,
  Award,
} from "lucide-react";

interface DebateSetupModalProps {
  children: React.ReactNode;
}

const learningModes = [
  { id: "practice", label: "Practice Mode", desc: "AI guides you step-by-step with real-time coaching", icon: Brain },
  { id: "challenge", label: "Challenge Mode", desc: "Debate against a skilled AI opponent at full intensity", icon: Award },
  { id: "learning", label: "Learning Mode", desc: "Focus on specific skills with targeted feedback", icon: BookOpen },
  { id: "quick", label: "Quick Debate", desc: "Jump straight into a casual debate round", icon: Play },
];

const formats = [
  { id: "bp", name: "British Parliamentary", desc: "4 teams, 8 speakers, most complex format", icon: Users },
  { id: "ap", name: "Asian Parliamentary", desc: "2 teams, simplified structure", icon: Users },
  { id: "wsdc", name: "World Schools", desc: "3v3 team format with structured roles", icon: Users },
  // Public Forum removed per user request
];

const categories = ["Education", "Technology", "Society", "Health", "Environment", "Politics"];
const topicDifficulties = ["Beginner", "Intermediate", "Advanced"];
const topicTypes = ["Policy", "Value", "Fact-based"];
const roles = [
  { id: "gov", label: "Government/Proposition" },
  { id: "opp", label: "Opposition" },
  { id: "random", label: "Random Assignment" },
];
const aiLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
const speechTimes = [3, 5, 7];
// 0 represents no preparation time (optional)
const prepTimes = [0, 15, 25, 30];
const feedbackDetails = ["Quick summary", "Detailed analysis", "Clash-by-clash breakdown"];
const languages = ["English", "Hindi", "Other Indian languages"];
const speechSpeeds = ["Normal", "Slow", "Fast"];

export function DebateSetupModal({ children }: DebateSetupModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [state, setState] = useState({
    learningMode: "practice",
    format: "bp",
    topicMode: "generate",
    customTopic: "",
    category: categories[0],
    topicDifficulty: topicDifficulties[0],
    topicType: topicTypes[0],
    selectedTopic: "",
    role: "gov",
    aiLevel: aiLevels[0],
    speechTime: 7,
    poiEnabled: true,
    prepTime: 15,
    feedbackDetail: feedbackDetails[0],
    language: languages[0],
    translation: false,
    speechSpeed: speechSpeeds[0],
    subtitles: false,
  });
  const [generating, setGenerating] = useState(false);

  // Simulate topic generation
  const generateTopic = () => {
    setGenerating(true);
    setTimeout(() => {
      setState((s) => ({ ...s, selectedTopic: `Sample ${state.topicDifficulty} ${state.topicType} topic in ${state.category}` }));
      setGenerating(false);
    }, 800);
  };

  const startDebate = () => {
    navigate("/debate-room", { state });
  };

  const steps = [
    // Step 1: Learning Mode
    <div key="step1">
      <h3 className="text-lg font-semibold mb-3">How would you like to practice today?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {learningModes.map((mode) => (
          <Card
            key={mode.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${state.learningMode === mode.id ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"}`}
            onClick={() => setState((s) => ({ ...s, learningMode: mode.id }))}
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <mode.icon className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-base">{mode.label}</CardTitle>
                <CardDescription>{mode.desc}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>,
    // Step 2: Format
    <div key="step2">
      <h3 className="text-lg font-semibold mb-3">Which debate format would you like to practice?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {formats.map((format) => (
          <Card
            key={format.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${state.format === format.id ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"}`}
            onClick={() => setState((s) => ({ ...s, format: format.id }))}
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <format.icon className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-base">{format.name}</CardTitle>
                <CardDescription>{format.desc}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>,
    // Step 3: Topic Selection
    <div key="step3">
      <h3 className="text-lg font-semibold mb-3">How would you like to choose your debate topic?</h3>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button variant={state.topicMode === "custom" ? "default" : "outline"} onClick={() => setState((s) => ({ ...s, topicMode: "custom" }))}>Enter Custom Topic</Button>
          <Button variant={state.topicMode === "generate" ? "default" : "outline"} onClick={() => setState((s) => ({ ...s, topicMode: "generate" }))}>Generate Topic</Button>
          <Button variant={state.topicMode === "category" ? "default" : "outline"} onClick={() => setState((s) => ({ ...s, topicMode: "category" }))}>Category Selection</Button>
        </div>
        {state.topicMode === "custom" && (
          <input
            className="w-full p-2 border rounded"
            placeholder="Enter your custom debate motion"
            value={state.customTopic}
            onChange={(e) => setState((s) => ({ ...s, customTopic: e.target.value }))}
          />
        )}
        {state.topicMode === "generate" && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <select className="border rounded p-1" value={state.topicDifficulty} onChange={e => setState(s => ({ ...s, topicDifficulty: e.target.value }))}>
                {topicDifficulties.map(d => <option key={d}>{d}</option>)}
              </select>
              <select className="border rounded p-1" value={state.topicType} onChange={e => setState(s => ({ ...s, topicType: e.target.value }))}>
                {topicTypes.map(t => <option key={t}>{t}</option>)}
              </select>
              <select className="border rounded p-1" value={state.category} onChange={e => setState(s => ({ ...s, category: e.target.value }))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <Button onClick={generateTopic} disabled={generating}>{generating ? "Generating..." : "Generate"}</Button>
            </div>
            {state.selectedTopic && <div className="p-2 bg-muted rounded">{state.selectedTopic}</div>}
          </div>
        )}
        {state.topicMode === "category" && (
          <div className="flex flex-col gap-2">
            <select className="border rounded p-1" value={state.category} onChange={e => setState(s => ({ ...s, category: e.target.value }))}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>,
    // Step 4: Role Assignment
    <div key="step4">
      <h3 className="text-lg font-semibold mb-3">Which position would you like to take?</h3>
      <div className="flex gap-4">
        {roles.map(role => (
          <Button
            key={role.id}
            variant={state.role === role.id ? "default" : "outline"}
            onClick={() => setState(s => ({ ...s, role: role.id }))}
          >
            {role.label}
          </Button>
        ))}
      </div>
    </div>,
    // Step 5: AI Opponent
    <div key="step5">
      <h3 className="text-lg font-semibold mb-3">Set your AI opponent's skill level:</h3>
      <div className="flex gap-4 flex-wrap">
        {aiLevels.map(level => (
          <Button
            key={level}
            variant={state.aiLevel === level ? "default" : "outline"}
            onClick={() => setState(s => ({ ...s, aiLevel: level }))}
          >
            {level}
          </Button>
        ))}
      </div>
    </div>,
    // Step 6: Debate Settings
    <div key="step6">
      <h3 className="text-lg font-semibold mb-3">Customize your debate experience:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Speech Time</Label>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setState(s => ({ ...s, speechTime: Math.max(1, s.speechTime - 1) }))}>
              <ArrowDown className="w-4 h-4" />
            </Button>
            <span>{state.speechTime} min</span>
            <Button variant="outline" onClick={() => setState(s => ({ ...s, speechTime: s.speechTime + 1 }))}>
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Prep Time (optional)</Label>
          <div className="flex gap-2">
            {prepTimes.map(t => (
              <Button key={t} variant={state.prepTime === t ? "default" : "outline"} onClick={() => setState(s => ({ ...s, prepTime: t }))}>{t === 0 ? "None" : `${t} min`}</Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Points of Information (POIs)</Label>
          <Switch checked={state.poiEnabled} onCheckedChange={v => setState(s => ({ ...s, poiEnabled: v }))} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Feedback Detail</Label>
          <div className="flex gap-2">
            {feedbackDetails.map(f => (
              <Button key={f} variant={state.feedbackDetail === f ? "default" : "outline"} onClick={() => setState(s => ({ ...s, feedbackDetail: f }))}>{f}</Button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    // Step 7: Language & Accessibility
    <div key="step7">
      <h3 className="text-lg font-semibold mb-3">Language & Accessibility</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Primary Language</Label>
          <select className="border rounded p-1" value={state.language} onChange={e => setState(s => ({ ...s, language: e.target.value }))}>
            {languages.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label><Languages className="inline w-4 h-4 mr-1" /> Translation Support</Label>
          <Switch checked={state.translation} onCheckedChange={v => setState(s => ({ ...s, translation: v }))} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Speech Speed</Label>
          <div className="flex gap-2">
            {speechSpeeds.map(s => (
              <Button key={s} variant={state.speechSpeed === s ? "default" : "outline"} onClick={() => setState(st => ({ ...st, speechSpeed: s }))}>{s}</Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label><Captions className="inline w-4 h-4 mr-1" /> Subtitles</Label>
          <Switch checked={state.subtitles} onCheckedChange={v => setState(s => ({ ...s, subtitles: v }))} />
        </div>
      </div>
    </div>,
    // Step 8: Review & Start
    <div key="step8">
      <h3 className="text-lg font-semibold mb-3">Review your debate setup</h3>
      <div className="space-y-2">
        <div><b>Learning Mode:</b> {learningModes.find(m => m.id === state.learningMode)?.label}</div>
        <div><b>Format:</b> {formats.find(f => f.id === state.format)?.name}</div>
        <div><b>Topic:</b> {state.topicMode === "custom" ? state.customTopic : state.topicMode === "generate" ? state.selectedTopic : state.category}</div>
        <div><b>Role:</b> {roles.find(r => r.id === state.role)?.label}</div>
        <div><b>AI Level:</b> {state.aiLevel}</div>
        <div><b>Speech Time:</b> {state.speechTime} min</div>
        <div><b>Prep Time:</b> {state.prepTime} min</div>
        <div><b>POIs:</b> {state.poiEnabled ? "Enabled" : "Disabled"}</div>
        <div><b>Feedback:</b> {state.feedbackDetail}</div>
        <div><b>Language:</b> {state.language}</div>
        <div><b>Translation:</b> {state.translation ? "Enabled" : "Disabled"}</div>
        <div><b>Speech Speed:</b> {state.speechSpeed}</div>
        <div><b>Subtitles:</b> {state.subtitles ? "Enabled" : "Disabled"}</div>
      </div>
      <div className="flex justify-center pt-4">
        <Button onClick={startDebate} className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 text-lg font-medium flex items-center gap-2">
          <Play className="w-5 h-5" />
          Start Debate Session
        </Button>
      </div>
    </div>,
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">Start New Debate</DialogTitle>
          <DialogDescription>Follow the steps to customize your debate session</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {steps[step]}
          <div className="flex justify-between pt-4">
            <Button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1} className="flex items-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
