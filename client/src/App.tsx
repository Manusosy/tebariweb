import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import SettingsPage from "@/pages/settings";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import SubmissionsPage from "@/pages/admin/submissions";
import HotspotsPage from "@/pages/admin/hotspots";
import OfficersPage from "@/pages/admin/officers";

// Field Officer Pages
import FieldOverview from "@/pages/field/overview";
import NewCollectionPage from "@/pages/field/new-collection";
import MySubmissionsPage from "@/pages/field/my-submissions";
import FieldMapView from "@/pages/field/map-view";

// Partner Pages
import PartnerOverview from "@/pages/partner/overview";
import PartnerCollections from "@/pages/partner/collections";
import PartnerAnalytics from "@/pages/partner/analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/settings" component={SettingsPage} />
      
      {/* Admin Routes */}
      <Route path="/dashboard" component={AdminDashboard} />
      <Route path="/map" component={AdminDashboard} /> 
      <Route path="/submissions" component={SubmissionsPage} />
      <Route path="/hotspots" component={HotspotsPage} />
      <Route path="/officers" component={OfficersPage} />
      
      {/* Field Officer Routes */}
      <Route path="/field/dashboard" component={FieldOverview} />
      <Route path="/collection/new" component={NewCollectionPage} />
      <Route path="/field/submissions" component={MySubmissionsPage} />
      <Route path="/field/map" component={FieldMapView} />
      
      {/* Partner Routes */}
      <Route path="/reports" component={PartnerOverview} /> 
      <Route path="/partner/overview" component={PartnerOverview} />
      <Route path="/partner/collections" component={PartnerCollections} />
      <Route path="/partner/analytics" component={PartnerAnalytics} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="tebari-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
