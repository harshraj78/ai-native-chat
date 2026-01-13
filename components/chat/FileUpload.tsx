'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FileUploadProps {
    onUploadComplete: (chatId: string) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 5));
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

            const data = await res.json();
            onUploadComplete(data.chatId);

        } catch (error) {
            clearInterval(progressInterval);
            console.error(error);

            let errorMessage = 'Failed to upload PDF';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                description: 'Check the console for more details',
                duration: 5000,
            });

            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto border-dashed border-2 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                <div className="p-4 bg-muted rounded-full">
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                        <Upload className="w-8 h-8 text-primary" />
                    )}
                </div>

                <div className="text-center space-y-1">
                    <h3 className="font-semibold text-lg">Upload PDF</h3>
                    <p className="text-sm text-muted-foreground">
                        Drag & drop or click to upload your document
                    </p>
                </div>

                {isUploading && (
                    <div className="w-full space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground">Processing vectors...</p>
                    </div>
                )}

                <div className="relative">
                    <Button disabled={isUploading} variant="default" className="w-full">
                        Select File
                    </Button>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={isUploading}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
