import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, MapPin, TrendingUp, Download, Recycle, Leaf, Users, MessageSquare, Loader2 } from "lucide-react";
import { HotspotMap } from "@/components/map/hotspot-map";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { Hotspot, Collection, CollectionItem, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

type CollectionWithDetails = Collection & {
  items: CollectionItem[];
  hotspot: Hotspot | null;
};

export default function PartnerOverview() {
  const { user } = useAuth();

  // Fetch real data
  const { data: hotspots, isLoading: loadingHotspots } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  const { data: collections, isLoading: loadingCollections } = useQuery<CollectionWithDetails[]>({
    queryKey: ["/api/collections"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const isLoading = loadingHotspots || loadingCollections;

  // Calculate real metrics
  const verifiedCollections = (collections || []).filter(c => c.status === 'verified');

  const totalRecovered = verifiedCollections.reduce((acc, c) => {
    const weight = c.items.reduce((sum, item) => sum + Number(item.weight), 0);
    return acc + weight;
  }, 0);

  // Material composition from verified collections
  const materialCounts: Record<string, number> = {};
  verifiedCollections.forEach(c => {
    c.items.forEach(item => {
      const type = item.materialType.toUpperCase();
      materialCounts[type] = (materialCounts[type] || 0) + Number(item.weight);
    });
  });

  const compositionData = Object.entries(materialCounts).map(([name, value]) => ({
    name,
    value,
    color: getColorForType(name)
  }));

  function getColorForType(type: string): string {
    const colors: Record<string, string> = {
      'PET': '#0ea5e9',
      'HDPE': '#22c55e',
      'LDPE': '#eab308',
      'PP': '#f97316',
      'PS': '#ef4444',
      'PVC': '#8b5cf6',
    };
    return colors[type] || '#64748b';
  }

  // CO2 offset estimation (rough: ~2.5kg CO2 per kg plastic recovered)
  const co2Offset = (totalRecovered * 2.5 / 1000).toFixed(1);

  // Field officers count
  const fieldOfficersCount = (users || []).filter(u => u.role === 'field_officer' && u.status === 'active').length;

  // Collection notes from verified submissions
  const recentNotes = verifiedCollections
    .filter(c => c.notes && c.notes.trim() !== '')
    .slice(0, 5);

  // Get officer name helper
  const getOfficerName = (userId: number) => {
    const officer = users?.find(u => u.id === userId);
    return officer?.name || `Officer #${userId}`;
  };

  return (
    <DashboardLayout
      userRole="partner"
      userName={user?.name || "Partner"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Impact Dashboard</h2>
            <p className="text-muted-foreground">Real-time tracking of environmental recovery efforts.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* High Level Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Plastic Recovered"
            value={isLoading ? "..." : `${totalRecovered.toFixed(1)}kg`}
            icon={Recycle}
            trend="up"
            trendValue="Verified"
            className="bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
          />
          <StatCard
            title="CO2 Emissions Offset"
            value={isLoading ? "..." : `${co2Offset} Tons`}
            icon={Leaf}
            description="Estimated equivalent"
            className="bg-sky-50/50 border-sky-200 dark:bg-sky-950/20 dark:border-sky-800"
          />
          <StatCard
            title="Active Field Officers"
            value={isLoading ? "..." : fieldOfficersCount}
            icon={Users}
            description="Supporting recovery"
          />
          <StatCard
            title="Active Collection Zones"
            value={isLoading ? "..." : (hotspots || []).length}
            icon={MapPin}
            trend="up"
            trendValue="Documented hotspots"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Material Composition Chart */}
          <Card className="col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle>Material Composition</CardTitle>
              <CardDescription>Breakdown by plastic type (verified collections).</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : compositionData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No verified collections yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={compositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Field Notes */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Field Notes
              </CardTitle>
              <CardDescription>Recent observations from field officers.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No field notes available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentNotes.map((collection) => (
                    <div key={collection.id} className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary/30">
                      <p className="text-sm italic mb-2">"{collection.notes}"</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium">{getOfficerName(collection.userId)}</span>
                        <span>{collection.collectedAt ? format(new Date(collection.collectedAt), 'MMM dd, yyyy') : ''}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        📍 {collection.hotspot?.name || collection.newHotspotName || 'Unknown location'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Map Preview */}
        <Card className="shadow-md overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle>Live Collection Map</CardTitle>
              <span className="text-xs text-muted-foreground">{(hotspots || []).length} active zones</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <HotspotMap hotspots={hotspots || []} className="h-[400px] w-full rounded-none" />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
