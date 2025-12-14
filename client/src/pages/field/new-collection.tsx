import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, Plus, Trash2, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Hotspot } from "@shared/schema";

type PlasticEntry = {
  id: string;
  type: string;
  weight: string;
};

export default function NewCollectionPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State for form
  const [loading, setLoading] = useState(false);
  const [isNewHotspot, setIsNewHotspot] = useState(false);
  const [plastics, setPlastics] = useState<PlasticEntry[]>([{ id: '1', type: '', weight: '' }]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>("");
  const [newHotspotName, setNewHotspotName] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string>("");

  // Camera State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch Hotspots
  const { data: hotspots } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  // Auto-switch to new hotspot mode if no hotspots exist
  useEffect(() => {
    if (hotspots && hotspots.length === 0) {
      setIsNewHotspot(true);
      // Optional: One-time toast could be annoying if it happens on every mount, 
      // but strictly speaking, it's helpful context.
      // toast({ title: "No Hotspots Found", description: "Switched to new hotspot reporting mode.", duration: 3000 });
    }
  }, [hotspots]);

  // Get User Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Geo Error", error);
          setGeoError("Could not fetch location. Please enable GPS.");
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } else {
      setGeoError("Geolocation not supported");
    }
  }, []);

  // Post Collection Mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/collections", data);
    },
    onSuccess: () => {
      toast({
        title: "Collection Submitted",
        description: `Successfully recorded ${totalWeight.toFixed(1)}kg of plastic data.`,
      });
      setPlastics([{ id: '1', type: '', weight: '' }]);
      setSelectedHotspotId("");
      setFile(null);
      setPreviewUrl(null);
      setLoading(false);
      setNewHotspotName(""); // Reset name
      setIsNewHotspot(false); // Reset toggle
    },
    onError: (err) => {
      setLoading(false);
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } else {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);
      }
    } catch (err) {
      console.error("Camera Error", err);
      toast({ title: "Camera Error", description: "Could not access camera. Ensure permissions are granted.", variant: "destructive" });
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            setFile(capturedFile);
            setPreviewUrl(URL.createObjectURL(capturedFile));
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const triggerGallery = () => {
    document.getElementById('gallery-input')?.click();
  };

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
    if (!location) {
      toast({ title: "Location Missing", description: "Please enable GPS to submit.", variant: "destructive" });
      return;
    }

    if (!isNewHotspot && !selectedHotspotId) {
      toast({ title: "Hotspot Required", description: "Please select a hotspot or toggle 'New Hotspot'.", variant: "destructive" });
      return;
    }

    if (isNewHotspot && !newHotspotName.trim()) {
      toast({ title: "Name Required", description: "Please provide a name for the new hotspot.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const items = plastics.filter(p => p.type && p.weight).map(p => ({
      materialType: p.type,
      weight: p.weight,
    }));

    // Fix: Ensure hotspotId is null if new hotspot or invalid selection
    const validHotspotId = (!isNewHotspot && selectedHotspotId) ? Number(selectedHotspotId) : null;

    const formData = new FormData();
    if (validHotspotId) {
      formData.append("hotspotId", validHotspotId.toString());
    }

    formData.append("isNewHotspot", String(isNewHotspot));
    formData.append("newHotspotName", newHotspotName);
    formData.append("items", JSON.stringify(items));
    formData.append("status", "pending");
    formData.append("collectedAt", new Date().toISOString());
    formData.append("notes", (document.getElementById('notes') as HTMLTextAreaElement)?.value || "");
    formData.append("gpsLatitude", location.lat.toString());
    formData.append("gpsLongitude", location.lng.toString());

    if (file) {
      formData.append("image", file);
    }

    mutation.mutate(formData);
  };

  return (
    <DashboardLayout
      userRole="field_officer"
      userName={user?.name || "Field Officer"}
      userEmail={user?.email || ""}
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
                  <div className={`text-xs font-mono px-2 py-1 rounded ${location ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {location ? `GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : (geoError || "Locating...")}
                  </div>
                </div>
              </div>

              {!isNewHotspot ? (
                <div className="space-y-2">
                  <Label>Select Nearby Hotspot</Label>
                  <Select value={selectedHotspotId} onValueChange={setSelectedHotspotId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select active hotspot..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hotspots?.map(h => (
                        <SelectItem key={h.id} value={String(h.id)}>{h.name} ({h.estimatedVolume || 0}kg est)</SelectItem>
                      ))}
                      {(!hotspots || hotspots.length === 0) && <SelectItem value="none" disabled>No hotspots found</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-muted rounded text-sm text-muted-foreground">
                    New hotspot reporting is currently pending admin approval. You can name it below.
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-spot-name">New Location Name</Label>
                    <Input
                      id="new-spot-name"
                      placeholder="e.g., Shelly Beach South Point"
                      value={newHotspotName}
                      onChange={(e) => setNewHotspotName(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      GPS Coordinates ({location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '...'}) will be automatically attached.
                    </p>
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
              <div className="space-y-4">
                <Label>Mandatory Site Photo</Label>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="gallery-input"
                  onChange={handleFileChange}
                />

                <canvas ref={canvasRef} className="hidden" />

                {!isCameraActive && !previewUrl ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={startCamera}
                      className="h-32 border-2 border-dashed border-input rounded-lg flex flex-col items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer transition-colors bg-muted/10 gap-2"
                    >
                      <Camera className="h-8 w-8 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">Open Camera</span>
                    </div>

                    <div
                      onClick={triggerGallery}
                      className="h-32 border-2 border-dashed border-input rounded-lg flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors bg-muted/10 gap-2"
                    >
                      <Plus className="h-8 w-8 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">From Gallery</span>
                    </div>
                  </div>
                ) : isCameraActive ? (
                  <div className="relative rounded-lg overflow-hidden border bg-black aspect-video flex flex-col items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 items-center z-10 pointer-events-auto">
                      <Button type="button" variant="destructive" size="sm" onClick={stopCamera}>Cancel</Button>
                      <button
                        type="button"
                        className="bg-white hover:bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center border-4 border-emerald-500 shadow-lg transition-transform active:scale-95"
                        onClick={capturePhoto}
                      >
                        <div className="w-12 h-12 bg-white rounded-full border border-gray-300"></div>
                      </button>
                      <div className="w-16"></div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img src={previewUrl!} alt="Evidence" className="w-full h-64 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                      }}>Remove</Button>
                      <Button type="button" variant="default" size="sm" onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        startCamera();
                      }}>Retake Photo</Button>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Photo will be geo-tagged with your current location: {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Waiting for GPS...'}
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
