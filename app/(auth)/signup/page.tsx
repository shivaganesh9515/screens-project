"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Check, X } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const passwordChecks = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUpper: /[A-Z]/.test(password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwordStrength < 2) {
      setError("Please use a stronger password with at least 8 characters, a number, and an uppercase letter.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (authError) { setError(authError.message); setLoading(false); return; }
    if (!authData.user) { setError("Failed to create account."); setLoading(false); return; }

    if (authData.session) {
      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authData.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: orgName }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to setup organization");
        setLoading(false);
        return;
      }
    }
  };

  const PasswordCheck = ({ passed, label }: { passed: boolean; label: string }) => (
    <span className={`flex items-center gap-1.5 text-xs ${passed ? "text-success" : "text-muted-foreground"}`}>
      {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </span>
  );

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="rounded-2xl bg-card p-8 shadow-card">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Start managing your digital signage screens</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
          <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-11 w-full rounded-lg border-border bg-white px-4 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="orgName" className="text-sm font-medium">Organization Name</Label>
          <Input id="orgName" placeholder="My Company" value={orgName} onChange={(e) => setOrgName(e.target.value)} required className="h-11 w-full rounded-lg border-border bg-white px-4 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="h-11 w-full rounded-lg border-border bg-white px-4 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            className="h-11 w-full rounded-lg border-border bg-white px-4 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      passwordStrength >= level
                        ? passwordStrength >= 3
                          ? "bg-success"
                          : passwordStrength >= 2
                            ? "bg-warning"
                            : "bg-destructive"
                        : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <PasswordCheck passed={passwordChecks.length} label="8+ characters" />
                <PasswordCheck passed={passwordChecks.hasNumber} label="Number" />
                <PasswordCheck passed={passwordChecks.hasUpper} label="Uppercase" />
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="h-11 w-full rounded-full text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98]" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : "Create account"}
        </Button>
      </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary transition-colors hover:text-primary-dark hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
