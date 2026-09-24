import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchOwnerMessagesApi, 
  markMessageAsReadApi, 
  ownerReplyConversationApi, 
  deleteConversationApi, 
  deleteAllOwnerMessagesApi, 
  Message 
} from '../api/publicApi';
import { usePetsQuery } from '../hooks/usePets';
import { HeaderBar } from '../components/HeaderBar';
import { 
  Send, 
  User, 
  Phone, 
  MapPin, 
  Trash2, 
  Search, 
  CheckCircle, 
  CheckCheck,
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Mail,
  Smile,
  Navigation,
  ChevronLeft
} from 'lucide-react';
import { Input, Button, Tag, Spin, Popconfirm, message as antMessage, Tooltip } from 'antd';

const QUICK_REPLIES = [
  "I am on my way to pick up my pet! 🚗",
  "Thank you so much! Please hold my pet safely 🐾",
  "Please call my phone number directly 📞",
  "Could you please share your exact GPS location? 📍",
  "Is my pet injured or safe? 🩺"
];

const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const OwnerInboxPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const selectedPetIdParam = searchParams.get('petId');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // TanStack Query for owner pets & messages
  const { data: pets } = usePetsQuery();
  const { data: messages, isLoading } = useQuery({
    queryKey: ['owner-messages'],
    queryFn: fetchOwnerMessagesApi,
    refetchInterval: 3000,
  });

  const markReadMutation = useMutation({
    mutationFn: (msgId: number) => markMessageAsReadApi(msgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-messages'] });
      antMessage.success('Message marked as read.');
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ convId, text, petId }: { convId: string; text: string; petId: number }) =>
      ownerReplyConversationApi(convId, text, petId),
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['owner-messages'] });
      antMessage.success('Message sent!');
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Failed to send message.');
    },
  });

  const deleteConvMutation = useMutation({
    mutationFn: (convId: string) => deleteConversationApi(convId),
    onSuccess: () => {
      setMobileView('list');
      queryClient.invalidateQueries({ queryKey: ['owner-messages'] });
      antMessage.success('Conversation deleted.');
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Failed to delete conversation.');
    },
  });

  const clearAllMessagesMutation = useMutation({
    mutationFn: () => deleteAllOwnerMessagesApi(),
    onSuccess: () => {
      setSelectedConvId(null);
      setMobileView('list');
      queryClient.invalidateQueries({ queryKey: ['owner-messages'] });
      antMessage.success('All chats cleared.');
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Failed to clear chats.');
    },
  });

  // Group messages by conversationId
  const groupedThreads: Record<string, Message[]> = {};
  if (messages) {
    messages.forEach((msg) => {
      const convId = msg.conversationId || `conv-${msg.id}`;
      if (!groupedThreads[convId]) {
        groupedThreads[convId] = [];
      }
      groupedThreads[convId].push(msg);
    });
  }

  // Sort messages in each thread by sentAt ascending
  Object.keys(groupedThreads).forEach((convId) => {
    groupedThreads[convId].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  });

  // Filter threads by search query
  const threadEntries = Object.entries(groupedThreads).filter(([convId, threadMsgs]) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const petObj = pets?.find(p => p.id === threadMsgs[0]?.petId);
    return threadMsgs.some(
      (m) =>
        m.senderName?.toLowerCase().includes(query) ||
        m.senderContact?.toLowerCase().includes(query) ||
        m.messageText?.toLowerCase().includes(query) ||
        (petObj && petObj.name.toLowerCase().includes(query))
    );
  });

  // Default selection logic
  useEffect(() => {
    if (threadEntries.length > 0 && !selectedConvId) {
      if (selectedPetIdParam) {
        const petIdNum = parseInt(selectedPetIdParam, 10);
        const matchEntry = threadEntries.find(([_, threadMsgs]) => threadMsgs[0]?.petId === petIdNum);
        if (matchEntry) {
          setSelectedConvId(matchEntry[0]);
          setMobileView('chat');
          return;
        }
      }
    }
  }, [messages, selectedPetIdParam]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, messages, mobileView]);

  const activeThread = selectedConvId ? groupedThreads[selectedConvId] : null;
  const activePet = activeThread && pets ? pets.find(p => p.id === activeThread[0]?.petId) : null;
  const activeInitialMsg = activeThread ? activeThread[0] : null;
  const unreadCount = messages ? messages.filter(m => !m.read).length : 0;

  const handleSelectThread = (convId: string) => {
    setSelectedConvId(convId);
    setMobileView('chat');
  };

  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConvId || !activeThread || !replyText.trim()) return;
    const petId = activeThread[0]?.petId || (activePet ? activePet.id : 0);
    replyMutation.mutate({ convId: selectedConvId, text: replyText.trim(), petId });
  };

  const handleQuickReplyClick = (replyStr: string) => {
    setReplyText(replyStr);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0c1317] text-slate-100 flex flex-col justify-between p-2 sm:p-4 font-sans">
      {/* Top Header Bar */}
      <HeaderBar
        pageType="dashboard"
        user={user}
        unreadAlertsCount={unreadCount}
        totalAlertsCount={messages ? messages.length : 0}
        onOpenInbox={() => {}}
        onLogout={handleLogout}
      />

      {/* Main WhatsApp Application Window */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-[#222d34] bg-[#111b21] h-[calc(100vh-100px)] min-h-[550px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 h-full overflow-hidden">
          
          {/* WhatsApp Left Sidebar (Chat List Panel) - Responsive: Full width on mobile when mobileView === 'list' */}
          <div className={`lg:col-span-4 bg-[#111b21] border-r border-[#222d34] flex flex-col justify-between h-full ${
            mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Sidebar Header Bar (WhatsApp Mobile Style Header) */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#222d34]">
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <button 
                    type="button" 
                    title="Back to Dashboard"
                    className="p-1.5 text-[#aebac1] hover:text-white hover:bg-[#2a3942] rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </Link>
                <div className="w-9 h-9 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884] font-bold">
                  <User className="w-5 h-5 text-[#00a884]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#e9edef] leading-tight font-heading">
                    WhatsApp Chats
                  </h2>
                  <span className="text-[10px] text-[#8696a0]">
                    {unreadCount > 0 ? `${unreadCount} unread alert chats` : 'All chats up to date'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Tooltip title={soundEnabled ? "Sound active" : "Muted"}>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 text-[#aebac1] hover:text-white rounded-full hover:bg-[#2a3942] transition-colors"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00a884]" /> : <VolumeX className="w-4 h-4 text-[#8696a0]" />}
                  </button>
                </Tooltip>

                {messages && messages.length > 0 && (
                  <Popconfirm
                    title="Clear all chat history?"
                    description="This will permanently delete all conversation threads."
                    onConfirm={() => clearAllMessagesMutation.mutate()}
                    okText="Clear All"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <button
                      type="button"
                      title="Clear All Chats"
                      className="p-2 text-[#aebac1] hover:text-rose-400 rounded-full hover:bg-[#2a3942] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Popconfirm>
                )}
              </div>
            </div>

            {/* WhatsApp Search Input Field */}
            <div className="p-2.5 bg-[#111b21] border-b border-[#222d34]">
              <div className="relative flex items-center bg-[#202c33] rounded-xl px-3 py-1.5">
                <Search className="w-4 h-4 text-[#8696a0] mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or start new chat..."
                  className="bg-transparent text-[#e9edef] text-xs w-full focus:outline-none placeholder-[#8696a0]"
                />
              </div>
            </div>

            {/* WhatsApp Mobile Chat Entries List */}
            {isLoading ? (
              <div className="py-20 text-center space-y-3 flex-1">
                <Spin size="large" />
                <p className="text-xs text-[#8696a0]">Loading WhatsApp chats...</p>
              </div>
            ) : threadEntries.length > 0 ? (
              <div className="overflow-y-auto flex-1 divide-y divide-[#222d34]">
                {threadEntries.map(([convId, threadMsgs]) => {
                  const initialMsg = threadMsgs[0];
                  const lastMsg = threadMsgs[threadMsgs.length - 1];
                  const hasUnread = threadMsgs.some((m) => !m.read);
                  const isSelected = selectedConvId === convId;
                  const petObj = pets?.find((p) => p.id === initialMsg.petId);

                  return (
                    <div
                      key={convId}
                      onClick={() => handleSelectThread(convId)}
                      className={`px-4 py-3.5 flex items-center justify-between cursor-pointer transition-colors active:bg-[#2a3942] ${
                        isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {petObj?.photoUrl ? (
                            <img src={petObj.photoUrl} alt={petObj.name} className="w-12 h-12 rounded-full object-cover border border-[#222d34]" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884] font-bold text-lg">
                              🐾
                            </div>
                          )}
                          {hasUnread && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
                          )}
                        </div>

                        {/* Text Info */}
                        <div className="min-w-0 flex-1 pr-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#e9edef] truncate">
                              {initialMsg.senderName}
                            </h3>
                            <span className="text-[10px] text-[#8696a0] flex-shrink-0 ml-1">
                              {getRelativeTime(lastMsg.sentAt)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-[#8696a0] truncate flex items-center gap-1">
                              {lastMsg.senderType === 'OWNER' && (
                                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] flex-shrink-0" />
                              )}
                              <span>{lastMsg.messageText}</span>
                            </p>

                            {hasUnread && (
                              <span className="ml-2 w-5 h-5 rounded-full bg-[#00a884] text-[#111b21] font-extrabold text-[10px] flex items-center justify-center flex-shrink-0">
                                {threadMsgs.filter(m => !m.read).length}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-[#00a884] font-semibold block mt-0.5">
                            Pet: {petObj?.name || 'Protected Pet'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center space-y-3 flex-1 text-[#8696a0]">
                <Mail className="w-10 h-10 mx-auto text-[#2a3942]" />
                <p className="text-xs font-bold text-[#e9edef]">No WhatsApp chats</p>
                <p className="text-[11px] text-[#8696a0] max-w-xs mx-auto">
                  {searchQuery ? "No chats match your search query." : "Scanned pet tag alerts will show up here like WhatsApp messages."}
                </p>
              </div>
            )}
          </div>

          {/* WhatsApp Mobile Right Screen (Active Chat Screen) - Full screen on mobile when mobileView === 'chat' */}
          <div className={`lg:col-span-8 bg-[#0b141a] flex flex-col justify-between h-full relative ${
            mobileView === 'list' ? 'hidden lg:flex' : 'flex'
          }`}>
            {activeThread && activeInitialMsg ? (
              <>
                {/* WhatsApp Mobile Active Chat Header */}
                <div className="bg-[#202c33] px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-[#222d34] z-10 shadow-md">
                  <div className="flex items-center gap-2.5">
                    {/* Mobile Back Button (WhatsApp Mobile Header Arrow) */}
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="lg:hidden p-1.5 text-[#aebac1] hover:text-white rounded-full transition-colors"
                      title="Back to chats list"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884] font-bold">
                      <User className="w-5 h-5 text-[#00a884]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xs sm:text-sm font-bold text-[#e9edef] truncate">
                          {activeInitialMsg.senderName}
                        </h2>
                        {activePet && (
                          <span className="bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                            🐾 {activePet.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8696a0] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00a884] inline-block"></span>
                        <a href={`tel:${activeInitialMsg.senderContact}`} className="text-[#53bdeb] font-bold hover:underline">
                          {activeInitialMsg.senderContact}
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1.5">
                    {activeInitialMsg.latitude != null && activeInitialMsg.longitude != null && (
                      <a
                        href={`https://www.google.com/maps?q=${activeInitialMsg.latitude},${activeInitialMsg.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Map</span> 📍
                      </a>
                    )}

                    {activeThread.some(m => !m.read) && (
                      <button
                        type="button"
                        onClick={() => markReadMutation.mutate(activeInitialMsg.id)}
                        className="p-1.5 text-[#00a884] text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    <Popconfirm
                      title="Delete chat?"
                      description="Delete this conversation permanently?"
                      onConfirm={() => selectedConvId && deleteConvMutation.mutate(selectedConvId)}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <button
                        type="button"
                        title="Delete Chat"
                        className="p-2 text-[#aebac1] hover:text-rose-400 rounded-full hover:bg-[#2a3942] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Popconfirm>
                  </div>
                </div>

                {/* WhatsApp Chat Messages Wallpaper Area */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#202c33_1px,transparent_1px)] [bg-size:16px_16px] bg-[#0b141a]">
                  {/* Date Badge */}
                  <div className="flex justify-center my-1">
                    <span className="bg-[#182229] border border-[#222d34] text-[#8696a0] text-[9px] sm:text-[10px] font-semibold px-3 py-1 rounded-md shadow-sm uppercase tracking-wider">
                      TODAY • EMERGENCY ALERTS
                    </span>
                  </div>

                  {activeThread.map((msg) => {
                    const isOwner = msg.senderType === 'OWNER';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-xl text-xs leading-relaxed shadow-md relative ${
                            isOwner
                              ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                              : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                          }`}
                        >
                          <div className="text-[10px] font-bold text-[#8696a0] mb-1">
                            {isOwner ? '🏠 You (Owner)' : `🐾 Finder (${msg.senderName})`}
                          </div>

                          <p className="whitespace-pre-wrap">{msg.messageText}</p>

                          {msg.latitude != null && msg.longitude != null && (
                            <div className="mt-2 pt-2 border-t border-black/20">
                              <a
                                href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-black/20 px-2.5 py-1 rounded-lg border border-amber-400/30 transition-colors"
                              >
                                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Live GPS Location Card 📍
                              </a>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#8696a0]">
                            <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOwner && (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Reply Bar */}
                <div className="px-3 py-1.5 bg-[#111b21] border-t border-[#222d34]">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                    <span className="text-[10px] text-[#8696a0] font-bold flex items-center gap-1 flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-[#00a884]" /> Replies:
                    </span>
                    {QUICK_REPLIES.map((reply, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickReplyClick(reply)}
                        className="text-[11px] bg-[#202c33] hover:bg-[#2a3942] border border-[#222d34] text-[#e9edef] px-2.5 py-0.5 rounded-full transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Mobile Chat Input Bar */}
                <form onSubmit={handleSendReply} className="bg-[#202c33] px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2 border-t border-[#222d34]">
                  <button 
                    type="button"
                    title="Add Emoji" 
                    className="text-[#aebac1] hover:text-white p-1 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Message..."
                    size="large"
                    className="bg-[#2a3942] border-none text-[#e9edef] placeholder-[#8696a0] rounded-2xl text-xs flex-1 h-10 focus:bg-[#2a3942]"
                    onPressEnter={handleSendReply}
                  />

                  <button
                    type="submit"
                    disabled={replyMutation.isPending}
                    className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#00c99e] text-[#111b21] flex items-center justify-center transition-transform active:scale-95 shadow-md flex-shrink-0"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4 fill-current ml-0.5 text-[#111b21]" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[#8696a0] bg-[#111b21]">
                <div className="w-16 h-16 rounded-full bg-[#202c33] border border-[#222d34] flex items-center justify-center text-2xl mb-3 text-[#00a884]">
                  💬
                </div>
                <h3 className="text-base font-bold text-[#e9edef] font-heading">PetSafe WhatsApp Mobile</h3>
                <p className="text-xs text-[#8696a0] max-w-sm mt-1 leading-relaxed">
                  Select a chat from your contacts list to view finder messages and respond in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Footer */}
      <footer className="w-full max-w-7xl mx-auto text-center text-[10px] text-[#8696a0] py-2 mt-1">
        PetSafe Emergency Identification • WhatsApp Mobile Interface
      </footer>
    </div>
  );
};
