
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Sun, Coins, Video } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { AuthDropdown } from "@/components/auth/AuthDropdown";

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DM</span>
          </div>
          <span className="font-semibold text-lg hidden sm:block">DebateMaster Pro</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Credits Counter */}
        <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full">
          <Coins className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">1,250</span>
          <Badge variant="secondary" className="text-xs">AI Credits</Badge>
        </div>

        {/* Live Debates */}
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Video className="w-4 h-4 mr-2" />
          Live Debates
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>

        {/* User Profile */}
        <AuthDropdown />
      </div>
    </header>
  );
}
