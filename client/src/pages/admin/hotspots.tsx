import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { HotspotMap } from "@/components/map/hotspot-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Loader2, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Hotspot } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Kenya coastal regions for zone selection
const KENYA_ZONES = [
  { name: "Mombasa", lat: "-4.0435", lng: "39.6682" },
  { name: "Kilifi", lat: "-3.6305", lng: "39.8499" },
  { name: "Malindi", lat: "-3.2138", lng: "40.1169" },
  { name: "Watamu", lat: "-3.3540", lng: "40.0240" },
  { name: "Mtwapa", lat: "-3.9412", lng: "39.7368" },
  { name: "Nyali", lat: "-4.0305", lng: "39.7174" },
  { name: "Diani", lat: "-4.3217", lng: "39.5802" },
  { name: "Lamu", lat: "-2.2686", lng: "40.9020" },
  { name: "Kwale", lat: "-4.1743", lng: "39.4521" },
  { name: "Tana River", lat: "-1.8571", lng: "40.0542" },
];

export default function HotspotsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);

  // Form state for new zone
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneDescription, setNewZoneDescription] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");

  // Fetch real data from backend
  const { data: hotspots, isLoading, isError } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  // Mutation for updating hotspot status
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Hotspot> }) => {
      const res = await apiRequest("PATCH", `/api/hotspots/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotspots"] });
      toast({ title: "Zone updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update zone", variant: "destructive" });
    }
  });

  // Mutation for creating new zone
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; latitude: string; longitude: string; status: string; estimatedVolume: string }) => {
      const res = await apiRequest("POST", "/api/hotspots", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotspots"] });
      toast({ title: "Zone created successfully" });
      resetForm();
      setIsAddZoneOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create zone", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setNewZoneName("");
    setNewZoneDescription("");
    setSelectedRegion("");
    setCustomLat("");
    setCustomLng("");
  };

  const handleCreateZone = () => {
    if (!newZoneName.trim()) {
      toast({ title: "Please enter a zone name", variant: "destructive" });
      return;
    }

    let lat = customLat;
    let lng = customLng;

    // If a region is selected, use its coordinates
    if (selectedRegion) {
      const region = KENYA_ZONES.find(z => z.name === selectedRegion);
      if (region) {
        lat = region.lat;
        lng = region.lng;
      }
    }

    if (!lat || !lng) {
      toast({ title: "Please select a region or enter coordinates", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      name: newZoneName.trim(),
      description: newZoneDescription.trim(),
      latitude: lat,
      longitude: lng,
      status: "active",
      estimatedVolume: "0"
    });
  };

  // Filter hotspots by status
  const filteredHotspots = (hotspots || []).filter(h => {
    if (statusFilter === "all") return true;
    return h.status === statusFilter;
  });

  const handleStatusChange = (hotspot: Hotspot, newStatus: string) => {
    updateMutation.mutate({ id: hotspot.id, updates: { status: newStatus } });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">{status}</Badge>;
      case 'cleared':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">{status}</Badge>;
      case 'active':
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout userRole={(user?.role as any) || "admin"} userName={user?.name || "Admin"} userEmail={user?.email || ""}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Zone Management</h2>
            <p className="text-muted-foreground">Manage collection zones and assign field officers to areas.</p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="cleared">Cleared</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={() => setIsAddZoneOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex h-64 items-center justify-center flex-col gap-4 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div className="text-destructive font-medium">Failed to load zones</div>
            <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/hotspots"] })}>Retry</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* List Sidebar */}
            <Card className="lg:col-span-1 flex flex-col h-full shadow-md">
              <CardHeader>
                <CardTitle className="text-base">
                  {statusFilter === "all" ? "All Zones" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Zones`} ({filteredHotspots.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                {filteredHotspots.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No zones found</p>
                    <Button variant="link" onClick={() => setIsAddZoneOpen(true)} className="mt-2">
                      Create your first zone
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredHotspots.map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors group ${selectedHotspot?.id === hotspot.id ? 'bg-muted/50' : ''}`}
                        onClick={() => setSelectedHotspot(hotspot)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{hotspot.name}</h3>
                          {getStatusBadge(hotspot.status)}
                        </div>
                        {hotspot.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{hotspot.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Zone {hotspot.id}
                          </span>
                        </div>
                        <div className="text-xs grid grid-cols-2 gap-2">
                          <div className="bg-muted rounded px-2 py-1">
                            Est. Volume: <span className="font-medium text-foreground">{hotspot.estimatedVolume}kg</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-6 text-xs w-full">
                                Change Status
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleStatusChange(hotspot, 'active')}>
                                Set Active
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(hotspot, 'critical')} className="text-destructive">
                                Set Critical
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(hotspot, 'cleared')} className="text-emerald-600">
                                Set Cleared
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map View */}
            <Card className="lg:col-span-2 shadow-md flex flex-col overflow-hidden">
              <HotspotMap
                hotspots={filteredHotspots}
                className="w-full h-full rounded-none"
                center={selectedHotspot ? [Number(selectedHotspot.latitude), Number(selectedHotspot.longitude)] : undefined}
                zoom={selectedHotspot ? 14 : undefined}
              />
            </Card>
          </div>
        )}

        {/* Add Zone Dialog */}
        <Dialog open={isAddZoneOpen} onOpenChange={setIsAddZoneOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Collection Zone</DialogTitle>
              <DialogDescription>
                Create a new zone where field officers will collect plastic waste.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Zone Name *</Label>
                <Input
                  id="zoneName"
                  placeholder="e.g., Kilifi Beach North"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneDescription">Description</Label>
                <Textarea
                  id="zoneDescription"
                  placeholder="Brief description of this zone..."
                  value={newZoneDescription}
                  onChange={(e) => setNewZoneDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Region (Kenya)</Label>
                <Select value={selectedRegion} onValueChange={(val) => {
                  setSelectedRegion(val);
                  // Clear custom coordinates when region is selected
                  setCustomLat("");
                  setCustomLng("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {KENYA_ZONES.map(zone => (
                      <SelectItem key={zone.name} value={zone.name}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center text-xs text-muted-foreground">— or enter custom coordinates —</div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    placeholder="-3.6305"
                    value={customLat}
                    onChange={(e) => {
                      setCustomLat(e.target.value);
                      setSelectedRegion(""); // Clear region when custom coords entered
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    placeholder="39.8499"
                    value={customLng}
                    onChange={(e) => {
                      setCustomLng(e.target.value);
                      setSelectedRegion(""); // Clear region when custom coords entered
                    }}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setIsAddZoneOpen(false); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateZone} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Zone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
