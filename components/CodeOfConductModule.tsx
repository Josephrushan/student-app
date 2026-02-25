
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { ShieldAlert, CheckCircle2, UserCheck, Gavel, Scale, Info, Heart, Users, Edit3, Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { db, saveDoc } from '../services/firebaseService';
import { doc, onSnapshot } from 'firebase/firestore';

interface ConductSection {
  title: string;
  icon: string;
  color: string;
  items: string[];
}

const DEFAULT_SECTIONS: ConductSection[] = [
  {
    title: "Institutional Values",
    icon: "Heart",
    color: "text-pink-600 bg-pink-50",
    items: [
      "Commitment to excellence and academic integrity in all endeavors.",
      "Cultivating an environment of empathy, inclusivity, and shared respect.",
      "Upholding the honor and reputation of the school both on and off-campus.",
      "Practicing honesty and transparency in all community communications."
    ]
  },
  {
    title: "Digital Etiquette",
    icon: "UserCheck",
    color: "text-indigo-600 bg-indigo-50",
    items: [
      "Engaging in constructive, school-related discourse within community feeds.",
      "Protecting the privacy and security of fellow students and staff.",
      "Zero tolerance for cyber-bullying, harassment, or derogatory language.",
      "Respectful use of institution-provided digital resources and tools."
    ]
  },
  {
    title: "Community Standards",
    icon: "Gavel",
    color: "text-amber-600 bg-amber-50",
    items: [
      "Punctuality and active participation in the learning process.",
      "Responsible stewardship of school facilities and common areas.",
      "Adherence to health and safety protocols defined by administration.",
      "Leading by example to inspire positive behavior in others."
    ]
  }
];

const iconMap: Record<string, any> = {
  Heart,
  UserCheck,
  Gavel,
  Scale,
  Users
};

interface CodeOfConductModuleProps {
  currentUser: User;
}

const CodeOfConductModule: React.FC<CodeOfConductModuleProps> = ({ currentUser }) => {
  const [sections, setSections] = useState<ConductSection[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isPrincipal = currentUser.role === UserRole.PRINCIPAL;

  useEffect(() => {
    if (!currentUser.schoolId) return;
    const unsub = onSnapshot(doc(db, `schools/${currentUser.schoolId}/config`, 'conduct'), (snap) => {
        if (snap.exists()) {
            setSections(snap.data().sections || DEFAULT_SECTIONS);
        } else {
            setSections(DEFAULT_SECTIONS);
        }
        setLoading(false);
    });
    return () => unsub();
  }, [currentUser.schoolId]);

  const handleSave = async () => {
    if (!currentUser.schoolId) return;
    setIsSaving(true);
    try {
        await saveDoc(`schools/${currentUser.schoolId}/config`, 'conduct', { sections });
        setIsEditing(false);
    } catch (err) {
        console.error("Failed to save conduct", err);
        alert("Failed to update policy.");
    } finally {
        setIsSaving(false);
    }
  };

  const updateItem = (sIdx: number, iIdx: number, val: string) => {
    const updated = [...sections];
    updated[sIdx].items[iIdx] = val;
    setSections(updated);
  };

  const removeItem = (sIdx: number, iIdx: number) => {
    const updated = [...sections];
    updated[sIdx].items.splice(iIdx, 1);
    setSections(updated);
  };

  const addItem = (sIdx: number) => {
    const updated = [...sections];
    updated[sIdx].items.push("New policy item...");
    setSections(updated);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-teal animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Policy...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 text-left">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Code of Conduct</h2>
      </div>

      {isPrincipal && !isEditing && (
        <button 
          onClick={() => setIsEditing(true)}
          className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 mx-4"
        >
          <Edit3 className="w-5 h-5" /> Edit Standards
        </button>
      )}

      <p className="text-slate-600 text-sm font-medium mb-6 px-4">Institutional standards for a safe, productive, and respectful campus environment in {currentUser.school}.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section, sIdx) => {
          const IconComp = iconMap[section.icon] || Info;
          return (
            <div key={sIdx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-8 relative group">
              <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner bg-[#1a1a1a] text-white">
                <IconComp className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">{section.title}</h3>
                <ul className="space-y-4">
                  {section.items.map((item, iIdx) => (
                    <li key={iIdx} className="flex gap-4 items-start group/item">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#00ff8e] transition-colors shrink-0"></div>
                      <div className="flex-1">
                        {isEditing ? (
                            <div className="flex items-center gap-2 w-full">
                                <textarea 
                                    value={item} 
                                    onChange={(e) => updateItem(sIdx, iIdx, e.target.value)}
                                    rows={2}
                                    className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-[#00ff8e] rounded-xl text-sm font-medium text-slate-700 resize-none outline-none"
                                />
                                <button onClick={() => { if(confirm("Are you sure you want to permanently delete this?")) removeItem(sIdx, iIdx); }} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">{item}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {isEditing && (
                    <button 
                        onClick={() => addItem(sIdx)}
                        className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#00ff8e] hover:text-[#072432] transition-colors"
                    >
                        <Plus className="w-3 h-3" /> Add Standard
                    </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isEditing && (
          <div className="fixed bottom-32 left-0 w-full flex justify-center z-[150] animate-slide-up px-4">
              <div className="bg-[#072432] p-4 rounded-[2rem] shadow-2xl flex items-center gap-6 border border-white/10">
                  <p className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">Policy Draft Mode</p>
                  <div className="flex gap-2">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-[#00ff8e] text-[#072432] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Publish Changes
                    </button>
                  </div>
              </div>
          </div>
      )}

      {!isEditing && (
          <div className="p-12 bg-white border-2 border-dashed border-slate-100 rounded-[3.5rem] text-center">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-inner">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Institutional Compliance</h3>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
              Violations of these standards are addressed by the {currentUser.school} administration. We encourage all members to lead by example and uphold the dignity of our institution.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1a1a] rounded-xl text-white border border-[#1a1a1a]">
                 <CheckCircle2 className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Official Certification</span>
               </div>
               <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1a1a] rounded-xl text-white border border-[#1a1a1a]">
                 <Users className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Community Verified</span>
               </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default CodeOfConductModule;
