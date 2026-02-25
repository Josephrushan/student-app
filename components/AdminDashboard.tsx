
import React, { useState, useEffect } from 'react';
import { School } from '../types';
import { db, saveDoc, setupListener, removeDoc } from '../services/firebaseService';
import { Plus, School as SchoolIcon, X, LogOut, Loader2, CheckCircle2, Building2, AlertTriangle, Trash2 } from 'lucide-react';
import Logo from './Logo';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolLevel, setNewSchoolLevel] = useState<'Primary' | 'Secondary'>('Primary');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = setupListener('schools', (data) => setSchools(data as School[]));
    return () => unsubscribe();
  }, []);

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    setIsLoading(true);
    const schoolId = `school_${Date.now()}`;
    const newSchool: School = {
      id: schoolId,
      name: newSchoolName.trim(),
      level: newSchoolLevel,
      logoUrl: '' 
    };

    try {
      await saveDoc('schools', schoolId, newSchool);
      setNewSchoolName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to add school:", error);
      alert("Error adding school. Ensure you are correctly authenticated as the system administrator.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!schoolToDelete || deleteConfirmationName !== schoolToDelete.name) return;

    setIsDeleting(true);
    try {
      await removeDoc('schools', schoolToDelete.id);
      setSchoolToDelete(null);
      setDeleteConfirmationName('');
    } catch (error) {
      console.error("Failed to delete school:", error);
      alert("Error deleting institution. Please check permissions.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <Logo size="sm" />
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Admin</p>
            <p className="text-xs font-bold text-slate-900">info@visualmotion.co.za</p>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {schoolToDelete && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-scale-up">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                      <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Destructive Action</h3>
                  <p className="text-slate-500 font-medium mb-6">Are you sure you want to permanently delete this? Type <span className="font-bold text-slate-900 underline">{schoolToDelete.name}</span> to confirm.</p>
                  <input 
                    type="text" 
                    value={deleteConfirmationName} 
                    onChange={e => setDeleteConfirmationName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-red-100 focus:border-red-500 rounded-xl mb-6 outline-none font-bold"
                  />
                  <div className="flex gap-4">
                      <button onClick={() => setSchoolToDelete(null)} className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                      <button 
                        onClick={confirmDelete} 
                        disabled={deleteConfirmationName !== schoolToDelete.name || isDeleting}
                        className="flex-1 py-4 bg-red-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-red-100 disabled:opacity-30 flex items-center justify-center gap-2"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Termination"}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto p-8 space-y-12 overflow-y-auto hide-scrollbar">
        <div className="text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Infrastructure</h1>
          <p className="text-slate-500 mt-3 font-medium text-lg">Provision and manage educational institutions across the network.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center gap-5">
            <div className="p-4 bg-brand-navy rounded-2xl text-white shadow-xl">
              <Plus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Register New School</h2>
          </div>
          
          <form onSubmit={handleAddSchool} className="p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Institution Name</label>
                <div className="relative">
                  <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    required 
                    value={newSchoolName} 
                    onChange={e => setNewSchoolName(e.target.value)}
                    placeholder="e.g. Westside High School" 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-brand-navy rounded-[1.5rem] outline-none font-bold text-lg text-slate-900 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">School Level</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setNewSchoolLevel('Primary')}
                    className={`flex-1 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${newSchoolLevel === 'Primary' ? 'bg-brand-navy border-brand-navy text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-brand-navy/20'}`}
                  >
                    Primary
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewSchoolLevel('Secondary')}
                    className={`flex-1 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${newSchoolLevel === 'Secondary' ? 'bg-brand-navy border-brand-navy text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-brand-navy/20'}`}
                  >
                    High School
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-6 bg-brand-navy text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : success ? <><CheckCircle2 className="w-6 h-6 text-brand-teal" /> Institution Added</> : "Provision System ID"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-8 pb-24 text-left">
          <div className="flex items-center justify-between px-6">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Active Institutions</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full">{schools.length} Registered</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schools.length === 0 ? (
              <div className="col-span-full py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-50 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200 shadow-sm"><SchoolIcon className="w-8 h-8" /></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active school IDs in database</p>
              </div>
            ) : (
              schools.map(school => (
                <div key={school.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-2xl transition-all duration-500 hover:border-brand-navy/20">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-brand-navy transition-all duration-500 shadow-inner">
                      <SchoolIcon className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-black text-slate-900 tracking-tight group-hover:text-brand-navy transition-colors">{school.name}</p>
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1 bg-indigo-50 px-3 py-1 rounded-lg inline-block">{school.level}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSchoolToDelete(school); setDeleteConfirmationName(''); }}
                    className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                    title="Terminate ID"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
