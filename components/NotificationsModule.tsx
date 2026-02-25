import React, { useState } from 'react';
import { User, Alert, Comment } from '../types';
import { Bell, MessageCircle, Clock, CheckCircle2, AlertTriangle, Thermometer, UserX, Send, Info, ChevronRight, MessageSquare, History } from 'lucide-react';
import { saveDoc } from '../services/firebaseService';
import { sendPushNotificationToUser } from '../services/pushNotificationService';
import { initializePushNotifications } from '../services/notificationService';

interface NotificationsModuleProps {
  currentUser: User;
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  allUsers: User[];
}

const NotificationsModule: React.FC<NotificationsModuleProps> = ({ currentUser, alerts, setAlerts, allUsers }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleToggle = async () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      await initializePushNotifications();
    } else {
      console.log('Push notifications disabled.');
    }
  };

  const myStudentIds = allUsers.filter(u => u.parentId === currentUser.id).map(u => u.id);
  
  const myActiveAlerts = alerts
    .filter(a => myStudentIds.includes(a.studentId) && !a.resolved)
    .sort((a, b) => b.timestamp - a.timestamp);

  const [replyText, setReplyText] = useState<{[key: string]: string}>({});

  const handleReplyChange = (alertId: string, text: string) => {
      setReplyText({ ...replyText, [alertId]: text });
  };

  const submitReply = async (alertId: string) => {
      const text = replyText[alertId];
      if (!text?.trim()) return;

      const alertToUpdate = alerts.find(a => a.id === alertId);
      if (!alertToUpdate) return;

      const newComment: Comment = {
          id: `c_${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          content: text,
          timestamp: Date.now()
      };

      const updatedAlert = {
          ...alertToUpdate,
          comments: [...alertToUpdate.comments, newComment],
          acknowledged: true 
      };

      try {
          await saveDoc('alerts', alertId, updatedAlert);
          setAlerts(prev => prev.map(a => a.id === alertId ? updatedAlert : a));
          setReplyText({ ...replyText, [alertId]: '' });
          
          // Clear badge when notification is acknowledged
          if (navigator.setAppBadge) {
            navigator.setAppBadge(0).catch(() => {});
          }
      } catch (error) {
          console.error("Failed to submit reply:", error);
      }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* High-Impact Theme Header */}
      <div className="relative bg-[#072432] rounded-[3.5rem] p-10 md:p-16 text-white overflow-hidden shadow-2xl shadow-slate-200 text-left mb-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ff8e]/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <Bell className="w-4 h-4 text-[#00ff8e]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Access</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight text-white">Parents <span className="text-[#00ff8e]">Portal.</span></h2>
          <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl">
            Secure family gateway for real-time academic updates and direct communication with school leadership.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {myActiveAlerts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-50 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">System Clear</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">No high-priority notifications are pending for your linked accounts.</p>
            </div>
        ) : (
            <div className="space-y-10">
                {myActiveAlerts.map(alert => (
                    <div key={alert.id} className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 overflow-hidden animate-fade-in transition-all duration-300 relative hover:shadow-xl hover:shadow-slate-200/50">
                        <div className={`h-2 w-full ${alert.type === 'Absent' ? 'bg-red-500' : 'bg-amber-500'}`}></div>

                        <div className="p-8">
                            <div className="flex items-start justify-between gap-6">
                                  <div className="flex items-start gap-5">
                                      <div className={`p-4 rounded-3xl shrink-0 shadow-sm ${
                                          alert.type === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                      }`}>
                                          {alert.type === 'Absent' ? <UserX className="w-8 h-8" /> : <Thermometer className="w-8 h-8" />}
                                      </div>
                                      <div className="text-left">
                                          <div className="flex items-center gap-3 mb-2">
                                              <h3 className="text-2xl font-black text-slate-900 leading-none">
                                                  {alert.type === 'Absent' ? 'Absence Alert' : 'Sick Alert'}
                                              </h3>
                                          </div>
                                          <p className="text-slate-600 font-medium leading-relaxed">
                                              A report for <span className="font-black text-indigo-700">{alert.studentName}</span> was logged by <span className="font-bold text-slate-800">{alert.teacherName}</span>.
                                          </p>
                                          <div className="flex items-center gap-4 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(alert.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                              <span className="text-slate-200">•</span>
                                              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{alert.grade}</span>
                                          </div>
                                      </div>
                                  </div>
                            </div>

                            <div className="mt-10 bg-slate-50/80 rounded-[2rem] p-8 border border-slate-100">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                      <MessageSquare className="w-4 h-4" /> Secure Thread
                                  </h4>
                                  
                                  {alert.comments.length > 0 ? (
                                      <div className="space-y-6 mb-8">
                                          {alert.comments.map(comment => {
                                              const isMe = comment.authorId === currentUser.id;
                                              return (
                                                  <div key={comment.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-2">{comment.authorName}</span>
                                                          <div className={`p-4 rounded-2xl text-sm font-bold leading-relaxed ${
                                                              isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-200 shadow-sm'
                                                          }`}>
                                                              {comment.content}
                                                          </div>
                                                      </div>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  ) : (
                                      <div className="flex flex-col items-center justify-center py-6 text-center">
                                          <p className="text-sm font-bold text-slate-400 italic">Initiate communication with the school below.</p>
                                      </div>
                                  )}
                                  
                                  <div className="relative mt-4">
                                      <input 
                                          type="text" 
                                          value={replyText[alert.id] || ''}
                                          onChange={(e) => handleReplyChange(alert.id, e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && submitReply(alert.id)}
                                          className="w-full pl-6 pr-16 py-5 rounded-[1.5rem] bg-white border-2 border-transparent focus:border-indigo-500 shadow-sm outline-none transition-all text-sm font-bold placeholder:text-slate-400"
                                          placeholder="Type a response..."
                                      />
                                      <button 
                                          onClick={() => submitReply(alert.id)}
                                          disabled={!replyText[alert.id]?.trim()}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                                      >
                                          <Send className="w-5 h-5" />
                                      </button>
                                  </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsModule;
