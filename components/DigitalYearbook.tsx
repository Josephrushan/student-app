import React, { useState, useRef, useMemo, useEffect } from 'react';
import { User, YearbookEntry, YearbookConfig, UserRole } from '../types';
import { ChevronLeft, ChevronRight, Book, Settings, Printer, Loader2, Trash2, LayoutGrid, Upload, CheckCircle2, AlertCircle, Sparkles, X, Heart, User as UserIcon, GraduationCap, Quote, Plus, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { YEARBOOK_SECTIONS } from '../constants';
import { uploadImage, removeDoc } from '../services/firebaseService';
import Logo from './Logo';

interface DigitalYearbookProps {
  currentUser: User;
  entries: YearbookEntry[]; 
  allUsers?: User[]; 
  config: YearbookConfig;
  onConfigChange: (config: YearbookConfig) => void;
}

type PageType = 
  | { type: 'manual', sectionId: string, url: string }
  | { type: 'auto', sectionId: string };

const DigitalYearbook: React.FC<DigitalYearbookProps> = ({ currentUser, entries, allUsers = [], config, onConfigChange }) => {
  const BASE_WIDTH = 1024;
  const BASE_HEIGHT = 724; 

  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const canEdit = currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL;

  useEffect(() => {
    const handleResize = () => {
        if (containerRef.current) {
            const parentWidth = containerRef.current.offsetWidth;
            const newScale = Math.min(parentWidth / BASE_WIDTH, 1); 
            setScale(newScale);
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gradeStudents = useMemo(() => allUsers.filter(u => u.role === UserRole.STUDENT && u.grade === currentUser.grade), [allUsers, currentUser.grade]);
  const faculty = useMemo(() => allUsers.filter(u => 
    (u.role === UserRole.TEACHER && (u.allowedGrades?.includes(currentUser.grade) || u.grade === currentUser.grade)) ||
    u.role === UserRole.PRINCIPAL
  ), [allUsers, currentUser.grade]);
  
  const journalHighlights = useMemo(() => {
    return [...entries]
      .filter(e => e.grade === currentUser.grade)
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  }, [entries, currentUser.grade]);

  // Handle deleted sections (config.customPages used to store active section IDs)
  const activeSectionIds = useMemo(() => {
      // If none set, all are active by default
      if (!config.customPages || config.customPages.length === 0) return YEARBOOK_SECTIONS.map(s => s.id);
      return config.customPages;
  }, [config.customPages]);

  const pages: PageType[] = useMemo(() => {
    return YEARBOOK_SECTIONS.filter(section => {
        if (!activeSectionIds.includes(section.id)) return false;
        if (section.id.startsWith('class_')) {
            const classLetter = section.id.split('_')[1];
            return gradeStudents.some(s => s.classLetter === classLetter);
        }
        return true;
    }).map(section => {
        const manualUrl = config.manualSections?.[section.id];
        if (manualUrl) return { type: 'manual', sectionId: section.id, url: manualUrl };
        return { type: 'auto', sectionId: section.id };
    });
  }, [config.manualSections, gradeStudents, activeSectionIds]);

  const totalPages = pages.length;

  const handleSectionUpload = async (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && currentUser.schoolId) {
          setIsUploading(sectionId);
          try {
              const url = await uploadImage(`yearbook/${currentUser.schoolId}/${currentUser.grade}/${sectionId}`, e.target.files[0] as any);
              const updatedManual = { ...(config.manualSections || {}), [sectionId]: url };
              onConfigChange({ ...config, manualSections: updatedManual });
          } catch (err) {
              console.error(err);
          } finally {
              setIsUploading(null);
          }
      }
  };

  const handleRemoveOverride = (sectionId: string) => {
      if (!confirm("Revert this page to automated content?")) return;
      const updatedManual = { ...(config.manualSections || {}) };
      delete updatedManual[sectionId];
      onConfigChange({ ...config, manualSections: updatedManual });
  };

  const handleDeleteSection = (sectionId: string) => {
      if (sectionId === 'title' || sectionId === 'closing_page') return alert("Core sections cannot be removed.");
      if (!confirm("Remove this section from the yearbook entirely? You can add it back later.")) return;
      const updatedIds = activeSectionIds.filter(id => id !== sectionId);
      onConfigChange({ ...config, customPages: updatedIds });
  };

  const handleRestoreSection = (sectionId: string) => {
      const updatedIds = [...activeSectionIds, sectionId];
      onConfigChange({ ...config, customPages: updatedIds });
  };

  const generatePDF = async () => {
      if (!printContainerRef.current) return;
      setIsGeneratingPdf(true);
      try {
          const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 210] });
          const pageElements = printContainerRef.current.children;
          for (let i = 0; i < pageElements.length; i++) {
              const page = pageElements[i] as HTMLElement;
              const canvas = await html2canvas(page, { scale: 2, useCORS: true, width: BASE_WIDTH, height: BASE_HEIGHT });
              const imgData = canvas.toDataURL('image/jpeg', 0.9);
              if (i > 0) pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
          }
          pdf.save(`${currentUser.grade}_Yearbook_2024.pdf`);
      } catch (error) {
          console.error(error);
      } finally {
          setIsGeneratingPdf(false);
      }
  };

  const renderAutoContent = (sectionId: string) => {
      if (sectionId.startsWith('class_')) {
          const classLetter = sectionId.split('_')[1];
          const classStudents = gradeStudents.filter(s => s.classLetter === classLetter);
          return (
              <div className="w-full h-full bg-white p-12 flex flex-col text-left">
                  <div className="border-b-8 border-brand-navy pb-4 mb-8">
                      <h2 className="text-6xl font-black text-slate-900 uppercase">Class {classLetter}</h2>
                      <p className="text-brand-navy font-bold uppercase tracking-[0.3em]">Grade {currentUser.grade} Excellence</p>
                  </div>
                  <div className="flex-1 grid grid-cols-5 gap-6">
                      {classStudents.map(student => (
                          <div key={student.id} className="text-center">
                              <div className="w-full aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden mb-2 shadow-sm border border-slate-100">
                                  <img src={student.avatar} className="w-full h-full object-cover" alt="" />
                              </div>
                              <p className="text-[10px] font-black text-slate-900 uppercase">{student.name}</p>
                          </div>
                      ))}
                  </div>
              </div>
          );
      }
      if (sectionId.startsWith('journal_')) {
          const idx = parseInt(sectionId.split('_')[1]) - 1;
          const entry = journalHighlights[idx];
          if (!entry) return <div className="w-full h-full bg-slate-50 flex items-center justify-center p-20 text-slate-300 font-black uppercase tracking-widest text-3xl">Reserved for Moment #{idx+1}</div>;
          return (
              <div className="w-full h-full bg-slate-900 flex text-left">
                  <div className="w-1/2 h-full"><img src={entry.images[0].url} className="w-full h-full object-cover" alt="" /></div>
                  <div className="w-1/2 p-20 flex flex-col justify-center">
                      <h2 className="text-6xl font-black text-white leading-tight uppercase mb-8">{entry.title || 'Highlight'}</h2>
                      <p className="text-xl text-slate-300 italic mb-8">"{entry.description}"</p>
                      <div className="flex items-center gap-4 text-brand-teal">
                        <Heart className="w-6 h-6 fill-current" />
                        <span className="font-black text-2xl">{entry.likes?.length || 0} Votes</span>
                      </div>
                  </div>
              </div>
          );
      }
      switch (sectionId) {
          case 'title':
              return (
                <div className="w-full h-full bg-brand-navy flex flex-col items-center justify-center text-center p-20 relative">
                    <Logo size="lg" white className="mb-10" />
                    <h1 className="text-8xl font-black text-brand-teal mb-2 tracking-tighter">{currentUser.grade}</h1>
                    <p className="text-2xl text-white/50 font-bold tracking-[0.5em] uppercase">Yearbook 2024</p>
                    <div className="mt-20 pt-12 border-t border-white/10 w-64"><p className="text-white text-lg font-medium tracking-widest uppercase">{currentUser.school}</p></div>
                </div>
              );
          case 'principal':
              return (
                <div className="w-full h-full bg-white p-20 flex items-center gap-12 text-left">
                    <div className="w-1/3 aspect-[3/4] bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                        {config.principalPhoto ? <img src={config.principalPhoto} className="w-full h-full object-cover" alt="" /> : <UserIcon className="w-32 h-32 m-auto mt-24 text-slate-200" />}
                    </div>
                    <div className="flex-1 relative">
                        <Quote className="absolute -top-12 -left-12 w-20 h-20 text-slate-50 rotate-180" />
                        <h2 className="text-4xl font-black text-slate-900 mb-8 uppercase">Principal's Reflection</h2>
                        <p className="text-2xl text-slate-600 italic leading-relaxed">"{config.principalMessage}"</p>
                    </div>
                </div>
              );
          case 'faculty':
              return (
                <div className="w-full h-full bg-white p-20 flex flex-col text-left">
                    <h2 className="text-5xl font-black text-slate-900 border-b-8 border-brand-navy pb-4 mb-10 uppercase tracking-tighter">Academic Team</h2>
                    <div className="grid grid-cols-4 gap-10">
                        {faculty.map(f => (
                            <div key={f.id} className="text-center">
                                <div className="w-full aspect-square bg-slate-50 rounded-[2rem] overflow-hidden mb-4 border-4 border-white shadow-lg"><img src={f.avatar} className="w-full h-full object-cover" alt="" /></div>
                                <h3 className="font-black text-slate-900 text-sm">{f.name} {f.surname}</h3>
                                <p className="text-[10px] text-brand-navy font-bold uppercase">{f.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
              );
          case 'closing_page':
              return (
                <div className="w-full h-full bg-slate-50 p-20 flex flex-col items-center justify-center text-center">
                    <Logo size="lg" className="mb-12" />
                    <h2 className="text-7xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Goodbye 2024</h2>
                    <p className="text-xl text-slate-400 font-bold tracking-[0.3em] uppercase">The Journey Continues</p>
                </div>
              );
          default:
              return <div className="w-full h-full bg-white p-20 flex items-center justify-center text-slate-200 font-black uppercase text-4xl">{sectionId.replace('_', ' ')}</div>;
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-4 pb-32">
        <div className="w-full max-w-7xl px-6 text-left">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
                    <Book className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Yearbook</h2>
            </div>

            <button onClick={generatePDF} disabled={isGeneratingPdf} className="flex items-center gap-3 bg-[#1a1a1a] text-white px-8 py-3 rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 mb-6">
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export Pdf
            </button>

            <p className="text-slate-600 text-sm font-medium">Class of 2024 <span className="text-[#00ff8e] font-black">Grade {currentUser.grade}</span></p>
        </div>

        <div className="h-8"></div>

        <div ref={containerRef} className="w-full flex justify-center overflow-hidden px-4">
            <div 
                style={{ width: `${BASE_WIDTH}px`, height: `${BASE_HEIGHT}px`, transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: `-${BASE_HEIGHT * (1 - scale)}px` }}
                className="relative bg-white shadow-2xl overflow-hidden shrink-0"
            >
                {(() => {
                    const page = pages[currentPage];
                    if (!page) return null;
                    return page.type === 'manual' ? <img src={page.url} className="w-full h-full object-cover" alt="" /> : renderAutoContent(page.sectionId);
                })()}
                <div className="absolute bottom-8 right-8 z-50"><span className="px-4 py-2 bg-white/80 backdrop-blur rounded-full text-[10px] font-black shadow-sm">PAGE {currentPage + 1}</span></div>
            </div>
        </div>

        <div className="flex justify-center items-center gap-8 mt-12 px-6">
             <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-[11px] uppercase shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30">Prev</button>
             <div className="text-center"><span className="text-slate-900 font-black text-base block">{currentPage + 1}</span><span className="text-slate-400 font-bold text-[10px] uppercase">OF {totalPages}</span></div>
             <button onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-[11px] uppercase shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30">Next</button>
        </div>

        {/* Layout Management Underneath the Book */}
        {canEdit && (
            <div className="w-full max-w-5xl mt-24 px-6 text-left space-y-12">
                <div className="flex items-center gap-6 border-b border-slate-200 pb-8">
                    <div className="p-4 bg-[#1a1a1a] rounded-2xl text-white shadow-inner"><Settings className="w-8 h-8" /></div>
                    <div><h3 className="text-2xl font-black text-slate-900 uppercase">Layout Editor</h3><p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Manage institutional sections & overrides</p></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {YEARBOOK_SECTIONS.map((section) => {
                        const isActive = activeSectionIds.includes(section.id);
                        const manualUrl = config.manualSections?.[section.id];
                        
                        return (
                            <div key={section.id} className={`p-6 rounded-[2.5rem] border-2 transition-all group ${isActive ? 'bg-white border-white shadow-sm' : 'bg-slate-100 border-dashed border-slate-300 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{section.group}</p>
                                        <h4 className="font-black text-slate-900 text-base">{section.title}</h4>
                                    </div>
                                    <div className="flex gap-1">
                                        {isActive ? (
                                            <button onClick={() => handleDeleteSection(section.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Remove section"><Trash2 className="w-4 h-4" /></button>
                                        ) : (
                                            <button onClick={() => handleRestoreSection(section.id)} className="p-2 text-[#00ff8e] hover:text-brand-navy transition-colors" title="Restore section"><Plus className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{section.description}</p>
                                        <div className="flex gap-2">
                                            <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3 bg-black text-white rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                                                {isUploading === section.id ? <Loader2 className="w-3 h-3 animate-spin" /> : manualUrl ? 'Update Override' : 'Override Page'}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSectionUpload(section.id, e)} />
                                            </label>
                                            {manualUrl && (
                                                <button onClick={() => handleRemoveOverride(section.id)} className="p-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all"><X className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                        {!manualUrl && <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase"><Sparkles className="w-3 h-3" /> Auto-populated from feeds</div>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none" style={{ width: `${BASE_WIDTH}px` }} ref={printContainerRef}>
            {pages.map((page, idx) => (
                <div key={idx} className="w-[1024px] h-[724px] bg-white relative overflow-hidden mb-4">
                    {page.type === 'manual' ? <img src={page.url} className="w-full h-full object-cover" alt="" /> : renderAutoContent(page.sectionId)}
                </div>
            ))}
        </div>
    </div>
  );
};

export default DigitalYearbook;