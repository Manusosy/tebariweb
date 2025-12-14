import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Scale,
    MapPin,
    TrendingUp,
    Download,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    FileText,
    Loader2,
    MessageSquare
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { Hotspot, Collection, CollectionItem, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type CollectionWithDetails = Collection & {
    items: CollectionItem[];
    hotspot: Hotspot | null;
};

type UserWithDetails = User & { assignedHotspot: Hotspot | null };

export default function AdminReportsPage() {
    const { user } = useAuth();

    // Fetch real data
    const { data: hotspots, isLoading: loadingHotspots } = useQuery<Hotspot[]>({
        queryKey: ["/api/hotspots"],
    });

    const { data: collections, isLoading: loadingCollections } = useQuery<CollectionWithDetails[]>({
        queryKey: ["/api/collections"],
    });

    const { data: users, isLoading: loadingUsers } = useQuery<UserWithDetails[]>({
        queryKey: ["/api/users"],
    });

    const isLoading = loadingHotspots || loadingCollections || loadingUsers;

    // Calculate metrics
    const allCollections = collections || [];
    const verifiedCollections = allCollections.filter(c => c.status === 'verified');
    const pendingCollections = allCollections.filter(c => c.status === 'pending');
    const rejectedCollections = allCollections.filter(c => c.status === 'rejected');

    const totalWeight = verifiedCollections.reduce((acc, c) => {
        return acc + c.items.reduce((sum, item) => sum + Number(item.weight), 0);
    }, 0);

    const fieldOfficers = (users || []).filter(u => u.role === 'field_officer');
    const activeOfficers = fieldOfficers.filter(u => u.status === 'active').length;
    const suspendedOfficers = fieldOfficers.filter(u => u.status === 'suspended').length;

    const criticalHotspots = (hotspots || []).filter(h => h.status === 'critical').length;

    // Material breakdown
    const materialCounts: Record<string, number> = {};
    verifiedCollections.forEach(c => {
        c.items.forEach(item => {
            const type = item.materialType.toUpperCase();
            materialCounts[type] = (materialCounts[type] || 0) + Number(item.weight);
        });
    });

    const materialData = Object.entries(materialCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6'];

    // Status breakdown for pie chart
    const statusData = [
        { name: 'Verified', value: verifiedCollections.length, color: '#22c55e' },
        { name: 'Pending', value: pendingCollections.length, color: '#eab308' },
        { name: 'Rejected', value: rejectedCollections.length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Recent field notes
    const recentNotes = verifiedCollections
        .filter(c => c.notes && c.notes.trim() !== '')
        .slice(0, 5);

    const getOfficerName = (userId: number) => {
        const officer = users?.find(u => u.id === userId);
        return officer?.name || `Officer #${userId}`;
    };

    return (
        <DashboardLayout
            userRole={(user?.role as any) || "admin"}
            userName={user?.name || "Admin"}
            userEmail={user?.email || ""}
        >
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                        <p className="text-muted-foreground">Comprehensive overview of collection activities and team performance.</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Verified Collection"
                        value={isLoading ? "..." : `${totalWeight.toFixed(1)}kg`}
                        icon={Scale}
                        trend="up"
                        trendValue="Verified only"
                        className="bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                    />
                    <StatCard
                        title="Pending Review"
                        value={isLoading ? "..." : pendingCollections.length}
                        icon={Clock}
                        description="Awaiting verification"
                        className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                    />
                    <StatCard
                        title="Active Field Officers"
                        value={isLoading ? "..." : `${activeOfficers}/${fieldOfficers.length}`}
                        icon={Users}
                        description={suspendedOfficers > 0 ? `${suspendedOfficers} suspended` : "All active"}
                    />
                    <StatCard
                        title="Critical Zones"
                        value={isLoading ? "..." : criticalHotspots}
                        icon={AlertTriangle}
                        description="Require attention"
                        className={criticalHotspots > 0 ? "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800" : ""}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Material Breakdown */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Material Breakdown</CardTitle>
                            <CardDescription>Weight by plastic type (verified)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-[250px] flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : materialData.length === 0 ? (
                                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                    No verified collections yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={materialData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {materialData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submission Status */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Submission Status</CardTitle>
                            <CardDescription>All-time submission breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-[250px] flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : statusData.length === 0 ? (
                                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                    No submissions yet
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Field Notes */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Field Notes
                            </CardTitle>
                            <CardDescription>Recent officer observations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : recentNotes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No field notes</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                                    {recentNotes.map(c => (
                                        <div key={c.id} className="p-3 bg-muted/30 rounded-lg border-l-3 border-primary/30 text-sm">
                                            <p className="italic line-clamp-2">"{c.notes}"</p>
                                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                <span>{getOfficerName(c.userId)}</span>
                                                <span>{c.collectedAt ? format(new Date(c.collectedAt), 'MMM dd') : ''}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Officer Performance Table */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Officer Performance</CardTitle>
                        <CardDescription>Collection activity by field officer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Officer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Assigned Zone</TableHead>
                                        <TableHead className="text-right">Submissions</TableHead>
                                        <TableHead className="text-right">Verified</TableHead>
                                        <TableHead className="text-right">Total Weight</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fieldOfficers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No field officers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        fieldOfficers.map(officer => {
                                            const officerCollections = allCollections.filter(c => c.userId === officer.id);
                                            const officerVerified = officerCollections.filter(c => c.status === 'verified');
                                            const officerWeight = officerVerified.reduce((acc, c) =>
                                                acc + c.items.reduce((sum, i) => sum + Number(i.weight), 0), 0);

                                            return (
                                                <TableRow key={officer.id}>
                                                    <TableCell className="font-medium">{officer.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={officer.status === 'active' ? 'default' : 'destructive'}>
                                                            {officer.status || 'active'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {officer.assignedHotspot?.name || (
                                                            <span className="text-muted-foreground italic">Unassigned</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">{officerCollections.length}</TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="text-emerald-600">{officerVerified.length}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">{officerWeight.toFixed(1)}kg</TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
