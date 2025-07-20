
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  TrendingUp, 
  Target, 
  Award, 
  Download, 
  Share, 
  ChevronRight,
  Brain,
  MessageSquare,
  Volume2,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export function FeedbackSystem() {
  const performanceData = {
    manner: { 
      score: 78, 
      feedback: "Excellent eye contact and confident posture. Consider varying vocal pace for greater impact.",
      trend: "up",
      change: "+5%"
    },
    matter: { 
      score: 85, 
      feedback: "Strong logical arguments with compelling evidence. Outstanding clash analysis with opponent points.",
      trend: "up", 
      change: "+8%"
    },
    method: { 
      score: 72, 
      feedback: "Clear structure with good signposting. Transitions between points could be smoother.",
      trend: "down",
      change: "-2%"
    },
    overall: 78,
    level: "Advanced Intermediate"
  };

  const improvements = [
    {
      category: "Vocal Delivery",
      suggestion: "Practice varying your pace and volume for emphasis. Record yourself speaking to identify monotone patterns.",
      priority: "High",
      timeEstimate: "15 mins daily",
      exercises: ["Tongue twisters", "Reading aloud with emotion"]
    },
    {
      category: "Argument Structure", 
      suggestion: "Use clearer signposting between points. Try 'Firstly...', 'Furthermore...', 'In conclusion...'",
      priority: "Medium",
      timeEstimate: "10 mins daily",
      exercises: ["Outline practice", "Mini-speech drills"]
    },
    {
      category: "Rebuttal Technique",
      suggestion: "Address opponent arguments more directly. Use the 'Point, Reason, Evidence, Link-back' structure.",
      priority: "High", 
      timeEstimate: "20 mins daily",
      exercises: ["Counter-argument practice", "Clash analysis"]
    },
  ];

  const skillProgress = [
    { skill: "Argumentation", current: 78, target: 85, maxScore: 100 },
    { skill: "Rebuttal", current: 72, target: 80, maxScore: 100 },
    { skill: "Delivery", current: 85, target: 90, maxScore: 100 },
    { skill: "Research", current: 68, target: 85, maxScore: 100 },
    { skill: "Cross-Examination", current: 74, target: 82, maxScore: 100 },
  ];

  const recentDebates = [
    { topic: "Social Media Regulation", score: 82, opponent: "AI Advanced", format: "BP", date: "2 hours ago" },
    { topic: "Climate Change Policy", score: 76, opponent: "AI Expert", format: "WSDC", date: "1 day ago" },
    { topic: "Education Reform", score: 88, opponent: "AI Intermediate", format: "AP", date: "3 days ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-2 sm:p-4 md:p-6 bg-[#0B1426] min-h-screen text-gray-200">
      {/* Performance Overview Header */}
      <div className="text-center space-y-6 bg-gradient-to-br from-[#1A2842] to-[#0B1426] p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex items-center justify-center gap-3">
          <Star className="w-10 h-10 text-amber-500 fill-current" />
          <h1 className="text-4xl font-bold text-white">Debate Performance Report</h1>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="text-7xl font-bold text-blue-400">{performanceData.overall}%</div>
          <div className="flex flex-col">
            <Badge className="debate-secondary text-lg px-4 py-2 mb-2 bg-emerald-900 text-emerald-300 border border-emerald-400">
              {performanceData.level}
            </Badge>
            <div className="flex items-center gap-1 text-emerald-400">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12% this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="card-hover shadow-lg border border-gray-700 bg-[#1A2842] text-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                </div>
                <span>Manner</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUp className="w-4 h-4" />
                <span className="text-sm">{performanceData.manner.change}</span>
              </div>
            </CardTitle>
            <CardDescription>Presentation and delivery style</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-blue-700">{performanceData.manner.score}%</div>
              <Progress value={performanceData.manner.score} className="h-3 bg-blue-100" />
              <p className="text-sm text-slate-600 leading-relaxed">{performanceData.manner.feedback}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover shadow-lg border border-gray-700 bg-[#1A2842] text-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-600" />
                </div>
                <span>Matter</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUp className="w-4 h-4" />
                <span className="text-sm">{performanceData.matter.change}</span>
              </div>
            </CardTitle>
            <CardDescription>Content and argumentation quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-emerald-700">{performanceData.matter.score}%</div>
              <Progress value={performanceData.matter.score} className="h-3 bg-emerald-100" />
              <p className="text-sm text-slate-600 leading-relaxed">{performanceData.matter.feedback}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover shadow-lg border border-gray-700 bg-[#1A2842] text-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <span>Method</span>
              </div>
              <div className="flex items-center gap-1 text-red-500">
                <ArrowDown className="w-4 h-4" />
                <span className="text-sm">{performanceData.method.change}</span>
              </div>
            </CardTitle>
            <CardDescription>Structure and organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-amber-600">{performanceData.method.score}%</div>
              <Progress value={performanceData.method.score} className="h-3 bg-amber-100" />
              <p className="text-sm text-slate-600 leading-relaxed">{performanceData.method.feedback}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* AI Improvement Suggestions */}
        <Card className="shadow-lg border border-gray-700 bg-[#1A2842] text-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              AI-Powered Improvement Plan
            </CardTitle>
            <CardDescription>Personalized recommendations to enhance your debate skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {improvements.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">{item.category}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.priority === "High" ? "destructive" : "secondary"}>
                        {item.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.timeEstimate}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">{item.suggestion}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.exercises.map((exercise, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {exercise}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Progress Tracking */}
        <Card className="shadow-lg border border-gray-700 bg-[#1A2842] text-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Skill Development Progress
            </CardTitle>
            <CardDescription>Track your improvement across different debate skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {skillProgress.map((skill, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-800">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        {skill.current}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-blue-600">
                        {skill.target}%
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={skill.current} className="h-3 bg-gray-200" />
                    <div
                      className="absolute top-0 h-3 w-1 bg-blue-600 rounded-full"
                      style={{ left: `${skill.target}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Target: {skill.target}% • {skill.target - skill.current}% to go
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Debate History */}
      <Card className="shadow-lg border border-gray-700 bg-[#1A2842] text-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-200">
            <Award className="w-5 h-5 text-amber-600" />
            Recent Debate Performance
          </CardTitle>
          <CardDescription className="text-gray-400">Your latest debate sessions and scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDebates.map((debate, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#22345A] rounded-xl border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    debate.score >= 80 ? 'bg-green-500' : debate.score >= 70 ? 'bg-blue-500' : 'bg-orange-500'
                  }`}>
                    {debate.score}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-100">{debate.topic}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>vs {debate.opponent}</span>
                      <Badge variant="outline">{debate.format}</Badge>
                      <span>{debate.date}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button className="debate-primary h-12 px-6">
          <Download className="w-4 h-4 mr-2" />
          Export Full Report
        </Button>
        <Button variant="outline" className="h-12 px-6">
          <Share className="w-4 h-4 mr-2" />
          Share Progress
        </Button>
        <Button className="debate-secondary h-12 px-6">
          <Target className="w-4 h-4 mr-2" />
          Start New Practice
        </Button>
      </div>
    </div>
  );
}
