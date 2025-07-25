
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface Speaker {
  name: string;
  current: boolean;
  status: string;
}

interface SpeakerOrderProps {
  speakers: Speaker[];
}

export function SpeakerOrder({ speakers }: SpeakerOrderProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Speaking Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {speakers.map((speaker, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg flex items-center justify-between ${
                speaker.current 
                  ? "bg-blue-100 border border-blue-200" 
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <span className={`text-sm font-medium ${
                speaker.current ? "text-blue-800" : "text-gray-700"
              }`}>
                {speaker.name}
              </span>
              <Badge 
                variant={speaker.current ? "default" : "secondary"}
                className={speaker.current ? "debate-primary" : ""}
              >
                {speaker.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
