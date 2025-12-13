import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { HotspotMap } from "@/components/map/hotspot-map";
import { MOCK_HOTSPOTS, Hotspot } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, AlertTriangle, Filter } from "lucide-react";

export default function HotspotsPage() {
  return (
    <DashboardLayout userRole="admin" userName="Sarah Ops" userEmail="sarah@tebari.com">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Hotspot Management</h2>
            <p className="text-muted-foreground">Monitor and manage identified plastic waste zones.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter View
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* List Sidebar */}
          <Card className="lg:col-span-1 flex flex-col h-full shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Active Zones ({MOCK_HOTSPOTS.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="divide-y">
                {MOCK_HOTSPOTS.map((hotspot) => (
                  <div key={hotspot.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{hotspot.name}</h3>
                      <Badge variant={
                        hotspot.severity === 'critical' ? 'destructive' : 
                        hotspot.severity === 'high' ? 'secondary' : 'outline'
                      } className={
                        hotspot.severity === 'critical' ? '' : 
                        hotspot.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' : ''
                      }>
                        {hotspot.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Area {hotspot.id.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> {hotspot.trend}
                      </span>
                    </div>
                    <div className="text-xs grid grid-cols-2 gap-2">
                      <div className="bg-muted rounded px-2 py-1">
                        Est. Volume: <span className="font-medium text-foreground">{hotspot.estimatedVolume}kg</span>
                      </div>
                      <div className="bg-muted rounded px-2 py-1">
                        Status: <span className="font-medium text-foreground">{hotspot.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Map View */}
          <Card className="lg:col-span-2 shadow-md flex flex-col overflow-hidden">
            <HotspotMap hotspots={MOCK_HOTSPOTS} className="w-full h-full rounded-none" />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
