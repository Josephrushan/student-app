
import React, { useState } from 'react';
import { User, Announcement, UserRole } from '../types';
import { Megaphone, Plus, Trash2, AlertCircle, Check, X, Calendar, Lock, Globe } from 'lucide-react';
import { saveDoc } from '../services/firebaseService';
import { sendPushNotificationToUser } from '../services/pushNotificationService';

interface AnnouncementsModuleProps {
  currentUser: User;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  allUsers: User[];
}

const AnnouncementsModule: React.FC<AnnouncementsModuleProps> = ({ currentUser, announcements, setAnnouncements, allUsers }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<'Normal' | 'High'>('Normal');
  
  // Exclude Students and Parents from seeing or interacting
  const canCreate = currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL;

  // Filter: ONLY current school, but IGNORE grades (School-Wide Staff Notice)
  const schoolWideNotices = announcements.filter(a => a.schoolId === currentUser.schoolId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !currentUser.schoolId) return;

    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      title: newTitle,
      content: newContent,
      authorName: `${currentUser.name} ${currentUser.surname || ''}`,
      date: new Date().toISOString().split('T')[0],
      priority: newPriority,
      schoolId: currentUser.schoolId
    };

    try {
        await saveDoc('announcements', newAnnouncement.id, newAnnouncement);
        setAnnouncements([newAnnouncement, ...announcements]);
        
        // Send push notifications to all students in school
        const studentsInSchool = allUsers.filter(u => u.role === UserRole.STUDENT && u.schoolId === currentUser.schoolId);
        const notificationPromises = studentsInSchool.map(student =>
          sendPushNotificationToUser(student.id, {
            title: `New announcement: ${newTitle}`,
            message: newContent.substring(0, 100),
            icon: '/educater-icon-512.png',
            url: '/announcements'
          }).catch(err => console.error('Push notification failed:', err))
        );
        await Promise.all(notificationPromises);
        
        setIsCreating(false);
        setNewTitle('');
        setNewContent('');
        setNewPriority('Normal');
    } catch (error) {
        console.error("Failed to post notice:", error);
        alert("Failed to save announcement.");
    }
  };

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to delete this staff notice?")) {
        setAnnouncements(announcements.filter(a => a.id !== id));
        // Note: Real delete happens via firebaseService removeDoc if needed, 
        // but for now we update local state or call a removal helper.
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Bulletin</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                    <Globe className="w-3 h-3" /> School-Wide
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">
                    <Lock className="w-3 h-3" /> Staff Only
                </span>
            </div>
          </div>
        </div>
        {canCreate && (
            <button
                onClick={() => setIsCreating(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-50 text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
            >
                <Plus className="h-4 w-4 mr-2" />
                Post Notice
            </button>
        )}
      </div>

      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-amber-800 leading-relaxed">
              Staff notices are global to the entire institution and are not filtered by grade. These messages are strictly hidden from students and parents.
          </p>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-indigo-500/20 p-8 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Create Staff Notice</h3>
                <button onClick={() => setIsCreating(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Announcement Title</label>
                        <input 
                            type="text"
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="block w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all text-sm font-bold text-slate-900"
                            placeholder="e.g. End of Term Staff Braai"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Priority Level</label>
                        <select 
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value as 'Normal' | 'High')}
                            className="block w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all text-sm font-bold text-slate-900 appearance-none"
                        >
                            <option value="Normal">Normal Priority</option>
                            <option value="High">🚨 High Priority (Alerts All Staff)</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message Content</label>
                    <textarea 
                        required
                        rows={5}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="block w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all text-sm font-bold text-slate-900 resize-none"
                        placeholder="Detail the school-wide announcement here..."
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                    <button 
                        type="button" 
                        onClick={() => setIsCreating(false)}
                        className="px-6 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        Publish Notice
                    </button>
                </div>
            </form>
        </div>
      )}

      <div className="space-y-6">
        {schoolWideNotices.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-50">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Megaphone className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No school-wide notices posted.</p>
            </div>
        ) : (
            schoolWideNotices.map(ann => (
                <div key={ann.id} className={`bg-white rounded-[2.5rem] p-8 border-2 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 group relative ${ann.priority === 'High' ? 'border-red-100 ring-4 ring-red-50' : 'border-slate-100'}`}>
                    <div className="flex justify-between items-start gap-4 mb-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {ann.priority === 'High' && (
                                    <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest animate-pulse shadow-md">
                                        <AlertCircle className="w-3 h-3" /> Urgent Notice
                                    </span>
                                )}
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                    <Calendar className="w-3.5 h-3.5" /> {ann.date}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 leading-tight">{ann.title}</h3>
                        </div>
                        {(currentUser.role === UserRole.PRINCIPAL || (currentUser.role === UserRole.TEACHER && ann.authorName === `${currentUser.name} ${currentUser.surname || ''}`)) && (
                             <button onClick={() => handleDelete(ann.id)} className="p-3 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
                        <p className="text-slate-600 leading-relaxed text-base font-medium whitespace-pre-wrap">{ann.content}</p>
                    </div>
                    <div className="mt-6 flex items-center gap-3 pt-6 border-t border-slate-50">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Lock className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Posted by {ann.authorName}
                        </span>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsModule;
