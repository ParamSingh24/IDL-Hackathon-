import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Crown, Star, Award } from "lucide-react";

export function AchievementDisplay() {
  const achievements = [
    {
      id: 1,
      title: "First Victory",
      description: "Win your first debate",
      icon: Trophy,
      unlocked: true,
      rarity: "Common",
    },
    {
      id: 2,
      title: "Streak Master",
      description: "Win 5 debates in a row",
      icon: Flame,
      unlocked: true,
      rarity: "Rare",
    },
    {
      id: 3,
      title: "Rebuttal King",
      description: "Deliver 10 effective rebuttals",
      icon: Crown,
      unlocked: false,
      progress: 7,
      total: 10,
      rarity: "Epic",
    },
    {
      id: 4,
      title: "Format Master",
      description: "Win debates in all 3 formats",
      icon: Star,
      unlocked: false,
      progress: 2,
      total: 3,
      rarity: "Legendary",
    },
  ];

  // Refined function to return themed classes for rarity badges
  const getRarityStyle = (rarity) => {
    switch (rarity) {
      case "Common":    return "bg-gray-200/10 text-gray-300 border-gray-400/20";
      case "Rare":      return "bg-blue-500/10 text-blue-400 border-blue-400/20";
      case "Epic":      return "bg-purple-500/10 text-purple-400 border-purple-400/20";
      case "Legendary": return "bg-amber-500/10 text-amber-400 border-amber-400/20";
      default:          return "bg-gray-500/10 text-gray-300 border-gray-400/20";
    }
  };

  return (
    <Card 
      className="bg-[#0A0A0A] text-gray-200 border-gray-800 w-full animate-fade-in" 
      style={{ animationDelay: "400ms" }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-white">
          <Award className="w-6 h-6 text-lime-400" />
          Achievements
        </CardTitle>
        <CardDescription className="text-gray-400">
          Unlock badges by reaching debate milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
        >
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`
                flex flex-col justify-between p-4 rounded-lg bg-[#1C1C1C] border border-gray-800
                transition-all duration-300
                ${
                  achievement.unlocked
                    // Unlocked cards are fully visible and have a subtle hover effect
                    ? 'hover:bg-gray-800 hover:border-gray-700'
                    // Locked cards are muted and have no hover effect
                    : 'opacity-60 saturate-50 cursor-default'
                }
              `}
            >
              {/* Main content of the card */}
              <div>
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className={`p-3 rounded-lg ${
                      achievement.unlocked
                        ? "bg-lime-400/10 text-lime-400" // Bright icon for unlocked
                        : "bg-gray-700 text-gray-400"   // Muted icon for locked
                    }`}
                  >
                    <achievement.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{achievement.title}</h4>
                      <Badge className={`border text-xs ${getRarityStyle(achievement.rarity)}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                </div>

                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.total}</span>
                    </div>
                    <Progress
                      value={(achievement.progress / achievement.total) * 100}
                      className="h-2 bg-gray-700 [&>*]:bg-lime-400"
                    />
                  </div>
                )}
              </div>

              {/* "Unlocked" badge at the bottom for unlocked achievements */}
              {achievement.unlocked && (
                <div className="mt-4">
                  <Badge className="w-full justify-center bg-gray-700 text-lime-400 border border-lime-400/30 py-1">
                    ✓ Unlocked
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}