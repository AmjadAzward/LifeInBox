'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ImagePlus,
  FileText,
  Camera,
  ClipboardPaste,
  Keyboard,
  Upload,
  X,
} from 'lucide-react';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/image-compression';

type InputMethod = 'image' | 'pdf' | 'photo' | 'paste' | 'type';

interface MethodOption {
  id: InputMethod;
  label: string;
  description: string;
  icon: typeof ImagePlus;
  accept?: string;
  capture?: string;
}

const methods: MethodOption[] = [
  {
    id: 'image',
    label: 'Upload Image',
    description: 'JPG, PNG, or WEBP screenshot',
    icon: ImagePlus,
    accept: 'image/jpeg,image/png,image/webp',
  capture: 'environment',
  },
  {
    id: 'pdf',
    label: 'Upload PDF',
    description: 'Booking, invoice, or document',
    icon: FileText,
    accept: 'application/pdf',
  },
  {
    id: 'photo',
    label: 'Take Photo',
    description: 'Use your camera to capture',
    icon: Camera,
    accept: 'image/jpeg,image/png',
    capture: 'environment',
  },
  {
    id: 'paste',
    label: 'Paste Text',
    description: 'Paste from clipboard or email',
    icon: ClipboardPaste,
  },
  {
    id: 'type',
    label: 'Type Something',
    description: 'Write details manually',
    icon: Keyboard,
  },
];

export default function RememberPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<InputMethod | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selected: FileList | File[] | undefined) => {
    const incoming = Array.from(selected || []);
    if (!incoming.length) return;
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (incoming.some((file) => !validTypes.includes(file.type))) {
      setError('Please upload a JPG, PNG, WEBP, or PDF file.');
      return;
    }
    if (incoming.some((file) => file.size > 10 * 1024 * 1024)) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }
    setError('');
    const compressed = await Promise.all(incoming.map(compressImage));
    setFiles((current) => [...current, ...compressed].slice(0, 5));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!selectedMethod) return;
    if (
      (selectedMethod === 'paste' || selectedMethod === 'type') &&
      !text.trim()
    ) {
      setError('Please enter some text first.');
      return;
    }
    if (
      (selectedMethod === 'image' ||
        selectedMethod === 'pdf' ||
        selectedMethod === 'photo') &&
      !files.length
    ) {
      setError('Please select a file first.');
      return;
    }
    setError('');
    try {
      const attachmentIds: string[] = [];
      for (const file of files) { const body = new FormData(); body.append('file', file); const response = await fetch('/api/uploads', { method:'POST', body }); const result = await response.json(); if(!response.ok) throw new Error(result.error||'Upload failed'); attachmentIds.push(result.data.id); }
      const preferredDate=new URLSearchParams(window.location.search).get('date')||undefined;
      sessionStorage.setItem('lifeinbox.pending', JSON.stringify({ text: text.trim() || undefined, attachmentId:attachmentIds[0], attachmentIds, preferredDate }));
      router.push('/app/processing');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to continue.'); }
  };

  const resetMethod = () => {
    setSelectedMethod(null);
    setFiles([]);
    setText('');
    setError('');
  };

  return (
    <div>
      <MobileHeader title="Remember Something" showBack backHref="/app" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Remember Something
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a document or type the details - we&apos;ll extract the
            important information for you.
          </p>
        </div>

        {!selectedMethod && (
          <div className="space-y-3 animate-fade-in">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method.id);
                    setError('');
                    if (method.accept && method.id !== 'photo') {
                      setTimeout(() => fileInputRef.current?.click(), 100);
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">
                      {method.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {method.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedMethod && (
          <div className="animate-fade-in-up space-y-5">
            <div className="flex items-center justify-between">
              <button
                onClick={resetMethod}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Change method
              </button>
            </div>

            {/* File upload methods */}
            {(selectedMethod === 'image' ||
              selectedMethod === 'pdf' ||
              selectedMethod === 'photo') && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={selectedMethod !== 'photo'}
                  accept={
                    methods.find((m) => m.id === selectedMethod)?.accept
                  }
                  capture={
                    selectedMethod === 'photo' ? 'environment' : undefined
                  }
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files || undefined)}
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  {files.length ? (
                    <div className="space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 mx-auto">
                        <FileText className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {files.map((file) => file.name).join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {files.length} file{files.length === 1 ? '' : 's'} · {(files.reduce((total, file) => total + file.size, 0) / 1024).toFixed(0)} KB total
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles([]);
                        }}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove files
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mx-auto">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {selectedMethod === 'photo'
                            ? 'Take a photo'
                            : 'Drop your file here or click to browse'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, WEBP, or PDF · Max 10 MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Text input methods */}
            {(selectedMethod === 'paste' || selectedMethod === 'type') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {selectedMethod === 'paste'
                    ? 'Paste your text below'
                    : 'Type the details you want to remember'}
                </label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    selectedMethod === 'paste'
                      ? 'Paste the email, bill details, or booking confirmation here...'
                      : 'e.g. Dental appointment on 29 September at 3 PM at Smile Clinic...'
                  }
                  className="min-h-[160px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Include dates, amounts, reference numbers, and any actions
                  you need to take.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              disabled={
                (selectedMethod === 'paste' || selectedMethod === 'type') &&
                !text.trim()
              }
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
