
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, UserRole, Alert, School } from '../types';
import { NotificationSubscribeButton } from './NotificationSubscribeButton';
import { 
  Camera, 
  Edit2, 
  Save, 
  User as UserIcon, 
  Star, 
  Users, 
  GraduationCap, 
  X, 
  Mail, 
  Phone, 
  Baby, 
  UserPlus, 
  Activity,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Building,
  Upload,
  Lock,
  CreditCard,
  ChevronDown,
  Check,
  Settings,
  Eye,
  School as SchoolIcon,
  BookOpen,
  Heart,
  AlertCircle,
  Image as ImageIcon,
  Bell
} from 'lucide-react';
import { uploadImage, saveDoc, patchDoc, createSecondaryAuthUser } from '../services/firebaseService';
import { compressImage } from '../services/imageCompressionService';
import { GRADES, CLASSES, PRIMARY_SUBJECTS, HIGH_SCHOOL_SUBJECTS, PRIMARY_GRADES, SECONDARY_GRADES } from '../constants';

interface ProfileModuleProps {
  currentUser: User;
  allUsers: User[];
  onUpdateProfile: (updatedUser: User) => void;
  onAddStudent?: (student: User) => void;
  alerts?: Alert[];
  setAlerts?: React.Dispatch<React.SetStateAction<Alert[]>>;
  onGradeChange?: (grade: string) => void;
}

