
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PenTool, Save, Download } from "lucide-react";

interface NotesPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function NotesPanel({ notes, onNotesChange }: NotesPanelProps) {
  const saveNotes = () => {
    localStorage.setItem('debate-notes', notes);
  };

  const exportNotes = () => {
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="w-4 h-4" />
          Debate Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Textarea
            placeholder="Take notes during the debate..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[200px] resize-none border-gray-200 focus:border-blue-400"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={saveNotes}>
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={exportNotes}>
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
