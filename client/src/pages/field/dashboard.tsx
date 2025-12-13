import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function FieldDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Submission Received",
        description: "Data successfully uploaded for verification.",
      });
    }, 1500);
  };

  return (
    <DashboardLayout 
      userRole="field_officer" 
      userName="John Field" 
      userEmail="john@tebari.com"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Collection Entry</h2>
          <p className="text-muted-foreground">Capture plastic data from the field.</p>
        </div>

        <Card className="shadow-lg border-primary/20">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location & Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* GPS Section */}
              <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">GPS Coordinates</p>
                  <p className="text-xs text-muted-foreground">Lat: -3.3502, Lng: 40.0154</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">✓ Precision: 4m</p>
                </div>
                <Button variant="outline" size="sm" type="button">
                  Refresh GPS
                </Button>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Mandatory Photo Evidence</Label>
                <div className="h-40 border-2 border-dashed border-input rounded-lg flex flex-col items-center justify-center hover:bg-muted/50 cursor-pointer transition-colors bg-muted/20">
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Tap to take photo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Plastic Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pet">PET (Bottles)</SelectItem>
                      <SelectItem value="hdpe">HDPE (Jugs)</SelectItem>
                      <SelectItem value="pp">PP (Containers)</SelectItem>
                      <SelectItem value="ldpe">LDPE (Bags)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="0.0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Field Notes</Label>
                <Textarea id="notes" placeholder="Describe the conditions..." />
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? "Uploading..." : "Submit Collection Data"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
