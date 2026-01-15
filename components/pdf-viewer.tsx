"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
    url: string | null;
    page?: number | null; // New prop for page navigation
    className?: string;
}

export function PDFViewer({ url, page, className }: PDFViewerProps) {
    const [isLoading, setIsLoading] = useState(true);

    // Construct URL with page hash if provided
    const pdfUrlWithPage = url ? `${url}${page ? `#page=${page}` : ''}` : null;

    if (!url) {
        return (
            <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-muted/20 border-r border-border/50", className)}>
                <p className="text-muted-foreground text-sm">No PDF selected</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Upload or select a chat to view document</p>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full h-full bg-background border-r border-border/50", className)}>
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            <iframe
                key={pdfUrlWithPage} // Force re-render on hash change if needed, or rely on browser behavior
                src={pdfUrlWithPage || ''}
                className="w-full h-full border-none"
                onLoad={() => setIsLoading(false)}
                title="PDF Viewer"
            />
        </div>
    );
}
