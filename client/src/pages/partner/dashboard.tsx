import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { HotspotMap } from "@/components/map/hotspot-map";
import { MOCK_HOTSPOTS } from "@/lib/mock-data";
import { Scale, MapPin, TrendingUp, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/use-auth";

export default function PartnerDashboard() {
  const { user } = useAuth();
  const totalVolume = MOCK_HOTSPOTS.reduce((acc, h) => acc + Number(h.estimatedVolume), 0);

  return (
    <DashboardLayout
      userRole="partner"
      userName={user?.name || "Partner"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Impact Overview</h2>
            <p className="text-muted-foreground">Verified environmental data for stakeholders.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Q1 Report
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Plastic Recovered"
            value={`${totalVolume}kg`}
            icon={Scale}
            trend="up"
            trendValue="Verified"
            className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
          />
          <StatCard
            title="Hotspots Monitored"
            value={MOCK_HOTSPOTS.length}
            icon={MapPin}
            description="Active surveillance"
          />
          <StatCard
            title="Community Impact"
            value="High"
            icon={TrendingUp}
            description="3 new jobs created"
          />
        </div>

        {/* Map Section - Read Only */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Hotspot Status Map</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <HotspotMap hotspots={MOCK_HOTSPOTS} className="h-[500px] w-full rounded-md" readonly />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
