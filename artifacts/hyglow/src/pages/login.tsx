import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginMutation.mutateAsync({ data: { email, password } });
      login(res.token, res.user);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-sidebar p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight leading-none">HYGLOW</h1>
            <p className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest leading-none mt-0.5">Enterprise ERP</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-sidebar-foreground leading-tight">
              Unified ERP for<br />modern enterprises
            </h2>
            <p className="text-sidebar-foreground/60 text-sm max-w-sm">
              Manage your entire business from a single platform — finance, HR, sales, logistics, and more.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Modules", value: "16+" },
              { label: "Data Points", value: "Real-time" },
              { label: "Reports", value: "Auto" },
              { label: "Users", value: "Unlimited" },
            ].map(item => (
              <div key={item.label} className="bg-sidebar-accent/50 rounded-lg p-4">
                <p className="text-sidebar-primary font-bold text-xl">{item.value}</p>
                <p className="text-sidebar-foreground/50 text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sidebar-foreground/30 text-xs">© 2026 Hyglow Inc. All rights reserved.</p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">HYGLOW</h1>
            <p className="text-muted-foreground text-sm mt-1">Enterprise ERP</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your account to continue.{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">Create account</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
