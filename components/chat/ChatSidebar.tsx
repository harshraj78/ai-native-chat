'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Chat {
    id: string;
    name: string;
    pdfName: string | null;
    createdAt: string;
}

interface ChatSidebarProps {
    chats: Chat[];
    currentChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    isLoading: boolean;
}

export function ChatSidebar({ chats, currentChatId, onSelectChat, onNewChat, isLoading }: ChatSidebarProps) {
    return (
        <div className="w-full md:w-64 flex flex-col h-[600px] border-r bg-background/50 backdrop-blur-sm border-white/10">
            <div className="p-4 border-b border-border/40">
                <Button
                    onClick={onNewChat}
                    className="w-full justify-start gap-2 shadow-sm"
                    variant="default"
                >
                    <PlusCircle className="w-4 h-4" />
                    New Chat
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2 p-2">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground p-4">
                            No chats yet.
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <Button
                                key={chat.id}
                                variant={currentChatId === chat.id ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start text-left font-normal truncate",
                                    currentChatId === chat.id && "bg-secondary"
                                )}
                                onClick={() => onSelectChat(chat.id)}
                            >
                                <MessageCircle className="w-4 h-4 mr-2 shrink-0" />
                                <div className="flex flex-col truncate">
                                    <span className="truncate">{chat.name || "Untitled Chat"}</span>
                                    {chat.pdfName && (
                                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                            {chat.pdfName}
                                        </span>
                                    )}
                                </div>
                            </Button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
