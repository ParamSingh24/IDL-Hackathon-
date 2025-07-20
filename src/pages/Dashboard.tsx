
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActiveChallenges } from "@/components/dashboard/ActiveChallenges";
import { DebateHistory } from "@/components/dashboard/DebateHistory";
import { PracticeRecommendations } from "@/components/dashboard/PracticeRecommendations";
import { AchievementDisplay } from "@/components/gamification/AchievementDisplay";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 p-2 sm:p-4 md:p-6 rounded-2xl overflow-x-auto min-w-0 w-full bg-background">
        <WelcomeSection />
        <StatsCards />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-w-0 w-full p-2">
          <div className="xl:col-span-2 space-y-8 min-w-0 w-full p-2">
            <QuickActions />
            <PracticeRecommendations />
            <DebateHistory />
          </div>
          <div className="space-y-8 min-w-0 w-full p-2">
            <ActiveChallenges />
            <AchievementDisplay />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
