import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { HotspotMap } from "@/components/map/hotspot-map";
import { MOCK_HOTSPOTS, MOCK_SUBMISSIONS } from "@/lib/mock-data";
import { Scale, MapPin, TrendingUp, AlertTriangle } from "lucide-react";
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
import { Button } from "@/components/ui/button"; // Added import
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

export default function AdminDashboard() {
  const totalVolume = MOCK_HOTSPOTS.reduce((acc, h) => acc + h.estimatedVolume, 0);
  const criticalSpots = MOCK_HOTSPOTS.filter(h => h.severity === 'critical').length;
  
  const plasticData = [
    { name: 'PET', value: 400 },
    { name: 'HDPE', value: 300 },
    { name: 'PP', value: 200 },
    { name: 'LDPE', value: 278 },
    { name: 'Other', value: 189 },
  ];

  const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444'];

  return (
    <DashboardLayout 
      userRole="admin" 
      userName="Sarah Ops"
      userEmail="sarah@tebari.com"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of plastic hotspots and collection activities.</p>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Plastic Identified" 
            value={`${totalVolume}kg`}
            icon={Scale}
            trend="up"
            trendValue="12% vs last month"
          />
          <StatCard 
            title="Active Hotspots" 
            value={MOCK_HOTSPOTS.length}
            icon={MapPin}
            description="Across 3 regions"
          />
          <StatCard 
            title="Critical Zones" 
            value={criticalSpots}
            icon={AlertTriangle}
            trend="down"
            trendValue="2 resolved"
            className="border-l-4 border-l-destructive"
          />
          <StatCard 
            title="Collection Efficiency" 
            value="87%"
            icon={TrendingUp}
            trend="up"
            trendValue="5%"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Map Section */}
          <Card className="col-span-4 shadow-md">
            <CardHeader>
              <CardTitle>Live Hotspot Map</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <HotspotMap hotspots={MOCK_HOTSPOTS} className="h-[350px] w-full rounded-md" />
            </CardContent>
          </Card>

          {/* Chart Section */}
          <Card className="col-span-3 shadow-md">
            <CardHeader>
              <CardTitle>Plastic Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={plasticData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {plasticData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Field Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SUBMISSIONS.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      Lat: {sub.location.lat.toFixed(3)}, Lng: {sub.location.lng.toFixed(3)}
                    </TableCell>
                    <TableCell>Officer {sub.officerId}</TableCell>
                    <TableCell>{sub.totalWeight}kg</TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'approved' ? 'default' : 'secondary'} 
                        className={sub.status === 'approved' ? 'bg-emerald-600' : 'bg-yellow-500'}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
