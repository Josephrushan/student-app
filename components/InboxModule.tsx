
import React, { useState, useEffect, useRef } from 'react';
import { User, Conversation, DirectMessage, UserRole } from '../types';
import { Send, Search, User as UserIcon, Trash2, ChevronLeft, MoreVertical, ShieldCheck, Mail, Lock } from 'lucide-react';
import { db, saveDoc, removeDoc, setupListener } from '../services/firebaseService';
import { sendPushNotificationToUser } from '../services/pushNotificationService';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface InboxModuleProps {
  currentUser: User;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const InboxModule: React.FC<InboxModuleProps> = ({ currentUser, conversations, activeConversationId, setActiveConversationId }) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipantId = activeConversation?.participants.find(p => p !== currentUser.id);
  const otherParticipantName = otherParticipantId ? activeConversation.participantNames[otherParticipantId] : 'Unknown';
  const otherParticipantAvatar = otherParticipantId ? activeConversation.participantAvatars[otherParticipantId] : '';

  useEffect(() => {
    if (!activeConversationId || !activeConversation) return;

    // Clear badge when conversation is opened
    if (navigator.setAppBadge) {
      navigator.setAppBadge(0).catch(() => {});
    }

    // We remove the orderBy here to avoid requiring a composite index in the Firebase Console.
    // We will sort the messages on the client side instead.
    const q = query(
      collection(db, 'direct_messages'),
      where('conversationId', '==', activeConversationId),
      where('participants', 'array-contains', currentUser.id)
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectMessage));
      // Sort chronologically on the client side
      const sortedMsgs = msgs.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(sortedMsgs);
    }, (err) => {
      console.error("Direct message listener failed:", err);
    });

    return () => unsub();
  }, [activeConversationId, activeConversation?.id, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending || !activeConversationId || !activeConversation) return;
    setIsSending(true);

    const msgId = `dm_${Date.now()}`;
    const newMsg: DirectMessage = {
      id: msgId,
      conversationId: activeConversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: inputText.trim(),
      timestamp: Date.now(),
      participants: activeConversation.participants
    };

    try {
      await saveDoc('direct_messages', msgId, newMsg);
      await saveDoc('conversations', activeConversationId, {
        ...activeConversation,
        lastMessage: inputText.trim(),
        lastTimestamp: Date.now()
      });
      
      // Send push notification to recipient ONLY
      if (otherParticipantId) {
        console.log(`📨 Sending notification:`);
        console.log(`   From (currentUser.id): ${currentUser.id}`);
        console.log(`   To (otherParticipantId): ${otherParticipantId}`);
        console.log(`   Conversation participants: ${activeConversation.participants.join(', ')}`);
        
        await sendPushNotificationToUser(otherParticipantId, {
          title: `New message from ${currentUser.name}`,
          message: inputText.trim().substring(0, 100),
          icon: '/educater-icon-512.png',
          url: '/inbox'
        }).catch(err => console.error('Push notification failed:', err));
      } else {
        console.warn('⚠️ No otherParticipantId found - notification not sent');
      }
      
      setInputText('');
    } catch (err) {
      console.error("DM failed", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this conversation thread? This action cannot be undone.")) return;
    try {
      await removeDoc('conversations', convId);
      if (activeConversationId === convId) setActiveConversationId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const names = Object.values(c.participantNames).join(' ').toLowerCase();
    return names.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-10rem)] bg-white rounded-[3rem] shadow-sm border border-slate-100 flex overflow-hidden animate-fade-in text-left">
      {/* Sidebar */}
      <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-slate-50`}>
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-[#00ff8e] rounded-full animate-pulse"></div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Direct Inbox</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white border-2 focus:border-indigo-100 rounded-2xl outline-none text-xs font-bold transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-10 text-center opacity-30">
              <Mail className="w-10 h-10 mx-auto mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Active Chats</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const otherId = conv.participants.find(p => p !== currentUser.id);
              const otherName = otherId ? conv.participantNames[otherId] : 'Unknown';
              const otherAvatar = otherId ? conv.participantAvatars[otherId] : '';
              const isActive = conv.id === activeConversationId;

              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full p-4 flex items-center gap-4 transition-all border-b border-slate-50/50 relative group cursor-pointer ${activeConversationId === conv.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'}`}
                >
                  <img src={otherAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=random`} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt="" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-sm font-black text-slate-900 truncate">{otherName}</h4>
                      <span className="text-[9px] font-bold text-slate-300">{new Date(conv.lastTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{conv.lastMessage || 'Start a conversation'}</p>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area - Full Screen on Mobile */}
      {activeConversationId ? (
        <div className="fixed md:relative inset-0 md:inset-auto md:flex-1 flex flex-col bg-white md:bg-slate-50/20 z-[100] md:z-auto pt-safe">
          <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-white border-b border-slate-50 flex items-center justify-between shrink-0 h-16 pt-safe">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveConversationId(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                title="Back to inbox"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <img src={otherParticipantAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipantName)}&background=random`} className="w-10 h-10 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" alt="" />
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-900 leading-tight">{otherParticipantName}</h3>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-[#00ff8e] uppercase tracking-widest mt-0.5">
                  <div className="w-1 h-1 bg-[#00ff8e] rounded-full animate-pulse"></div> Verified
                </div>
              </div>
            </div>
            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical className="w-4 h-4" /></button>
          </div>

          <div className="absolute top-16 left-0 right-0 bottom-32 overflow-y-auto hide-scrollbar p-4 space-y-4">
            <div className="text-center py-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 text-[8px] font-black uppercase text-indigo-400 tracking-widest">
                <Lock className="w-2.5 h-2.5" /> End-to-end Encrypted
              </div>
            </div>

            {messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-[1.75rem] text-sm font-medium leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-[#072432] text-white rounded-tr-none shadow-indigo-100/20' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 mt-1 px-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-50 p-4 pb-safe">
            <form onSubmit={handleSend} className="flex gap-2 items-center bg-slate-100/50 p-2.5 rounded-full">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 min-w-0 px-4 py-3 bg-white outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 rounded-lg"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="shrink-0 bg-[#072432] text-[#00ff8e] p-2.5 rounded-full hover:brightness-110 disabled:opacity-30 shadow-lg transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-12 opacity-30">
          <div className="w-24 h-24 bg-slate-100 rounded-[3rem] flex items-center justify-center mb-6">
            <Mail className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Select a Conversation</h3>
          <p className="text-sm font-bold text-slate-400 max-w-xs uppercase tracking-widest leading-relaxed">Start direct communication with any member of your institutional directory.</p>
        </div>
      )}
    </div>
  );
};

export default InboxModule;
