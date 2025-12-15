import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Users, DollarSign, Globe, Download, ArrowUpRight, Bell, Edit } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection, CollectionItem, Hotspot, User, FinancialMetric, Notification } from "@shared/schema";
import { format, subMonths } from "date-fns";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type CollectionWithDetails = Collection & {
  items: CollectionItem[];
  hotspot: Hotspot | null;
};

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [metricForm, setMetricForm] = useState({ category: "", value: "", target: "" });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: hotspots, isLoading: hotspotsLoading } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery<CollectionWithDetails[]>({
    queryKey: ["/api/collections"],
  });

  const { data: financialMetrics } = useQuery<FinancialMetric[]>({
    queryKey: ["/api/metrics"],
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const updateMetricDfn = useMutation({
    mutationFn: async (data: { category: string, value: number, target?: number }) => {
      const res = await apiRequest("POST", "/api/metrics", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({ title: "Metric updated" });
      setMetricForm({ category: "", value: "", target: "" });
    }
  });

  const isLoading = usersLoading || hotspotsLoading || collectionsLoading;

  // Calculate Real Metrics
  const totalNetwork = users?.length || 0;
  const activeRegions = hotspots?.length || 0;

  const verifiedCollections = (collections || []).filter(c => c.status === 'verified');

  const totalDiverted = verifiedCollections.reduce((total, c) => {
    return total + c.items.reduce((sum, item) => sum + Number(item.weight), 0);
  }, 0);

  const totalImpactValue = totalDiverted * 0.50;

  // Growth Chart Data (Last 6 Months)
  const monthlyDataMap = new Map<string, { value: number, impact: number }>();
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = subMonths(today, i);
    const key = format(d, 'MMM');
    monthlyDataMap.set(key, { value: 0, impact: 0 });
  }

  verifiedCollections.forEach(c => {
    if (c.collectedAt) {
      const date = new Date(c.collectedAt);
      const key = format(date, 'MMM');
      if (monthlyDataMap.has(key)) {
        const weight = c.items.reduce((sum, item) => sum + Number(item.weight), 0);
        const current = monthlyDataMap.get(key) || { value: 0, impact: 0 };
        current.impact += weight;
        current.value += weight * 0.50;
        monthlyDataMap.set(key, current);
      }
    }
  });

  const growthData = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
    month,
    revenue: data.value,
    impact: data.impact
  }));

  // Default metrics if empty
  const defaultFunding = [
    { category: 'Grant A', value: 65, target: 100 },
    { category: 'Seed Round', value: 80, target: 100 },
    { category: 'Ops Budget', value: 45, target: 100 },
  ];

  const fundingDisplay = financialMetrics?.length ? financialMetrics : defaultFunding;

  return (
    <DashboardLayout userRole="super_admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Executive Overview</h2>
            <p className="text-muted-foreground">High-level strategic metrics and environmental impact.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Report
            </Button>
            <Button className="bg-primary text-primary-foreground">
              Invite Stakeholder
            </Button>
          </div>
        </div>

        {/* Strategic KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Impact Value"
            value={`$${totalImpactValue.toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue="Calculated from verified volume"
            className="bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800"
          />
          <StatCard
            title="Active Regions"
            value={activeRegions.toString()}
            icon={Globe}
            description={`Across ${hotspots?.filter(h => h.status === 'active').length || 0} active zones`}
          />
          <StatCard
            title="Total Network"
            value={totalNetwork.toString()}
            icon={Users}
            description="Officers, Admins & Partners"
          />
          <StatCard
            title="Plastic Diverted"
            value={`${(totalDiverted / 1000).toFixed(2)} T`}
            icon={TrendingUp}
            trend="up"
            trendValue="Verified Volume"
            className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Growth Chart */}
          <Card className="col-span-2 shadow-md">
            <CardHeader>
              <CardTitle>Growth & Impact Velocity</CardTitle>
              <CardDescription>Value created vs. physical environmental impact (kg).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" name="Est. Value ($)" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                      <Area yAxisId="right" type="monotone" dataKey="impact" name="Impact (kg)" stroke="#10b981" fillOpacity={1} fill="url(#colorImpact)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Funding Utilization - Connected to Real Data */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Budget Utilization</CardTitle>
                <CardDescription>Current burn rate across funds.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Financial Metrics</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Fund/Category Name</Label>
                      <Input
                        placeholder="e.g. Grant A"
                        value={metricForm.category}
                        onChange={e => setMetricForm({ ...metricForm, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Value (Used/Burned)</Label>
                      <Input
                        type="number"
                        placeholder="Percentage or Amount"
                        value={metricForm.value}
                        onChange={e => setMetricForm({ ...metricForm, value: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target / Total (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={metricForm.target}
                        onChange={e => setMetricForm({ ...metricForm, target: e.target.value })}
                      />
                    </div>
                    <Button onClick={() => updateMetricDfn.mutate({
                      category: metricForm.category,
                      value: Number(metricForm.value),
                      target: metricForm.target ? Number(metricForm.target) : undefined
                    })} className="w-full">
                      Save Update
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {fundingDisplay.map((fund: any) => (
                  <div key={fund.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{fund.category}</span>
                      <span className="text-muted-foreground">{fund.value}% Used</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, Number(fund.value)))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>System Health & Alerts</CardTitle>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/super-admin/notifications'}>
              View All Notifications
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className={`flex items-start gap-4 p-3 border rounded-lg ${n.type === 'alert' ? 'bg-red-50 dark:bg-red-900/10 border-red-200' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200'}`}>
                    <div className={`h-2 w-2 mt-2 rounded-full ${n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent alerts.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
