
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <Button asChild className="inline-flex items-center gap-2">
            <a href="/">
              <Home className="w-4 h-4" />
              Return to Dashboard
            </a>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
