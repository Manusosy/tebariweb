import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MapPin, Loader2, UserPlus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Hotspot } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type UserWithDetails = User & { assignedHotspot: Hotspot | null };

export default function OfficersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOfficer, setSelectedOfficer] = useState<UserWithDetails | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>("");

  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery<UserWithDetails[]>({
    queryKey: ["/api/users"],
  });

  const { data: hotspots } = useQuery<Hotspot[]>({
    queryKey: ["/api/hotspots"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: Partial<User> }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Officer updated successfully" });
      setIsAssignOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update officer", variant: "destructive" });
    }
  });

  const fieldOfficers = (users || []).filter(u => u.role === 'field_officer');

  const handleAssignArea = () => {
    if (!selectedOfficer || !selectedHotspotId) return;
    updateMutation.mutate({
      id: selectedOfficer.id,
      updates: { assignedHotspotId: parseInt(selectedHotspotId) }
    });
  };

  const handleToggleStatus = (officer: UserWithDetails) => {
    const newStatus = officer.status === 'suspended' ? 'active' : 'suspended';
    updateMutation.mutate({
      id: officer.id,
      updates: { status: newStatus }
    });
  };

  return (
    <DashboardLayout
      userRole={(user?.role as any) || "admin"}
      userName={user?.name || "Admin"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Field Officers</h2>
            <p className="text-muted-foreground">Manage your team, assignments, and account status.</p>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Officer
          </Button>
        </div>

        {usersLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : usersError ? (
          <div className="flex h-64 items-center justify-center flex-col gap-4 text-center">
            <div className="text-destructive font-medium">Failed to load officers</div>
            <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/users"] })}>Retry</Button>
          </div>
        ) : (
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Officer</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Area</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldOfficers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No officers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  fieldOfficers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{officer.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{officer.name}</div>
                            <div className="text-xs text-muted-foreground">{officer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{officer.role.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={officer.status === 'active' ? 'default' : 'destructive'}>
                          {officer.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {officer.assignedHotspot ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{officer.assignedHotspot.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedOfficer(officer);
                              setSelectedHotspotId(officer.assignedHotspotId?.toString() || "");
                              setIsAssignOpen(true);
                            }}>
                              Assign Area
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(officer)} className={officer.status === 'active' ? 'text-destructive' : 'text-green-600'}>
                              {officer.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Area to {selectedOfficer?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">Select Hotspot</label>
              <Select value={selectedHotspotId} onValueChange={setSelectedHotspotId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hotspot..." />
                </SelectTrigger>
                <SelectContent>
                  {(hotspots || []).map(h => (
                    <SelectItem key={h.id} value={h.id.toString()}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignArea} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
