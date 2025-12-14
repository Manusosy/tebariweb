import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { HotspotMap } from "@/components/map/hotspot-map";
import { MOCK_HOTSPOTS } from "@/lib/mock-data";

export default function FieldMapView() {
  return (
    <DashboardLayout 
      userRole="field_officer" 
      userName="John Field" 
      userEmail="john@tebari.com"
    >
      <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Active Zones Map</h2>
           <p className="text-muted-foreground">View your assigned hotspots and navigate to collection points.</p>
        </div>
        
        <Card className="flex-1 overflow-hidden shadow-lg border-primary/20">
          <CardContent className="p-0 h-full">
            <HotspotMap 
              hotspots={MOCK_HOTSPOTS} 
              zoom={12}
              className="w-full h-full rounded-none"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
