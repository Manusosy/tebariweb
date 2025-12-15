import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, MapPin, CheckCircle, Clock, Loader2, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { HotspotMap } from "@/components/map/hotspot-map";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection, CollectionItem, Hotspot } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type CollectionWithRelations = Collection & { items: CollectionItem[], hotspot: Hotspot | null };

export default function FieldOverview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Map State
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.350, 40.015]);
  const [mapZoom, setMapZoom] = useState(11);

  const { data: collections, isLoading: loadingCollections } = useQuery<CollectionWithRelations[]>({
    queryKey: ["/api/collections"],
  });

  const { data: hotspots, isLoading: loadingHotspots } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      toast({ title: "Deleted", description: "Submission deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Calculate Stats
  const mySubmissions = collections || [];

  // Filter out rejected submissions for total calculation
  const validSubmissions = mySubmissions.filter(s => s.status !== 'rejected');

  const totalCollected = validSubmissions.reduce((acc, s) => {
    const weight = s.items.reduce((sum, item) => sum + Number(item.weight), 0);
    return acc + weight;
  }, 0);

  const pendingCount = mySubmissions.filter(s => s.status === 'pending').length;
  // Verified count excludes rejected and pending
  const verifiedCount = mySubmissions.filter(s => s.status === 'verified').length;

  // Determine hotspots to show on map
  const assignedHotspot = (user as any)?.assignedHotspot;

  // If assigned, show that. Else show nearby (first 3).
  let displayHotspots: Hotspot[] = [];
  if (assignedHotspot) {
    displayHotspots = [assignedHotspot];
  } else {
    displayHotspots = hotspots?.slice(0, 3) || [];
  }

  // Effect to center map on assigned hotspot when loaded
  useEffect(() => {
    if (assignedHotspot?.latitude && assignedHotspot?.longitude) {
      setMapCenter([Number(assignedHotspot.latitude), Number(assignedHotspot.longitude)]);
      setMapZoom(13);
    }
  }, [assignedHotspot]);

  const handleFocusLocation = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(14);
    // Scroll to top or specific map section could be nice, but flyTo is enough visual feedback if visible
  };

  return (
    <DashboardLayout
      userRole="field_officer"
      userName={user?.name || "Field Officer"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
            <p className="text-muted-foreground">Welcome back, {user?.name?.split(' ')[0] || 'User'}. Here's your activity overview.</p>
          </div>
          <Link href="/collection/new">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all">
              + Start New Collection
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loadingCollections ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : (
            <>
              <StatCard
                title="My Total Collected"
                value={`${totalCollected.toFixed(1)}kg`}
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
                value={verifiedCount}
                icon={CheckCircle}
                className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900"
              />
              {/* Dynamic Assigned Area Card */}
              {(() => {
                // Now using direct relation from user object
                const assignedHotspot = (user as any)?.assignedHotspot;

                if (assignedHotspot) {
                  return (
                    <StatCard
                      title="Assigned Area"
                      value={assignedHotspot.name}
                      icon={MapPin}
                      description={assignedHotspot.description || "Active zone"}
                      className="border-primary/20"
                    />
                  );
                } else {
                  return (
                    <StatCard
                      title="Assigned Area"
                      value="Awaiting Assignment"
                      icon={MapPin}
                      description="Your admin will assign you a zone"
                      className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900"
                    />
                  );
                }
              })()}
            </>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Nearby Hotspots */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {assignedHotspot ? "My Assigned Zone" : "Nearby Hotspots"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingHotspots ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px] w-full">
                  <HotspotMap
                    hotspots={displayHotspots}
                    className="w-full h-full rounded-none"
                    zoom={mapZoom}
                    center={mapCenter}
                  />
                </div>
              )}
              <div className="p-4 space-y-3">
                {loadingHotspots ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                ) : (
                  displayHotspots.map(spot => (
                    <div key={spot.id}
                      className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                      onClick={() => handleFocusLocation(Number(spot.latitude), Number(spot.longitude))}
                    >
                      <div>
                        <p className="font-medium text-sm">{spot.name}</p>
                        <p className="text-xs text-muted-foreground">{spot.estimatedVolume}kg est. volume</p>
                      </div>
                      <Badge variant="outline" className={
                        // spot.severity === 'critical' ? 'text-red-600 border-red-200 bg-red-50' : ''
                        'capitalize'
                      }>{spot.status}</Badge>
                    </div>
                  ))
                )}
                {displayHotspots.length === 0 && !loadingHotspots && (
                  <p className="text-sm text-muted-foreground text-center py-4">No hotspots to display.</p>
                )}
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
                {loadingCollections ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : mySubmissions.length > 0 ? (
                  mySubmissions.slice(0, 5).map(sub => {
                    const subWeight = sub.items.reduce((sum, item) => sum + Number(item.weight), 0);
                    return (
                      <div key={sub.id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                        onClick={() => sub.gpsLatitude && sub.gpsLongitude && handleFocusLocation(Number(sub.gpsLatitude), Number(sub.gpsLongitude))}
                      >
                        {sub.imageUrl ? (
                          <img
                            src={sub.imageUrl}
                            alt="Thumbnail"
                            className="w-16 h-16 rounded-md object-cover border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center border">
                            <Scale className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">
                                Collection {sub.hotspot ? `at ${sub.hotspot.name}` : ''}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {sub.collectedAt ? format(new Date(sub.collectedAt), 'MMM dd, yyyy') : '-'}
                              </span>
                            </div>
                            {(sub.status === 'pending' || sub.status === 'rejected') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent map focus
                                  if (confirm(`Are you sure you want to delete this ${sub.status} submission?`)) {
                                    deleteMutation.mutate(sub.id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Collected <span className="font-semibold text-foreground">{subWeight.toFixed(1)}kg</span> of plastics
                          </p>
                          <Badge variant={sub.status === 'verified' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5 capitalize">
                            {sub.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No collections yet.</p>
                    <Link href="/collection/new">
                      <Button variant="link" className="mt-2">Start your first collection</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
