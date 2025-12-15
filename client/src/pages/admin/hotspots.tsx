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

// Kenya coastal regions with sub-locations for zone selection
const KENYA_COASTAL_LOCATIONS: Record<string, { name: string; lat: string; lng: string }[]> = {
  "Kilifi": [
    { name: "Marereni", lat: "-2.9533", lng: "40.1850" },
    { name: "Malindi Town", lat: "-3.2138", lng: "40.1169" },
    { name: "Watamu", lat: "-3.3540", lng: "40.0240" },
    { name: "Kilifi Town", lat: "-3.6305", lng: "39.8499" },
    { name: "Mtwapa", lat: "-3.9412", lng: "39.7368" },
    { name: "Takaungu", lat: "-3.7000", lng: "39.8500" },
  ],
  "Mombasa": [
    { name: "Nyali", lat: "-4.0305", lng: "39.7174" },
    { name: "Bamburi", lat: "-3.9833", lng: "39.7167" },
    { name: "Likoni", lat: "-4.0767", lng: "39.6500" },
    { name: "Kisauni", lat: "-3.9833", lng: "39.7333" },
    { name: "Old Town", lat: "-4.0635", lng: "39.6682" },
    { name: "Shanzu", lat: "-4.0000", lng: "39.7500" },
    { name: "Mombasa Island", lat: "-4.0435", lng: "39.6682" },
  ],
  "Kwale": [
    { name: "Diani", lat: "-4.3217", lng: "39.5802" },
    { name: "Ukunda", lat: "-4.2833", lng: "39.5667" },
    { name: "Shimba Hills", lat: "-4.2500", lng: "39.4333" },
    { name: "Msambweni", lat: "-4.4667", lng: "39.4833" },
    { name: "Shimoni", lat: "-4.6500", lng: "39.3833" },
    { name: "Tiwi", lat: "-4.2333", lng: "39.6000" },
  ],
  "Lamu": [
    { name: "Lamu Town", lat: "-2.2686", lng: "40.9020" },
    { name: "Shela", lat: "-2.2833", lng: "40.9000" },
    { name: "Pate Island", lat: "-2.0833", lng: "41.0667" },
    { name: "Manda Island", lat: "-2.2500", lng: "40.9333" },
    { name: "Mokowe", lat: "-2.1833", lng: "40.8500" },
  ],
  "Tana River": [
    { name: "Kipini", lat: "-2.5167", lng: "40.5333" },
    { name: "Garsen", lat: "-2.2667", lng: "40.1167" },
    { name: "Hola", lat: "-1.5000", lng: "40.0333" },
    { name: "Ngao", lat: "-2.0000", lng: "40.1500" },
  ],
};

