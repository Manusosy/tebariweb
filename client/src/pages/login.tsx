import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [_, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect based on role
      switch (user.role) {
        case 'field_officer':
          setLocation('/field/dashboard');
          break;
        case 'partner':
          setLocation('/partner/overview');
          break;
        case 'super_admin':
          setLocation('/executive');
          break;
        default:
          setLocation('/dashboard');
      }
    }
  }, [user, setLocation]);

  const [isLogin, setIsLogin] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "admin",
      name: "", // Will be hidden/autofilled or required only for register
      organization: ""
    }
  });

  const onSubmit = (data: FormData) => {
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=1600&auto=format&fit=crop&q=60')] bg-cover bg-center opacity-10 blur-sm pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl relative z-10 border-primary/10">
        <Tabs defaultValue="login" onValueChange={(v) => setIsLogin(v === 'login')} className="w-full">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <span className="text-primary font-bold text-xl">T.</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome to Tebari</CardTitle>
            <CardDescription>
              Sign in to the Plastic Hotspot Tracking System
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...form.register("username")} placeholder="johndoe" required />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-xs text-primary hover:underline" onClick={(e) => { e.preventDefault(); alert("Please contact your administrator to reset your password."); }}>
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input id="password" type="password" {...form.register("password")} required />
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...form.register("name")} placeholder="John Doe" required={!isLogin} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...form.register("email")} placeholder="john@example.com" required={!isLogin} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization (Optional)</Label>
                    <Input id="organization" {...form.register("organization")} placeholder="Org Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select onValueChange={(val) => form.setValue("role", val)} defaultValue={form.getValues("role")}>
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
                </>
              )}

              <Button type="submit" className="w-full" disabled={loginMutation.isPending || registerMutation.isPending}>
                {(loginMutation.isPending || registerMutation.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Tabs>
        <CardFooter className="text-center text-sm text-muted-foreground flex justify-center">
          <p>Protected System. Authorized Access Only.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
