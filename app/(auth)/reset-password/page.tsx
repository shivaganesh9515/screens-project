"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/overview`,
    });

    if (resetError) { setError(resetError.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center animate-fade-in">
        <div className="rounded-2xl bg-card px-8 py-10 shadow-card">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          If an account exists with <span className="font-medium text-foreground">{email}</span>, we&apos;ve sent a password reset link.
        </p>
        <Link href="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="rounded-2xl bg-card p-8 shadow-card">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="h-11 w-full rounded-lg border-border bg-white pl-10 pr-4 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <Button type="submit" className="h-11 w-full rounded-full text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98]" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Send reset link"}
        </Button>
      </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-primary transition-colors hover:text-primary-dark hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
