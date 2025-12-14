import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, Plus, Trash2, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { MOCK_HOTSPOTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

type PlasticEntry = {
  id: string;
  type: string;
  weight: string;
};

export default function NewCollectionPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isNewHotspot, setIsNewHotspot] = useState(false);
  const [plastics, setPlastics] = useState<PlasticEntry[]>([{ id: '1', type: '', weight: '' }]);

  const addPlasticRow = () => {
    setPlastics([...plastics, { id: Math.random().toString(), type: '', weight: '' }]);
  };

  const removePlasticRow = (id: string) => {
    if (plastics.length > 1) {
      setPlastics(plastics.filter(p => p.id !== id));
    }
  };

  const updatePlastic = (id: string, field: 'type' | 'weight', value: string) => {
    setPlastics(plastics.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const totalWeight = plastics.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Collection Submitted",
        description: `Successfully recorded ${totalWeight.toFixed(1)}kg of plastic data.`,
      });
      // Reset form
      setPlastics([{ id: '1', type: '', weight: '' }]);
    }, 1500);
  };

  return (
    <DashboardLayout 
      userRole="field_officer" 
      userName="John Field" 
      userEmail="john@tebari.com"
    >
      <div className="max-w-2xl mx-auto space-y-6 pb-20">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Collection Entry</h2>
          <p className="text-muted-foreground">Capture plastic data from the field.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Location Section */}
          <Card className="shadow-md border-primary/20 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                Location Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                <div className="space-y-1">
                  <Label htmlFor="location-mode" className="text-xs uppercase text-muted-foreground">Collection Site</Label>
                  <div className="flex items-center gap-2">
                    <Switch id="location-mode" checked={isNewHotspot} onCheckedChange={setIsNewHotspot} />
                    <Label htmlFor="location-mode" className="font-medium">
                      {isNewHotspot ? "Reporting New Hotspot" : "Existing Hotspot"}
                    </Label>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded">
                    GPS: -3.350, 40.015
                  </div>
                </div>
              </div>

              {!isNewHotspot ? (
                <div className="space-y-2">
                  <Label>Select Nearby Hotspot</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select active hotspot..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_HOTSPOTS.map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name} ({h.estimatedVolume}kg est)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-spot-name">New Location Name</Label>
                    <Input id="new-spot-name" placeholder="e.g., Shelly Beach South Point" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Severity Est.</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label>Status</Label>
                      <Input value="New" disabled className="bg-muted" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence Section */}
          <Card className="shadow-md">
            <CardHeader className="py-4 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="h-4 w-4" />
                Photo Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>Mandatory Site Photo</Label>
                <div className="h-32 border-2 border-dashed border-input rounded-lg flex flex-col items-center justify-center hover:bg-muted/50 cursor-pointer transition-colors bg-muted/10">
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Tap to capture / upload</span>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" /> Photo metadata (EXIF) will be used to verify location & time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plastic Data Section */}
          <Card className="shadow-md">
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-base">Collected Materials</CardTitle>
              <Badge variant="secondary" className="text-base font-mono">
                Total: {totalWeight.toFixed(1)} kg
              </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {plastics.map((entry, index) => (
                <div key={entry.id} className="grid grid-cols-12 gap-3 items-end animate-in fade-in slide-in-from-left-2">
                  <div className="col-span-6 space-y-1">
                    <Label className={index === 0 ? "" : "sr-only"}>Type</Label>
                    <Select value={entry.type} onValueChange={(val) => updatePlastic(entry.id, 'type', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pet">PET (Bottles)</SelectItem>
                        <SelectItem value="hdpe">HDPE (Jugs/Caps)</SelectItem>
                        <SelectItem value="pp">PP (Containers)</SelectItem>
                        <SelectItem value="ldpe">LDPE (Bags/Film)</SelectItem>
                        <SelectItem value="ps">PS (Styrofoam)</SelectItem>
                        <SelectItem value="pvc">PVC (Pipes)</SelectItem>
                        <SelectItem value="other">Other / Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4 space-y-1">
                    <Label className={index === 0 ? "" : "sr-only"}>Weight (kg)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.0" 
                      value={entry.weight}
                      onChange={(e) => updatePlastic(entry.id, 'weight', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                     <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removePlasticRow(entry.id)}
                      disabled={plastics.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" size="sm" onClick={addPlasticRow} className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" /> Add Another Plastic Type
              </Button>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="notes">Field Notes</Label>
                <Textarea id="notes" placeholder="Describe the conditions, weather, access issues..." />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
            {loading ? "Uploading Securely..." : "Submit Collection Data"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
