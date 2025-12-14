import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { HotspotMap } from "@/components/map/hotspot-map";
import { Scale, MapPin, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Hotspot, Collection, CollectionItem } from "@shared/schema";
import { useLocation } from "wouter";

type CollectionWithDetails = Collection & {
  items: CollectionItem[];
  hotspot: Hotspot | null;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Map State for focus
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.350, 40.015]);
  const [mapZoom, setMapZoom] = useState(11);

  // 1. Fetch Real Data
  const { data: hotspots, isLoading: loadingHotspots } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  const { data: collections, isLoading: loadingCollections } = useQuery<CollectionWithDetails[]>({
    queryKey: ["/api/collections"],
  });

  const isLoading = loadingHotspots || loadingCollections;

  // 2. Calculate Stats
  const realHotspots = hotspots || [];
  const realCollections = collections || [];

  // Total collected volume (sum of all verified/approved collections)
  const totalVolume = realCollections
    .filter(c => c.status === 'verified' || c.status === 'approved')
    .reduce((acc, c) => {
      const weight = c.items.reduce((sum, item) => sum + Number(item.weight), 0);
      return acc + weight;
    }, 0);

  const criticalSpots = realHotspots.filter(h => h.status === 'critical').length;

  // Efficiency: Verified Submissions / Total Submissions
  const totalSubmissions = realCollections.length;
  const verifiedSubmissions = realCollections.filter(c => c.status === 'verified').length;
  const efficiency = totalSubmissions > 0 ? Math.round((verifiedSubmissions / totalSubmissions) * 100) : 0;

  // 3. Prepare Chart Data (Aggregate Material Types from Verified Collections)
  const materialCounts: Record<string, number> = {};
  realCollections.filter(c => c.status === 'verified').forEach(c => {
    c.items.forEach(item => {
      const type = item.materialType.toUpperCase();
      materialCounts[type] = (materialCounts[type] || 0) + Number(item.weight);
    });
  });

  const plasticData = Object.entries(materialCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  if (plasticData.length === 0) {
    plasticData.push({ name: 'No Data', value: 0 });
  }

  const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444'];

  // 4. Map Data (Hotspots + Submissions)
  const submissionMarkers = realCollections
    .filter(s => s.gpsLatitude && s.gpsLongitude && s.status === 'pending')
    .map(s => ({
      id: 10000 + s.id,
      name: s.newHotspotName || s.hotspot?.name || `Submission #${s.id}`,
      description: `Collected on ${new Date(s.collectedAt!).toLocaleDateString()}`,
      latitude: s.gpsLatitude!,
      longitude: s.gpsLongitude!,
      status: s.status,
      estimatedVolume: "0",
      createdAt: new Date(s.collectedAt!)
    } as unknown as Hotspot));

  const mapData = [...realHotspots, ...submissionMarkers];

  // 5. Recent Submissions (Last 5)
  const recentSubmissions = [...realCollections].sort((a, b) =>
    new Date(b.collectedAt || 0).getTime() - new Date(a.collectedAt || 0).getTime()
  ).slice(0, 5);

  // Focus on location handler
  const handleFocusLocation = (lat: number | null, lng: number | null) => {
    if (lat && lng) {
      setMapCenter([lat, lng]);
      setMapZoom(14);
      // Scroll to map on mobile
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <DashboardLayout
      userRole={(user?.role as any) || "admin"}
      userName={user?.name || "Admin"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of plastic hotspots and collection activities.</p>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Plastic Collected"
            value={isLoading ? "..." : `${totalVolume.toFixed(1)}kg`}
            icon={Scale}
            trend="up"
            trendValue="Verified"
          />
          <StatCard
            title="Active Hotspots"
            value={isLoading ? "..." : realHotspots.length}
            icon={MapPin}
            description="Documented Zones"
          />
          <StatCard
            title="Critical Zones"
            value={isLoading ? "..." : criticalSpots}
            icon={AlertTriangle}
            trend="down"
            trendValue="Action Needed"
            className="border-l-4 border-l-destructive"
          />
          <StatCard
            title="Approval Rate"
            value={isLoading ? "..." : `${efficiency}%`}
            icon={TrendingUp}
            description={`${verifiedSubmissions}/${totalSubmissions} submissions`}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Map Section */}
          <Card className="col-span-4 shadow-md flex flex-col">
            <CardHeader>
              <CardTitle>Live Zoning Map</CardTitle>
            </CardHeader>
            <CardContent className="pl-2 flex-1 min-h-[350px] relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <HotspotMap
                  hotspots={mapData}
                  className="h-full w-full rounded-md min-h-[350px]"
                  center={mapCenter}
                  zoom={mapZoom}
                />
              )}
            </CardContent>
          </Card>

          {/* Chart Section */}
          <Card className="col-span-3 shadow-md">
            <CardHeader>
              <CardTitle>Collected Material Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={plasticData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {plasticData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions Table */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Field Submissions</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setLocation("/submissions")}>View All</Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-muted/20 animate-pulse rounded" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location / Hotspot</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Weight</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No submissions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentSubmissions.map((sub) => {
                      const weight = sub.items.reduce((acc, i) => acc + Number(i.weight), 0);
                      const hasCoords = sub.gpsLatitude && sub.gpsLongitude;
                      return (
                        <TableRow
                          key={sub.id}
                          className={hasCoords ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                          onClick={() => hasCoords && handleFocusLocation(Number(sub.gpsLatitude), Number(sub.gpsLongitude))}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {hasCoords && <MapPin className="h-3 w-3 text-primary" />}
                              {sub.hotspot?.name || sub.newHotspotName || "Unknown Location"}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(sub.collectedAt!).toLocaleDateString()}</TableCell>
                          <TableCell>{weight.toFixed(1)}kg</TableCell>
                          <TableCell>
                            <Badge variant={sub.status === 'verified' ? 'default' : sub.status === 'rejected' ? 'destructive' : 'secondary'}
                              className={sub.status === 'verified' ? 'bg-emerald-600' : sub.status === 'pending' ? 'bg-amber-500' : ''}>
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setLocation("/submissions"); }}>Review</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