export default function HotspotsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);

  // Form state for new zone
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneDescription, setNewZoneDescription] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedSubLocation, setSelectedSubLocation] = useState("");
  const [autoLat, setAutoLat] = useState("");
  const [autoLng, setAutoLng] = useState("");
  const [newZoneAccessibility, setNewZoneAccessibility] = useState("Truck");
  const [newZonePartnerInfo, setNewZonePartnerInfo] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);

  // Get sub-locations for selected county
  const subLocations = selectedCounty ? KENYA_COASTAL_LOCATIONS[selectedCounty] || [] : [];

  // Fetch real data from backend
  const { data: hotspots, isLoading, isError } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  const resetForm = () => {
    setNewZoneName("");
    setNewZoneDescription("");
    setSelectedCounty("");
    setSelectedSubLocation("");
    setAutoLat("");
    setAutoLng("");
    setNewZoneAccessibility("Truck"); // Default
    setNewZonePartnerInfo("");
  };

  // Mutation for updating hotspot status
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Hotspot> }) => {
      const res = await apiRequest("PATCH", `/api/hotspots/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotspots"] });
      toast({ title: "Zone updated successfully" });
      setIsEditOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update zone", variant: "destructive" });
    }
  });

  // Mutation for creating new zone
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; latitude: string; longitude: string; status: string; estimatedVolume: string; accessibility: string; partnerInfo: string }) => {
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

  const handleCreateZone = () => {
    if (!newZoneName.trim()) {
      toast({ title: "Please enter a zone name", variant: "destructive" });
      return;
    }

    if (!autoLat || !autoLng) {
      toast({ title: "Please select a county and location", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      name: newZoneName.trim(),
      description: newZoneDescription.trim(),
      latitude: autoLat,
      longitude: autoLng,
      status: "active",
      estimatedVolume: "0",
      accessibility: newZoneAccessibility,
      partnerInfo: newZonePartnerInfo.trim()
    });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotspot) return;

    // We already have the state updated in the editingHotspot object if we used controlled inputs properly,
    // but here I'm using a simpler approach or local variables?
    // Let's assume we update ONE field or use a separate form state for editing.
    // For simplicity, let's just use the `editingHotspot` object itself if we made it mutable in state, 
    // OR create a separate edit form state. 
    // Let's use `editingHotspot` + `updateMutation`.

    // Actually, distinct states for edit form is cleaner.
    // For now, I'll pass the current `newZonePartnerInfo` etc if I reused them, but renaming them to generic `formState` would be better.
    // I will stick to reusing the "Add Zone" form state for "Edit" or just create a small Edit Dialog for Partner Info specifically as requested.

    updateMutation.mutate({
      id: editingHotspot.id,
      updates: {
        partnerInfo: newZonePartnerInfo,
        description: newZoneDescription,
        accessibility: newZoneAccessibility
      }
    });
  };

  const openEditDialog = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setNewZoneName(hotspot.name); // Just for display
    setNewZoneDescription(hotspot.description || "");
    setNewZoneAccessibility(hotspot.accessibility || "Truck");
    setNewZonePartnerInfo(hotspot.partnerInfo || "");
    setIsEditOpen(true);
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
            <Button onClick={() => { resetForm(); setIsAddZoneOpen(true); }} className="gap-2">
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
                        <div className="text-xs grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-muted rounded px-2 py-1">
                            Est. Volume: <span className="font-medium text-foreground">{hotspot.estimatedVolume}kg</span>
                          </div>
                          <div className="bg-muted rounded px-2 py-1 truncate">
                            Access: <span className="font-medium text-foreground">{hotspot.accessibility || "N/A"}</span>
                          </div>
                        </div>
                        <div className="text-xs flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-6 text-xs flex-1">
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
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); openEditDialog(hotspot); }}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map View */}
            <Card className="lg:col-span-2 shadow-md flex flex-col overflow-hidden relative">
              <HotspotMap
                hotspots={filteredHotspots}
                className="w-full h-full rounded-none"
                center={selectedHotspot ? [Number(selectedHotspot.latitude), Number(selectedHotspot.longitude)] : undefined}
                zoom={selectedHotspot ? 14 : undefined}
              />
              {selectedHotspot && selectedHotspot.partnerInfo && (
                <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-lg max-w-lg">
                  <h4 className="font-semibold text-sm mb-1 text-primary">Partner / Recycler Instructions</h4>
                  <p className="text-sm text-muted-foreground">{selectedHotspot.partnerInfo}</p>
                </div>
              )}
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
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
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
                <Label>Accessibility (Logistics) *</Label>
                <Select value={newZoneAccessibility} onValueChange={setNewZoneAccessibility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accessibility type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck Access</SelectItem>
                    <SelectItem value="Motorbike">Motorbike Only</SelectItem>
                    <SelectItem value="Foot">Foot / Cart Only</SelectItem>
                    <SelectItem value="Boat">Boat Access</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="partnerInfo">Partner Info / Recycler Instructions</Label>
                <Textarea
                  id="partnerInfo"
                  placeholder="Tools needed, safety warnings, pickup instructions..."
                  value={newZonePartnerInfo}
                  onChange={(e) => setNewZonePartnerInfo(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>County *</Label>
                <Select value={selectedCounty} onValueChange={(val) => {
                  setSelectedCounty(val);
                  setSelectedSubLocation("");
                  setAutoLat("");
                  setAutoLng("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(KENYA_COASTAL_LOCATIONS).map(county => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCounty && (
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select value={selectedSubLocation} onValueChange={(val) => {
                    setSelectedSubLocation(val);
                    const location = subLocations.find(loc => loc.name === val);
                    if (location) {
                      setAutoLat(location.lat);
                      setAutoLng(location.lng);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subLocations.map(loc => (
                        <SelectItem key={loc.name} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {autoLat && autoLng && (
                <div className="bg-muted/50 rounded-md p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">Auto-detected Coordinates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Latitude: <span className="font-mono text-foreground">{autoLat}°</span></div>
                    <div>Longitude: <span className="font-mono text-foreground">{autoLng}°</span></div>
                  </div>
                </div>
              )}
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

        {/* Edit Zone Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Zone Details</DialogTitle>
              <DialogDescription>
                Update information for {editingHotspot?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Accessibility</Label>
                <Select value={newZoneAccessibility} onValueChange={setNewZoneAccessibility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accessibility type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck Access</SelectItem>
                    <SelectItem value="Motorbike">Motorbike Only</SelectItem>
                    <SelectItem value="Foot">Foot / Cart Only</SelectItem>
                    <SelectItem value="Boat">Boat Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newZoneDescription}
                  onChange={(e) => setNewZoneDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Partner Info / Instructions</Label>
                <Textarea
                  value={newZonePartnerInfo}
                  onChange={(e) => setNewZonePartnerInfo(e.target.value)}
                  rows={3}
                  placeholder="Tools, Pickup instructions etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout >
  );
}
