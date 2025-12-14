import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, DollarSign, Globe, Download, ArrowUpRight } from "lucide-react";
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
  Legend
} from 'recharts';

export default function SuperAdminDashboard() {
  const growthData = [
    { month: 'Jan', revenue: 45000, impact: 1200 },
    { month: 'Feb', revenue: 52000, impact: 1500 },
    { month: 'Mar', revenue: 49000, impact: 1400 },
    { month: 'Apr', revenue: 63000, impact: 2100 },
    { month: 'May', revenue: 78000, impact: 2800 },
    { month: 'Jun', revenue: 92000, impact: 3200 },
  ];

  const fundingMetrics = [
    { name: 'Grant A', used: 65, remaining: 35 },
    { name: 'Seed Round', used: 80, remaining: 20 },
    { name: 'Ops Budget', used: 45, remaining: 55 },
  ];

  return (
    <DashboardLayout 
      userRole="super_admin" 
      userName="Sarah CEO" 
      userEmail="ceo@tebari.com"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Executive Overview</h2>
            <p className="text-muted-foreground">High-level strategic metrics and funding performance.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Investor Report (PDF)
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
            value="$425k"
            icon={DollarSign}
            trend="up"
            trendValue="18% YoY"
            className="bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800"
          />
          <StatCard 
            title="Active Regions" 
            value="3"
            icon={Globe}
            description="Expansion ready: 2"
          />
          <StatCard 
            title="Total Network" 
            value="48"
            icon={Users}
            description="Officers, Admins & Partners"
            trend="up"
            trendValue="5 new this month"
          />
          <StatCard 
            title="Plastic Diverted" 
            value="12.4 T"
            icon={TrendingUp}
            trend="up"
            trendValue="Record High"
            className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Growth Chart */}
          <Card className="col-span-2 shadow-md">
            <CardHeader>
              <CardTitle>Growth & Impact Velocity</CardTitle>
              <CardDescription>Revenue equivalent vs. environmental impact.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" name="Value ($)" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="impact" name="Impact (kg)" stroke="#10b981" fillOpacity={1} fill="url(#colorImpact)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Funding Utilization */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Budget Utilization</CardTitle>
              <CardDescription>Current burn rate across funds.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {fundingMetrics.map((fund) => (
                  <div key={fund.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{fund.name}</span>
                      <span className="text-muted-foreground">{fund.used}% Used</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${fund.used}%` }} 
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Runway</p>
                      <p className="text-2xl font-bold">14 Months</p>
                    </div>
                    <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> Healthy
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent System Alerts for CEO */}
        <Card>
           <CardHeader>
             <CardTitle>System Health & Alerts</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               <div className="flex items-start gap-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                 <div className="h-2 w-2 mt-2 rounded-full bg-yellow-500" />
                 <div>
                   <p className="font-medium text-sm">Approaching Storage Limit</p>
                   <p className="text-xs text-muted-foreground">Image storage is at 85% capacity. Consider upgrading plan before end of month.</p>
                 </div>
                 <Button variant="ghost" size="sm" className="ml-auto text-xs">Review</Button>
               </div>
               <div className="flex items-start gap-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 rounded-lg">
                 <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                 <div>
                   <p className="font-medium text-sm">New Partner Onboarded</p>
                   <p className="text-xs text-muted-foreground">"EcoPlast Solutions" has been verified and added to the partner network.</p>
                 </div>
                 <Button variant="ghost" size="sm" className="ml-auto text-xs">Details</Button>
               </div>
             </div>
           </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
