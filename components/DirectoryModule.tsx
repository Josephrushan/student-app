
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  ChevronRight, 
  User as UserIcon, 
  MessageSquare, 
  X, 
  Baby, 
  Quote, 
  Info, 
  ExternalLink, 
  CheckCircle2,
  BookOpen,
  Briefcase,
  Heart,
  ShieldAlert,
  GraduationCap,
  Building
} from 'lucide-react';

interface DirectoryModuleProps {
  currentUser: User;
  allUsers: User[];
  initialSearch?: string;
  onSearchChange?: (val: string) => void;
  onMessageUser?: (userId: string) => void;
}

const DirectoryModule: React.FC<DirectoryModuleProps> = ({ currentUser, allUsers, initialSearch = '', onSearchChange, onMessageUser }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);

  useEffect(() => {
      setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredUsers = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    
    // Pool should only contain users from the SAME school
    const pool = allUsers.filter(u => {
        if (!u || u.schoolId !== currentUser.schoolId || u.id === currentUser.id) return false;
        return true;
    });

    if (!term) {
        // Default view: people in the same grade context sorted by name
        return pool.filter(u => u.grade === currentUser.grade).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return pool.filter(user => {
        const fullName = `${user.name || ''} ${user.surname || ''}`.toLowerCase();
        
        // 1. Direct name match
        if (fullName.includes(term)) return true;

        // 2. Parent-by-student match
        if (user.role === UserRole.PARENT) {
            const children = allUsers.filter(u => u.parentId === user.id);
            const childMatch = children.some(child => 
                `${child.name || ''} ${child.surname || ''}`.toLowerCase().includes(term)
            );
            if (childMatch) return true;
        }

        // 3. Educator-by-subject match
        if (user.role === UserRole.TEACHER || user.role === UserRole.PRINCIPAL) {
            const subjectMatch = user.selectedSubjects?.some(subject => 
                (subject || '').toLowerCase().includes(term)
            );
            if (subjectMatch) return true;
        }

        return false;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [searchTerm, allUsers, currentUser]);

  const getChildren = (parentId: string) => {
    return allUsers.filter(u => u.parentId === parentId && u.role === UserRole.STUDENT);
  };

  const getChildrenNames = (parentId: string) => {
    return getChildren(parentId)
      .map(u => `${u.name || ''} ${u.surname || ''}`)
      .join(', ');
  };

  const handleSearchTermChange = (val: string) => {
      setSearchTerm(val);
      if (onSearchChange) onSearchChange(val);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-32">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">School Directory</h2>
      </div>

      <button className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all mb-6 mx-4">
        Verified Connections
      </button>

      <p className="text-slate-600 text-sm font-medium mb-6 px-4">Secure access to contact details for every <span className="text-[#00ff8e] font-black">Educator</span>, <span className="text-[#00ff8e] font-black">Parent</span> and <span className="text-[#00ff8e] font-black">Peer</span> in the {currentUser.school} community.</p>

      <div className="relative w-full mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Search name , student or School"
          value={searchTerm}
          onChange={(e) => handleSearchTermChange(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 bg-white rounded-full text-slate-700 placeholder-slate-400 font-medium text-sm outline-none shadow-md transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchTermChange('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
              <Search className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight">No results found</h3>
            <p className="text-sm text-slate-400 mt-2 italic px-8">Try searching by first name, surname, or a linked student.</p>
          </div>
        ) : (
          filteredUsers.map(profile => {
            const isStaff = profile.role === UserRole.TEACHER || profile.role === UserRole.PRINCIPAL;
            const isStudent = profile.role === UserRole.STUDENT;
            
            return (
                <div key={profile.id} className="bg-white p-8 rounded-[3rem] border-2 border-white shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col text-left">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img 
                                src={profile.avatar} 
                                alt={profile.name} 
                                className="w-28 h-28 rounded-[2.5rem] object-cover bg-slate-50 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${profile.name}&background=random`; }}
                            />
                            {isStaff && (
                                <div className="absolute -bottom-2 -right-2 bg-[#00ff8e] p-2 rounded-xl shadow-lg border-2 border-white">
                                    <GraduationCap className="w-4 h-4 text-[#072432]" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-black text-slate-900 truncate mb-1 group-hover:text-[#072432] transition-colors">{profile.name} {profile.surname}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-sm">
                                    {isStudent ? 'Peer' : profile.role}
                                </span>
                                {!isStudent && (
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                        <Building className="w-3 h-3" /> {profile.grade}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4 flex-1">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {profile.role === UserRole.PARENT ? (
                                <>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Baby className="w-3 h-3" /> Linked Students</p>
                                    <p className="text-xs font-bold text-slate-700 truncate">{getChildren(profile.id).length > 0 ? getChildrenNames(profile.id) : 'No linked students'}</p>
                                </>
                            ) : isStaff ? (
                                <>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Position</p>
                                    <p className="text-xs font-bold text-slate-700 truncate">{profile.role} @ {profile.school}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Baby className="w-3 h-3" /> Profile</p>
                                    <p className="text-xs font-bold text-slate-700 truncate">Student at {profile.school}</p>
                                </>
                            )}
                        </div>
                        
                        {(profile.role === UserRole.TEACHER || profile.role === UserRole.PRINCIPAL) && profile.selectedSubjects && profile.selectedSubjects.length > 0 && (
                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Specialization</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {profile.selectedSubjects.map(s => (
                                        <span key={s} className="text-[8px] font-black uppercase bg-white text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profile.funFact && (
                            <div className="relative p-4 bg-slate-50/50 rounded-2xl italic">
                                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-slate-100 rotate-180" />
                                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">"{profile.funFact}"</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-3">
                        <button 
                            onClick={() => setSelectedProfile(profile)}
                            className="flex-1 py-3.5 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                            View Details
                        </button>
                        <button 
                            onClick={() => onMessageUser && onMessageUser(profile.id)}
                            className="p-3.5 bg-[#1a1a1a] text-white rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            );
          })
        )}
      </div>

      {selectedProfile && (
          <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedProfile(null)}>
              <div className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl animate-scale-up border border-white/10" onClick={e => e.stopPropagation()}>
                  <div className="bg-[#072432] h-32 relative">
                      <button onClick={() => setSelectedProfile(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="px-10 pb-12 flex flex-col items-center relative">
                      <img src={selectedProfile.avatar} className="w-40 h-40 rounded-[3rem] border-8 border-white -mt-20 shadow-2xl mb-6 object-cover relative z-10" alt="" />
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedProfile.name} {selectedProfile.surname}</h2>
                      <span className="px-6 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest mt-3 border border-indigo-100">{selectedProfile.role}</span>
                      
                      <div className="w-full mt-10 space-y-4">
                          <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                              <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400"><Mail className="w-5 h-5" /></div>
                              <div className="text-left"><p className="text-[9px] font-black uppercase text-slate-400">Email Contact</p><p className="text-sm font-bold text-slate-800">{selectedProfile.email || 'Private'}</p></div>
                          </div>
                          {selectedProfile.contactNumber && (
                              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                                  <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400"><Phone className="w-5 h-5" /></div>
                                  <div className="text-left"><p className="text-[9px] font-black uppercase text-slate-400">Mobile Number</p><p className="text-sm font-bold text-slate-800">{selectedProfile.contactNumber}</p></div>
                              </div>
                          )}
                          <div className="flex items-center gap-4 p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                              <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-400"><Building className="w-5 h-5" /></div>
                              <div className="text-left"><p className="text-[9px] font-black uppercase text-indigo-400">Affiliation</p><p className="text-sm font-bold text-indigo-900">{selectedProfile.grade} • {selectedProfile.school}</p></div>
                          </div>
                      </div>

                      <button 
                        onClick={() => { onMessageUser && onMessageUser(selectedProfile.id); setSelectedProfile(null); }}
                        className="w-full mt-10 py-6 bg-[#072432] text-[#00ff8e] rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
                      >
                          <MessageSquare className="w-5 h-5" /> Start Private Chat
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DirectoryModule;
