
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  BookOpen
} from "lucide-react";

export function LearningAnalytics() {
  const weaknessAreas = [
    {
      skill: "Rebuttal Technique",
      severity: "High",
      impact: "Significantly affects clash quality",
      recommendation: "Practice counter-argument structures using PREL method",
      exercises: ["Daily rebuttal drills", "Case study analysis", "Clash identification practice"],
      timeRequired: "15-20 mins daily"
    },
    {
      skill: "Research Quality", 
      severity: "Medium",
      impact: "Limits argument strength",
      recommendation: "Develop source evaluation and fact-checking skills",
      exercises: ["Source verification practice", "Evidence analysis", "Credibility assessment"],
      timeRequired: "10-15 mins daily"
    },
    {
      skill: "Vocal Delivery",
      severity: "Low", 
      impact: "Affects presentation quality",
      recommendation: "Work on pace variation and emphasis techniques",
      exercises: ["Voice modulation practice", "Reading aloud", "Pace control drills"],
      timeRequired: "5-10 mins daily"
    }
  ];

  const strengths = [
    {
      skill: "Logical Structure",
      level: "Advanced",
      consistency: "95%",
      trend: "Stable",
      description: "Excellent organization and flow in arguments"
    },
    {
      skill: "Evidence Integration",
      level: "Intermediate+", 
      consistency: "87%",
      trend: "Improving",
      description: "Good use of statistics and expert opinions"
    },
    {
      skill: "Audience Engagement",
      level: "Advanced",
      consistency: "92%", 
      trend: "Stable",
      description: "Strong eye contact and persuasive delivery"
    }
  ];

  const personalizedRecommendations = [
    {
      category: "Immediate Focus",
      priority: "High",
      title: "Master Rebuttal Frameworks",
      description: "Focus on PREL (Point, Reason, Evidence, Link-back) structure for stronger counter-arguments",
      estimatedTime: "2 weeks",
      difficulty: "Intermediate",
      resources: ["Rebuttal Template Library", "Video Tutorials", "Practice Partners"]
    },
    {
      category: "Skill Enhancement", 
      priority: "Medium",
      title: "Advanced Research Techniques",
      description: "Learn academic source evaluation and real-time fact verification methods",
      estimatedTime: "3 weeks",
      difficulty: "Intermediate",
      resources: ["Research Methodology Course", "Fact-Checking Tools", "Database Access"]
    },
    {
      category: "Performance Polish",
      priority: "Low", 
      title: "Voice Coaching Program",
      description: "Develop dynamic vocal delivery with pace and tone variation",
      estimatedTime: "4 weeks",
      difficulty: "Beginner",
      resources: ["Voice Training App", "Speech Exercises", "Recording Tools"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Weakness Identification */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Areas for Improvement
          </CardTitle>
          <CardDescription>
            Identified weaknesses that need focused attention for skill development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weaknessAreas.map((area, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-800">{area.skill}</h4>
                    <p className="text-sm text-slate-600 mt-1">{area.impact}</p>
                  </div>
                  <Badge 
                    variant={area.severity === "High" ? "destructive" : area.severity === "Medium" ? "default" : "secondary"}
                  >
                    {area.severity} Priority
                  </Badge>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-blue-800">
                    <strong>Recommendation:</strong> {area.recommendation}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Suggested Exercises:</p>
                  <div className="flex flex-wrap gap-2">
                    {area.exercises.map((exercise, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {exercise}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    <strong>Time Commitment:</strong> {area.timeRequired}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strength Reinforcement */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Strengths to Maintain
          </CardTitle>
          <CardDescription>
            Skills showing consistent growth and excellence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strengths.map((strength, index) => (
              <div key={index} className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-emerald-800">{strength.skill}</h4>
                  <Badge className="bg-emerald-600 text-white">
                    {strength.level}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Consistency</span>
                    <span className="font-medium text-emerald-800">{strength.consistency}</span>
                  </div>
                  <Progress value={parseInt(strength.consistency)} className="h-2 bg-emerald-200" />
                  <p className="text-xs text-emerald-700">{strength.description}</p>
                  <Badge variant="outline" className={`text-xs ${
                    strength.trend === 'Improving' ? 'border-green-500 text-green-700' : 'border-blue-500 text-blue-700'
                  }`}>
                    {strength.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI-Powered Learning Path
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your performance patterns and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {personalizedRecommendations.map((rec, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">{rec.category}</span>
                      <Badge 
                        variant={rec.priority === "High" ? "destructive" : rec.priority === "Medium" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-lg text-slate-800 mb-1">{rec.title}</h4>
                    <p className="text-slate-600 text-sm">{rec.description}</p>
                  </div>
                  <Button className="debate-primary">
                    Start Learning
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-600">Duration: {rec.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-600">Level: {rec.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-600">{rec.resources.length} Resources</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Available Resources:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.resources.map((resource, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
