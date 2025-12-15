import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Calendar, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Hotspot } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function PartnerCollections() {
  const { user } = useAuth();
  // Fetch real data
  const { data: hotspots } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  // Filter for spots that have enough volume (e.g. > 100kg) or critical status
  const readyForCollection = (hotspots || []).filter(h =>
    Number(h.estimatedVolume) > 100 || h.status === 'critical'
  );

  const handleSchedule = (spot: Hotspot) => {
    const message = `Hi, I'd like to schedule a pickup for Zone: ${spot.name}. Estimated Volume: ${spot.estimatedVolume}kg. Access: ${spot.accessibility || 'Not specified'}.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/254795581750?text=${encodedMessage}`, '_blank');
  };

  return (
    <DashboardLayout
      userRole="partner"
      userName={user?.name || "Partner"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Available Collections</h2>
          <p className="text-muted-foreground">High-volume zones ready for logistical pickup.</p>
        </div>

        <div className="grid gap-6">
          {readyForCollection.length === 0 ? (
            <div className="p-12 text-center border rounded-lg bg-muted/20">
              <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">No collections available</h3>
              <p className="text-muted-foreground">Check back later for high-volume zones.</p>
            </div>
          ) : (
            readyForCollection.map((spot) => (
              <Card key={spot.id} className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{spot.name}</h3>
                        <Badge variant={spot.status === 'critical' ? 'destructive' : 'default'} className="uppercase text-[10px]">
                          {spot.status} Priority
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> Zone {spot.id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> Updated: {spot.createdAt ? new Date(spot.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 bg-muted/30 p-4 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Estimated Volume</p>
                        <p className="text-2xl font-bold text-primary">{spot.estimatedVolume} kg</p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Accessibility</p>
                        <p className="text-lg font-medium">{spot.accessibility || "Not specified"}</p>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold gap-2"
                      onClick={() => handleSchedule(spot)}
                    >
                      <Truck className="h-4 w-4" />
                      Schedule Pickup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )))}
        </div>
      </div>
    </DashboardLayout>
  );
}
