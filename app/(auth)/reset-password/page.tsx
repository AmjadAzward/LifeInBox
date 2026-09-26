'use client';
import { FormEvent,useEffect,useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage(){
  const router=useRouter();
  const[password,setPassword]=useState('');
  const[confirm,setConfirm]=useState('');
  const[message,setMessage]=useState('');
  const[loading,setLoading]=useState(false);
  const[checking,setChecking]=useState(true);
  const[hasSession,setHasSession]=useState(false);

  useEffect(()=>{
    const supabase=createClient();
    let mounted=true;
    supabase.auth.getSession().then(({data})=>{if(mounted){setHasSession(Boolean(data.session));setChecking(false);}});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(!mounted)return;
      if(event==='PASSWORD_RECOVERY'||session)setHasSession(true);
      setChecking(false);
    });
    return()=>{mounted=false;subscription.unsubscribe();};
  },[]);

  async function submit(event:FormEvent){
    event.preventDefault();setMessage('');
    if(password.length<8)return setMessage('Password must be at least 8 characters.');
    if(password!==confirm)return setMessage('Passwords do not match.');
    if(!hasSession)return setMessage('This recovery link is invalid or has expired. Request a new link.');
    setLoading(true);
    const{error}=await createClient().auth.updateUser({password});
    setLoading(false);
    if(error){
      const code='code'in error&&typeof error.code==='string'?error.code:'';
      if(code==='same_password'||/different from the old password/i.test(error.message))return setMessage('Choose a password different from your current password.');
      return setMessage(error.message||'Unable to update the password.');
    }
    router.replace('/app');router.refresh();
  }

  return <form onSubmit={submit} className="space-y-5">
    <div><h1 className="text-2xl font-bold">Choose a new password</h1><p className="mt-1 text-sm text-muted-foreground">Use at least eight characters and choose a password different from your current one.</p></div>
    {!checking&&!hasSession&&<div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">This recovery link is invalid or has expired. <Link className="font-medium underline" href="/forgot-password">Request a new link</Link>.</div>}
    <div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)}/></div>
    <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e)=>setConfirm(e.target.value)}/></div>
    {message&&<p role="alert" className="text-sm text-destructive">{message}</p>}
    <Button className="w-full" disabled={checking||loading||!hasSession}>{checking?'Checking recovery link...':loading?'Saving...':'Save password'}</Button>
  </form>;
}
