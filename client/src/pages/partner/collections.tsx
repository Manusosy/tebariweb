import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Calendar, ArrowRight } from "lucide-react";
import { MOCK_HOTSPOTS } from "@/lib/mock-data";

import { useAuth } from "@/hooks/use-auth";

export default function PartnerCollections() {
  const { user } = useAuth();
  // Filter for spots that have enough volume to be worth collecting (e.g. > 100kg)
  const readyForCollection = MOCK_HOTSPOTS.filter(h => Number(h.estimatedVolume) > 100 || h.status === 'critical');

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
          {readyForCollection.map((spot) => (
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
                        <Calendar className="h-4 w-4" /> Last Updated: Today
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
                      <p className="text-lg font-medium">Truck Access</p>
                    </div>
                  </div>

                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-semibold gap-2">
                    <Truck className="h-4 w-4" />
                    Schedule Pickup
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
