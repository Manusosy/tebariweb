import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut, Phone, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function SuspendedAccountPage() {
    const { user, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();

    const handleLogout = async () => {
        await logoutMutation.mutateAsync();
        setLocation("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4">
            <Card className="max-w-md w-full shadow-xl border-destructive/20">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl text-destructive">Account Suspended</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-muted-foreground">
                        Sorry, your account has been suspended. You are unable to access the platform until your account is reactivated.
                    </p>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-medium">Contact Support</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>support@tebari.com</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>+254 700 000 000</span>
                        </div>
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                        Logged in as: <span className="font-medium">{user?.email || user?.username}</span>
                    </div>

                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full gap-2"
                        disabled={logoutMutation.isPending}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
