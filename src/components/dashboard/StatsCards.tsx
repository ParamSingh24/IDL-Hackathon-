
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Award, Flame } from "lucide-react";

export function StatsCards() {
  const stats = [
    {
      title: "Total Debates",
      value: "127",
      change: "+12",
      changeLabel: "this month",
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-primary/10",
    },
    {
      title: "Win Rate",
      value: "73%",
      change: "+5%",
      changeLabel: "vs last month",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Skill Level",
      value: "Advanced",
      change: "Level 8",
      changeLabel: "2 levels up",
      icon: Award,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Current Streak",
      value: "7 wins",
      change: "🔥",
      changeLabel: "personal best",
      icon: Flame,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={stat.title} className="bg-[#1C1C1C] text-gray-200 border border-gray-800 rounded-lg transition-colors duration-200 hover:border-lime-400/50 card-hover animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1 text-white">{stat.value}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-gray-700 text-lime-400 border border-lime-400/30">
                {stat.change}
              </Badge>
              <p className="text-xs text-gray-400">{stat.changeLabel}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
