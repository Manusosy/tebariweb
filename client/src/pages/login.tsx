import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [_, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("admin");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      // In a real app, we'd store the token/user here
      if (selectedRole === 'field_officer') {
        setLocation('/field/dashboard');
      } else if (selectedRole === 'partner') {
        setLocation('/partner/overview');
      } else if (selectedRole === 'super_admin') {
        setLocation('/executive');
      } else {
        setLocation('/dashboard');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=1600&auto=format&fit=crop&q=60')] bg-cover bg-center opacity-10 blur-sm pointer-events-none" />
      
      <Card className="w-full max-w-md shadow-2xl relative z-10 border-primary/10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <span className="text-primary font-bold text-xl">T.</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to Tebari</CardTitle>
          <CardDescription>
            Sign in to the Plastic Hotspot Tracking System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@tebari.com" required defaultValue="admin@tebari.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role (for demo purposes)</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin (Ops Team)</SelectItem>
                  <SelectItem value="field_officer">Field Officer</SelectItem>
                  <SelectItem value="partner">Recycler / Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground flex justify-center">
          <p>Protected System. Authorized Access Only.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
