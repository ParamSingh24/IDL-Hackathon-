
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { NewChatbot } from "@/components/NewChatbot";
import { FloatingAssist } from "@/components/FloatingAssist";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col bg-background">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-auto bg-background">
          {children}
        </main>
        <NewChatbot />
        <FloatingAssist />
      </div>
    </div>
  );
}
