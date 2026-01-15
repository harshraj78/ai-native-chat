'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/chat/FileUpload';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Menu, MessageSquare, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { cn } from '@/lib/utils';

export default function Home() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  // Sheet handles state internally or via open prop. We can use open prop for manual control if needed, 
  // or just let SheetTrigger handle it. Using state allows us to close it programmatically on selection.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    fetchChats();
  };

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background overflow-hidden relative">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Header / Topbar */}
      <div className="fixed top-0 left-0 right-0 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[85%] sm:w-[350px]">
                <ChatSidebar
                  chats={chats}
                  currentChatId={chatId}
                  onSelectChat={(id) => { setChatId(id); setIsMobileMenuOpen(false); }}
                  onNewChat={() => { setChatId(null); setIsMobileMenuOpen(false); }}
                  isLoading={isLoadingChats}
                  onRefresh={fetchChats}
                />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-blue-600 text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="hidden sm:inline-block tracking-tight text-lg">AI-Native Chat</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 ring-2 ring-border" } }} />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="rounded-full shadow-lg hover:shadow-primary/25">Get Started</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex w-full pt-16 h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-[280px] shrink-0 border-r border-border/40 bg-card/30 backdrop-blur-sm">
          <ChatSidebar
            chats={chats}
            currentChatId={chatId}
            onSelectChat={setChatId}
            onNewChat={() => setChatId(null)}
            isLoading={isLoadingChats}
            onRefresh={fetchChats}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {!chatId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 animate-fade-in">
              <div className="w-full max-w-3xl space-y-8 text-center mb-10">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                    Chat with your Documents
                  </h1>
                  <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                    Upload any PDF and ask questions immediately. Our AI analyzes your documents to provide instant, accurate answers.
                  </p>
                </div>

                <FileUpload onUploadComplete={handleNewChatCreated} />

                {/* Feature Pills */} {/* Optional decorative elements */}
                <div className="flex flex-wrap justify-center gap-3 pt-8 opacity-70">
                  {['Instant Analysis', 'Secure & Private', 'AI-Powered'].map((feature) => (
                    <div key={feature} className="px-3 py-1 rounded-full border bg-secondary/50 text-xs font-medium text-muted-foreground">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center p-4 lg:p-6 animate-zoom-in">
              <div className="w-full h-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden border border-border/50 ring-1 ring-black/5 dark:ring-white/5">
                <ChatInterface chatId={chatId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
