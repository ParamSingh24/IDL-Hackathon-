import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Trophy, Zap } from "lucide-react";

export function ActiveChallenges() {
  const challenges = [
    {
      title: "Weekly Debate Marathon",
      description: "Complete 10 debates this week",
      progress: 70,
      current: 7,
      target: 10,
      timeLeft: "3 days",
      reward: "500 XP + Badge",
      type: "weekly",
      icon: Trophy,
    },
    {
      title: "Rebuttal Master",
      description: "Win 5 debates using strong rebuttals",
      progress: 60,
      current: 3,
      target: 5,
      timeLeft: "5 days",
      reward: "Rebuttal Badge",
      type: "skill",
      icon: Zap,
    },
    {
      title: "Team Tournament",
      description: "Join and compete in team debate",
      progress: 0,
      current: 0,
      target: 1,
      timeLeft: "2 days",
      reward: "Team Spirit Badge",
      type: "social",
      icon: Users,
    },
  ];

  // Themed color function
  const getTypeColor = (type) => {
    switch (type) {
      case "weekly": return "bg-lime-400/10 text-lime-400 border border-lime-400/20";
      case "skill":  return "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20";
      case "social": return "bg-fuchsia-400/10 text-fuchsia-400 border border-fuchsia-400/20";
      default:       return "bg-gray-700 text-gray-300";
    }
  };

  return (
    // Main card with the dark background theme from the screenshot
    <Card className="bg-[#0A0A0A] text-gray-200 border-gray-800 w-full max-w-3xl mx-auto">
      {/* YOUR ORIGINAL HEADER CONTENT - UNCHANGED */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-white">
          <Trophy className="w-6 h-6 text-lime-400" />
          Active Challenges
        </CardTitle>
        <CardDescription className="text-gray-400">
          Complete challenges to earn XP and unlock achievements
        </CardDescription>
      </CardHeader>
      
      {/* YOUR ORIGINAL CARD CONTENT - UNCHANGED LOGIC */}
      <CardContent className="space-y-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.title}
            className="p-4 rounded-lg bg-[#1C1C1C] border border-gray-800 transition-all duration-300 group hover:border-lime-400/50 hover:shadow-[0_0_15px_rgba(163,230,53,0.15)]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(challenge.type)}`}>
                  <challenge.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{challenge.title}</h4>
                  <p className="text-sm text-gray-400">{challenge.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0 ml-4">
                <Clock className="w-3 h-3 text-lime-400" />
                {challenge.timeLeft}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">
                  Progress: {challenge.current}/{challenge.target}
                </span>
                <span className="font-medium text-lime-400">{challenge.progress}%</span>
              </div>
              <Progress value={challenge.progress} className="h-2 bg-gray-700 [&>*]:bg-lime-400" />
              
              <div className="flex justify-between items-center pt-2">
                <Badge variant="secondary" className="text-xs bg-gray-700 text-lime-400 border border-lime-400/30">
                  {challenge.reward}
                </Badge>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent text-gray-400 border-gray-600 hover:text-white hover:border-white transition-colors"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Remove the CardFooter with main buttons */}
    </Card>
  );
}