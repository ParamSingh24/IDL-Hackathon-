
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { LearningAnalytics } from "@/components/analytics/LearningAnalytics";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock,
  Trophy,
  Brain
} from "lucide-react";

const Analytics = () => {
  const analyticsData = {
    totalDebates: 47,
    winRate: 68,
    averageScore: 76,
    hoursSpent: 142,
    streak: 8,
    rankImprovement: 23
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Performance Analytics</h1>
            <p className="text-gray-400">
              Comprehensive insights into your debate performance and skill development
            </p>
          </div>
          <Badge className="debate-primary text-lg px-4 py-2">
            Last 30 Days
          </Badge>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1C1C1C] p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Debates</p>
                <p className="text-3xl font-bold text-blue-700">{analyticsData.totalDebates}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1C] p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Win Rate</p>
                <p className="text-3xl font-bold text-emerald-700">{analyticsData.winRate}%</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1C] p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-amber-600">{analyticsData.averageScore}%</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1C] p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Hours Practiced</p>
                <p className="text-3xl font-bold text-purple-700">{analyticsData.hoursSpent}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Analytics Content */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Metrics
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Learning Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="mt-6">
            <PerformanceMetrics />
          </TabsContent>
          
          <TabsContent value="learning" className="mt-6">
            <LearningAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
