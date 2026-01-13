'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, RefreshCw } from 'lucide-react';
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

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Sync internal state with prop
    useEffect(() => {
        if (initialChatId) {
            setMessages([]); // Clear previous messages immediately
            const fetchMessages = async () => {
                try {
                    const res = await fetch(`/api/chat/${initialChatId}`);
                    if (!res.ok) return; // Handle error or not found
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
                    chatId: initialChatId, // Use prop directly
                }),
            });

            if (!res.ok) throw new Error('Failed to fetch response');

            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);

            // Note: Parent should handle chatId update via props if this was a new chat, 
            // but currently we only use ChatInterface when chatId exists.
        } catch (error) {
            toast.error('Failed to send message');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl h-[600px] flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold leading-none tracking-tight">Chat Guide</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Ask questions about your PDF</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => {
                    setMessages([]);
                }} title="Clear Chat" className="text-muted-foreground hover:text-foreground">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4 min-h-0">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground mt-20">
                            <p>No messages yet. Ask something about your document!</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex w-full items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {m.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>
                            )}

                            <div
                                className={cn(
                                    "rounded-2xl px-5 py-3 max-w-[85%] shadow-sm ring-1 ring-inset",
                                    m.role === 'user'
                                        ? "bg-primary text-primary-foreground ring-primary/20 rounded-tr-sm"
                                        : "bg-card text-foreground ring-border rounded-tl-sm prose prose-sm dark:prose-invert max-w-none break-words"
                                )}
                            >
                                {m.role === 'user' ? (
                                    m.content
                                ) : (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {m.content}
                                    </ReactMarkdown>
                                )}
                            </div>

                            {m.role === 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
                                    <User className="w-5 h-5 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex w-full items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                            <div className="bg-muted match-height rounded-2xl px-5 py-3 text-sm text-muted-foreground animate-pulse shadow-sm ring-1 ring-inset ring-border">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            <div className="p-4 bg-background border-t">
                <form onSubmit={handleSubmit} className="flex gap-3 relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        disabled={isLoading}
                        className="flex-1 pr-12 h-12 rounded-full border-muted-foreground/20 focus-visible:ring-primary/20 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors"
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </Card>
    );
}
