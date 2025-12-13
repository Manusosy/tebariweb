import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_USERS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

export default function OfficersPage() {
  const officers = MOCK_USERS.filter(u => u.role === 'field_officer' || u.role === 'admin');

  return (
    <DashboardLayout userRole="admin" userName="Sarah Ops" userEmail="sarah@tebari.com">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Field Officers</h2>
          <p className="text-muted-foreground">Manage your on-ground data collection team.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {officers.map((officer) => (
            <Card key={officer.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5 border-b" />
              <CardContent className="pt-0 relative">
                <div className="flex justify-between items-start">
                  <Avatar className="h-20 w-20 border-4 border-background -mt-10">
                    <AvatarImage src={officer.avatar} />
                    <AvatarFallback>{officer.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="mt-4">View Profile</Button>
                </div>
                
                <div className="mt-4 space-y-1">
                  <h3 className="font-bold text-lg">{officer.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{officer.role.replace('_', ' ')}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {officer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    +254 7XX XXX XXX
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Kilifi Region
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
