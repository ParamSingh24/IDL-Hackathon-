import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const mockEvents = [
  {
    name: "Spring Invitational",
    date: "2025-08-05",
    format: "BP",
    teams: 32,
  },
  {
    name: "Online Autumn Cup",
    date: "2025-09-20",
    format: "AP",
    teams: 24,
  },
  {
    name: "Winter Classic",
    date: "2025-12-02",
    format: "WSDC",
    teams: 16,
  },
];

const TournamentSchedule = () => {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Upcoming Tournaments</h1>
        {mockEvents.map((ev, idx) => (
          <Card key={idx} className="bg-[#1C1C1C] border border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">{ev.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  Format: {ev.format} • Teams: {ev.teams}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4" />
                {new Date(ev.date).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <button className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all">
                Register
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default TournamentSchedule;
