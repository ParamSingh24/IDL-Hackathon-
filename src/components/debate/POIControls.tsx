
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hand } from "lucide-react";

interface POIControlsProps {
  isProtectedTime: boolean;
  poiRequested: boolean;
  onTogglePOI: () => void;
  onOfferPOI: () => void;
}

export function POIControls({ 
  isProtectedTime, 
  poiRequested, 
  onTogglePOI, 
  onOfferPOI 
}: POIControlsProps) {
  if (isProtectedTime) return null;

  return (
    <Card className="shadow-lg border-orange-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={poiRequested ? "destructive" : "outline"}
            onClick={onTogglePOI}
            className="flex-1 h-12"
          >
            <Hand className="w-4 h-4 mr-2" />
            {poiRequested ? "Cancel POI Request" : "Request POI"}
          </Button>
          <Button variant="outline" className="flex-1 h-12" onClick={onOfferPOI}>
            <Hand className="w-4 h-4 mr-2" />
            Offer POI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
