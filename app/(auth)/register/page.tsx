'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient, hasSupabaseConfig } from '@/lib/supabase/client';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const countries = [
  'Sri Lanka',
  'India',
  'United Kingdom',
  'United States',
  'Australia',
  'Canada',
  'Singapore',
  'United Arab Emirates',
  'Other',
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    timezone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const handleCaptcha = useCallback((token: string) => setCaptchaToken(token), []);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setForm((f) => ({ ...f, timezone: tz }));
    } catch {
      setForm((f) => ({ ...f, timezone: 'UTC' }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.fullName) newErrors.fullName = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!form.country) newErrors.country = 'Please select your country';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const { error } = await createClient().auth.signUp({ email: form.email, password: form.password, options: { captchaToken, emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`, data: { full_name: form.fullName, country: form.country, timezone: form.timezone } } });
      if (error) throw error;
    } catch (error) { setErrors({ email: error instanceof Error ? error.message : 'Registration failed.' }); setLoading(false); return; }
    router.push('/onboarding');
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
      <p className="text-sm text-muted-foreground mt-1.5">
        Start remembering what matters
      </p>
      {!hasSupabaseConfig && <p className="mt-4 rounded-lg bg-warning/10 p-3 text-sm text-warning">Registration is unavailable until Supabase is configured in <code>.env.local</code>.</p>}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              placeholder="Your full name"
              className="pl-10"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              className="pl-10 pr-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              className="pl-10"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={form.country}
            onValueChange={(v) => setForm({ ...form, country: v })}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select your country" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-xs text-destructive">{errors.country}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            value={form.timezone}
            readOnly
            className="bg-muted/50"
          />
          <p className="text-xs text-muted-foreground">
            Detected from your browser. You can change this later in Settings.
          </p>
        </div>

        <TurnstileWidget onToken={handleCaptcha}/>
        <Button type="submit" className="w-full" disabled={loading || !hasSupabaseConfig || (captchaEnabled && !captchaToken)}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
