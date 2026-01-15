'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onUploadComplete: (chatId: string) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) await processFile(file);
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await processFile(file);
    };

    const processFile = async (file: File) => {
        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => (prev >= 95 ? 95 : prev + 5));
        }, 500);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.status === 403) {
                toast.error('Premium subscription required', {
                    description: 'Please upgrade to upload more files.',
                    action: {
                        label: 'Upgrade',
                        onClick: async () => {
                            try {
                                const res = await fetch('/api/subscription/checkout', { method: 'POST', body: '{}' });
                                if (!res.ok) return;
                                const { url } = await res.json();
                                if (url) window.location.href = url;
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || `Upload failed: ${res.statusText}`);
            }

            clearInterval(progressInterval);
            setUploadProgress(100);
            toast.success('PDF processed successfully!');

            // Small delay to show 100% completion
            setTimeout(async () => {
                const data = await res.json();
                onUploadComplete(data.chatId);
            }, 500);

        } catch (error) {
            clearInterval(progressInterval);
            console.error(error);
            let errorMessage = 'Failed to upload PDF';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card
            className={cn(
                "w-full max-w-lg mx-auto transition-all duration-300 border-2 border-dashed glass-card overflow-hidden",
                isDragging ? "border-primary bg-primary/5 scale-105" : "border-border/50 hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <CardContent className="flex flex-col items-center justify-center p-12 space-y-6 text-center">
                <div className={cn(
                    "p-6 rounded-full transition-colors duration-300",
                    isDragging ? "bg-primary/20" : "bg-secondary"
                )}>
                    {isUploading ? (
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    ) : (
                        <Upload className="w-10 h-10 text-primary" />
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-2xl tracking-tight">Upload your PDF</h3>
                    <p className="text-sm text-muted-foreground/80 max-w-xs mx-auto">
                        Drag & drop your document here, or click to browse. We'll analyze it instantly.
                    </p>
                </div>

                {isUploading && (
                    <div className="w-full space-y-3 animate-in fade-in zoom-in duration-300">
                        <Progress value={uploadProgress} className="h-2 w-full bg-secondary" />
                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                            <span>Processing...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                    </div>
                )}

                <div className="relative w-full">
                    <Button
                        disabled={isUploading}
                        className="w-full h-12 text-base shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
                    >
                        {isUploading ? 'Processing...' : 'Select PDF File'}
                    </Button>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={isUploading}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

