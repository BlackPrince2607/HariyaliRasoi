"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Leaf, Lock } from "lucide-react";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      setToken(result.access_token);
      toast.success("Welcome back!");
      router.push("/admin");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center mesh-hero px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-3xl border border-brand-gold/40 bg-brand-surface/95 p-8 shadow-[var(--shadow-elevated)] backdrop-blur">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-leaf/12 text-brand-leaf">
              <Leaf className="h-7 w-7" />
            </span>
            <p className="mt-4 font-hand text-xl text-brand-saffron">welcome back</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal">
              Admin Login
            </h1>
            <p className="mt-1 text-sm text-brand-muted">Hariyali Rasoi dashboard</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email", { required: true })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password", { required: true })} className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              <Lock className="h-4 w-4" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-brand-muted">
            <Link href="/" className="text-brand-leaf hover:underline">
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
