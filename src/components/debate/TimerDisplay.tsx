
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, PlayCircle, PauseCircle } from "lucide-react";

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  isProtectedTime: boolean;
  isDebateActive: boolean;
  onToggleDebate: () => void;
  currentSpeaker: string;
}

export function TimerDisplay({ 
  timeLeft, 
  totalTime, 
  isProtectedTime, 
  isDebateActive, 
  onToggleDebate,
  currentSpeaker 
}: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeProgress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <Card className="shadow-lg border-2 border-blue-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800">
            Current Speech - {currentSpeaker}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={isProtectedTime ? "timer-protected" : "timer-unprotected"}>
              {isProtectedTime ? "Protected Time" : "POI Time"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleDebate}
              className="ml-2"
            >
              {isDebateActive ? (
                <PauseCircle className="w-4 h-4" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className={`text-6xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-700'}`}>
            {formatTime(timeLeft)}
          </div>
          <Progress 
            value={timeProgress} 
            className="h-4 bg-gray-200"
          />
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="border-blue-200">
              <Clock className="w-3 h-3 mr-1" />
              {Math.floor(totalTime / 60)}:00 Total
            </Badge>
            <Badge variant="outline" className="border-gray-200">
              Protected: First 1:00 & Last 1:00
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
