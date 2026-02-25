
import React, { useState, useRef, useMemo } from 'react';
import { Resource, ResourceType, User, UserRole, VisibilityType } from '../types';
import { 
  Video, 
  ImageIcon, 
  Plus, 
  X, 
  Upload, 
  BookOpen, 
  ChevronRight, 
  Trash2, 
  Loader2, 
  Link as LinkIcon,
  FileText,
  Download,
  CheckCircle2,
  Eye,
  Camera,
  Globe,
  Building2,
  Lock,
  GraduationCap
} from 'lucide-react';
import { PRIMARY_GRADES, SECONDARY_GRADES, PRIMARY_SUBJECTS, HIGH_SCHOOL_SUBJECTS } from '../constants';
import { saveDoc, removeDoc, uploadImage } from '../services/firebaseService';
import ResourceViewer from './ResourceViewer';

interface TutoringModuleProps {
  currentUser: User;
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
}

const TutoringModule: React.FC<TutoringModuleProps> = ({ currentUser, resources, setResources }) => {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newGrades, setNewGrades] = useState<string[]>([]);
  const [newType, setNewType] = useState<ResourceType>(ResourceType.LINK);
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMetadata, setNewMetadata] = useState('');
  const [newVisibility, setNewVisibility] = useState<VisibilityType>('school');
  const [newVisibleGrades, setNewVisibleGrades] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const availableSubjects = PRIMARY_GRADES.includes(currentUser.grade) ? PRIMARY_SUBJECTS : HIGH_SCHOOL_SUBJECTS;
  const isPrincipal = currentUser.role === UserRole.PRINCIPAL;
  const allGrades = [...PRIMARY_GRADES, ...HIGH_SCHOOL_SUBJECTS.filter(s => !PRIMARY_SUBJECTS.includes(s))];

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      // Check if user can see this resource based on visibility
      let canSeeByVisibility = false;
      
      if (r.visibility === 'all-schools' || r.isPublic || r.isGlobal) {
        canSeeByVisibility = true;
      } else if (r.visibility === 'school' && r.schoolId === currentUser.schoolId) {
        canSeeByVisibility = true;
      } else if (r.visibility === 'grade' && r.grade === currentUser.grade && r.schoolId === currentUser.schoolId) {
        canSeeByVisibility = true;
      } else if (r.visibility === 'specific-grade' && r.visibleGrades?.includes(currentUser.grade) && r.schoolId === currentUser.schoolId) {
        canSeeByVisibility = true;
      }
      
      if (!canSeeByVisibility) return false;

      // Apply filters
      const matchesGrade = selectedGrade === 'All' || (r.forGrades?.includes(selectedGrade) || r.grade === selectedGrade);
      const matchesSubject = selectedSubject === 'All' || r.subject === selectedSubject;
      
      return matchesGrade && matchesSubject;
    }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [resources, currentUser.grade, currentUser.schoolId, selectedSubject, selectedGrade]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSubject || isSubmitting) return;

    setIsSubmitting(true);
    const resId = Date.now().toString();
    
    try {
      console.log('Starting resource creation...', { newTitle, newSubject, newType, schoolId: currentUser.schoolId });
      
      let finalUrl = newUrl;
      let fileName = '';
      let thumbUrl = '';

      // Upload file if selected
      if (newType === ResourceType.FILE && selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        finalUrl = await uploadImage(`resources/${resId}/${selectedFile.name}`, selectedFile);
        fileName = selectedFile.name;
        console.log('File uploaded successfully:', finalUrl);
      }

      // Upload thumbnail if selected
      if (selectedThumbnail) {
        console.log('Uploading thumbnail...');
        thumbUrl = await uploadImage(`resources/${resId}/thumbnail`, selectedThumbnail);
        console.log('Thumbnail uploaded successfully:', thumbUrl);
      }

      // Validate required fields
      if (!finalUrl && newType === ResourceType.FILE) {
        throw new Error('File upload failed - no URL returned');
      }
      if (!finalUrl && newType === ResourceType.LINK) {
        throw new Error('Please enter a valid video URL');
      }

      const newResource: Resource = {
          id: resId,
          title: newTitle,
          subject: newSubject,
          type: newType,
          description: newDescription,
          url: finalUrl,
          thumbnailUrl: thumbUrl,
          metadata: newMetadata,
          fileName: fileName,
          authorName: `${currentUser.name} ${currentUser.surname || ''}`,
          grade: currentUser.grade,
          forGrades: newGrades.length > 0 ? newGrades : [currentUser.grade],
          schoolId: currentUser.schoolId || '',
          visibility: newVisibility,
          visibleGrades: newVisibility === 'specific-grade' ? newVisibleGrades : undefined,
          isPublic: isPublic,
          isGlobal: currentUser.isGlobalResourceCreator || false,
          contributedBy: currentUser.role === UserRole.TEACHER ? currentUser.name : undefined,
          timestamp: Date.now()
      };

      console.log('Saving resource to Firestore:', newResource);
      await saveDoc('resources', resId, newResource);
      
      console.log('Resource saved successfully!');
      alert(`✅ Resource "${newTitle}" published successfully!`);
      setIsCreating(false);
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to save resource:", error);
      console.error("Error details:", errorMessage);
      alert(`❌ Failed to publish resource:\n\n${errorMessage}\n\nPlease check:\n- File format is supported\n- File size is reasonable\n- You have internet connection\n- Your account has permissions`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewSubject('');
    setNewGrades([]);
    setNewType(ResourceType.LINK);
    setNewUrl('');
    setNewDescription('');
    setNewMetadata('');
    setNewVisibility('school');
    setNewVisibleGrades([]);
    setIsPublic(false);
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
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

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-32">
      {viewingResource && (
          <ResourceViewer 
            isOpen 
            onClose={() => setViewingResource(null)} 
            title={viewingResource.title} 
            description={viewingResource.description} 
            type={viewingResource.type === ResourceType.LINK ? "Media Link" : "Study Resource"} 
            url={viewingResource.url || ''} 
            fileName={viewingResource.fileName}
          />
      )}

      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Learning Resources</h2>
      </div>

      {(currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL) && (
        <button onClick={() => setIsCreating(true)} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 mx-4">
          <Plus className="w-5 h-5" /> Publish New Entry
        </button>
      )}

      <p className="text-slate-600 text-sm font-medium mb-6 px-4">Grade {currentUser.grade} <span className="text-[#00ff8e] font-black">Your Portal to Online Learning</span></p>

      {isCreating && (
           <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-10 animate-fade-in relative text-left">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Create Educational Entry</h3>
                <button onClick={() => setIsCreating(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><X className="h-8 w-8" /></button>
              </div>
              <form onSubmit={handleCreateResource} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Entry Title</label><input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold text-sm outline-none" placeholder="e.g. NCERT Mathematics"/></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Subject Focus</label><select required value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold text-sm outline-none">{availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Book Cover / Thumbnail</label>
                        <div 
                          onClick={() => thumbInputRef.current?.click()}
                          className="w-48 aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative group"
                        >
                           {thumbnailPreview ? (
                             <>
                               <img src={thumbnailPreview} className="w-full h-full object-cover" alt="" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">Change Cover</div>
                             </>
                           ) : (
                             <>
                               <Camera className="w-8 h-8 text-slate-300 mb-2" />
                               <span className="text-[9px] font-black text-slate-400 uppercase">Add Cover</span>
                             </>
                           )}
                        </div>
                        <input type="file" ref={thumbInputRef} onChange={handleThumbnailChange} className="hidden" accept="image/*" />
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Sub-label Metadata</label>
                          <input type="text" value={newMetadata} onChange={e => setNewMetadata(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold text-sm outline-none" placeholder="e.g. 1,234 Questions"/>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Resource Format</label>
                          <div className="flex gap-2">
                              <button type="button" onClick={() => setNewType(ResourceType.LINK)} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${newType === ResourceType.LINK ? 'bg-[#072432] text-white border-[#072432] shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>Video / Link</button>
                              <button type="button" onClick={() => setNewType(ResourceType.FILE)} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${newType === ResourceType.FILE ? 'bg-[#072432] text-white border-[#072432] shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>Upload File</button>
                          </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{newType === ResourceType.LINK ? 'Media URL (YouTube/Web)' : 'Target File'}</label>
                             {newType === ResourceType.LINK ? (
                               <div className="relative"><LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input type="url" required value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold text-sm outline-none" placeholder="https://youtube.com/..."/></div>
                             ) : (
                               <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer px-6 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center gap-3 text-slate-400 hover:bg-slate-100 transition-all font-bold text-sm truncate uppercase overflow-hidden">
                                   {selectedFile ? <><CheckCircle2 className="w-5 h-5 text-brand-teal" /> {selectedFile.name}</> : <><Upload className="w-5 h-5" /> Select PDF/Doc/Image</>}
                                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx" />
                               </div>
                             )}
                        </div>
                      </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Context & Instructions</label>
                    <textarea required rows={4} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-medium text-sm resize-none outline-none" placeholder="Describe how students should use this resource..."/>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-100 rounded-[2rem] p-8 space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-purple-900">Target Grades & Distribution</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-purple-700 ml-4 mb-2 block">Select Grades This Resource Is For:</label>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 p-4 bg-white rounded-xl border-2 border-purple-100">
                          {(PRIMARY_GRADES.includes(currentUser.grade) ? PRIMARY_GRADES : SECONDARY_GRADES).map(grade => (
                            <button key={grade} type="button" onClick={() => setNewGrades(prev => prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade])} className={`py-2 px-3 rounded-lg text-[9px] font-bold uppercase transition-all border-2 ${newGrades.includes(grade) ? 'bg-[#00ff8e] text-[#072432] border-[#00ff8e]' : 'bg-white border-slate-200 text-slate-600 hover:border-[#00ff8e]'}`}>
                              {grade}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {currentUser.role === UserRole.TEACHER && (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
                          <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} className="w-5 h-5 accent-purple-600 rounded" />
                          <div className="flex-1">
                            <label className="text-sm font-bold text-slate-900 cursor-pointer">Make Available to Other Schools</label>
                            <p className="text-[10px] text-slate-500">Other educators can discover and use this resource</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[2rem] p-8 space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <Globe className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-indigo-900">Share Settings</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <button type="button" onClick={() => { setNewVisibility('all-schools'); setNewVisibleGrades([]); }} className={`w-full p-4 rounded-xl text-left border-2 font-bold text-sm transition-all flex items-start gap-3 ${newVisibility === 'all-schools' ? 'bg-white border-indigo-600 text-indigo-900 shadow-md' : 'bg-white/50 border-indigo-100 text-slate-600 hover:bg-white'}`}>
                        <Globe className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-black">All Schools Network</div>
                          <div className="text-[10px] opacity-70">Visible to educators across all connected schools</div>
                        </div>
                      </button>

                      <button type="button" onClick={() => { setNewVisibility('school'); setNewVisibleGrades([]); }} className={`w-full p-4 rounded-xl text-left border-2 font-bold text-sm transition-all flex items-start gap-3 ${newVisibility === 'school' ? 'bg-white border-indigo-600 text-indigo-900 shadow-md' : 'bg-white/50 border-indigo-100 text-slate-600 hover:bg-white'}`}>
                        <Building2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-black">My School Only</div>
                          <div className="text-[10px] opacity-70">Visible to all grades in {currentUser.school || 'your school'}</div>
                        </div>
                      </button>

                      <button type="button" onClick={() => { setNewVisibility('grade'); setNewVisibleGrades([]); }} className={`w-full p-4 rounded-xl text-left border-2 font-bold text-sm transition-all flex items-start gap-3 ${newVisibility === 'grade' ? 'bg-white border-indigo-600 text-indigo-900 shadow-md' : 'bg-white/50 border-indigo-100 text-slate-600 hover:bg-white'}`}>
                        <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-black">Same Grade Only</div>
                          <div className="text-[10px] opacity-70">Visible only to Grade {currentUser.grade}</div>
                        </div>
                      </button>

                      <button type="button" onClick={() => setNewVisibility('specific-grade')} className={`w-full p-4 rounded-xl text-left border-2 font-bold text-sm transition-all flex items-start gap-3 ${newVisibility === 'specific-grade' ? 'bg-white border-indigo-600 text-indigo-900 shadow-md' : 'bg-white/50 border-indigo-100 text-slate-600 hover:bg-white'}`}>
                        <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-black">Select Specific Grades</div>
                          <div className="text-[10px] opacity-70">Choose which grades can view this</div>
                        </div>
                      </button>
                    </div>

                    {newVisibility === 'specific-grade' && (
                      <div className="mt-4 p-4 bg-white rounded-xl border-2 border-indigo-200 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Select Grades</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[...PRIMARY_GRADES, ...HIGH_SCHOOL_SUBJECTS].filter(g => !PRIMARY_SUBJECTS.includes(g)).map(grade => (
                            <button key={grade} type="button" onClick={() => setNewVisibleGrades(prev => prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade])} className={`py-2 px-3 rounded-lg text-[10px] font-bold uppercase transition-all border-2 ${newVisibleGrades.includes(grade) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                              Grade {grade}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-8 border-t border-slate-50">
                    <button type="submit" disabled={isSubmitting || !newTitle} className="px-14 py-6 bg-[#072432] text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-50 flex items-center gap-4">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Publish Entry"}
                    </button>
                  </div>
              </form>
           </div>
      )}

      <div className="flex overflow-x-auto pb-2 gap-4 hide-scrollbar px-2">
          <button onClick={() => setSelectedSubject('All')} className={`flex-shrink-0 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedSubject === 'All' ? 'bg-[#072432] text-[#00ff8e] border-[#072432] shadow-xl' : 'bg-white text-slate-400 border-white hover:border-slate-100 shadow-sm'}`}>All Subjects</button>
          {availableSubjects.map(s => (
              <button key={s} onClick={() => setSelectedSubject(s)} className={`flex-shrink-0 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedSubject === s ? 'bg-[#072432] text-[#00ff8e] border-[#072432] shadow-xl' : 'bg-white text-slate-400 border-white hover:border-slate-100 shadow-sm'}`}>{s}</button>
          ))}
      </div>

      <div className="flex overflow-x-auto pb-8 gap-4 hide-scrollbar px-2">
          <button onClick={() => setSelectedGrade('All')} className={`flex-shrink-0 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedGrade === 'All' ? 'bg-[#00ff8e] text-[#072432] border-[#00ff8e] shadow-xl' : 'bg-white text-slate-400 border-white hover:border-slate-100 shadow-sm'}`}>All Grades</button>
          {PRIMARY_GRADES.map(g => (
              <button key={g} onClick={() => setSelectedGrade(g)} className={`flex-shrink-0 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedGrade === g ? 'bg-[#00ff8e] text-[#072432] border-[#00ff8e] shadow-xl' : 'bg-white text-slate-400 border-white hover:border-slate-100 shadow-sm'}`}>{g}</button>
          ))}
      </div>

      <div className="flex items-center gap-3 px-2 mb-6 text-left">
         <div className="p-2 bg-[#1a1a1a] rounded-lg text-white font-black text-[10px] uppercase">{currentUser.grade}</div>
         <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{selectedSubject === 'All' ? 'Mathematics' : selectedSubject}</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 text-left px-2">
        {filteredResources.map((res) => (
            <div key={res.id} className="bg-white rounded-[1.5rem] border-2 border-transparent shadow-sm hover:shadow-2xl hover:border-brand-teal transition-all duration-500 flex flex-col overflow-hidden group">
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                    {res.thumbnailUrl ? (
                      <img src={res.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        {res.type === ResourceType.LINK ? <Video className="w-12 h-12" /> : <FileText className="w-12 h-12" />}
                      </div>
                    )}
                    {(res.isPublic || res.isGlobal) && (
                      <div className="absolute top-2 left-2 flex gap-1">
                        {res.isGlobal && <div className="px-2 py-1 bg-emerald-500 text-white text-[7px] font-black uppercase rounded-md shadow-lg">Global</div>}
                        {res.isPublic && <div className="px-2 py-1 bg-blue-500 text-white text-[7px] font-black uppercase rounded-md shadow-lg">Shared</div>}
                      </div>
                    )}
                    {isPrincipal && (
                      <button onClick={(e) => { e.stopPropagation(); if(confirm("Are you sure?")) removeDoc('resources', res.id); }} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors mb-1 truncate">{res.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.metadata || (res.type === ResourceType.LINK ? 'Video Content' : 'Study Resource')}</p>
                        {(res.contributedBy || res.schoolId !== currentUser.schoolId) && (
                          <p className="text-[9px] text-slate-500 mt-2 font-semibold">
                            {res.contributedBy ? `By ${res.contributedBy}` : `From another school`}
                          </p>
                        )}
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button onClick={() => setViewingResource(res)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-full font-black flex items-center justify-center hover:bg-slate-300 transition-all">
                            <Eye className="w-4 h-4" />
                        </button>
                        <a href={res.url} target="_blank" rel="noreferrer" download={res.fileName} className="flex-1 py-3 bg-[#072432] text-[#00ff8e] rounded-full font-black flex items-center justify-center hover:brightness-110 transition-all">
                            <Download className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        ))}
        {filteredResources.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No matching items in your library shelf.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutoringModule;
