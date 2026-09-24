'use client';

import { useEffect, useRef, useState } from 'react';
import { User as UserIcon, Mail, Globe, Calendar, Save, Camera, Trash2 } from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getInitials } from '@/lib/format';
import { useProfile } from '@/hooks/use-profile';

export default function ProfilePage() {
  const { profile, loading, error: profileError, refresh } = useProfile();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if(profile){setFullName(profile.full_name);setEmail(profile.email);setCountry(profile.country);setTimezone(profile.timezone);setAvatarUrl(profile.image_url ? `/api/profile/avatar?v=${Date.now()}` : '');} }, [profile]);

  const handleAvatar = async (file?: File) => {
    if (!file) return;
    setUploadingAvatar(true); setMessage('');
    try {
      const body = new FormData(); body.append('avatar', file);
      const response = await fetch('/api/profile/avatar', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to upload photo.');
      setAvatarUrl(result.imageUrl);
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to upload photo.'); }
    finally { setUploadingAvatar(false); if (avatarInputRef.current) avatarInputRef.current.value = ''; }
  };

  const handleSave = async () => {
    if (profile && email.trim().toLowerCase() !== profile.email.toLowerCase()) {
      const { createClient } = await import('@/lib/supabase/client');
      const { error } = await createClient().auth.updateUser({ email: email.trim() });
      if (error) { setMessage(error.message); return; }
      setMessage('Profile saved. Check your new email address to confirm the change.');
    }
    const response = await fetch('/api/me',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({full_name:fullName,country,timezone})});
    if(!response.ok){setMessage('Unable to save profile.');return;}
    setMessage(''); setSaved(true); await refresh();
    setTimeout(() => setSaved(false), 3000);
  };

  const removeAvatar = async () => {
    const response = await fetch('/api/profile/avatar', { method: 'DELETE' });
    if (!response.ok) return setMessage('Unable to remove photo.');
    setAvatarUrl(''); await refresh();
  };

  return (
    <div>
      <MobileHeader title="Profile" showBack backHref="/app/settings" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your personal information.
          </p>
        </div>
        {(message || profileError) && <p className="text-sm text-destructive">{message || profileError}</p>}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground text-xl font-bold">
              {avatarUrl ? <div role="img" aria-label={`${fullName} profile photo`} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${avatarUrl})` }} /> : getInitials(fullName)}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handleAvatar(event.target.files?.[0])} />
            <button type="button" aria-label="Upload profile photo" disabled={uploadingAvatar} onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-50">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{loading && !fullName ? 'Loading...' : fullName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {uploadingAvatar ? 'Uploading photo...' : 'Click the camera icon to upload or replace your photo'}
            </p>
          </div>
          {avatarUrl && <Button type="button" variant="ghost" size="sm" onClick={removeAvatar}><Trash2 className="mr-2 h-4 w-4"/>Remove</Button>}
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                className="pl-10"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[
                  'Sri Lanka',
                  'India',
                  'United Kingdom',
                  'United States',
                  'Australia',
                  'Canada',
                  'Singapore',
                  'United Arab Emirates',
                  'Other',
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[
                  'Asia/Colombo',
                  'Asia/Kolkata',
                  'Asia/Dubai',
                  'Asia/Singapore',
                  'Europe/London',
                  'America/New_York',
                  'America/Los_Angeles',
                  'Australia/Sydney',
                  'UTC',
                ].map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          {saved && (
            <span className="text-sm text-success animate-fade-in">
              Changes saved.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
