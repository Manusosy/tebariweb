import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, MapPin, TrendingUp, Download, Recycle, Leaf, Users } from "lucide-react";
import { HotspotMap } from "@/components/map/hotspot-map";
import { MOCK_HOTSPOTS } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export default function PartnerOverview() {
  const totalVolume = MOCK_HOTSPOTS.reduce((acc, h) => acc + h.estimatedVolume, 0);
  const totalRecovered = Math.round(totalVolume * 0.65); // Simulating recovered amount

  const trendData = [
    { month: 'Jan', collected: 1200, recovered: 800 },
    { month: 'Feb', collected: 1500, recovered: 950 },
    { month: 'Mar', collected: 1100, recovered: 850 },
    { month: 'Apr', collected: 1800, recovered: 1200 },
    { month: 'May', collected: 2100, recovered: 1600 },
    { month: 'Jun', collected: 1950, recovered: 1500 },
  ];

  const compositionData = [
    { name: 'PET (Bottles)', value: 45, color: '#0ea5e9' },
    { name: 'HDPE (Rigid)', value: 25, color: '#22c55e' },
    { name: 'LDPE (Film)', value: 15, color: '#eab308' },
    { name: 'PP (Misc)', value: 10, color: '#f97316' },
    { name: 'Other', value: 5, color: '#64748b' },
  ];

  return (
    <DashboardLayout 
      userRole="partner" 
      userName="Eco Partners" 
      userEmail="partner@eco.com"
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
            value={`${totalRecovered}kg`}
            icon={Recycle}
            trend="up"
            trendValue="15% vs last month"
            className="bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
          />
          <StatCard 
            title="CO2 Emissions Offset" 
            value="3.2 Tons"
            icon={Leaf}
            description="Estimated equivalent"
            className="bg-sky-50/50 border-sky-200 dark:bg-sky-950/20 dark:border-sky-800"
          />
          <StatCard 
            title="Community Jobs" 
            value="12"
            icon={Users}
            description="Field officers supported"
          />
          <StatCard 
            title="Active Collection Zones" 
            value={MOCK_HOTSPOTS.length}
            icon={MapPin}
            trend="up"
            trendValue="2 new zones"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recovery Trend Chart */}
          <Card className="col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Recovery Trends (6 Months)</CardTitle>
              <CardDescription>Volume of plastic identified vs. successfully recovered.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="collected" name="Identified" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recovered" name="Recovered" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Composition Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Material Composition</CardTitle>
              <CardDescription>Breakdown by plastic type.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* Live Map Preview */}
        <Card className="shadow-md overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle>Live Collection Map</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">View Full Map &rarr;</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <HotspotMap hotspots={MOCK_HOTSPOTS} className="h-[400px] w-full rounded-none" readonly />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
