
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User, UserRole } from '../types';
import { Send, User as UserIcon, ShieldCheck, Trash2, Smile, Crown, ChevronDown, Lock, Search } from 'lucide-react';
import { GRADES } from '../constants';
import { saveDoc, removeDoc } from '../services/firebaseService';

interface ChatModuleProps {
  currentUser: User;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onViewInDirectory: (name: string) => void;
}

const ChatModule: React.FC<ChatModuleProps> = ({ currentUser, messages, setMessages, onViewInDirectory }) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>(currentUser.role === UserRole.PRINCIPAL ? "Grade 8" : currentUser.grade);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const activeGrade = currentUser.role === UserRole.PRINCIPAL ? selectedGrade : currentUser.grade;
  const filteredMessages = messages.filter(m => m.grade === activeGrade);

  // Auto-scroll to bottom on initial load, then allow manual scrolling
  useEffect(() => {
    if (isInitialLoad && filteredMessages.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        setIsInitialLoad(false);
      }, 100);
    }
  }, [isInitialLoad, filteredMessages.length]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending || currentUser.role === UserRole.STUDENT) return;
    setIsSending(true);
    const mid = Date.now().toString();
    const msg: ChatMessage = { 
        id: mid, 
        senderId: currentUser.id, 
        senderName: currentUser.name, 
        role: currentUser.role, 
        content: inputText.trim(), 
        timestamp: Date.now(), 
        grade: activeGrade, 
        schoolId: currentUser.schoolId || '' 
    };
    try { 
        await saveDoc('messages', mid, msg); 
        setInputText(''); 
    } catch (e) {
        console.error("Chat send failed", e);
    } finally { 
        setIsSending(false); 
    }
  };

  const handleDelete = async (mid: string) => {
      if (!confirm("Are you sure you want to permanently delete this?")) return;
      try {
          await removeDoc('messages', mid);
      } catch (err) {
          console.error("Delete failed", err);
      }
  };

  const canDelete = (msg: ChatMessage) => {
      if (currentUser.role === UserRole.PRINCIPAL) return true;
      if (msg.senderId === currentUser.id) return true;
      return false;
  };

  return (
    <div className="h-[calc(100vh-10rem)] bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden animate-fade-in">
      <div className="sticky top-0 z-20 px-8 py-4 border-b border-slate-50 bg-white flex justify-between items-center shrink-0">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00ff8e] rounded-full animate-pulse"></div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Community Feed</p>
          </div>
        </div>
        {currentUser.role === UserRole.PRINCIPAL && (
          <div className="flex items-center justify-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Grade:</label>
            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="pl-4 py-1 pr-6 bg-black border border-black rounded-full text-xs font-bold text-white cursor-pointer hover:bg-slate-800 transition-all appearance-none"
            >
              {GRADES.slice(7).map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 hide-scrollbar" ref={scrollContainerRef}>
        {filteredMessages.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6 text-slate-300" />
               </div>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Secure Channel Ready</p>
           </div>
        ) : filteredMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isStaff = msg.role === UserRole.TEACHER || msg.role === UserRole.PRINCIPAL;
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
              <div className={`flex max-w-[85%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                <div className="shrink-0 mt-0.5">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=00ff8e&color=072432`} 
                    className="w-8 h-8 rounded-2xl shadow-sm border-2 border-white" 
                    alt="" 
                  />
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1 text-[8px]">
                    <span className={`font-black uppercase tracking-widest text-slate-400`}>
                        {msg.senderName} {isStaff && '• S'}
                    </span>
                    <span className="text-slate-300 font-bold">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className="relative">
                    <div className={`px-4 py-2 rounded-[1.75rem] text-sm font-medium leading-relaxed shadow-sm transition-all ${
                        isMe 
                          ? 'bg-[#072432] text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                        {msg.content}
                    </div>
                    
                    {canDelete(msg) && (
                        <button 
                            onClick={() => handleDelete(msg.id)}
                            className={`absolute -bottom-2 ${isMe ? '-left-6' : '-right-6'} p-1 bg-white text-slate-300 hover:text-red-500 rounded-lg shadow-sm border border-slate-50 transition-all opacity-0 group-hover:opacity-100`}
                            title="Delete message"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 z-20 p-3 bg-white border-t border-slate-50 shrink-0">
        {currentUser.role === UserRole.STUDENT ? (
          <div className="py-2 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 rounded-full italic">Read-only access</div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-1.5 items-center bg-slate-100/50 p-1 rounded-full w-full">
             <input 
                type="text" 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                placeholder="Message..." 
                className="flex-1 min-w-0 px-3 py-2 bg-transparent outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400" 
             />
             <button 
                type="submit" 
                disabled={!inputText.trim() || isSending} 
                className="shrink-0 bg-[#072432] text-[#00ff8e] p-2.5 rounded-full hover:brightness-110 disabled:opacity-30 shadow-lg active:scale-95 transition-all"
             >
                <Send className="w-4 h-4" />
             </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatModule;
