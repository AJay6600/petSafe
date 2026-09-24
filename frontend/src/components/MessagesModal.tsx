import React, { useState, useRef } from 'react';
import { Modal, Spin, Tag, Button, Input, Popconfirm, message as antMessage, Tooltip } from 'antd';
import { 
  Mail, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Send, 
  MapPin, 
  ExternalLink, 
  Trash2,
  Search,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPetMessagesApi, markMessageAsReadApi, ownerReplyConversationApi, deleteConversationApi, deletePetMessagesApi, Message } from '../api/publicApi';
import { Pet } from '../api/petsApi';

interface MessagesModalProps {
  pet: Pet | null;
  open: boolean;
  onClose: () => void;
}

const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString();
};

const QUICK_REPLIES = [
  "I am on my way to pick up my pet! 🚗",
  "Thank you so much! Please hold my pet safely 🐾",
  "Please call my phone number directly 📞",
  "Could you please share your exact GPS location? 📍",
  "Is my pet injured or safe? 🩺"
];

export const MessagesModal: React.FC<MessagesModalProps> = ({ pet, open, onClose }) => {
  const queryClient = useQueryClient();
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { data: messages, isLoading, isError } = useQuery({
    queryKey: ['pet-messages', pet?.id],
    queryFn: () => fetchPetMessagesApi(pet!.id),
    enabled: !!pet && open,
    refetchInterval: 3000,
  });

  const markReadMutation = useMutation({
    mutationFn: (msgId: number) => markMessageAsReadApi(msgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-messages', pet?.id] });
      queryClient.invalidateQueries({ queryKey: ['owner-messages'] });
      antMessage.success('Message marked as read.');
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ convId, text }: { convId: string; text: string }) =>
      ownerReplyConversationApi(convId, text, pet!.id),
    onSuccess: (_, variables) => {
      setReplyTextMap((prev) => ({ ...prev, [variables.convId]: '' }));
      queryClient.invalidateQueries({ queryKey: ['pet-messages', pet?.id] });
      queryClient.invalidateQueries({ queryKey: ['owner-messages'] });
      antMessage.success('Reply sent to finder!');
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Failed to send reply.');
    },
  });

  const deleteConvMutation = useMutation({
    mutationFn: (convId: string) => deleteConversationApi(convId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-messages', pet?.id] });
      queryClient.invalidateQueries({ queryKey: ['owner-messages'] });
      antMessage.success('Conversation thread deleted.');
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Failed to delete thread.');
    },
  });

  const clearPetMessagesMutation = useMutation({
    mutationFn: (petId: number) => deletePetMessagesApi(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-messages', pet?.id] });
      queryClient.invalidateQueries({ queryKey: ['owner-messages'] });
      antMessage.success('Inbox emptied for this pet.');
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Failed to clear inbox.');
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

  // Sort messages in each thread by sentAt ascending for chat view
  Object.keys(groupedThreads).forEach((convId) => {
    groupedThreads[convId].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  });

  // Filter threads by search query
  const filteredThreadEntries = Object.entries(groupedThreads).filter(([convId, threadMsgs]) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return threadMsgs.some(
      (m) =>
        m.senderName?.toLowerCase().includes(query) ||
        m.senderContact?.toLowerCase().includes(query) ||
        m.messageText?.toLowerCase().includes(query)
    );
  });

  const handleSendReply = (convId: string) => {
    const text = replyTextMap[convId];
    if (!text || !text.trim()) return;
    replyMutation.mutate({ convId, text: text.trim() });
  };

  const handleQuickReplyClick = (convId: string, replyStr: string) => {
    setReplyTextMap((prev) => ({ ...prev, [convId]: replyStr }));
  };

  return (
    <Modal
      title={
        <div className="flex flex-wrap items-center justify-between gap-3 pr-6 text-white font-bold text-base">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-heading text-base block leading-tight">
                Alerts Inbox — {pet?.name}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Direct Two-Way Communication Channel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip title={soundEnabled ? "Audio alerts enabled" : "Audio alerts muted"}>
              <Button
                type="text"
                size="small"
                onClick={() => setSoundEnabled(!soundEnabled)}
                icon={soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                className="hover:bg-slate-800 rounded-lg"
              />
            </Tooltip>

            {messages && messages.length > 0 && (
              <Popconfirm
                title="Clear all messages?"
                description="This will permanently delete all finder alerts and chat history for this pet."
                onConfirm={() => pet && clearPetMessagesMutation.mutate(pet.id)}
                okText="Empty Inbox"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<Trash2 className="w-3.5 h-3.5 inline mr-1" />}
                  loading={clearPetMessagesMutation.isPending}
                  className="text-xs font-semibold hover:bg-rose-500/10 rounded-lg px-2"
                >
                  Empty Inbox
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={720}
      className="dark-modal"
      style={{ top: 20 }}
    >
      <div className="py-2 space-y-4">
        {/* Search Bar for Messages */}
        {messages && messages.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations by finder name or keyword..."
              className="bg-slate-950 border-slate-800 text-white pl-9 rounded-xl text-xs"
              allowClear
            />
          </div>
        )}

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Spin size="large" />
            <p className="text-xs text-slate-400">Loading inbox messages...</p>
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-rose-400 text-xs">
            Failed to load messages for this pet.
          </div>
        ) : filteredThreadEntries.length > 0 ? (
          <div className="space-y-6 max-h-[60vh] sm:max-h-[500px] overflow-y-auto pr-1">
            {filteredThreadEntries.map(([convId, threadMsgs]) => {
              const initialMsg = threadMsgs[0];
              const hasUnread = threadMsgs.some((m) => !m.read);

              return (
                <div key={convId} className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 text-xs shadow-xl transition-all">
                  {/* Thread Header */}
                  <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-800 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{initialMsg.senderName}</span>
                          {hasUnread ? (
                            <Tag color="error" className="font-bold text-[10px] animate-pulse border-none rounded-full px-2">NEW ALERT</Tag>
                          ) : (
                            <Tag color="default" className="font-semibold text-[10px] bg-slate-800 text-slate-400 border-slate-700 rounded-full">ACTIVE</Tag>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Started {getRelativeTime(initialMsg.sentAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasUnread && (
                        <Button
                          type="text"
                          size="small"
                          icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                          onClick={() => markReadMutation.mutate(initialMsg.id)}
                          loading={markReadMutation.isPending}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 p-1"
                        >
                          Mark Read
                        </Button>
                      )}
                      <Popconfirm
                        title="Delete conversation?"
                        description="Are you sure you want to delete this conversation thread?"
                        onConfirm={() => deleteConvMutation.mutate(convId)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />}
                          loading={deleteConvMutation.isPending}
                          className="p-1"
                          title="Delete thread"
                        />
                      </Popconfirm>
                    </div>
                  </div>

                  {/* Finder Details Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Contact: <a href={`tel:${initialMsg.senderContact}`} className="text-white font-bold hover:underline">{initialMsg.senderContact}</a></span>
                    </div>

                    {initialMsg.latitude != null && initialMsg.longitude != null && (
                      <a 
                        href={`https://www.google.com/maps?q=${initialMsg.latitude},${initialMsg.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 transition-colors shadow-sm"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        View GPS Location 📍
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>

                  {/* Thread Message History (Chat Bubbles) */}
                  <div className="space-y-3 bg-slate-950/90 p-4 rounded-xl border border-slate-800/60 max-h-56 overflow-y-auto">
                    {threadMsgs.map((msg) => {
                      const isOwner = msg.senderType === 'OWNER';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-bold text-slate-400">
                              {isOwner ? '🏠 You (Owner)' : `🐾 ${msg.senderName}`}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[85%] p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isOwner
                                ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 border border-emerald-500/40 text-emerald-100 rounded-tr-xs'
                                : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.messageText}</p>

                            {msg.latitude != null && msg.longitude != null && (
                              <div className="mt-2 pt-2 border-t border-slate-800/80">
                                <a 
                                  href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:underline"
                                >
                                  <MapPin className="w-3 h-3 text-amber-400" /> Map Coordinates ({msg.latitude.toFixed(4)}, {msg.longitude.toFixed(4)}) 📍
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Canned Quick Replies */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Response Suggestions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_REPLIES.map((reply, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickReplyClick(convId, reply)}
                          className="text-[11px] bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Owner Reply Box */}
                  <div className="pt-2 flex gap-2">
                    <Input
                      value={replyTextMap[convId] || ''}
                      onChange={(e) =>
                        setReplyTextMap({ ...replyTextMap, [convId]: e.target.value })
                      }
                      placeholder="Type a reply to send to the finder..."
                      size="large"
                      className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs flex-1"
                      onPressEnter={() => handleSendReply(convId)}
                    />
                    <Button
                      type="primary"
                      icon={<Send className="w-4 h-4" />}
                      onClick={() => handleSendReply(convId)}
                      loading={replyMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-500 border-none rounded-xl text-xs font-bold h-10 px-5 shadow-lg shadow-emerald-600/20"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-14 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto text-2xl">
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">No finder messages found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {searchQuery 
                  ? "No messages match your search filter." 
                  : `When someone scans ${pet?.name || 'your pet'}'s collar tag and sends an alert, it will instantly show up here.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