const ProfileModule: React.FC<ProfileModuleProps> = ({ 
  currentUser, 
  allUsers, 
  onUpdateProfile,
  onAddStudent,
  alerts,
  setAlerts,
  onGradeChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingChildSubjects, setEditingChildSubjects] = useState<User | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [addStudentError, setAddStudentError] = useState('');
  
  const [name, setName] = useState(currentUser.name);
  const [surname, setSurname] = useState(currentUser.surname || '');
  const [funFact, setFunFact] = useState(currentUser.funFact || '');
  const [contactNumber, setContactNumber] = useState(currentUser.contactNumber || '');
  const [staffSubjects, setStaffSubjects] = useState<string[]>(currentUser.selectedSubjects || []);
  
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentSurname, setNewStudentSurname] = useState(currentUser.surname || '');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState(currentUser.grade);
  const [newStudentClass, setNewStudentClass] = useState(CLASSES[0]);
  const [newStudentIdNumber, setNewStudentIdNumber] = useState('');
  const [newStudentAllergens, setNewStudentAllergens] = useState('');
  const [newStudentSubjects, setNewStudentSubjects] = useState<string[]>([]);

  const [tempChildSubjects, setTempChildSubjects] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const schoolLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNewStudentGrade(currentUser.grade);
  }, [currentUser.grade]);

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    const updated = { 
        ...currentUser, 
        name, 
        surname, 
        funFact, 
        contactNumber: contactNumber.trim(),
        selectedSubjects: staffSubjects
    };
    onUpdateProfile(updated);
    setIsEditing(false);
    setIsSubmitting(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        // Compress image before uploading
        const compressedFile = await compressImage(e.target.files[0]);
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target?.result) {
            const avatarUrl = await uploadImage(`users/${currentUser.id}/avatar`, event.target.result as string);
            onUpdateProfile({ ...currentUser, avatar: avatarUrl });
          }
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Failed to process photo:', error);
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingCover(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const coverUrl = await uploadImage(`users/${currentUser.id}/cover`, event.target.result as string);
            onUpdateProfile({ ...currentUser, coverImage: coverUrl });
          } catch (error) {
            console.error("Cover upload failed", error);
          } finally {
            setIsUploadingCover(false);
          }
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSchoolLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && currentUser.schoolId) {
          setIsUploadingLogo(true);
          const reader = new FileReader();
          reader.onload = async (event) => {
              if (event.target?.result) {
                  try {
                      const logoUrl = await uploadImage(`schools/${currentUser.schoolId}/logo`, event.target.result as string);
                      console.log('✅ Logo uploaded successfully:', logoUrl);
                      
                      await patchDoc('schools', currentUser.schoolId!, { logoUrl });
                      console.log('✅ School document updated');
                      
                      onUpdateProfile({ ...currentUser, schoolLogo: logoUrl });
                      alert("Institution logo updated successfully!");
                  } catch (error) {
                      console.error("School logo upload failed", error);
                      alert("Failed to update school logo. Please check permissions.");
                  } finally {
                      setIsUploadingLogo(false);
                  }
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStudentError('');
    if (!onAddStudent || !newStudentName || !newStudentEmail || !newStudentPassword) {
      setAddStudentError("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
        const authCredential = await createSecondaryAuthUser(
            newStudentEmail.toLowerCase().trim(), 
            newStudentPassword
        );
        
        const studentId = authCredential.user.uid;

        const newStudent: User = {
            id: studentId,
            name: newStudentName,
            surname: newStudentSurname,
            email: newStudentEmail.toLowerCase().trim(),
            password: newStudentPassword, 
            role: UserRole.STUDENT,
            grade: currentUser.grade, 
            classLetter: newStudentClass,
            school: currentUser.school || '',
            schoolId: currentUser.schoolId || '',
            schoolLogo: currentUser.schoolLogo || '',
            parentId: currentUser.id,
            idNumber: newStudentIdNumber,
            allergens: newStudentAllergens,
            selectedSubjects: newStudentSubjects,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudentName + ' ' + (newStudentSurname || ''))}&background=random`,
            isPaid: true // Student accounts under paid parent are automatically active
        };

        // This call triggers saveDoc in App.tsx
        await onAddStudent(newStudent);
        
        setIsAddingStudent(false);
        setNewStudentName('');
        setNewStudentEmail('');
        setNewStudentPassword('');
        setNewStudentIdNumber('');
        setNewStudentAllergens('');
        setNewStudentSubjects([]);
    } catch (error: any) {
        console.error("Failed to add student:", error);
        if (error.code === 'auth/email-already-in-use') {
            setAddStudentError("This email address is already registered.");
        } else if (error.code === 'auth/weak-password') {
            setAddStudentError("Password should be at least 6 characters.");
        } else {
            setAddStudentError("Failed to create child profile. Please check connection.");
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleUpdateChildSubjects = async () => {
    if (!editingChildSubjects) return;
    setIsSubmitting(true);
    try {
      const updatedChild = { ...editingChildSubjects, selectedSubjects: tempChildSubjects };
      await saveDoc('users', updatedChild.id, updatedChild);
      setEditingChildSubjects(null);
    } catch (error) {
      console.error("Failed to update child subjects:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubject = (subject: string, currentList: string[], setter: (val: string[]) => void) => {
    if (currentList.includes(subject)) {
      setter(currentList.filter(s => s !== subject));
    } else {
      setter([...currentList, subject]);
    }
  };

  const myChildren = allUsers.filter(u => u.parentId === currentUser.id && u.role === UserRole.STUDENT);
  
  const getSubjectList = (grade: string) => {
    return PRIMARY_GRADES.includes(grade) ? PRIMARY_SUBJECTS : HIGH_SCHOOL_SUBJECTS;
  };

  const availableGradesForSwitch = useMemo(() => {
    if (currentUser.role === UserRole.PRINCIPAL) {
        return currentUser.allowedGrades || (PRIMARY_GRADES.includes(currentUser.grade) ? PRIMARY_GRADES : SECONDARY_GRADES);
    }
    if (currentUser.role === UserRole.TEACHER) {
        return currentUser.allowedGrades || [currentUser.grade];
    }
    return [currentUser.grade];
  }, [currentUser]);

  const hasMultipleGrades = availableGradesForSwitch.length > 1;

  const inputClasses = "w-full px-8 py-6 bg-slate-100/50 border-2 border-transparent focus:border-slate-800 focus:bg-white rounded-[2.5rem] outline-none transition-all text-2xl font-black text-slate-800 placeholder:text-slate-500 placeholder:font-bold placeholder:text-sm";

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto max-h-screen overflow-y-auto hide-scrollbar">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-white h-48 relative overflow-hidden group">
          {currentUser.coverImage && (
            <img src={currentUser.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          )}
          <button onClick={() => coverInputRef.current?.click()} className="absolute top-4 right-4 p-3 bg-[#1a1a1a] text-white rounded-full shadow-xl hover:scale-110 transition-all active:scale-95"><Edit2 className="w-5 h-5" /></button>
          <input type="file" ref={coverInputRef} onChange={handleCoverUpload} className="hidden" accept="image/*" />
        </div>

        <div className="relative px-8 pb-10 flex flex-col items-center">
            <div className="relative -mt-24 mb-6">
                <div className="w-56 h-56 rounded-full border-[8px] border-white object-cover shadow-2xl bg-white overflow-hidden flex items-center justify-center">
                    {currentUser.avatar ? <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon className="w-20 h-20 text-slate-200" />}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-700 shadow-xl transition-all transform hover:scale-110 active:scale-95"><Camera className="w-5 h-5" /></button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
            </div>

            <div className="text-center w-full">
                {isEditing ? (
                  <div className="space-y-6 mb-8 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">First Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-800 focus:bg-white rounded-2xl outline-none font-bold" placeholder="First Name" />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Surname</label>
                        <input type="text" value={surname} onChange={e => setSurname(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-800 focus:bg-white rounded-2xl outline-none font-bold" placeholder="Surname" />
                      </div>
                    </div>
                    
                    {currentUser.role !== UserRole.STUDENT && (
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-4">Contact Number (Optional)</label>
                        <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input 
                                type="tel" 
                                value={contactNumber} 
                                onChange={e => setContactNumber(e.target.value)} 
                                className="w-full pl-12 pr-5 py-4 bg-slate-100 border-2 border-slate-200 focus:border-slate-800 focus:bg-white rounded-2xl outline-none font-black text-slate-900 placeholder:text-slate-400" 
                                placeholder="e.g. +27 123 4567" 
                            />
                        </div>
                      </div>
                    )}

                    {(currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL) && (
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-4">Subjects Taught</label>
                            <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 gap-2">
                                    {getSubjectList(currentUser.grade).map(subject => {
                                        const isSelected = staffSubjects.includes(subject);
                                        return (
                                            <button 
                                                key={subject}
                                                type="button"
                                                onClick={() => toggleSubject(subject, staffSubjects, setStaffSubjects)}
                                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isSelected ? 'bg-slate-300 border-slate-400 text-slate-900' : 'bg-white border-slate-100 text-slate-600'}`}
                                            >
                                                <span className="text-xs font-bold">{subject}</span>
                                                {isSelected && <Check className="w-4 h-4 text-slate-900" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Personal Bio / Fun Fact</label>
                        <textarea value={funFact} onChange={e => setFunFact(e.target.value)} rows={3} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-800 focus:bg-white rounded-2xl outline-none resize-none font-medium" placeholder="A little about yourself..." />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button onClick={handleSaveProfile} disabled={isSubmitting} className="flex-1 py-4 bg-[#1a1a1a] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                      </button>
                      <button onClick={() => setIsEditing(false)} className="px-6 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 text-center animate-fade-in">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{currentUser.name} {currentUser.surname}</h1>
                        <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[#1a1a1a] text-white shadow-sm border border-[#1a1a1a]">{currentUser.role}</span>
                        {currentUser.relationship && (
                           <span className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[#1a1a1a] text-white shadow-sm border border-[#1a1a1a] flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-pink-600" /> {currentUser.relationship}
                           </span>
                        )}
                      </div>
                  </div>
                )}
            </div>

            <div className="w-full space-y-4">
                {hasMultipleGrades && onGradeChange && (
                    <div className="p-6 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-[#1a1a1a] rounded-2xl"><Eye className="w-6 h-6 text-white" /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Experience View</p>
                                <p className="font-bold text-lg text-slate-900">Switch Active Grade</p>
                                <p className="text-[9px] font-medium text-slate-600">
                                    {currentUser.role === UserRole.PRINCIPAL 
                                        ? "Full campus access enabled" 
                                        : "Limited to your selected grades"}
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <select 
                                value={currentUser.grade}
                                onChange={(e) => onGradeChange(e.target.value)}
                                className="w-full px-6 py-4 bg-[#1a1a1a] border-2 border-[#1a1a1a] rounded-3xl outline-none appearance-none font-bold text-white focus:border-slate-600 transition-all cursor-pointer"
                            >
                                {availableGradesForSwitch.map(g => (
                                    <option key={g} value={g} className="text-slate-900">{g}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 pointer-events-none" />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white"><Mail className="w-6 h-6" /></div>
                    <div className="overflow-hidden text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Primary Email</p>
                        <p className="font-bold text-slate-800 text-sm truncate">{currentUser.email || 'No email set'}</p>
                    </div>
                </div>

                {currentUser.contactNumber && (
                    <div className="flex items-center gap-4 p-5 bg-slate-100 rounded-[2rem] border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white shadow-sm"><Phone className="w-6 h-6" /></div>
                        <div className="overflow-hidden text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-0.5">Contact Number</p>
                            <p className="font-black text-slate-900 text-sm truncate">{currentUser.contactNumber}</p>
                        </div>
                    </div>
                )}

                {(currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL) && currentUser.selectedSubjects && currentUser.selectedSubjects.length > 0 && (
                     <div className="flex items-start gap-4 p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white"><BookOpen className="w-6 h-6" /></div>
                        <div className="overflow-hidden text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Expertise / Subjects</p>
                            <div className="flex flex-wrap gap-2">
                                {currentUser.selectedSubjects.map(s => (
                                    <span key={s} className="px-2 py-1 bg-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-slate-300">{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300"><SchoolIcon className="w-6 h-6" /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Affiliation</p>
                        <p className="font-bold text-slate-800 text-sm">{currentUser.school}</p>
                    </div>
                </div>

                <div className="bg-slate-100 rounded-[2rem] border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-5 h-5 text-slate-700" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Notifications</p>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Stay updated with homework, alerts, and messages</p>
                    <NotificationSubscribeButton userId={currentUser.id} />
                </div>

                {currentUser.role === UserRole.PRINCIPAL && (
                    <div className="mt-10 pt-8 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-6 px-2 text-left">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Building className="w-5 h-5 text-slate-700" /> Institutional Branding</h3>
                        </div>
                        <div className="p-8 bg-slate-100 rounded-[3rem] border border-slate-200 shadow-sm text-center relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-slate-300/20 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                             
                             <div className="relative z-10">
                             <div className="w-40 h-40 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl border-4 border-white overflow-hidden">
                                     {currentUser.schoolLogo ? (
                                         <img src={currentUser.schoolLogo} alt="School Logo" className="w-full h-full object-cover" />
                                     ) : (
                                         <ImageIcon className="w-8 h-8 text-slate-200" />
                                     )}
                                 </div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-6">Official Institution Logo</p>
                                 <button 
                                     onClick={() => schoolLogoInputRef.current?.click()}
                                     disabled={isUploadingLogo}
                                     className="w-full py-4 bg-[#1a1a1a] border-2 border-[#1a1a1a] text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                 >
                                     {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Change School Logo</>}
                                 </button>
                                 <input type="file" ref={schoolLogoInputRef} onChange={handleSchoolLogoUpload} className="hidden" accept="image/*" />
                                 <p className="text-[9px] text-slate-400 font-medium mt-4 italic">This logo will represent your school in Yearbooks and Admin tools.</p>
                             </div>
                        </div>
                    </div>
                )}

                {currentUser.role === UserRole.PARENT && (
                  <div className="mt-10 pt-8 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-6 px-2">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Baby className="w-5 h-5 text-slate-700" /> My Children</h3>
                      <button onClick={() => setIsAddingStudent(true)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 flex items-center gap-1.5 px-4 py-2 bg-slate-200 rounded-xl hover:bg-slate-300 transition-all shadow-sm"><UserPlus className="w-3.5 h-3.5" /> Add Child</button>
                    </div>

                    {myChildren.length === 0 ? (
                      <div className="p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center bg-white">
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">No children linked to your account.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myChildren.map(child => (
                          <div key={child.id} className="p-5 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-5">
                              <img src={child.avatar} alt="" className="w-16 h-16 rounded-[1.5rem] object-cover bg-slate-50 border border-slate-100 shadow-sm" />
                              <div className="flex-1 overflow-hidden text-left">
                                <p className="font-black text-slate-900 truncate">{child.name} {child.surname}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{child.grade}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class {child.classLetter}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => { setEditingChildSubjects(child); setTempChildSubjects(child.selectedSubjects || []); }}
                                className="p-3 bg-[#1a1a1a] text-white rounded-2xl hover:opacity-80 transition-colors"
                              >
                                <Settings className="w-5 h-5" />
                              </button>
                            </div>
                            
                            {child.selectedSubjects && child.selectedSubjects.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {child.selectedSubjects.slice(0, 3).map(s => (
                                  <span key={s} className="px-2 py-1 bg-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-slate-300">{s}</span>
                                ))}
                                {child.selectedSubjects.length > 3 && <span className="text-[9px] text-slate-400 font-bold">+{child.selectedSubjects.length - 3} more</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </div>
        </div>
      </div>

      {editingChildSubjects && (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditingChildSubjects(null)}>
           <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="text-left pr-4">
                    <h3 className="text-2xl font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">Subject Preferences</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Filtering feeds for {editingChildSubjects.name}</p>
                  </div>
                  <button 
                    onClick={() => setEditingChildSubjects(null)} 
                    className="flex-shrink-0 p-3 bg-[#1a1a1a] border border-[#1a1a1a] shadow-sm rounded-2xl text-white hover:opacity-80 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed text-left">Select the subjects your child should receive homework and learning resources for. If none are selected, they will receive all feeds for their grade.</p>
                  <div className="grid grid-cols-1 gap-3">
                      {getSubjectList(editingChildSubjects.grade).map(subject => {
                          const isSelected = tempChildSubjects.includes(subject);
                          return (
                              <button 
                                key={subject} 
                                onClick={() => toggleSubject(subject, tempChildSubjects, setTempChildSubjects)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected ? 'bg-slate-300 border-slate-400 text-slate-900' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
                              >
                                  <span className="text-sm font-bold">{subject}</span>
                                  {isSelected && <div className="bg-[#1a1a1a] rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                              </button>
                          );
                      })}
                  </div>
              </div>
              <div className="p-8 border-t border-slate-100">
                  <button onClick={handleUpdateChildSubjects} disabled={isSubmitting} className="w-full py-6 bg-[#1a1a1a] text-white font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                  </button>
              </div>
           </div>
        </div>
      )}

      {isAddingStudent && (
          <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={() => setIsAddingStudent(false)}>
              <div className="bg-white w-full max-w-xl h-full sm:h-auto sm:max-h-[95vh] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div className="text-left pr-4">
                        <h3 className="text-2xl font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">Add Child Profile</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Linking your family accounts</p>
                      </div>
                      <button 
                        onClick={() => { setIsAddingStudent(false); setAddStudentError(''); }} 
                        className="flex-shrink-0 p-3 bg-[#1a1a1a] border border-[#1a1a1a] shadow-sm rounded-2xl text-white hover:opacity-80 transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                      {addStudentError && (
                          <div className="mb-6 p-4 bg-slate-200 border border-slate-300 rounded-2xl flex items-center gap-3 animate-fade-in">
                              <AlertCircle className="w-5 h-5 text-slate-700 shrink-0" />
                              <p className="text-xs font-bold text-slate-800">{addStudentError}</p>
                          </div>
                      )}

                      <form onSubmit={handleAddChild} className="space-y-10">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2 text-left">
                                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">First Name</label>
                                  <input type="text" required value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className={inputClasses} placeholder="e.g. Liam" />
                              </div>
                              <div className="space-y-2 text-left">
                                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Surname</label>
                                  <input type="text" required value={newStudentSurname} onChange={e => setNewStudentSurname(e.target.value)} className={inputClasses} placeholder="e.g. Smith" />
                              </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2 text-left">
                                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 ml-2">Grade Level (Locked to yours)</label>
                                  <div className="relative">
                                    <GraduationCap className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400" />
                                    <select disabled value={currentUser.grade} className={`${inputClasses} pl-20 appearance-none bg-slate-200 cursor-not-allowed opacity-70`}>
                                        <option value={currentUser.grade}>{currentUser.grade}</option>
                                    </select>
                                  </div>
                              </div>
                              <div className="space-y-2 text-left">
                                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Class Code</label>
                                  <div className="relative">
                                    <Building className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400" />
                                    <select value={newStudentClass} onChange={e => setNewStudentClass(e.target.value)} className={`${inputClasses} pl-20 appearance-none bg-slate-100/50`}>
                                        {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 pointer-events-none" />
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-4 text-left">
                              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Subject Selection (Optional)</label>
                              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                                  <p className="text-xs text-slate-500 font-bold italic">Select specific subjects to filter feeds.</p>
                                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                      {getSubjectList(currentUser.grade).map(subject => {
                                          const isSelected = newStudentSubjects.includes(subject);
                                          return (
                                              <button 
                                                type="button"
                                                key={subject} 
                                                onClick={() => toggleSubject(subject, newStudentSubjects, setNewStudentSubjects)}
                                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isSelected ? 'bg-slate-300 border-slate-400 text-slate-900' : 'bg-white border-slate-200 text-slate-600'}`}
                                              >
                                                  <span className="text-xs font-black uppercase tracking-tight">{subject}</span>
                                                  {isSelected && <Check className="w-4 h-4 text-slate-900" />}
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>
                          </div>

                          <div className="p-10 bg-slate-100 rounded-[3rem] border border-slate-200 space-y-8 text-left">
                              <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-[#1a1a1a] rounded-2xl text-white"><Lock className="w-6 h-6" /></div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">Sign-in Credentials</p></div>
                              <div className="space-y-2"><label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Student Login Email</label><input type="email" required value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} className={`${inputClasses} bg-white shadow-sm text-base py-4`} placeholder="student@school.com" /></div>
                              <div className="space-y-2"><label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Set Account Password</label><input type="password" required value={newStudentPassword} onChange={e => setNewStudentPassword(e.target.value)} className={`${inputClasses} bg-white shadow-sm text-base py-4`} placeholder="••••••••" /></div>
                          </div>

                          <div className="pt-6">
                            <button type="submit" disabled={isSubmitting} className="w-full py-8 bg-[#1a1a1a] text-white font-black uppercase tracking-[0.3em] text-base rounded-[2.5rem] shadow-2xl shadow-slate-200 hover:opacity-90 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                                {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <CheckCircle2 className="w-8 h-8" />} Link Child Account
                            </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ProfileModule;
