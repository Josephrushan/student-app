import React, { useState, useMemo } from 'react';
import { User, Alert, AlertType, UserRole, Comment } from '../types';
import { Search, Bell, Clock, CheckCircle2, UserX, Thermometer, MessageSquare, ChevronRight, Plus, X, Loader2, User as UserIcon, Send } from 'lucide-react';
import { saveDoc, removeDoc } from '../services/firebaseService';
import { sendPushNotificationToUser } from '../services/pushNotificationService';

interface AlertsModuleProps {
  currentUser: User;
  allUsers: User[];
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
}

const AlertsModule: React.FC<AlertsModuleProps> = ({ currentUser, allUsers, alerts, setAlerts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingAlertId, setViewingAlertId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{[key: string]: string}>({});

  const canLog = currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL;

  const activeAlerts = alerts
    .filter(a => a.schoolId === currentUser.schoolId && !a.resolved)
    .sort((a, b) => b.timestamp - a.timestamp);

  const studentsInSchool = useMemo(() => {
      return allUsers.filter(u => u.role === UserRole.STUDENT && u.schoolId === currentUser.schoolId);
  }, [allUsers, currentUser.schoolId]);

  const searchedStudents = useMemo(() => {
      const term = studentSearch.toLowerCase().trim();
      if (!term) return [];
      return studentsInSchool.filter(s => 
          `${s.name} ${s.surname}`.toLowerCase().includes(term) || 
          s.idNumber?.includes(term)
      ).slice(0, 5);
  }, [studentSearch, studentsInSchool]);

  const handleLogStatus = async (type: AlertType) => {
      if (!selectedStudent || isSubmitting) return;
      setIsSubmitting(true);
      
      const alertId = `alert_${Date.now()}`;
      const newAlert: Alert = {
          id: alertId,
          studentId: selectedStudent.id,
          studentName: `${selectedStudent.name} ${selectedStudent.surname || ''}`,
          teacherId: currentUser.id,
          teacherName: `${currentUser.name} ${currentUser.surname || ''}`,
          type,
          date: new Date().toLocaleDateString(),
          timestamp: Date.now(),
          grade: selectedStudent.grade,
          comments: [],
          acknowledged: false,
          resolved: false,
          schoolId: currentUser.schoolId || ''
      };

      try {
          await saveDoc('alerts', alertId, newAlert);
          
          // Get student's parent
          const studentParent = allUsers.find(u => u.id === selectedStudent.parentId);
          if (studentParent) {
            await sendPushNotificationToUser(studentParent.id, {
              title: `New alert for ${selectedStudent.name}`,
              message: `${newAlert.type} alert on ${newAlert.date}`,
              icon: '/educater-icon-512.png',
              url: '/notifications'
            }).catch(err => console.error('Push notification failed:', err));
          }
          
          setIsLogging(false);
          setSelectedStudent(null);
          setStudentSearch('');
      } catch (err) {
          alert("Failed to log status. Please try again.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleResolve = async (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!confirm("Are you sure you want to permanently delete this?")) return;
      try {
          await removeDoc('alerts', id);
          if (viewingAlertId === id) setViewingAlertId(null);
      } catch (err) {
          console.error(err);
      }
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
        comments: [...(alertToUpdate.comments || []), newComment]
    };

    try {
        await saveDoc('alerts', alertId, updatedAlert);
        setReplyText({ ...replyText, [alertId]: '' });
    } catch (error) {
        console.error("Failed to submit reply:", error);
    }
  };

  const selectedAlert = activeAlerts.find(a => a.id === viewingAlertId);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 text-left">
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Alerts</h2>
      </div>

      {canLog && (
        <button onClick={() => setIsLogging(true)} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 mx-4">
          <Plus className="w-5 h-5" /> Log Student Status
        </button>
      )}

      {isLogging && (
          <div className="fixed inset-0 z-[250] bg-white/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsLogging(false)}>
              <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Log New Alert</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mark a student absent or sick</p>
                      </div>
                      <button onClick={() => setIsLogging(false)} className="p-2.5 bg-black border border-black rounded-2xl text-white hover:brightness-90 transition-colors"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="p-10 space-y-8">
                      {!selectedStudent ? (
                          <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Search Student Registry</label>
                              <div className="relative">
                                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                  <input 
                                    type="text"
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-[#00ff8e] rounded-[1.5rem] outline-none font-bold text-lg"
                                    placeholder="Enter student name..."
                                    autoFocus
                                  />
                              </div>
                              <div className="space-y-2">
                                  {searchedStudents.map(s => (
                                      <button 
                                        key={s.id}
                                        onClick={() => setSelectedStudent(s)}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 hover:border-[#00ff8e] hover:shadow-md rounded-2xl transition-all group"
                                      >
                                          <div className="flex items-center gap-4">
                                              <img src={s.avatar} className="w-10 h-10 rounded-xl" alt="" />
                                              <div className="text-left">
                                                  <p className="font-black text-slate-800">{s.name} {s.surname}</p>
                                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.grade} • Class {s.classLetter}</p>
                                              </div>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-[#00ff8e]" />
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-10 animate-fade-in">
                              <div className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-gray-100">
                                  <img src={selectedStudent.avatar} className="w-20 h-20 rounded-[1.5rem] border-4 border-white shadow-lg" alt="" />
                                  <div className="text-left">
                                      <h4 className="text-sm font-black text-gray-900 leading-tight">{selectedStudent.name} {selectedStudent.surname}</h4>
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedStudent.grade} Student</p>
                                      <button onClick={() => setSelectedStudent(null)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:underline">Change Selection</button>
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-8">
                                  <button 
                                    onClick={() => handleLogStatus('Absent')}
                                    disabled={isSubmitting}
                                    className="flex flex-col items-center gap-3 disabled:opacity-50 active:scale-95 transition-all"
                                  >
                                      <div className="w-20 h-20 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors shadow-sm">
                                          <UserX className="w-10 h-10 text-gray-600" />
                                      </div>
                                      <span className="font-black uppercase text-xs tracking-widest text-black">Mark Absent</span>
                                  </button>
                                  <button 
                                    onClick={() => handleLogStatus('Sick')}
                                    disabled={isSubmitting}
                                    className="flex flex-col items-center gap-3 disabled:opacity-50 active:scale-95 transition-all"
                                  >
                                      <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-md hover:bg-white/50 flex items-center justify-center transition-colors shadow-sm">
                                          <Thermometer className="w-10 h-10 text-[#00ff8e]" />
                                      </div>
                                      <span className="font-black uppercase text-xs tracking-widest text-black">Mark Sick</span>
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {selectedAlert && (
          <div className="fixed inset-0 z-[250] bg-white/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingAlertId(null)}>
              <div className="bg-white w-full max-w-xl h-full max-h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                  <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-left">
                          <div className={`p-3 rounded-2xl ${selectedAlert.type === 'Absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                             {selectedAlert.type === 'Absent' ? <UserX className="w-6 h-6" /> : <Thermometer className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 leading-none">{selectedAlert.studentName}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Logged {selectedAlert.date}</p>
                          </div>
                      </div>
                      <button onClick={() => setViewingAlertId(null)} className="p-2.5 bg-black border border-black rounded-2xl text-white hover:brightness-90 transition-colors"><X className="w-6 h-6" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                      <div className="text-center py-4 px-8 bg-indigo-50 rounded-2xl mb-8">
                         <p className="text-xs font-bold text-indigo-700">Parents have been notified. Use this channel to coordinate details.</p>
                      </div>

                      {(selectedAlert.comments || []).map(comment => {
                          const isMe = comment.authorId === currentUser.id;
                          return (
                              <div key={comment.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-2">{comment.authorName}</span>
                                      <div className={`p-4 rounded-2xl text-sm font-bold ${isMe ? 'bg-[#072432] text-[#00ff8e] rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                                          {comment.content}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                      {(!selectedAlert.comments || selectedAlert.comments.length === 0) && (
                        <div className="text-center py-12 opacity-30 italic"><p className="text-sm font-bold uppercase tracking-widest">No communication yet</p></div>
                      )}
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-white">
                      <div className="relative">
                          <input 
                            type="text" 
                            value={replyText[selectedAlert.id] || ''}
                            onChange={e => setReplyText({ ...replyText, [selectedAlert.id]: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && submitReply(selectedAlert.id)}
                            placeholder="Type a message to parents..."
                            className="w-full pl-6 pr-16 py-5 rounded-[1.5rem] bg-slate-100 border-2 border-transparent focus:border-brand-navy outline-none font-bold text-sm"
                          />
                          <button onClick={() => submitReply(selectedAlert.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-[#072432] text-[#00ff8e] rounded-2xl shadow-lg active:scale-95 transition-all">
                              <Send className="w-5 h-5" />
                          </button>
                      </div>
                      <button onClick={() => handleResolve(selectedAlert.id)} className="w-full mt-4 py-3 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all">Resolve & Permanent Delete</button>
                  </div>
              </div>
          </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                 <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Active Cases</h3>
                 <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input type="text" placeholder="Filter alerts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00ff8e] rounded-2xl text-sm font-bold" />
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 italic leading-relaxed">Alerts notify linked parents immediately and open a private chat channel.</p>
             </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
              {activeAlerts.length === 0 ? (
                  <div className="py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-50 text-center">
                      <CheckCircle2 className="w-16 h-16 text-[#00ff8e] mx-auto mb-4 opacity-20" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All students are currently accounted for.</p>
                  </div>
              ) : (
                  activeAlerts.filter(a => a.studentName.toLowerCase().includes(searchTerm.toLowerCase())).map(alert => (
                      <div key={alert.id} onClick={() => setViewingAlertId(alert.id)} className="bg-white p-8 rounded-[3rem] border-2 border-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-xl transition-all duration-300 cursor-pointer">
                          <div className="flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${alert.type === 'Absent' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                  {alert.type === 'Absent' ? <UserX className="w-8 h-8" /> : <Thermometer className="w-8 h-8" />}
                              </div>
                              <div className="text-left">
                                  <h4 className="text-xl font-black text-slate-900">{alert.studentName}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${alert.type === 'Absent' ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>{alert.type}</span>
                                      <span className="text-slate-200">•</span>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alert.date}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className="flex -space-x-2">
                                  {(alert.comments || []).slice(0, 3).map((c, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#00ff8e] flex items-center justify-center text-[#072432] text-[8px] font-black">{c.authorName.charAt(0)}</div>
                                  ))}
                                  {(alert.comments || []).length > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400 text-[8px] font-black">+{alert.comments.length - 3}</div>
                                  )}
                              </div>
                              <button className="flex-1 md:flex-none px-8 py-4 bg-[#072432] text-[#00ff8e] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl group-hover:scale-105 transition-all">View Thread</button>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default AlertsModule;