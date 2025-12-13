import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { LayoutGrid, List as ListIcon, Search, MapPin, Scale } from "lucide-react";
import { MOCK_SUBMISSIONS, MOCK_USERS, CollectionSubmission } from "@/lib/mock-data";
import { HotspotMap } from "@/components/map/hotspot-map";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function SubmissionsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<CollectionSubmission | null>(null);

  const filteredSubmissions = MOCK_SUBMISSIONS.filter(s => 
    s.id.includes(search) || 
    (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()))
  );

  const getOfficer = (id: string) => MOCK_USERS.find(u => u.id === id);

  return (
    <DashboardLayout userRole="admin" userName="Sarah Ops" userEmail="sarah@tebari.com">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Submissions & Media</h2>
            <p className="text-muted-foreground">Verify field data and review photographic evidence.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search submissions..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center border rounded-md bg-background">
              <Button 
                variant={view === "grid" ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => setView("grid")}
                className="rounded-r-none h-9 w-9"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === "list" ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => setView("list")}
                className="rounded-l-none h-9 w-9"
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((sub) => {
              const officer = getOfficer(sub.officerId);
              return (
                <Card 
                  key={sub.id} 
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <div className="relative aspect-video bg-muted">
                    <img 
                      src={sub.imageUrl} 
                      alt="Submission evidence" 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={sub.status === 'approved' ? 'default' : 'secondary'} 
                        className={sub.status === 'approved' ? 'bg-emerald-600' : 'bg-yellow-500 shadow-sm'}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 text-white">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <Scale className="h-4 w-4" /> {sub.totalWeight}kg
                        </span>
                        <span className="text-xs opacity-90">
                          {format(new Date(sub.timestamp), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={officer?.avatar} />
                        <AvatarFallback>{officer?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium leading-none">{officer?.name}</p>
                        <p className="text-xs text-muted-foreground">Field Officer</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Lat: {sub.location.lat.toFixed(4)}, Lng: {sub.location.lng.toFixed(4)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((sub) => {
                  const officer = getOfficer(sub.officerId);
                  return (
                    <TableRow key={sub.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSubmission(sub)}>
                      <TableCell>
                        <img 
                          src={sub.imageUrl} 
                          alt="Thumbnail" 
                          className="h-10 w-16 object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{officer?.name}</TableCell>
                      <TableCell>{format(new Date(sub.timestamp), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {sub.location.lat.toFixed(3)}, {sub.location.lng.toFixed(3)}
                      </TableCell>
                      <TableCell>{sub.totalWeight}kg</TableCell>
                      <TableCell>
                         <Badge variant={sub.status === 'approved' ? 'default' : 'secondary'} 
                          className={sub.status === 'approved' ? 'bg-emerald-600' : 'bg-yellow-500'}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Detailed Modal */}
        <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Submission Details <Badge variant="outline">{selectedSubmission?.id}</Badge>
              </DialogTitle>
              <DialogDescription>
                Submitted by {getOfficer(selectedSubmission?.officerId || '')?.name} on {selectedSubmission && format(new Date(selectedSubmission.timestamp), 'PPP p')}
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden border bg-muted relative group">
                    <img 
                      src={selectedSubmission.imageUrl} 
                      alt="Full Evidence" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Plastic Composition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(selectedSubmission.plasticTypes).map(([type, weight]) => (
                          <div key={type} className="flex items-center justify-between text-sm">
                            <span className="uppercase font-medium text-muted-foreground">{type}</span>
                            <span className="font-bold">{weight} kg</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex items-center justify-between font-bold">
                          <span>Total</span>
                          <span className="text-primary">{selectedSubmission.totalWeight} kg</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Officer</label>
                      <div className="flex items-center gap-2">
                         <Avatar className="h-8 w-8">
                          <AvatarImage src={getOfficer(selectedSubmission.officerId)?.avatar} />
                          <AvatarFallback>OF</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{getOfficer(selectedSubmission.officerId)?.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                      <div>
                        <Badge variant={selectedSubmission.status === 'approved' ? 'default' : 'secondary'} 
                          className={selectedSubmission.status === 'approved' ? 'bg-emerald-600' : 'bg-yellow-500'}>
                          {selectedSubmission.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Exact Location
                    </label>
                    <div className="h-[200px] w-full rounded-md overflow-hidden border">
                       {/* Reusing Map Component but forcing a specific view - in real app might want a dedicated MiniMap */}
                       <HotspotMap 
                         hotspots={[]} // No other hotspots, just showing location
                         center={[selectedSubmission.location.lat, selectedSubmission.location.lng]} 
                         zoom={15}
                         className="h-full w-full"
                       />
                    </div>
                    <p className="text-xs text-muted-foreground text-right font-mono">
                      {selectedSubmission.location.lat}, {selectedSubmission.location.lng}
                    </p>
                  </div>

                  {selectedSubmission.notes && (
                    <div className="bg-muted/50 p-4 rounded-md text-sm italic">
                      "{selectedSubmission.notes}"
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">Approve Data</Button>
                    <Button variant="destructive" className="flex-1">Reject</Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
