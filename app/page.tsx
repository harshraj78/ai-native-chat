'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/chat/FileUpload';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Menu, Sparkles, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../components/ui/sheet';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { PDFViewer } from '@/components/pdf-viewer';

import { useMediaQuery } from '@/hooks/use-media-query';

export default function Home() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [isPdfVisible, setIsPdfVisible] = useState(true);
  const [mobileTab, setMobileTab] = useState<'chat' | 'pdf'>('chat');

  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  const handleCitationClick = (page: number) => {
    setActivePage(page);
    if (isDesktop) {
      setIsPdfVisible(true);
    } else {
      setMobileTab('pdf'); // Switch to PDF tab on mobile
    }
  };

  const currentChat = chats.find(c => c.id === chatId);

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
                <SheetTitle className="hidden">Navigation Menu</SheetTitle>
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
          {/* Mobile Tab Switcher (Visible only on mobile if PDF exists) */}
          {!isDesktop && currentChat?.pdfUrl && (
            <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border/50">
              <Button
                variant={mobileTab === 'pdf' ? 'secondary' : 'ghost'}
                size="sm"
                className={cn("h-7 px-3 text-xs", mobileTab === 'pdf' && "bg-background shadow-sm")}
                onClick={() => setMobileTab('pdf')}
              >
                PDF
              </Button>
              <Button
                variant={mobileTab === 'chat' ? 'secondary' : 'ghost'}
                size="sm"
                className={cn("h-7 px-3 text-xs", mobileTab === 'chat' && "bg-background shadow-sm")}
                onClick={() => setMobileTab('chat')}
              >
                Chat
              </Button>
            </div>
          )}

          {/* Desktop Toggle Button */}
          {isDesktop && currentChat?.pdfUrl && (
            <Button
              variant={isPdfVisible ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsPdfVisible(!isPdfVisible)}
              className="hidden md:flex gap-2"
            >
              {isPdfVisible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              {isPdfVisible ? "Hide PDF" : "Show PDF"}
            </Button>
          )}

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

                {/* Feature Pills */}
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
            <div className="w-full h-full flex flex-col bg-background">
              {/* Mobile Layout: Tabs */}
              {!isDesktop && currentChat?.pdfUrl ? (
                <div className="w-full h-full flex flex-col relative">
                  <div className={cn("absolute inset-0 w-full h-full transition-opacity duration-300", mobileTab === 'pdf' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
                    <PDFViewer url={currentChat.pdfUrl} page={activePage} />
                  </div>
                  <div className={cn("absolute inset-0 w-full h-full transition-opacity duration-300 bg-background", mobileTab === 'chat' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
                    <ChatInterface chatId={chatId} onCitationClick={handleCitationClick} />
                  </div>
                </div>
              ) : (
                // Desktop or No PDF
                <>
                  {currentChat?.pdfUrl && isPdfVisible ? (
                    <PanelGroup direction="horizontal" className="h-full w-full border-t border-border/40">
                      <Panel defaultSize={45} minSize={20} maxSize={60} className="bg-muted/10">
                        <PDFViewer url={currentChat.pdfUrl} page={activePage} />
                      </Panel>
                      <PanelResizeHandle className="bg-border/50 hover:bg-primary/50 transition-colors w-1.5" />
                      <Panel defaultSize={55} minSize={30}>
                        <div className="w-full h-full flex flex-col bg-background/50 backdrop-blur-sm min-w-0 overflow-hidden">
                          <ChatInterface chatId={chatId} onCitationClick={handleCitationClick} />
                        </div>
                      </Panel>
                    </PanelGroup>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center p-4 lg:p-6 animate-zoom-in">
                      <div className="w-full h-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden border border-border/50 ring-1 ring-black/5 dark:ring-white/5 relative">
                        <ChatInterface chatId={chatId} onCitationClick={handleCitationClick} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
