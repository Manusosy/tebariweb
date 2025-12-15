import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, Filter, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';

import { useQuery } from "@tanstack/react-query";
import { Collection, CollectionItem, Hotspot } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { startOfMonth, subMonths, format } from "date-fns";
import { Loader2 } from "lucide-react";

type CollectionWithDetails = Collection & {
  items: CollectionItem[];
  hotspot: Hotspot | null;
};

export default function PartnerAnalytics() {
  const { user } = useAuth();

  const { data: collections, isLoading } = useQuery<CollectionWithDetails[]>({
    queryKey: ["/api/collections"],
  });

  const { data: hotspots } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  // Calculate Real Analytics
  const verifiedCollections = (collections || []).filter(c => c.status === 'verified');

  // 1. Monthly Volume Data (Last 6 months)
  const monthlyVolumeMap = new Map<string, number>();
  const today = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(today, i);
    const key = format(d, 'MMM');
    monthlyVolumeMap.set(key, 0);
  }

  verifiedCollections.forEach(c => {
    if (c.collectedAt) {
      const date = new Date(c.collectedAt);
      const key = format(date, 'MMM');
      if (monthlyVolumeMap.has(key)) {
        const weight = c.items.reduce((sum, item) => sum + Number(item.weight), 0);
        monthlyVolumeMap.set(key, (monthlyVolumeMap.get(key) || 0) + weight);
      }
    }
  });

  const monthlyVolumeData = Array.from(monthlyVolumeMap.entries()).map(([month, collected]) => ({
    month,
    collected,
    target: 2000 // mocked target for now, or dynamic based on growth
  }));

  // 2. Regional Analysis (Volume by Hotspot)
  const regionMap = new Map<string, { pet: number, hdpe: number, other: number }>();

  verifiedCollections.forEach(c => {
    const regionName = c.hotspot?.name || c.newHotspotName || "Unknown";
    const current = regionMap.get(regionName) || { pet: 0, hdpe: 0, other: 0 };

    c.items.forEach(item => {
      const weight = Number(item.weight);
      if (item.materialType.toLowerCase() === 'pet') current.pet += weight;
      else if (item.materialType.toLowerCase() === 'hdpe') current.hdpe += weight;
      else current.other += weight;
    });

    regionMap.set(regionName, current);
  });

  const regionData = Array.from(regionMap.entries())
    .map(([name, counts]) => ({ name, ...counts }))
    .slice(0, 5); // Top 5 regions

  // Mock price trend for market context (external data usually)
  const plasticPriceTrend = [
    { date: 'W1', pet: 12, hdpe: 15 },
    { date: 'W2', pet: 13, hdpe: 15 },
    { date: 'W3', pet: 12.5, hdpe: 16 },
    { date: 'W4', pet: 14, hdpe: 16.5 },
  ];

  return (
    <DashboardLayout
      userRole="partner"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics</h2>
            <p className="text-muted-foreground">Deep dive into collection patterns and regional performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="6m">
              <SelectTrigger className="w-[120px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verify Collections (This Month)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                  `${monthlyVolumeData[monthlyVolumeData.length - 1]?.collected.toFixed(0) || 0} kg`
                }
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="text-emerald-500 flex items-center mr-1">
                  <ArrowUpRight className="h-3 w-3" /> Live
                </span>
                from verified submissions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Efficiency</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                System Uptime
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(hotspots || []).length}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                Monitored Areas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Volume vs Target Chart */}
          <Card className="col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Collection Volume vs Target</CardTitle>
              <CardDescription>Monthly plastic intake analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyVolumeData}>
                    <defs>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="collected" stroke="#10b981" fillOpacity={1} fill="url(#colorCollected)" strokeWidth={2} />
                    <Area type="monotone" dataKey="target" stroke="#94a3b8" fillOpacity={0} strokeDasharray="5 5" strokeWidth={2} />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Regional Breakdown */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Regional Composition Analysis</CardTitle>
              <CardDescription>Plastic types by collection zone.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" width={80} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend />
                    <Bar dataKey="pet" name="PET" stackId="a" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="hdpe" name="HDPE" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="other" name="Other" stackId="a" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Market Value Simulation */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recyclable Material Value</CardTitle>
              <CardDescription>Estimated market value trends (per kg).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={plasticPriceTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pet" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="hdpe" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
