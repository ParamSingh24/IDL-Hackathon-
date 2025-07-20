
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  Calendar,
  Trophy,
  Target
} from "lucide-react";

export function PerformanceMetrics() {
  const debateHistory = [
    {
      id: 1,
      topic: "Social Media Regulation",
      date: "2024-01-15",
      score: 82,
      format: "BP",
      opponent: "AI Advanced",
      manner: 85,
      matter: 78,
      method: 84,
      feedback: "Strong argumentation with excellent delivery. Consider improving rebuttal technique."
    },
    {
      id: 2,
      topic: "Climate Change Policy", 
      date: "2024-01-14",
      score: 76,
      format: "WSDC",
      opponent: "AI Expert",
      manner: 72,
      matter: 82,
      method: 74,
      feedback: "Excellent research and evidence. Work on vocal variety and pace."
    },
    {
      id: 3,
      topic: "Education Reform",
      date: "2024-01-12", 
      score: 88,
      format: "AP",
      opponent: "AI Intermediate",
      manner: 90,
      matter: 85,
      method: 89,
      feedback: "Outstanding performance across all criteria. Maintain this level!"
    }
  ];

  const skillTrends = [
    { skill: "Argumentation", current: 78, change: "+12%", trend: "up" },
    { skill: "Rebuttal", current: 72, change: "+8%", trend: "up" },
    { skill: "Delivery", current: 85, change: "+15%", trend: "up" },
    { skill: "Research", current: 68, change: "-3%", trend: "down" },
    { skill: "Cross-Examination", current: 74, change: "+6%", trend: "up" },
  ];

  const comparisonData = {
    userAverage: 78,
    peerAverage: 72,
    ranking: "Top 15%",
    improvementRate: "+23%"
  };

  return (
    <div className="space-y-8">
      {/* Debate History */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Debate History
          </CardTitle>
          <CardDescription>
            Chronological list of your debate sessions with detailed performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debateHistory.map((debate) => (
              <div key={debate.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-800">{debate.topic}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                      <span>{debate.date}</span>
                      <Badge variant="outline">{debate.format}</Badge>
                      <span>vs {debate.opponent}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      debate.score >= 80 ? 'bg-green-500' : debate.score >= 70 ? 'bg-blue-500' : 'bg-orange-500'
                    }`}>
                      {debate.score}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-600">Manner</p>
                    <p className="font-bold text-blue-600">{debate.manner}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600">Matter</p>
                    <p className="font-bold text-emerald-600">{debate.matter}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600">Method</p>
                    <p className="font-bold text-amber-600">{debate.method}%</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 bg-gray-50 p-2 rounded">
                  <strong>Feedback:</strong> {debate.feedback}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Trends */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Skill Development Trends
          </CardTitle>
          <CardDescription>
            Track your improvement across different debate skills over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {skillTrends.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{skill.current}%</span>
                    <Badge 
                      variant={skill.trend === 'up' ? 'default' : 'destructive'}
                      className={skill.trend === 'up' ? 'bg-green-500' : ''}
                    >
                      {skill.change}
                    </Badge>
                  </div>
                </div>
                <Progress value={skill.current} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Data */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Performance Comparison
          </CardTitle>
          <CardDescription>
            How you compare against similar-level debaters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{comparisonData.userAverage}%</p>
              <p className="text-sm text-blue-600">Your Average</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-700">{comparisonData.peerAverage}%</p>
              <p className="text-sm text-gray-600">Peer Average</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">{comparisonData.ranking}</p>
              <p className="text-sm text-emerald-600">Your Ranking</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <BarChart3 className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-700">{comparisonData.improvementRate}</p>
              <p className="text-sm text-amber-600">Improvement Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="flex justify-center">
        <Button className="debate-primary h-12 px-6">
          <Download className="w-4 h-4 mr-2" />
          Export Detailed Report
        </Button>
      </div>
    </div>
  );
}
