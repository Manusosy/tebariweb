import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, MapPin, CheckCircle, Clock } from "lucide-react";
import { MOCK_SUBMISSIONS, MOCK_HOTSPOTS } from "@/lib/mock-data";
import { Link } from "wouter";
import { HotspotMap } from "@/components/map/hotspot-map";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function FieldOverview() {
  const mySubmissions = MOCK_SUBMISSIONS.filter(s => s.officerId === 'u3'); // Current user 'u3'
  const totalCollected = mySubmissions.reduce((acc, s) => acc + s.totalWeight, 0);
  const pendingCount = mySubmissions.filter(s => s.status === 'pending').length;
  
  // Nearby hotspots (simulating proximity)
  const nearbyHotspots = MOCK_HOTSPOTS.slice(0, 3);

  return (
    <DashboardLayout 
      userRole="field_officer" 
      userName="John Field" 
      userEmail="john@tebari.com"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
            <p className="text-muted-foreground">Welcome back, John. Here's your activity overview.</p>
          </div>
          <Link href="/collection/new">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all">
              + Start New Collection
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="My Total Collected" 
            value={`${totalCollected}kg`}
            icon={Scale}
            trend="up"
            trendValue="This Month"
            className="border-primary/20 bg-primary/5"
          />
          <StatCard 
            title="Pending Approval" 
            value={pendingCount}
            icon={Clock}
            description="Submissions under review"
            className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900"
          />
          <StatCard 
            title="Verified Submissions" 
            value={mySubmissions.length - pendingCount}
            icon={CheckCircle}
            className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900"
          />
          <StatCard 
            title="Assigned Area" 
            value="Zone A"
            icon={MapPin}
            description="Kilifi North"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Nearby Hotspots */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Nearby Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="h-[300px] w-full">
                  <HotspotMap hotspots={nearbyHotspots} className="w-full h-full rounded-none" zoom={11} />
               </div>
               <div className="p-4 space-y-3">
                 {nearbyHotspots.map(spot => (
                   <div key={spot.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                     <div>
                       <p className="font-medium text-sm">{spot.name}</p>
                       <p className="text-xs text-muted-foreground">{spot.estimatedVolume}kg est. volume</p>
                     </div>
                     <Badge variant="outline" className={
                        spot.severity === 'critical' ? 'text-red-600 border-red-200 bg-red-50' : ''
                     }>{spot.status}</Badge>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mySubmissions.slice(0, 5).map(sub => (
                  <div key={sub.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <img 
                      src={sub.imageUrl} 
                      alt="Thumbnail" 
                      className="w-16 h-16 rounded-md object-cover border"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm">Collection at {sub.location.lat.toFixed(3)}, {sub.location.lng.toFixed(3)}</p>
                        <span className="text-xs text-muted-foreground">{format(new Date(sub.timestamp), 'MMM dd')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Collected <span className="font-semibold text-foreground">{sub.totalWeight}kg</span> of mixed plastics
                      </p>
                      <Badge variant={sub.status === 'approved' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5">
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
