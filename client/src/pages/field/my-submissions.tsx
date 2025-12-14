import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Scale, Calendar, CheckCircle, Clock, AlertCircle, Trash2, Loader2, Camera } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection, CollectionItem, Hotspot } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { HotspotMap } from "@/components/map/hotspot-map";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type CollectionWithDetails = Collection & {
  items: CollectionItem[];
  hotspot: Hotspot | null;
};

export default function MySubmissionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Map State
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.350, 40.015]);
  const [mapZoom, setMapZoom] = useState(11);

  const { data: submissions, isLoading } = useQuery<CollectionWithDetails[]>({
    queryKey: ["/api/collections"],
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

  const filtered = submissions?.filter(s =>
  (s.notes?.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toString().includes(search) ||
    s.hotspot?.name.toLowerCase().includes(search.toLowerCase()) ||
    s.newHotspotName?.toLowerCase().includes(search.toLowerCase())
  )
  ) || [];

  const handleFocusLocation = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(14);
    // Scroll to top to see map if on mobile? 
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert submissions to Hotspot type for map
  const mapData = (submissions || []).filter(s => s.gpsLatitude && s.gpsLongitude).map(s => {
    const totalWeight = s.items.reduce((acc, item) => acc + Number(item.weight), 0);
    return {
      id: s.id,
      name: s.hotspot?.name || s.newHotspotName || `Submission #${s.id}`,
      description: s.notes || "",
      latitude: s.gpsLatitude!,
      longitude: s.gpsLongitude!,
      status: s.status,
      estimatedVolume: totalWeight.toString(),
      createdAt: new Date() // Dummy
    } as unknown as Hotspot; // Cast to satisfy HotspotMap props which expects strictly Hotspot type
  });

  return (
    <DashboardLayout
      userRole="field_officer"
      userName={user?.name || "Field Officer"}
      userEmail={user?.email || ""}
    >
      <div className="h-[calc(100vh-2rem)] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Submissions</h2>
            <p className="text-muted-foreground">Track the status of your data collection entries.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
          {/* Left Column: Map */}
          <div className="w-full lg:w-1/2 h-[300px] lg:h-full rounded-xl overflow-hidden border shadow-sm relative shrink-0">
            {isLoading ? (
              <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                <MapPin className="h-10 w-10 text-muted-foreground/50" />
              </div>
            ) : (
              <HotspotMap
                hotspots={mapData}
                className="w-full h-full rounded-none border-0"
                zoom={mapZoom}
                center={mapCenter}
              />
            )}
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-medium z-[400] shadow-sm border">
              {mapData.length} Locations
            </div>
          </div>

          {/* Right Column: List */}
          <div className="w-full lg:w-1/2 flex flex-col min-h-0">
            <Tabs defaultValue="all" className="w-full h-full flex flex-col">
              <TabsList className="w-full justify-start shrink-0 mb-4">
                <TabsTrigger value="all" className="flex-1">All Entries</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
                <TabsTrigger value="approved" className="flex-1">Approved</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto pr-2 pb-4">
                <TabsContent value="all" className="mt-0">
                  <SubmissionList
                    submissions={filtered}
                    loading={isLoading}
                    onFocus={handleFocusLocation}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    isDeleting={deleteMutation.isPending}
                  />
                </TabsContent>
                <TabsContent value="pending" className="mt-0">
                  <SubmissionList
                    submissions={filtered.filter(s => s.status === 'pending')}
                    loading={isLoading}
                    onFocus={handleFocusLocation}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    isDeleting={deleteMutation.isPending}
                  />
                </TabsContent>
                <TabsContent value="approved" className="mt-0">
                  <SubmissionList
                    submissions={filtered.filter(s => s.status === 'verified')}
                    loading={isLoading}
                    onFocus={handleFocusLocation}
                    onDelete={() => { }}
                    isDeleting={false}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SubmissionList({
  submissions,
  loading,
  onFocus,
  onDelete,
  isDeleting
}: {
  submissions: CollectionWithDetails[],
  loading: boolean,
  onFocus: (lat: number, lng: number) => void,
  onDelete: (id: number) => void,
  isDeleting: boolean
}) {
  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No submissions found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {submissions.map((sub) => {
        const totalWeight = sub.items.reduce((acc, item) => acc + Number(item.weight), 0);
        const plasticTypes = Array.from(new Set(sub.items.map(i => i.materialType))).join(", ");
        const locationName = sub.hotspot?.name || sub.newHotspotName || "Unknown Location";
        const hasCoords = sub.gpsLatitude && sub.gpsLongitude;

        return (
          <Card
            key={sub.id}
            className="overflow-hidden hover:shadow-md transition-all group/card"
          >
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 p-4">
              {/* Location & Status Header (Visible on Mobile) */}
              <div className="flex justify-between items-start mb-4 sm:hidden">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{locationName}</h3>
                  <div className="text-sm text-muted-foreground">{sub.collectedAt ? format(new Date(sub.collectedAt), 'PP') : 'Unknown Date'}</div>
                </div>
                <StatusBadge status={sub.status} className="ml-2 shrink-0" />
              </div>

              {/* Image Section */}
              <div
                className="w-full sm:w-32 sm:h-32 aspect-video sm:aspect-square relative bg-muted shrink-0 rounded-md overflow-hidden cursor-pointer group/image mb-4 sm:mb-0"
                onClick={() => hasCoords && onFocus(Number(sub.gpsLatitude), Number(sub.gpsLongitude))}
              >
                {sub.imageUrl ? (
                  <img
                    src={sub.imageUrl}
                    alt="Evidence"
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover/image:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground group-hover/image:bg-muted/80 transition-colors">
                    <Camera className="h-8 w-8 opacity-20" />
                  </div>
                )}
                {hasCoords && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                    <MapPin className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                {/* Desktop Header */}
                <div className="hidden sm:flex justify-between items-start mb-2">
                  <div
                    className="cursor-pointer hover:underline underline-offset-4 decoration-muted-foreground/30"
                    onClick={() => hasCoords && onFocus(Number(sub.gpsLatitude), Number(sub.gpsLongitude))}
                  >
                    <h3 className="font-bold text-lg truncate leading-tight">{locationName}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {sub.collectedAt ? format(new Date(sub.collectedAt), 'PP, p') : '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={sub.status} />
                    {(sub.status === 'pending' || sub.status === 'rejected') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8 transition-colors -mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${sub.status} submission?`)) {
                            onDelete(sub.id);
                          }
                        }}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mobile Actions (Delete) */}
                {(sub.status === 'pending' || sub.status === 'rejected') && (
                  <div className="flex sm:hidden justify-end mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive h-8 border-destructive/20 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${sub.status} submission?`)) {
                          onDelete(sub.id);
                        }
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3 w-3 mr-2" /> Delete
                    </Button>
                  </div>
                )}

                {/* Stats Grid - Clean Layout */}
                <div
                  className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-balance cursor-pointer"
                  onClick={() => hasCoords && onFocus(Number(sub.gpsLatitude), Number(sub.gpsLongitude))}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Weight</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Scale className="h-3 w-3 text-primary" /> {totalWeight.toFixed(1)} <span className="text-muted-foreground text-xs font-normal">kg</span>
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Type</span>
                    <span className="font-medium truncate" title={plasticTypes || "None"}>
                      {plasticTypes || "Unknown"}
                    </span>
                  </div>

                  <div className="col-span-2 flex flex-col mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Location</span>
                    <span className="font-medium truncate flex items-center gap-1 font-mono text-xs">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {sub.gpsLatitude ? `${Number(sub.gpsLatitude).toFixed(4)}, ${Number(sub.gpsLongitude).toFixed(4)}` : 'No Coordinates'}
                    </span>
                  </div>
                </div>

                {/* Notes Inline */}
                {sub.notes && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-1 italic">
                    "{sub.notes}"
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function StatusBadge({ status, className }: { status: string, className?: string }) {
  if (status === 'verified' || status === 'approved') {
    return <Badge className={`bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 border-emerald-200 ${className}`} variant="outline"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
  }
  if (status === 'rejected') {
    return <Badge className={`bg-red-50 text-red-600 hover:bg-red-100 border-red-200 ${className}`} variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
  }
  return <Badge variant="outline" className={`bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200 ${className}`}><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
}
