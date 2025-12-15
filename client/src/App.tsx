import { Switch, Route, Redirect } from "wouter"; // Check wouter imports, standard is Switch, Route, Redirect? 
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import SettingsPage from "@/pages/settings";

import { Loader2 } from "lucide-react";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import SubmissionsPage from "@/pages/admin/submissions";
import HotspotsPage from "@/pages/admin/hotspots";
import OfficersPage from "@/pages/admin/officers";
import AdminReportsPage from "@/pages/admin/reports";
import MapViewPage from "@/pages/admin/map-view";

// Super Admin Pages
import SuperAdminDashboard from "@/pages/super-admin/dashboard";
import NotificationsPage from "@/pages/super-admin/notifications";

// Field Officer Pages
import FieldOverview from "@/pages/field/overview";
import NewCollectionPage from "@/pages/field/new-collection";
import MySubmissionsPage from "@/pages/field/my-submissions";
import FieldMapView from "@/pages/field/map-view";

// Partner Pages
import PartnerOverview from "@/pages/partner/overview";
import PartnerCollections from "@/pages/partner/collections";
import PartnerAnalytics from "@/pages/partner/analytics";
import SuspendedAccountPage from "@/pages/suspended";

function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element; // Component type 
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Route path={path} component={() => (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    )} />;
  }

  if (!user) {
    return <Route path={path} component={() => <Redirect to="/login" />} />;
  }

  // Check if user account is suspended
  if (user.status === 'suspended') {
    return <Route path={path} component={SuspendedAccountPage} />;
  }

  // Optional: Role checks can be here
  // if (requiredRole && user.role !== requiredRole) ...

  return <Route path={path} component={Component} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />

      <ProtectedRoute path="/settings" component={SettingsPage} />

      {/* Super Admin Routes */}
      <ProtectedRoute path="/executive" component={SuperAdminDashboard} />
      <ProtectedRoute path="/super-admin/notifications" component={NotificationsPage} />

      {/* Admin Routes */}
      <ProtectedRoute path="/dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/map" component={MapViewPage} />
      <ProtectedRoute path="/submissions" component={SubmissionsPage} />
      <ProtectedRoute path="/hotspots" component={HotspotsPage} />
      <ProtectedRoute path="/officers" component={OfficersPage} />

      {/* Field Officer Routes */}
      <ProtectedRoute path="/field/dashboard" component={FieldOverview} />
      <ProtectedRoute path="/collection/new" component={NewCollectionPage} />
      <ProtectedRoute path="/field/submissions" component={MySubmissionsPage} />
      <ProtectedRoute path="/field/map" component={FieldMapView} />

      {/* Admin Reports */}
      <ProtectedRoute path="/reports" component={AdminReportsPage} />

      {/* Partner Routes */}
      <ProtectedRoute path="/partner/overview" component={PartnerOverview} />
      <ProtectedRoute path="/partner/collections" component={PartnerCollections} />
      <ProtectedRoute path="/partner/analytics" component={PartnerAnalytics} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="tebari-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
