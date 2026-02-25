
import React, { useState, useRef, useMemo } from 'react';
import { Assignment, User, UserRole, VisibilityType } from '../types';
import { 
  Clock, 
  Plus, 
  Paperclip, 
  X, 
  BookOpen, 
  Loader2, 
  Upload, 
  Trash2, 
  Download,
  Eye,
  FileText,
  ImageIcon,
  Camera,
  File as FileIcon,
  ChevronRight,
  Globe,
  Building2,
  Lock
} from 'lucide-react';
import { saveDoc, uploadImage, removeDoc } from '../services/firebaseService';
import { sendPushNotificationToUser } from '../services/pushNotificationService';
import { PRIMARY_GRADES, PRIMARY_SUBJECTS, HIGH_SCHOOL_SUBJECTS } from '../constants';
import ResourceViewer from './ResourceViewer';

interface HomeworkModuleProps {
  currentUser: User;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  allUsers: User[];
}

const HomeworkModule: React.FC<HomeworkModuleProps> = ({ currentUser, assignments, setAssignments, allUsers }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingAssignmentId, setViewingAssignmentId] = useState<string | null>(null);
  const [viewingAttachmentUrl, setViewingAttachmentUrl] = useState<string | null>(null);
  const [viewingAttachmentName, setViewingAttachmentName] = useState<string>('');
  const [viewingAttachmentType, setViewingAttachmentType] = useState<string>('');
  const [viewingAttachmentDescription, setViewingAttachmentDescription] = useState<string>('');
  
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewSubjectDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newMetadata, setNewMetadata] = useState('');
  const [newVisibility, setNewVisibility] = useState<VisibilityType>('school');
  const [newVisibleGrades, setNewVisibleGrades] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<{file: File, name: string}[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const availableSubjects = PRIMARY_GRADES.includes(currentUser.grade) ? PRIMARY_SUBJECTS : HIGH_SCHOOL_SUBJECTS;
  const viewingAssignment = assignments.find(a => a.id === viewingAssignmentId);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => a.grade === currentUser.grade);
  }, [assignments, currentUser.grade]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files) as File[];
        const validFiles = files.map(file => ({ file, name: file.name }));
        setNewAttachments([...newAttachments, ...validFiles]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = (index: number) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!newTitle || !newDesc || !newSubject || isSubmitting) return;
    setIsSubmitting(true);
    const assignmentId = Date.now().toString();
    
    // Auto-set visibility to all-schools for Educater Institute global resource creators
    const isGlobalCreator = currentUser.isGlobalResourceCreator || currentUser.schoolId === 'educater-institute';
    const finalVisibility = isGlobalCreator ? 'all-schools' : newVisibility;
    
    try {
        console.log('Starting assignment creation...', { newTitle, newSubject, schoolId: currentUser.schoolId, attachmentCount: newAttachments.length, isGlobalCreator, visibility: finalVisibility });
        
        const uploadedAttachments = await Promise.all(newAttachments.map(async (att) => {
            console.log('Uploading attachment:', att.name);
            const url = await uploadImage(`assignments/${assignmentId}/files/${att.name}`, att.file);
            console.log('Attachment uploaded:', att.name, url);
            return { url, name: att.name, type: att.file.type };
        }));

        let thumbUrl = '';
        if (selectedThumbnail) {
          console.log('Uploading thumbnail...');
          thumbUrl = await uploadImage(`assignments/${assignmentId}/thumbnail`, selectedThumbnail);
          console.log('Thumbnail uploaded:', thumbUrl);
        }

        const newAssignment: Assignment = {
            id: assignmentId,
            title: newTitle,
            subject: newSubject,
            description: newDesc,
            dueDate: newDate || new Date().toISOString().split('T')[0],
            grade: currentUser.grade,
            isCompleted: false, 
            parentConfirmation: false, 
            completions: {},
            comments: [],
            attachments: uploadedAttachments,
            thumbnailUrl: thumbUrl,
            metadata: newMetadata,
            schoolId: currentUser.schoolId || '',
            visibility: finalVisibility,
            visibleGrades: finalVisibility === 'specific-grade' ? newVisibleGrades : undefined,
            timestamp: Date.now()
        };

        console.log('Saving assignment to Firestore:', newAssignment);
        await saveDoc('assignments', assignmentId, newAssignment);
        
        console.log('Assignment saved successfully!');
        
        // Send push notifications to all students in the same grade
        const studentsInGrade = allUsers.filter(u => u.role === UserRole.STUDENT && u.grade === currentUser.grade);
        console.log('Sending notifications to', studentsInGrade.length, 'students');
        
        const notificationPromises = studentsInGrade.map(student =>
          sendPushNotificationToUser(student.id, {
            title: `New assignment: ${newTitle}`,
            message: `${newSubject} - Due: ${newAssignment.dueDate}`,
            icon: '/educater-icon-512.png',
            url: '/homework'
          }).catch(err => console.error('Push notification failed for', student.id, err))
        );
        await Promise.all(notificationPromises);
        
        console.log('All notifications sent');
        alert(`✅ Assignment "${newTitle}" published successfully to ${studentsInGrade.length} students!`);
        setIsCreating(false);
        resetForm();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Assignment upload failed", error);
        console.error("Error details:", errorMessage);
        alert(`❌ Failed to publish assignment:\n\n${errorMessage}\n\nPlease check:\n- All required fields are filled\n- File sizes are reasonable\n- You have internet connection\n- Your account has permissions\n- Your schoolId is set in profile`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewSubjectDesc('');
    setNewAttachments([]);
    setNewMetadata('');
    setNewVisibility('school');
    setNewVisibleGrades([]);
    setSelectedThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to permanently delete this record?")) return;
      await removeDoc('assignments', id);
      if (viewingAssignmentId === id) setViewingAssignmentId(null);
  };

  const isDueDatePassed = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const shouldShowAsCompleted = (assignment: Assignment) => {
    // Check if CURRENT USER marked it complete (only hides for that user)
    // Teachers should NEVER see it as hidden
    if (currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL) {
      return false; // Teachers always see assignments as active
    }

    // For students/parents, check their own completion entry
    const userCompletion = assignment.completions?.[currentUser.id];
    if (!userCompletion) return false;

    const hideUntil = userCompletion.hideUntil || 0;
    const now = Date.now();
    return now < hideUntil;
  };

  const markAsComplete = async (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    try {
      const hideUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
      const updatedAssignment = {
        ...assignment,
        completions: {
          ...(assignment.completions || {}),
          [currentUser.id]: {
            studentDone: true,
            parentSigned: currentUser.role === 'Parent',
            markedAt: Date.now(),
            markedBy: currentUser.id,
            markedByName: currentUser.name,
            hideUntil: hideUntil
          }
        }
      };
      
      await saveDoc('assignments', assignmentId, updatedAssignment);
      console.log('✅ Assignment marked as complete by', currentUser.name, ', will hide for 24 hours');
    } catch (error) {
      console.error('Failed to mark complete:', error);
      alert('Failed to mark assignment as complete');
    }
  };

  const reviveAssignment = async (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      console.error('Assignment not found:', assignmentId);
      alert('Could not find assignment to revive');
      return;
    }
    
    const userCompletion = assignment.completions?.[currentUser.id];
    if (!userCompletion?.studentDone) {
      console.warn('Assignment is not marked complete by user:', assignmentId);
      return;
    }

    try {
      console.log('Reviving assignment:', assignmentId);
      const updatedAssignment = {
        ...assignment,
        completions: {
          ...(assignment.completions || {}),
          [currentUser.id]: {
            ...userCompletion,
            studentDone: false,
            hideUntil: 0
          }
        }
      };
      
      await saveDoc('assignments', assignmentId, updatedAssignment);
      console.log('✅ Assignment revived successfully');
    } catch (error) {
      console.error('Failed to revive assignment:', error);
      alert(`Failed to revive assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const triggerDownload = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getFileIcon = (type: string | undefined) => {
      const safeType = (type || '').toLowerCase();
      if (safeType.includes('image')) return <ImageIcon className="w-5 h-5 text-slate-400" />;
      if (safeType.includes('pdf')) return <FileText className="w-5 h-5 text-slate-400" />;
      return <FileIcon className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-32">
      {/* Resource Viewer Modal */}
      {viewingAttachmentUrl && (
        <ResourceViewer 
          isOpen={!!viewingAttachmentUrl}
          onClose={() => {
            setViewingAttachmentUrl(null);
            setViewingAttachmentName('');
            setViewingAttachmentType('');
            setViewingAttachmentDescription('');
          }}
          title={viewingAttachmentName}
          url={viewingAttachmentUrl}
          type={viewingAttachmentType}
          description={viewingAttachmentDescription}
          fileName={viewingAttachmentName}
        />
      )}

      {/* Detail Modal Overlay */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-white backdrop-blur-2xl" onClick={() => setViewingAssignmentId(null)}>
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full h-full overflow-hidden animate-scale-up border border-white/10 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white p-10 text-slate-900 relative flex-shrink-0">
                    <button onClick={() => setViewingAssignmentId(null)} className="absolute top-6 right-6 p-3 bg-black text-white hover:bg-slate-800 rounded-2xl transition-all z-10"><X className="w-6 h-6" /></button>
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-[#00ff8e] text-[#072432] mb-6 inline-block tracking-widest">{viewingAssignment.subject}</span>
                    <h2 className="text-4xl font-black leading-tight mb-2 tracking-tight text-slate-900">{viewingAssignment.title}</h2>
                    <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <Clock className="w-4 h-4" /> Due: {viewingAssignment.dueDate}
                    </div>
                </div>
                
                <div className="p-10 flex-1 overflow-y-auto space-y-12 text-left custom-scrollbar bg-white">
                    {viewingAssignment.thumbnailUrl && (
                      <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
                        <img src={viewingAssignment.thumbnailUrl} className="w-full h-full object-cover" alt="Task Cover" />
                      </div>
                    )}

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 flex items-center gap-2">
                           <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shrink-0"><BookOpen className="w-3 h-3" /></span> Educator's Instructions
                        </h4>
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-left">
                          <p className="text-slate-700 text-lg leading-relaxed font-medium whitespace-pre-wrap">{viewingAssignment.description}</p>
                        </div>
                    </div>

                    {viewingAssignment.attachments?.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shrink-0"><Paperclip className="w-3 h-3" /></span> Learning Materials
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                {viewingAssignment.attachments.map((att, i) => (
                                    <div 
                                        key={i} 
                                        className="flex items-center justify-between p-4 bg-[#f0f9ff] border border-[#e0f2fe] rounded-[2rem] transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                                {getFileIcon(att.type)}
                                            </div>
                                            <div className="text-left min-w-0">
                                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Resource File</p>
                                              <p className="text-[11px] font-bold text-slate-600 truncate max-w-[120px] md:max-w-[200px]">{att.name}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                              setViewingAttachmentUrl(att.url);
                                              setViewingAttachmentName(att.name);
                                              setViewingAttachmentType(att.type || 'File');
                                              setViewingAttachmentDescription(viewingAssignment.description || '');
                                            }}
                                            className="px-5 py-2.5 bg-[#072432] rounded-[1.25rem] flex items-center gap-3 hover:brightness-125 active:scale-95 transition-all shadow-md group shrink-0"
                                        >
                                            <div className="flex flex-col text-left">
                                                <span className="text-[8px] font-black text-[#00ff8e] uppercase tracking-[0.1em] leading-tight">VIEW</span>
                                                <span className="text-[8px] font-black text-[#00ff8e] uppercase tracking-[0.1em] leading-tight">FILE</span>
                                            </div>
                                            <Eye className="w-3.5 h-3.5 text-[#00ff8e]" strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL) && (
                        <div className="pt-8 border-t border-slate-50 flex justify-end">
                            <button onClick={(e) => handleDelete(viewingAssignment.id, e)} className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all">
                                <Trash2 className="w-5 h-5" /> Delete Academic Record
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Homework Tasks</h2>
      </div>

      {(currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL) && (
        <button onClick={() => setIsCreating(true)} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 mx-4">
          <Plus className="w-5 h-5" /> Post new task
        </button>
      )}

      <p className="text-slate-600 text-sm font-medium mb-6 px-4">{currentUser.grade} Academic Stream</p>

      {/* Creation Form */}
      {isCreating && (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 animate-fade-in relative text-left">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Create Academic Task</h3>
            <button onClick={() => setIsCreating(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><X className="h-8 w-8" /></button>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Subject Focus</label>
                <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold text-xs outline-none transition-all">
                    <option value="">Choose subject...</option>
                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Task Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold text-xs outline-none transition-all" placeholder="e.g. Science Revision" />
              </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Task Instructions</label>
                <textarea rows={4} value={newDesc} onChange={(e) => setNewSubjectDesc(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl text-xs font-medium resize-none outline-none transition-all" placeholder="Provide detailed instructions..."/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Due Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold text-xs outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Upload Cover (Optional)</label>
                  <button onClick={() => thumbInputRef.current?.click()} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" /> {thumbnailPreview ? 'Change Cover' : 'Add Cover'}
                  </button>
                  <input type="file" ref={thumbInputRef} onChange={handleThumbnailChange} className="hidden" accept="image/*" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Attachments</label>
                <button onClick={() => fileInputRef.current?.click()} className="w-full px-5 py-3.5 bg-indigo-50 text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> {newAttachments.length > 0 ? `${newAttachments.length} Files Ready` : 'Add Resource Files'}
                </button>
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-900">Share Settings</h4>
              </div>
              
              {currentUser.isGlobalResourceCreator || currentUser.schoolId === 'educater-institute' ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <Globe className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-black uppercase text-[10px] text-green-900">Global Content Creator</div>
                    <div className="text-[8px] text-green-700 opacity-90 mt-1">All materials you create are automatically visible across the entire network to educators and students worldwide. This is your official role at Educater Institute.</div>
                  </div>
                </div>
              ) : (
              <div className="space-y-2">
                <button type="button" onClick={() => { setNewVisibility('all-schools'); setNewVisibleGrades([]); }} className={`w-full p-3 rounded-lg text-left border-2 font-bold text-[9px] transition-all flex items-start gap-2 ${newVisibility === 'all-schools' ? 'bg-white border-indigo-600 text-indigo-900 shadow-md' : 'bg-white/50 border-indigo-100 text-slate-600 hover:bg-white'}`}>
                  <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black uppercase">All Schools Network</div>
                    <div className="text-[8px] opacity-70">Visible to educators across all schools</div>
                  </div>
                </button>

                <button type="button" onClick={() => { setNewVisibility('school'); setNewVisibleGrades([]); }} className={`w-full p-3 rounded-lg text-left border-2 font-bold text-[9px] transition-all flex items-start gap-2 ${newVisibility === 'school' ? 'bg-white border-indigo-600 text-indigo-900 shadow-md' : 'bg-white/50 border-indigo-100 text-slate-600 hover:bg-white'}`}>
                  <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black uppercase">My School Only</div>
                    <div className="text-[8px] opacity-70">Visible to all grades in your school</div>
                  </div>
                </button>

                <button type="button" onClick={() => { setNewVisibility('grade'); setNewVisibleGrades([]); }} className={`w-full p-3 rounded-lg text-left border-2 font-bold text-[9px] transition-all flex items-start gap-2 ${newVisibility === 'grade' ? 'bg-white border-indigo-600 text-indigo-900 shadow-md' : 'bg-white/50 border-indigo-100 text-slate-600 hover:bg-white'}`}>
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black uppercase">Same Grade Only</div>
                    <div className="text-[8px] opacity-70">Grade {currentUser.grade} only</div>
                  </div>
                </button>

                <button type="button" onClick={() => setNewVisibility('specific-grade')} className={`w-full p-3 rounded-lg text-left border-2 font-bold text-[9px] transition-all flex items-start gap-2 ${newVisibility === 'specific-grade' ? 'bg-white border-indigo-600 text-indigo-900 shadow-md' : 'bg-white/50 border-indigo-100 text-slate-600 hover:bg-white'}`}>
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black uppercase">Select Specific Grades</div>
                    <div className="text-[8px] opacity-70">Choose which grades can view</div>
                  </div>
                </button>
              </div>
              )}

              {newVisibility === 'specific-grade' && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-indigo-200 space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-indigo-600">Select Grades</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PRIMARY_GRADES.map(grade => (
                      <button key={grade} type="button" onClick={() => setNewVisibleGrades(prev => prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade])} className={`py-2 px-2 rounded text-[8px] font-bold uppercase transition-all border-2 ${newVisibleGrades.includes(grade) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-50">
                <button onClick={handleCreate} disabled={isSubmitting || !newTitle} className="px-10 py-4 bg-[#072432] text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Task"}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Cards Matching Reference Image */}
      <div className="space-y-4 px-2">
        {filteredAssignments.length === 0 ? (
            <div className="py-24 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-50 text-center flex flex-col items-center">
                <BookOpen className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active assignments on the shelf.</p>
            </div>
        ) : (
            filteredAssignments.map((assignment) => {
              const isCompleted = shouldShowAsCompleted(assignment);
              const userCompletion = assignment.completions?.[currentUser.id];
              const isTimeExpired = isDueDatePassed(assignment.dueDate) && !userCompletion?.studentDone;
              const canRevive = userCompletion?.studentDone === true;
              const completionCount = Object.values(assignment.completions || {}).filter(c => c.studentDone).length;
              
              return (
                <div 
                  key={assignment.id} 
                  className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col w-full p-4 md:p-6 relative ${isCompleted ? 'opacity-50 bg-slate-100' : ''}`}
                >
                  {/* Top: Subject Badge */}
                  <div className="mb-3">
                    <span className="px-4 py-1.5 bg-black text-white text-[7px] md:text-[9px] font-black uppercase tracking-widest rounded-full inline-block">{assignment.subject}</span>
                  </div>

                  {/* Title */}
                  <div className="mb-3">
                    <h3 className={`text-2xl md:text-3xl font-black leading-tight tracking-tight uppercase ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{assignment.title}</h3>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className={`text-[9px] md:text-[11px] font-medium line-clamp-2 ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>{assignment.description}</p>
                  </div>

                  {/* Large Thumbnail Area */}
                  <div className="w-full h-40 md:h-56 mb-4 bg-[#f1f5f9] rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-100">
                    {assignment.thumbnailUrl ? (
                      <img src={assignment.thumbnailUrl} className={`w-full h-full object-cover ${isCompleted ? 'grayscale' : ''}`} alt="" />
                    ) : (
                      <span className="text-slate-300 font-black uppercase text-[10px] tracking-widest opacity-40 text-center">thumbnail</span>
                    )}
                  </div>

                  {/* Bottom Row: Due Date (left) and delete button (right) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[8px] md:text-[10px] uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> DUE: {assignment.dueDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setViewingAssignmentId(assignment.id)}
                        className="p-2.5 bg-[#072432] text-white rounded-full hover:brightness-110 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {(currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL) && (
                        <button onClick={(e) => handleDelete(assignment.id, e)} className="p-2.5 bg-black text-white rounded-full hover:bg-slate-800 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Button row: Mark complete on left, View on right */}
                  {(currentUser.role !== UserRole.TEACHER && currentUser.role !== UserRole.PRINCIPAL) && (
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {!isCompleted && (
                          <button 
                            onClick={() => markAsComplete(assignment.id)}
                            className="px-8 md:px-10 py-3 md:py-4 bg-green-500 text-white rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                          >
                            ✓ MARK COMPLETE
                          </button>
                        )}
                        {isCompleted && canRevive && !isTimeExpired && (
                          <button 
                            onClick={() => reviveAssignment(assignment.id)}
                            className="px-8 md:px-10 py-3 md:py-4 bg-blue-500 text-white rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all"
                          >
                            ↻ UNDO
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => setViewingAssignmentId(assignment.id)}
                        className={`px-8 md:px-10 py-3 md:py-4 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3 ${isCompleted ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-[#072432] text-white hover:brightness-110'}`}
                        disabled={isCompleted}
                      >
                          VIEW <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
            );
            })
        )}
      </div>
    </div>
  );
};

export default HomeworkModule;
