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
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { LayoutGrid, List as ListIcon, Search, MapPin, Scale, Loader2, Filter, Image as ImageIcon } from "lucide-react";
import { HotspotMap } from "@/components/map/hotspot-map";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Collection, CollectionItem, Hotspot, User } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CollectionWithDetails = Collection & {
  items: CollectionItem[];
  hotspot: Hotspot | null;
};

export default function SubmissionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<CollectionWithDetails | null>(null);

  // Fetch Data
  const { data: submissions, isLoading } = useQuery<CollectionWithDetails[]>({
    queryKey: ["/api/collections"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getOfficerName = (id: number) => {
    const u = users?.find(user => user.id === id);
    return u ? u.name : `Officer #${id}`;
  };

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest("PATCH", `/api/collections/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      toast({ title: "Status Updated", description: "Submission status changed successfully." });
      setSelectedSubmission(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Filtering
  const filteredSubmissions = (submissions || []).filter(s => {
    const matchesSearch =
      s.notes?.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toString().includes(search) ||
      s.hotspot?.name.toLowerCase().includes(search.toLowerCase()) ||
      s.newHotspotName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate total weight for a submission
  const getTotalWeight = (sub: CollectionWithDetails) => sub.items.reduce((acc, i) => acc + Number(i.weight), 0);

  return (
    <DashboardLayout userRole="admin" userName="Admin" userEmail="admin@tebari.com">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Submissions & Validation</h2>
            <p className="text-muted-foreground">Review and verify field data entries.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center border rounded-md bg-background shrink-0">
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

        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No submissions found matching filters.</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubmissions.map((sub) => {
              const weight = getTotalWeight(sub);
              return (
                <Card
                  key={sub.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <div className="relative aspect-video bg-muted">
                    {sub.imageUrl ? (
                      <img
                        src={sub.imageUrl}
                        alt="Evidence"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={sub.status === 'verified' ? 'default' : sub.status === 'rejected' ? 'destructive' : 'secondary'}
                        className={sub.status === 'verified' ? 'bg-emerald-600' : sub.status === 'pending' ? 'bg-amber-500 shadow-sm' : ''}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 text-white">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <Scale className="h-4 w-4" /> {weight.toFixed(1)}kg
                        </span>
                        <span className="text-xs opacity-90">
                          {sub.collectedAt ? format(new Date(sub.collectedAt), 'MMM dd') : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">{getOfficerName(sub.userId).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm truncate">
                        <p className="font-medium leading-none truncate">{getOfficerName(sub.userId)}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{sub.hotspot?.name || sub.newHotspotName || "Unknown Location"}</span>
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
                  const weight = getTotalWeight(sub);
                  return (
                    <TableRow key={sub.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSubmission(sub)}>
                      <TableCell>
                        {sub.imageUrl ? (
                          <img
                            src={sub.imageUrl}
                            alt="Thumbnail"
                            className="h-10 w-16 object-cover rounded-md bg-muted"
                          />
                        ) : (
                          <div className="h-10 w-16 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 opacity-50" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{getOfficerName(sub.userId)}</TableCell>
                      <TableCell>{sub.collectedAt ? format(new Date(sub.collectedAt), 'MMM dd, HH:mm') : '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate">
                        {sub.hotspot?.name || sub.newHotspotName}
                      </TableCell>
                      <TableCell>{weight.toFixed(1)}kg</TableCell>
                      <TableCell>
                        <Badge variant={sub.status === 'verified' ? 'default' : sub.status === 'rejected' ? 'destructive' : 'secondary'}
                          className={sub.status === 'verified' ? 'bg-emerald-600' : sub.status === 'pending' ? 'bg-amber-500' : ''}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Review</Button>
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
                Submission Validation <Badge variant="outline">#{selectedSubmission?.id}</Badge>
              </DialogTitle>
              <DialogDescription>
                Review details submitted by {selectedSubmission ? getOfficerName(selectedSubmission.userId) : 'Officer'}
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden border bg-muted relative group">
                    {selectedSubmission.imageUrl ? (
                      <img
                        src={selectedSubmission.imageUrl}
                        alt="Full Evidence"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <Card>
                    <CardHeader className="pb-2 bg-muted/30">
                      <CardTitle className="text-base">Collected Materials</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {selectedSubmission.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="uppercase font-medium text-muted-foreground flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary/50" />
                              {item.materialType}
                            </span>
                            <span className="font-bold">{item.weight} kg</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex items-center justify-between font-bold mt-2">
                          <span>Total</span>
                          <span className="text-primary">{getTotalWeight(selectedSubmission).toFixed(1)} kg</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                      <div>
                        <Badge variant={selectedSubmission.status === 'verified' ? 'default' : selectedSubmission.status === 'rejected' ? 'destructive' : 'secondary'}
                          className={`text-sm px-3 py-1 ${selectedSubmission.status === 'verified' ? 'bg-emerald-600' : selectedSubmission.status === 'pending' ? 'bg-amber-500' : ''}`}>
                          {selectedSubmission.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Date</label>
                      <div className="text-sm font-medium">
                        {selectedSubmission.collectedAt ? format(new Date(selectedSubmission.collectedAt), 'PP p') : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Location
                    </label>
                    <div className="h-[200px] w-full rounded-md overflow-hidden border relative">
                      {selectedSubmission.gpsLatitude ? (
                        <HotspotMap
                          hotspots={[{
                            id: 999,
                            name: "Collection Point",
                            latitude: selectedSubmission.gpsLatitude,
                            longitude: selectedSubmission.gpsLongitude,
                            status: selectedSubmission.status === 'pending' ? 'pending' : selectedSubmission.status === 'verified' ? 'verified' : 'active',
                            estimatedVolume: "0"
                          } as any]}
                          center={[Number(selectedSubmission.gpsLatitude), Number(selectedSubmission.gpsLongitude)]}
                          zoom={15}
                          className="h-full w-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                          No GPS Data Available
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-right font-mono truncate">
                      {selectedSubmission.hotspot?.name || selectedSubmission.newHotspotName || "Unnamed Location"}
                    </p>
                  </div>

                  {selectedSubmission.notes && (
                    <div className="bg-muted/50 p-4 rounded-md text-sm italic border-l-2 border-muted">
                      "{selectedSubmission.notes}"
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      disabled={updateStatusMutation.isPending || selectedSubmission.status === 'verified'}
                      onClick={() => updateStatusMutation.mutate({ id: selectedSubmission.id, status: 'verified' })}
                    >
                      {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={updateStatusMutation.isPending || selectedSubmission.status === 'rejected'}
                      onClick={() => updateStatusMutation.mutate({ id: selectedSubmission.id, status: 'rejected' })}
                    >
                      Reject Data
                    </Button>
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
