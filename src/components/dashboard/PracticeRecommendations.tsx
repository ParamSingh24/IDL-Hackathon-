
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Clock } from "lucide-react";

export function PracticeRecommendations() {
  const recommendations = [
    {
      title: "Strengthen Counter-Rebuttal Skills",
      description: "Focus on addressing opponent rebuttals more effectively",
      difficulty: "Intermediate",
      estimatedTime: "15 min",
      priority: "High",
      icon: Target,
    },
    {
      title: "Improve Opening Statement Structure",
      description: "Practice clearer signposting and argument organization",
      difficulty: "Beginner",
      estimatedTime: "10 min",
      priority: "Medium",
      icon: TrendingUp,
    },
    {
      title: "Master POI Integration",
      description: "Learn to handle Points of Information smoothly",
      difficulty: "Advanced",
      estimatedTime: "20 min",
      priority: "High",
      icon: Brain,
    },
  ];

  return (
    <Card className="bg-[#0A0A0A] text-gray-200 border-gray-800 w-full animate-fade-in" style={{ animationDelay: "300ms" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-white">
          <Brain className="w-5 h-5 text-lime-400" />
          AI Practice Recommendations
        </CardTitle>
        <CardDescription className="text-gray-400">
          Personalized suggestions based on your recent performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-[#1C1C1C] border border-gray-800 transition-all duration-300 group hover:border-lime-400/50 hover:shadow-[0_0_15px_rgba(163,230,53,0.15)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-lime-400/10 text-lime-400 border border-lime-400/20 rounded-lg">
                    <rec.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{rec.title}</h4>
                    <p className="text-sm text-gray-400">{rec.description}</p>
                  </div>
                </div>
                <Badge
                  variant={rec.priority === "High" ? "destructive" : "secondary"}
                  className="ml-2 bg-gray-700 text-lime-400 border border-lime-400/30"
                >
                  {rec.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-gray-700 text-gray-300 border border-gray-600">{rec.difficulty}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1 bg-gray-700 text-gray-300 border border-gray-600">
                    <Clock className="w-3 h-3" />
                    {rec.estimatedTime}
                  </Badge>
                </div>
                <Button size="sm" className="bg-lime-400 text-black font-bold px-6 py-2 rounded-lg text-base shadow-[0_0_8px_#7ED321] hover:shadow-[0_0_15px_#7ED321,0_0_25px_#A3FF6A] transition-all duration-300 ease-in-out">
                  Start Practice
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
