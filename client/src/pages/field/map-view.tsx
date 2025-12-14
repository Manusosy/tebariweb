import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { HotspotMap } from "@/components/map/hotspot-map";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Hotspot, Collection } from "@shared/schema";

export default function FieldMapView() {
  const { user } = useAuth();

  // Fetch Hotspots
  const { data: hotspots } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  // Fetch Submissions (to show previous collection points)
  const { data: submissions } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  // Transform submissions into map markers
  const submissionMarkers = (submissions || [])
    .filter(s => s.gpsLatitude && s.gpsLongitude)
    .map(s => ({
      id: 10000 + s.id, // Offset ID to avoid conflict with real hotspots
      name: s.newHotspotName || s.notes || `Submission #${s.id}`,
      description: `Collected on ${new Date(s.collectedAt!).toLocaleDateString()}`,
      latitude: s.gpsLatitude!,
      longitude: s.gpsLongitude!,
      status: s.status, // 'pending', 'verified', 'rejected'
      estimatedVolume: "0", // Not needed for visual
      createdAt: new Date(s.collectedAt!)
    } as unknown as Hotspot));

  const mapData = [
    ...(hotspots || []),
    ...submissionMarkers
  ];

  return (
    <DashboardLayout
      userRole={(user?.role as any) || "field_officer"}
      userName={user?.name || "Field Officer"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Zoning & Hotspots</h2>
          <p className="text-muted-foreground">View verified hotspots and recent submission locations.</p>
        </div>

        <Card className="flex-1 overflow-hidden shadow-lg border-primary/20">
          <CardContent className="p-0 h-full">
            <HotspotMap
              hotspots={mapData}
              zoom={12}
              className="w-full h-full rounded-none"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
