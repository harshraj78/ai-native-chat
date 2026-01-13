'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/chat/FileUpload';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chat/list');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Failed to fetch chats", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleNewChatCreated = (newChatId: string) => {
    setChatId(newChatId);
    fetchChats(); // Refresh list to show new chat
  };

  return (
    <main className="flex min-h-screen flex-col bg-muted/30">
      <div className="w-full flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur-sm fixed top-0 z-20">
        <div className="flex items-center gap-2 font-mono text-sm font-semibold">
          <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">AI</span>
          <span>Native Chat</span>
        </div>
        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>

      <div className="flex h-screen pt-20">
        {/* Sidebar */}
        <div className="hidden md:flex h-full">
          <ChatSidebar
            chats={chats}
            currentChatId={chatId}
            onSelectChat={setChatId}
            onNewChat={() => setChatId(null)}
            isLoading={isLoadingChats}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center p-4">
          {/* Header Info (Title) - Optional to keep or move */}
          <div className="text-center space-y-4 mb-8 mt-8">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Chat with your Documents
            </h1>
          </div>

          {!chatId ? (
            <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FileUpload onUploadComplete={handleNewChatCreated} />
            </div>
          ) : (
            <div className="w-full max-w-2xl h-full animate-in zoom-in-50 duration-500">
              <ChatInterface chatId={chatId} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
