'use client';

import { useState } from 'react';
import {
  Download,
  Trash2,
  AlertTriangle,
  Shield,
  FileText,
  UserX,
} from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function PrivacyPage() {
  const [exportRequested, setExportRequested] = useState(false);
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const exportData = () => { setExportRequested(true); window.location.href='/api/data-export'; };
  const remove = async (account=false) => { if(account){const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user?.email||!password)return setError('Enter your password to confirm.');const{error:authError}=await supabase.auth.signInWithPassword({email:user.email,password});if(authError)return setError('Password is incorrect.');}const response=await fetch(account?'/api/account':'/api/account/content',{method:'DELETE'});if(!response.ok)return setError('The deletion could not be completed.');window.location.href=account?'/login':'/app'; };

  return (
    <div>
      <MobileHeader title="Privacy & Data" showBack backHref="/app/settings" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground">Privacy & Data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your data and privacy settings.
          </p>
        </div>

        {/* Export */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-foreground">
                Download My Data
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Export all your LifeInbox data including life items, reminders,
                and documents. We&apos;ll prepare a downloadable file.
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={exportData}
              >
                {exportRequested ? 'Export requested' : 'Request export'}
              </Button>
              {exportRequested && (
                <p className="text-xs text-success mt-2">
                  We&apos;ll email you when your data is ready to download.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Delete data */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Shield className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-semibold text-foreground">
              Data Deletion
            </h2>
          </div>
          <div className="divide-y divide-border">
            {/* Delete all content */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-start gap-3 px-4 py-4 hover:bg-destructive/5 transition-colors text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/5 text-destructive">
                    <Trash2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Delete All LifeInbox Content
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Removes all life items, reminders, and documents. Your
                      account remains.
                    </p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all content?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your life items, reminders,
                    notifications, and uploaded documents. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => remove(false)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete account */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-start gap-3 px-4 py-4 hover:bg-destructive/5 transition-colors text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/5 text-destructive">
                    <UserX className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Delete Account
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, all life items,
                    reminders, documents, and notification history. This action
                    cannot be undone.
                  </AlertDialogDescription>
                  <Input type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event)=>setPassword(event.target.value)}/>{error&&<p className="text-sm text-destructive">{error}</p>}
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => remove(true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Privacy info */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground">
                Your data is private and secure
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Only you can access your life items and documents. Uploaded
                files are stored privately and are never shared. We use
                industry-standard encryption to protect your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
