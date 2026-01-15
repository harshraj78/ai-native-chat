'use client';

import { useState } from 'react';
import { MessageCircle, PlusCircle, Loader2, Trash2, MoreVertical, Edit, Share2, Merge, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    onRefresh?: () => void;
}

export function ChatSidebar({ chats, currentChatId, onSelectChat, onNewChat, isLoading, onRefresh }: ChatSidebarProps) {
    const [actionLoading, setActionLoading] = useState(false);

    // Rename State
    const [renameChat, setRenameChat] = useState<Chat | null>(null);
    const [newName, setNewName] = useState('');

    // Delete State
    const [deleteChat, setDeleteChat] = useState<Chat | null>(null);

    // Share State
    const [shareChat, setShareChat] = useState<Chat | null>(null);
    const [shareUrl, setShareUrl] = useState('');

    // Merge State
    const [mergeSourceChat, setMergeSourceChat] = useState<Chat | null>(null);
    const [mergeTargetId, setMergeTargetId] = useState('');

    const handleRename = async () => {
        if (!renameChat || !newName.trim()) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/chat/${renameChat.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: newName }),
            });
            if (res.ok) {
                toast.success('Chat renamed');
                setRenameChat(null);
                setNewName('');
                onRefresh?.();
            } else {
                toast.error('Failed to rename chat');
            }
        } catch (error) {
            toast.error('Error renaming chat');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteChat) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/chat/${deleteChat.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Chat deleted');
                if (currentChatId === deleteChat.id) {
                    onNewChat(); // Reset if deleted active chat
                }
                setDeleteChat(null);
                onRefresh?.();
            } else {
                toast.error('Failed to delete chat');
            }
        } catch (error) {
            toast.error('Error deleting chat');
        } finally {
            setActionLoading(false);
        }
    };

    const handleShare = async (chat: Chat) => {
        setShareChat(chat);
        setShareUrl(''); // Reset
        setActionLoading(true);
        try {
            const res = await fetch('/api/chat/share', {
                method: 'POST',
                body: JSON.stringify({ chatId: chat.id }),
            });
            if (res.ok) {
                const data = await res.json();
                setShareUrl(data.url);
            } else {
                toast.error('Failed to generate share link');
                setShareChat(null);
            }
        } catch (error) {
            toast.error('Error sharing chat');
            setShareChat(null);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMerge = async () => {
        if (!mergeSourceChat || !mergeTargetId) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/chat/merge', {
                method: 'POST',
                body: JSON.stringify({ sourceChatId: mergeSourceChat.id, targetChatId: mergeTargetId }),
            });
            if (res.ok) {
                toast.success('Chats merged successfully');
                if (currentChatId === mergeSourceChat.id) {
                    onSelectChat(mergeTargetId);
                }
                setMergeSourceChat(null);
                setMergeTargetId('');
                onRefresh?.();
            } else {
                const data = await res.json();
                toast.error(data.details || 'Failed to merge chats');
            }
        } catch (error) {
            toast.error('Error merging chats');
        } finally {
            setActionLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Link copied!");
    };

    return (
        <div className="w-full flex flex-col h-full bg-transparent">
            <div className="p-4">
                <Button
                    onClick={onNewChat}
                    className="w-full justify-start gap-2 shadow-sm bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all group"
                    variant="outline"
                >
                    <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    New Chat
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 px-2">
                <div className="flex flex-col gap-1 pb-4">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground p-8 border-2 border-dashed border-muted rounded-xl bg-muted/30 mx-2">
                            <p>No chats yet</p>
                            <p className="text-xs opacity-70 mt-1">Upload a PDF to start</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div key={chat.id} className="group relative flex items-center gap-1 group/item">
                                <Button
                                    variant={currentChatId === chat.id ? "secondary" : "ghost"}
                                    className={cn(
                                        "flex-1 justify-start text-left font-normal truncate h-auto py-3 pl-3 pr-2 rounded-xl transition-all",
                                        currentChatId === chat.id
                                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                                            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => onSelectChat(chat.id)}
                                >
                                    <MessageCircle className={cn(
                                        "w-4 h-4 mr-3 shrink-0 transition-colors",
                                        currentChatId === chat.id ? "text-primary fill-primary/20" : "text-muted-foreground"
                                    )} />
                                    <div className="flex flex-col truncate w-full">
                                        <span className="truncate font-medium text-sm">
                                            {chat.name || "Untitled Chat"}
                                        </span>
                                        {chat.pdfName && (
                                            <span className="text-[10px] opacity-70 truncate max-w-[180px] flex items-center gap-1">
                                                PDF: {chat.pdfName}
                                            </span>
                                        )}
                                    </div>
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-1 top-2 bg-background/50 backdrop-blur-sm shadow-sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => { setRenameChat(chat); setNewName(chat.name); }}>
                                            <Edit className="mr-2 h-4 w-4" /> Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleShare(chat)}>
                                            <Share2 className="mr-2 h-4 w-4" /> Share
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setMergeSourceChat(chat)}>
                                            <Merge className="mr-2 h-4 w-4" /> Merge into...
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteChat(chat)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/20 text-xs text-center text-muted-foreground/60">
                AI-Native Chat &copy; 2024
            </div>

            {/* Rename Dialog */}
            <Dialog open={!!renameChat} onOpenChange={(open) => !open && setRenameChat(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Chat</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="name">Chat Name</Label>
                        <Input
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter new name"
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameChat(null)}>Cancel</Button>
                        <Button onClick={handleRename} disabled={actionLoading || !newName.trim()}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={!!shareChat} onOpenChange={(open) => !open && setShareChat(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Chat</DialogTitle>
                        <DialogDescription>
                            Anyone with this link will be able to view this chat.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mt-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">Link</Label>
                            <Input id="link" value={shareUrl || "Generating..."} readOnly />
                        </div>
                        <Button size="sm" className="px-3" onClick={() => copyToClipboard(shareUrl)} disabled={!shareUrl}>
                            <span className="sr-only">Copy</span>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Merge Dialog */}
            <Dialog open={!!mergeSourceChat} onOpenChange={(open) => !open && setMergeSourceChat(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Merge Chats</DialogTitle>
                        <DialogDescription>
                            Select a chat to merge <strong>{mergeSourceChat?.name}</strong> into.
                            The history will be appended to the target chat, and this chat will be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-[300px] overflow-y-auto space-y-2">
                        {chats.filter(c => c.id !== mergeSourceChat?.id).map(chat => (
                            <div
                                key={chat.id}
                                className={cn(
                                    "p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors flex items-center justify-between",
                                    mergeTargetId === chat.id ? "border-primary bg-primary/5" : "border-border"
                                )}
                                onClick={() => setMergeTargetId(chat.id)}
                            >
                                <span className="font-medium text-sm truncate">{chat.name}</span>
                                {mergeTargetId === chat.id && <Check className="h-4 w-4 text-primary" />}
                            </div>
                        ))}
                        {chats.filter(c => c.id !== mergeSourceChat?.id).length === 0 && (
                            <p className="text-center text-muted-foreground text-sm">No other chats available to merge with.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMergeSourceChat(null)}>Cancel</Button>
                        <Button onClick={handleMerge} disabled={actionLoading || !mergeTargetId}>
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Merge
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deleteChat} onOpenChange={(open) => !open && setDeleteChat(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your chat history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

