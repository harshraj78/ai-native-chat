'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown, ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    chatId: string;
}

export function ChatInterface({ chatId: initialChatId }: ChatInterfaceProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Fetch Initial Messages
    useEffect(() => {
        if (initialChatId) {
            setMessages([]);
            const fetchMessages = async () => {
                try {
                    const res = await fetch(`/api/chat/${initialChatId}`);
                    if (!res.ok) return;
                    const data = await res.json();
                    if (data.messages) {
                        setMessages(data.messages.map((msg: any) => ({
                            role: msg.role,
                            content: msg.content
                        })));
                    }
                } catch (error) {
                    console.error("Failed to load chat", error);
                    toast.error("Failed to load chat history");
                }
            };
            fetchMessages();
        } else {
            setMessages([]);
        }
    }, [initialChatId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    chatId: initialChatId,
                }),
            });

            if (!res.ok) throw new Error('Failed to fetch response');

            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            toast.error('Failed to send message');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="flex flex-col h-full relative bg-transparent">
            {/* Header Area inside Chat Interface if needed, distinct from main header */}
            <div className="absolute top-0 w-full z-10 flex justify-between items-center p-4 bg-gradient-to-b from-background via-background/80 to-transparent">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                        Chat Mode
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMessages([])}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Clear View"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 p-4 pb-32" ref={scrollAreaRef}>
                <div className="max-w-3xl mx-auto space-y-8 pt-12">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 1 }}>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-blue-500/20 flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">How can I help with your document?</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Ask about summaries, specific details, or analysis. I'm ready to assist.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-8">
                                {["Summarize this PDF", "What are the key findings?", "Explain the methodology", "List the main entities"].map((suggestion) => (
                                    <Button
                                        key={suggestion}
                                        variant="outline"
                                        className="h-auto py-3 justify-start text-left text-sm font-normal text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                                        onClick={() => setInput(suggestion)}
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex w-full gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {m.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            )}

                            <div className={cn(
                                "relative max-w-[85%] sm:max-w-[75%]",
                                m.role === 'user' ? "flex flex-col items-end" : "flex flex-col items-start"
                            )}>
                                <div
                                    className={cn(
                                        "px-5 py-3.5 shadow-sm text-sm leading-relaxed",
                                        m.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                            : "bg-card border border-border/50 text-card-foreground rounded-2xl rounded-tl-sm glass-card prose prose-sm dark:prose-invert max-w-none break-words"
                                    )}
                                >
                                    {m.role === 'user' ? (
                                        m.content
                                    ) : (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ node, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return match ? (
                                                        <div className="rounded-md bg-muted/50 border p-1 my-2">
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </div>
                                                    ) : (
                                                        <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {m.content}
                                        </ReactMarkdown>
                                    )}
                                </div>

                                {/* Message Actions (AI only) */}
                                {m.role === 'assistant' && (
                                    <div className="flex items-center gap-1 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                            onClick={() => copyToClipboard(m.content)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {m.role === 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 shadow-sm mt-1">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex w-full gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 shadow-sm mt-1 animate-pulse">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} className="h-4" />
                </div>
            </ScrollArea>

            {/* Floating Input Area */}
            <div className="absolute bottom-0 left-0 w-full p-4 lg:p-6 bg-gradient-to-t from-background via-background/90 to-transparent z-20">
                <div className="max-w-3xl mx-auto relative">
                    <div className={cn(
                        "relative flex items-center gap-2 p-2 rounded-2xl border transition-all duration-300",
                        "bg-background/80 backdrop-blur-xl shadow-lg ring-1 ring-black/5 dark:ring-white/5",
                        "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50"
                    )}>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl" title="Upload new file (coming soon)">
                            <PlusCircle className="h-5 w-5" />
                        </Button>

                        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask follow-up questions..."
                                disabled={isLoading}
                                className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent h-10 px-2 text-base placeholder:text-muted-foreground/50"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                size="icon"
                                className={cn(
                                    "h-10 w-10 rounded-xl transition-all duration-300",
                                    input.trim()
                                        ? "bg-primary text-primary-foreground shadow-md hover:shadow-primary/25 hover:scale-105"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                <ArrowUp className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground mt-3 opacity-60">
                        AI-Native Chat can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Helper icon
function PlusCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
        </svg>
    )
}

