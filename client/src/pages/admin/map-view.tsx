import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { HotspotMap } from "@/components/map/hotspot-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, MapPin, Eye, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Hotspot, Collection, CollectionItem } from "@shared/schema";

type CollectionWithDetails = Collection & {
    items: CollectionItem[];
    hotspot: Hotspot | null;
};

export default function MapViewPage() {
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

    // Fetch data
    const { data: hotspots, isLoading: loadingHotspots, isError } = useQuery<Hotspot[]>({
        queryKey: ["/api/hotspots"],
    });

    const { data: collections } = useQuery<CollectionWithDetails[]>({
        queryKey: ["/api/collections"],
    });

    const isLoading = loadingHotspots;
    const realHotspots = hotspots || [];
    const realCollections = collections || [];

    // Filter hotspots by status
    const filteredHotspots = realHotspots.filter(h => {
        if (statusFilter === "all") return true;
        return h.status === statusFilter;
    });

    // Add pending submissions as markers
    const submissionMarkers = realCollections
        .filter(s => s.gpsLatitude && s.gpsLongitude && s.status === 'pending')
        .map(s => ({
            id: 10000 + s.id,
            name: s.newHotspotName || s.hotspot?.name || `Submission #${s.id}`,
            description: `Pending submission from ${new Date(s.collectedAt!).toLocaleDateString()}`,
            latitude: s.gpsLatitude!,
            longitude: s.gpsLongitude!,
            status: 'pending',
            estimatedVolume: "0",
            createdAt: new Date(s.collectedAt!)
        } as unknown as Hotspot));

    const allMapData = statusFilter === "all"
        ? [...filteredHotspots, ...submissionMarkers]
        : filteredHotspots;

    // Center on selected hotspot or default
    const mapCenter: [number, number] = selectedHotspot
        ? [Number(selectedHotspot.latitude), Number(selectedHotspot.longitude)]
        : [-3.350, 40.015];
    const mapZoom = selectedHotspot ? 14 : 9;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'critical':
                return <Badge variant="destructive">{status}</Badge>;
            case 'cleared':
                return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">{status}</Badge>;
            case 'active':
                return <Badge variant="outline">{status}</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">{status}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout userRole={(user?.role as any) || "admin"} userName={user?.name || "Admin"} userEmail={user?.email || ""}>
            <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Map View</h2>
                        <p className="text-muted-foreground">Interactive map of all zones and submissions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Tabs value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setSelectedHotspot(null); }}>
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="critical">Critical</TabsTrigger>
                                <TabsTrigger value="cleared">Cleared</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    </div>
                ) : isError ? (
                    <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                        <div className="text-destructive font-medium text-lg">Failed to load map data</div>
                        <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
                    </div>
                ) : (
                    <div className="flex-1 grid lg:grid-cols-4 gap-4">
                        {/* Sidebar with hotspot list */}
                        <Card className="lg:col-span-1 shadow-md flex flex-col max-h-[calc(100vh-200px)] overflow-hidden">
                            <CardHeader className="py-3 px-4 border-b">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Zones ({filteredHotspots.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0">
                                {filteredHotspots.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No zones match the filter</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredHotspots.map((hotspot) => (
                                            <div
                                                key={hotspot.id}
                                                className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${selectedHotspot?.id === hotspot.id ? 'bg-muted/50 border-l-2 border-l-primary' : ''}`}
                                                onClick={() => setSelectedHotspot(hotspot)}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-medium text-sm truncate">{hotspot.name}</h3>
                                                    {getStatusBadge(hotspot.status)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Vol: {hotspot.estimatedVolume}kg
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Map */}
                        <Card className="lg:col-span-3 shadow-md flex flex-col overflow-hidden">
                            <HotspotMap
                                hotspots={allMapData}
                                className="w-full h-full rounded-none min-h-[400px]"
                                center={mapCenter}
                                zoom={mapZoom}
                            />
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
