
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface TranscriptionEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  isLive: boolean;
  speakerType: 'government' | 'opposition' | 'ai';
}

interface TranscriptionPanelProps {
  transcriptions: TranscriptionEntry[];
}

export function TranscriptionPanel({ transcriptions }: TranscriptionPanelProps) {
  return (
    <Card className="shadow-lg bg-secondary border border-border text-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <MessageSquare className="w-5 h-5 text-accent" />
          Live Transcription
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto bg-bg-secondary border border-border rounded-lg p-4">
          <div className="space-y-4">
            {transcriptions.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg ${
                  entry.isLive ? 'bg-secondary border border-accent' : 'bg-secondary border border-border'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <Badge className={
                    entry.speakerType === 'government' ? 'bg-accent text-primary' :
                    entry.speakerType === 'opposition' ? 'bg-secondary text-accent' :
                    'bg-gray-700 text-gray-300'
                  }>
                    {entry.speaker}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-secondary border-accent">
                    {entry.isLive ? 'Live' : 'Previous'}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-secondary">
                  "{entry.text}"
                </p>
              </div>
            ))}
            <div className="text-sm text-accent italic flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              Live transcription updating...
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
