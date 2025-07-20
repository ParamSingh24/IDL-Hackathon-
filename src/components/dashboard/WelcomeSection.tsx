
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, ArrowRight } from "lucide-react";

export function WelcomeSection() {
  return (
    <Card className="mb-8 bg-[#0A0A0A] text-gray-200 border-gray-800 w-full animate-fade-in">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome back, Alex! 👋
              </h1>
              <p className="text-gray-400">
                Ready to master your debate skills? You're making great progress!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1 bg-gray-700 text-lime-400 border border-lime-400/30">
                <Star className="w-3 h-3" />
                Advanced Debater
              </Badge>
              <Badge variant="outline" className="bg-gray-700 text-gray-300 border border-gray-600">Level 8</Badge>
            </div>
          </div>
          <div className="space-y-4 lg:min-w-[300px]">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress to Level 9</span>
                <span className="font-medium text-lime-400">750/1000 XP</span>
              </div>
              <Progress value={75} className="h-2 bg-gray-700 [&>*]:bg-lime-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1C1C1C] rounded-lg border border-gray-800 transition-all duration-300 group hover:border-lime-400/50 hover:shadow-[0_0_15px_rgba(163,230,53,0.15)]">
              <div>
                <p className="text-sm font-medium text-white">Today's Goal</p>
                <p className="text-xs text-gray-400">Complete 2 practice debates</p>
              </div>
              <ArrowRight className="w-4 h-4 text-lime-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
