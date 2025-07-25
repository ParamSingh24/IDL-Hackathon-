import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";

const ChallengeRoom = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-12 text-center space-y-4">
        <Badge variant="secondary" className="text-lg px-4 py-2">Challenge Mode</Badge>
        <h1 className="text-3xl font-bold">Coming&nbsp;Soon</h1>
        <p className="text-muted-foreground">
          We&apos;re working hard to bring competitive challenge debates. Stay tuned!
        </p>
      </div>
    </DashboardLayout>
  );
};

export default ChallengeRoom;
