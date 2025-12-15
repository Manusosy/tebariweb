import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Notification, InsertNotification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function NotificationsPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [form, setForm] = useState({
        type: "announcement",
        title: "",
        message: "",
        targetAudience: "broadcast"
    });

    const { data: notifications, isLoading } = useQuery<Notification[]>({
        queryKey: ["/api/notifications"],
    });

    const createNotification = useMutation({
        mutationFn: async (data: InsertNotification) => {
            const res = await apiRequest("POST", "/api/notifications", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
            toast({ title: "Notification Sent", description: "Your message has been broadcasted." });
            setForm({ type: "announcement", title: "", message: "", targetAudience: "broadcast" });
        },
        onError: (error: Error) => {
            toast({ title: "Failed to send", description: error.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.message) {
            toast({ title: "Missing Fields", description: "Please fill in title and message.", variant: "destructive" });
            return;
        }

        createNotification.mutate({
            type: form.type,
            title: form.title,
            message: form.message,
            userId: form.targetAudience === 'broadcast' ? null : parseInt(form.targetAudience) // Basic logic, needs user list for specific selection
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <DashboardLayout userRole="super_admin">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Notifications & Announcements</h2>
                        <p className="text-muted-foreground">Manage system alerts and communicate with partners.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Create Notification Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Announcement</CardTitle>
                            <CardDescription>Broadcast a message to all users or specific groups.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={form.type}
                                        onValueChange={(val) => setForm({ ...form, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="announcement">Announcement</SelectItem>
                                            <SelectItem value="alert">System Alert</SelectItem>
                                            <SelectItem value="message">Direct Message</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Title / Subject</Label>
                                    <Input
                                        placeholder="e.g. System Maintenance or New Policy"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Message Content</Label>
                                    <Textarea
                                        placeholder="Type your message here..."
                                        className="min-h-[120px]"
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    />
                                </div>

                                <Button type="submit" className="w-full gap-2" disabled={createNotification.isPending}>
                                    <Send className="h-4 w-4" />
                                    {createNotification.isPending ? "Sending..." : "Send Notification"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* History / Recent Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent History</CardTitle>
                            <CardDescription>Log of recent broadcasts and alerts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {isLoading ? (
                                    <div className="text-center py-8 text-muted-foreground">Loading history...</div>
                                ) : notifications?.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No notification history found.</div>
                                ) : (
                                    notifications?.map((n) => (
                                        <div key={n.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="mt-1">{getIcon(n.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-semibold">{n.title}</h4>
                                                    <span className="text-xs text-muted-foreground">
                                                        {n.createdAt && format(new Date(n.createdAt), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                                                <div className="mt-2 flex gap-2">
                                                    <span className="text-[10px] px-2 py-1 bg-secondary rounded-full uppercase tracking-wider font-medium">
                                                        {n.type}
                                                    </span>
                                                    {n.userId === null && (
                                                        <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full font-medium">
                                                            Broadcast
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
