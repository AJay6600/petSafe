import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPublicPetApi, 
  fetchConversationMessagesApi, 
  sendConversationMessageApi, 
  PublicPetDto, 
  Message 
} from '../api/publicApi';
import { 
  Send, 
  Bookmark, 
  ArrowLeft, 
  MessageSquare,
  MapPin,
  Phone,
  Sparkles,
  Navigation,
  CheckCheck,
  Smile
} from 'lucide-react';
import { Input, Spin, message as antMessage } from 'antd';

const FINDER_QUICK_MESSAGES = [
  "I found your pet safely! 🐾",
  "I am holding your pet at my current location 🏠",
  "Please call my mobile number as soon as possible 📞",
  "Could you share your home address for meetup? 📍",
  "Your pet appears healthy and safe 🩺"
];

export const PublicPetChat: React.FC = () => {
  const { token, conversationId } = useParams<{ token: string; conversationId: string }>();
  const [replyText, setReplyText] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: pet, isLoading: petLoading } = useQuery<PublicPetDto>({
    queryKey: ['public-pet', token],
    queryFn: () => fetchPublicPetApi(token!),
    enabled: !!token,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => fetchConversationMessagesApi(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 2500, // Live polling
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const replyMutation = useMutation({
    mutationFn: (params: { text: string; latitude?: number; longitude?: number }) => 
      sendConversationMessageApi(conversationId!, {
        senderName: messages && messages.length > 0 ? messages[0].senderName : 'Finder',
        senderContact: messages && messages.length > 0 ? messages[0].senderContact : '',
        messageText: params.text,
        latitude: params.latitude,
        longitude: params.longitude,
      }),
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      antMessage.success('Message sent to owner!');
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Failed to send message.');
    },
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate({ text: replyText.trim() });
  };

  const handleQuickMessageClick = (msgStr: string) => {
    setReplyText(msgStr);
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      antMessage.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLoading(false);
        replyMutation.mutate({
          text: '📍 Shared Current GPS Location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        setLocationLoading(false);
        antMessage.error('Could not acquire GPS location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (petLoading) {
    return (
      <div className="min-h-screen bg-[#0c1317] text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <Spin size="large" />
        <p className="text-sm font-medium text-[#8696a0]">Loading WhatsApp Chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1317] text-slate-100 flex flex-col justify-between p-1 sm:p-4 font-sans">
      {/* WhatsApp Mobile Container Window */}
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-[#222d34] bg-[#0b141a] h-[calc(100vh-20px)] sm:h-[calc(100vh-60px)] min-h-[550px]">
        
        {/* WhatsApp Mobile Header Bar */}
        <header className="bg-[#202c33] px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-[#222d34] z-20 shadow-md">
          <div className="flex items-center gap-2.5">
            <Link to={`/pet/${token}`}>
              <button
                type="button"
                className="p-1.5 text-[#aebac1] hover:text-white rounded-full transition-colors"
                title="Back to Pet Tag"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            {pet?.photoUrl ? (
              <img src={pet.photoUrl} alt={pet.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#00a884]/40" />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884] font-bold text-base">
                🐾
              </div>
            )}
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-[#e9edef] flex items-center gap-1.5">
                {pet?.ownerName || 'Pet Owner'}
              </h1>
              <p className="text-[10px] text-[#00a884] flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00a884] inline-block animate-pulse"></span>
                Online • {pet?.name || 'Pet'} Emergency Tag
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pet?.ownerContact && (
              <a href={`tel:${pet.ownerContact}`}>
                <button
                  type="button"
                  className="bg-[#00a884] hover:bg-[#00c99e] text-[#111b21] font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Call Owner</span>
                </button>
              </a>
            )}
          </div>
        </header>

        {/* WhatsApp Notice Bar */}
        <div className="bg-[#182229] border-b border-[#222d34] px-3.5 py-2 flex items-center gap-2 text-xs">
          <Bookmark className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <span className="text-[#e9edef] text-[10px] sm:text-[11px]">
            Bookmark this page URL to receive live replies from {pet?.name}'s owner.
          </span>
        </div>

        {/* WhatsApp Mobile Chat Wallpaper Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#202c33_1px,transparent_1px)] [bg-size:16px_16px] bg-[#0b141a]">
          <div className="flex justify-center my-1">
            <span className="bg-[#182229] border border-[#222d34] text-[#8696a0] text-[9px] sm:text-[10px] font-semibold px-3 py-0.5 rounded-md uppercase tracking-wider">
              MESSAGES ARE END-TO-END ENCRYPTED & LIVE
            </span>
          </div>

          {messagesLoading ? (
            <div className="py-20 text-center space-y-3">
              <Spin size="large" />
              <p className="text-xs text-[#8696a0]">Loading WhatsApp chat...</p>
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => {
              const isOwner = msg.senderType === 'OWNER';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwner ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-xl text-xs leading-relaxed shadow-md relative ${
                      isOwner
                        ? 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                        : 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-[#8696a0] mb-1">
                      {isOwner ? `🏠 ${pet?.ownerName || 'Pet Owner'}` : `🐾 You (${msg.senderName})`}
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
                          <MapPin className="w-3.5 h-3.5 text-amber-400" /> View Shared Location Card 📍
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#8696a0]">
                      <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!isOwner && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center space-y-2 text-[#8696a0]">
              <MessageSquare className="w-10 h-10 mx-auto text-[#2a3942]" />
              <p className="text-xs font-bold text-[#e9edef]">No messages in this chat yet.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* WhatsApp Mobile Quick Messages Chips Bar */}
        <div className="px-3 py-1.5 bg-[#111b21] border-t border-[#222d34]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[10px] text-[#8696a0] font-bold flex items-center gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-[#00a884]" /> Replies:
            </span>
            {FINDER_QUICK_MESSAGES.map((msg, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickMessageClick(msg)}
                className="text-[11px] bg-[#202c33] hover:bg-[#2a3942] border border-[#222d34] text-[#e9edef] px-2.5 py-0.5 rounded-full transition-colors whitespace-nowrap cursor-pointer"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp Mobile Input Bar */}
        <form onSubmit={handleSendReply} className="bg-[#202c33] px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2 border-t border-[#222d34]">
          <button
            type="button"
            onClick={handleShareLocation}
            disabled={locationLoading}
            className="text-amber-400 hover:text-amber-300 p-1.5 transition-colors flex items-center gap-1 text-xs font-semibold bg-[#2a3942] rounded-xl px-2"
            title="Share GPS Location"
          >
            <Navigation className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">GPS</span>
          </button>

          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a message..."
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
      </div>

      <footer className="w-full max-w-3xl mx-auto text-center text-[10px] text-[#8696a0] py-1 mt-1">
        PetSafe Emergency Identification • WhatsApp Mobile Interface
      </footer>
    </div>
  );
};
