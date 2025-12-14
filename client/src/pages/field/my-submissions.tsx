import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Scale, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { MOCK_SUBMISSIONS, CollectionSubmission } from "@/lib/mock-data";
import { format } from "date-fns";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MySubmissionsPage() {
  const [search, setSearch] = useState("");
  const mySubmissions = MOCK_SUBMISSIONS.filter(s => s.officerId === 'u3'); // Current user 'u3'

  const filtered = mySubmissions.filter(s => 
    s.notes?.toLowerCase().includes(search.toLowerCase()) ||
    s.id.includes(search)
  );

  return (
    <DashboardLayout 
      userRole="field_officer" 
      userName="John Field" 
      userEmail="john@tebari.com"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Submissions</h2>
            <p className="text-muted-foreground">Track the status of your data collection entries.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search history..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Entries</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <SubmissionList submissions={filtered} />
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
             <SubmissionList submissions={filtered.filter(s => s.status === 'pending')} />
          </TabsContent>
          <TabsContent value="approved" className="mt-4">
             <SubmissionList submissions={filtered.filter(s => s.status === 'approved')} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function SubmissionList({ submissions }: { submissions: CollectionSubmission[] }) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No submissions found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {submissions.map((sub) => (
        <Card key={sub.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 aspect-video sm:aspect-auto relative bg-muted">
              <img 
                src={sub.imageUrl} 
                alt="Evidence" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 sm:hidden">
                 <StatusBadge status={sub.status} />
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      Submission #{sub.id.toUpperCase().slice(0, 6)}
                    </h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(sub.timestamp), 'PPP p')}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <StatusBadge status={sub.status} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-3 text-sm">
                   <div className="bg-muted/50 p-2 rounded">
                     <span className="block text-xs text-muted-foreground">Total Weight</span>
                     <span className="font-bold flex items-center gap-1">
                       <Scale className="h-3 w-3" /> {sub.totalWeight}kg
                     </span>
                   </div>
                   <div className="bg-muted/50 p-2 rounded">
                     <span className="block text-xs text-muted-foreground">Location</span>
                     <span className="font-medium truncate flex items-center gap-1">
                       <MapPin className="h-3 w-3" /> {sub.location.lat.toFixed(3)}, {sub.location.lng.toFixed(3)}
                     </span>
                   </div>
                   <div className="bg-muted/50 p-2 rounded col-span-2">
                     <span className="block text-xs text-muted-foreground">Plastic Types</span>
                     <span className="font-medium truncate">
                       {Object.keys(sub.plasticTypes).join(", ")}
                     </span>
                   </div>
                </div>
                
                {sub.notes && (
                  <p className="text-sm text-muted-foreground italic border-l-2 pl-2 border-muted">
                    "{sub.notes}"
                  </p>
                )}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return <Badge className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
  }
  if (status === 'rejected') {
    return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
  }
  return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending Review</Badge>;
}
