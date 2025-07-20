import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DebateSetupModal } from "@/components/debate/DebateSetupModal";
import { 
  Mic, 
  BookOpen, 
  Users, 
  Brain, 
  Target, 
  Sparkles,
  Calendar
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Start Practice Debate",
      description: "Begin a new AI-powered debate session",
      icon: Mic,
      type: "primary", // Using a 'type' for cleaner styling
      isModal: true,
    },
    {
      title: "Daily Challenge",
      description: "Complete today's skill-building challenge",
      icon: Target,
      type: "secondary",
      badge: "New",
    },
    {
      title: "Join Live Room",
      description: "Practice with other debaters online",
      icon: Users,
      type: "accent",
      badge: "3 active",
    },
    {
      title: "Schedule Tournament",
      description: "Register for upcoming competitions",
      icon: Calendar,
      type: "event", // Semantic type
      badge: "3 upcoming",
    },
    {
      title: "AI Tutor Session",
      description: "Get personalized coaching and tips",
      icon: Brain,
      type: "tutor", // Semantic type
    },
    {
      title: "Learning Modules",
      description: "Study debate techniques and strategies",
      icon: BookOpen,
      type: "learning", // Semantic type
    },
  ];

  // A helper function to keep styling logic clean and centralized
  const getIconStyle = (type) => {
    switch (type) {
      case "primary":   return "bg-lime-400/10 text-lime-400";
      case "secondary": return "bg-fuchsia-400/10 text-fuchsia-400";
      case "accent":    return "bg-cyan-400/10 text-cyan-400";
      case "tutor":     return "bg-purple-500/10 text-purple-400";
      case "learning":  return "bg-blue-500/10 text-blue-400";
      case "event":     return "bg-orange-500/10 text-orange-400";
      default:          return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <Card className="bg-[#0A0A0A] text-gray-200 border-gray-800 w-full animate-fade-in" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-white">
          <Sparkles className="w-5 h-5 text-lime-400" />
          Quick Actions
        </CardTitle>
        <CardDescription className="text-gray-400">
          Jump into practice or explore learning resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            // Insert the extra buttons after 'Join Live Room'
            const isJoinLiveRoom = action.title === 'Join Live Room';
            const ActionCard = (
              <Button
                variant={action.type === 'primary' ? undefined : 'outline'}
                className={`
                  h-auto p-4 flex flex-col items-start text-left gap-3 w-full 
                  bg-[#1C1C1C] border border-gray-800 text-gray-200 rounded-lg 
                  transition-all duration-300 group
                  ${
                    action.type === 'primary'
                      ? 'hover:shadow-[0_0_15px_rgba(163,230,53,0.4)] hover:border-lime-400/30 hover:bg-[#1C1C1C]'
                      : 'hover:bg-gray-800 hover:border-gray-700'
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-lg ${getIconStyle(action.type)}`}> 
                    <action.icon className="w-5 h-5" />
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs bg-gray-700 text-lime-400 border border-lime-400/30">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <div className="w-full">
                  <h4 className="font-medium mb-1 text-white">{action.title}</h4>
                  <p className="text-xs opacity-80 line-clamp-2 text-gray-400">
                    {action.description}
                  </p>
                </div>
              </Button>
            );
            return (
              <div key={action.title}>
                {action.isModal ? <DebateSetupModal>{ActionCard}</DebateSetupModal> : ActionCard}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}