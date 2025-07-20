
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, User, MoreHorizontal } from "lucide-react";

export function DebateHistory() {
  const debates = [
    {
      id: 1,
      topic: "Artificial Intelligence should be regulated by international law",
      format: "BP",
      opponent: "AI Challenger Pro",
      result: "Won",
      score: 87,
      date: "2024-01-15",
      duration: "45 min",
      feedback: "Excellent argumentation and strong rebuttals",
    },
    {
      id: 2,
      topic: "Social media has a net negative impact on society",
      format: "AP",
      opponent: "DebateBot Advanced",
      result: "Lost",
      score: 71,
      date: "2024-01-14",
      duration: "38 min",
      feedback: "Good points but weak conclusion",
    },
    {
      id: 3,
      topic: "Universal basic income should be implemented globally",
      format: "WSDC",
      opponent: "AI Mentor",
      result: "Won",
      score: 92,
      date: "2024-01-13",
      duration: "52 min",
      feedback: "Outstanding performance with compelling evidence",
    },
  ];

  const getResultBadge = (result: string, score: number) => {
    if (result === "Won") {
      return <Badge className="bg-secondary text-secondary-foreground">Won • {score}%</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Lost • {score}%</Badge>;
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case "BP": return "bg-primary/10 text-primary";
      case "AP": return "bg-secondary/10 text-secondary";
      case "WSDC": return "bg-accent/10 text-accent";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="bg-[#0A0A0A] text-gray-200 border-gray-800 w-full animate-fade-in" style={{ animationDelay: "400ms" }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl text-white">
            <CalendarDays className="w-5 h-5 text-lime-400" />
            Recent Debates
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your latest debate performances and feedback
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="bg-transparent text-gray-400 border-gray-600 hover:text-white hover:border-white transition-colors shadow-[0_0_8px_#7ED321] hover:shadow-[0_0_15px_#7ED321,0_0_25px_#A3FF6A]">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {debates.map((debate) => (
            <div
              key={debate.id}
              className="p-4 rounded-lg bg-[#1C1C1C] border border-gray-800 transition-all duration-300 group hover:border-lime-400/50 hover:shadow-[0_0_15px_rgba(163,230,53,0.15)] card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium mb-1 line-clamp-2 text-white">{debate.topic}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={getFormatColor(debate.format) + " bg-gray-700 text-lime-400 border border-lime-400/30"}>
                      {debate.format}
                    </Badge>
                    {getResultBadge(debate.result, debate.score)}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors shadow-[0_0_8px_#7ED321] hover:shadow-[0_0_15px_#7ED321,0_0_25px_#A3FF6A]">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  vs {debate.opponent}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {debate.duration}
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {new Date(debate.date).toLocaleDateString()}
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-md">
                <p className="text-sm text-gray-200">
                  <span className="font-medium text-lime-400">AI Feedback:</span> {debate.feedback}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
