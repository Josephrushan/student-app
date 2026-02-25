
import React, { useState } from 'react';
import { User, UserRole, YearbookEntry, YearbookImage } from '../types';
import { Camera, Plus, X, User as UserIcon, Trash2, Heart, ChevronLeft, ChevronRight, Upload, Loader2 } from 'lucide-react';
import { uploadImage, removeDoc, saveDoc } from '../services/firebaseService';
import { compressImage } from '../services/imageCompressionService';

interface YearbookModuleProps {
  currentUser: User;
  entries: YearbookEntry[];
  setEntries: React.Dispatch<React.SetStateAction<YearbookEntry[]>>;
}

const YearbookModule: React.FC<YearbookModuleProps> = ({ currentUser, entries, setEntries }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<YearbookEntry | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImages, setNewImages] = useState<{data: string, name: string}[]>([]);

  const canCreate = currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL;
  const isPrincipal = currentUser.role === UserRole.PRINCIPAL;

  const filteredEntries = entries.filter(e => e.grade === currentUser.grade).sort((a, b) => b.timestamp - a.timestamp);

  // Added explicit type casting to File[] to resolve 'unknown' property and 'Blob' assignment errors
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(async (file) => {
        try {
          // Compress image before adding
          const compressedFile = await compressImage(file);
          
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setNewImages(prev => [...prev, { data: event.target.result as string, name: compressedFile.name }]);
            }
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error('Failed to process image:', error);
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (newImages.length === 0 || !newTitle || isSubmitting) return;
    setIsSubmitting(true);
    const entryId = Date.now().toString();
    try {
      const uploadedImages = await Promise.all(newImages.map(async (img, idx) => {
        const url = await uploadImage(`yearbook/${entryId}/img_${idx}`, img.data);
        return { url, caption: '' };
      }));
      const newEntry: YearbookEntry = {
        id: entryId,
        type: uploadedImages.length > 1 ? 'album' : 'single',
        title: newTitle,
        description: newDescription,
        images: uploadedImages,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        timestamp: Date.now(),
        grade: currentUser.grade,
        likes: [],
        schoolId: currentUser.schoolId || ''
      };
      // Fix: saveDoc will trigger the listener, no need for manual setEntries push
      await saveDoc('yearbook', entryId, newEntry);
      setIsCreating(false);
      setNewImages([]);
      setNewTitle('');
      setNewDescription('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (entryId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const entry = entries.find(e => e.id === entryId);
      if (!entry) {
        console.warn('Entry not found:', entryId);
        return;
      }
      const likes = entry.likes || [];
      const userHasLiked = likes.includes(currentUser.id);
      const updatedLikes = userHasLiked ? likes.filter(id => id !== currentUser.id) : [...likes, currentUser.id];
      const updatedEntry = { ...entry, likes: updatedLikes };
      
      console.log('Toggling like for entry:', entryId);
      console.log('User:', currentUser.id, 'Had liked:', userHasLiked, 'New likes count:', updatedLikes.length);
      
      // Local state update for smooth toggle
      setEntries(prev => prev.map(e => e.id === entryId ? updatedEntry : e));
      
      try {
        await saveDoc('yearbook', entryId, updatedEntry);
        console.log('✅ Like saved successfully');
      } catch (error) {
        console.error('❌ Failed to save like:', error);
        // Revert local state on failure
        setEntries(prev => prev.map(e => e.id === entryId ? entry : e));
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {viewingEntry && (
          <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingEntry(null)}>
              <div className="w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-scale-up border border-slate-100" onClick={e => e.stopPropagation()}>
                  <div className="bg-white p-8 relative aspect-video flex items-center justify-center">
                      <button onClick={() => setViewingEntry(null)} className="absolute top-4 right-4 p-2 bg-black text-white rounded-full hover:scale-110 transition-transform z-10 shadow-lg"><X className="w-6 h-6" /></button>
                      <img src={viewingEntry.images[activeImageIdx].url} className="w-full h-full object-cover rounded-2xl shadow-2xl" alt="" />
                      {viewingEntry.images.length > 1 && (
                          <div className="absolute inset-x-6 bottom-6 flex justify-between">
                            <button onClick={() => setActiveImageIdx(prev => (prev - 1 + viewingEntry.images.length) % viewingEntry.images.length)} className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all backdrop-blur-md shadow-lg"><ChevronLeft className="w-6 h-6" /></button>
                            <button onClick={() => setActiveImageIdx(prev => (prev + 1) % viewingEntry.images.length)} className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all backdrop-blur-md shadow-lg"><ChevronRight className="w-6 h-6" /></button>
                          </div>
                      )}
                  </div>
                  <div className="px-8 pb-10 text-left bg-white">
                      <div className="flex justify-between items-start mb-6 mt-8">
                          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">{viewingEntry.title}</h2>
                          {isPrincipal && <button onClick={(e) => { e.stopPropagation(); if(confirm("Are you sure you want to permanently delete this?")) { removeDoc('yearbook', viewingEntry.id); setViewingEntry(null); } }} className="p-3 bg-black text-white rounded-full hover:bg-slate-800 transition-all"><Trash2 className="w-5 h-5" /></button>}
                      </div>
                      <p className="text-slate-600 text-sm font-medium leading-relaxed mb-10">{viewingEntry.description || "Captured moment from school life."}</p>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-4">
                              {viewingEntry.authorAvatar && !viewingEntry.authorAvatar.includes('ui-avatars.com') ? (
                                <img src={viewingEntry.authorAvatar} alt={viewingEntry.authorName} className="w-12 h-12 rounded-full object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-[#00ff8e] flex items-center justify-center text-[#072432]"><UserIcon className="w-6 h-6" /></div>
                              )}
                              <div className="text-left"><p className="text-[10px] font-black uppercase text-slate-500">Contributor</p><p className="text-sm font-black text-slate-900">{viewingEntry.authorName}</p></div>
                          </div>
                          <button onClick={() => toggleLike(viewingEntry.id)} className="flex items-center gap-2 px-6 py-3 rounded-full font-black text-[10px] uppercase transition-all bg-black text-white shadow-xl hover:bg-slate-800">
                            <Heart className="w-4 h-4 fill-current" /> {viewingEntry.likes?.length || 0} Votes
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <Camera className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Grade Journal</h2>
      </div>

      {canCreate && (
        <button onClick={() => setIsCreating(true)} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 mx-4">
          <Plus className="w-5 h-5" /> Post to Journal
        </button>
      )}

      <p className="text-slate-600 text-sm font-medium mb-6 px-4">{currentUser.grade} Private Journal</p>

      {isCreating && (
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl animate-fade-in relative text-left">
           <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Share Moments</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-300 p-2"><X className="w-8 h-8" /></button>
           </div>
           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Moment Title</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#072432] rounded-2xl font-bold text-sm" placeholder="e.g. Field Trip 2024" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Select Images</label><label className="cursor-pointer block w-full px-6 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm text-center hover:bg-slate-100"><Upload className="inline-block w-4 h-4 mr-2" /> {newImages.length > 0 ? `${newImages.length} images ready` : 'Add multiple photos'}<input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" /></label></div>
              </div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tell the story</label><textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} rows={3} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#072432] rounded-2xl font-medium text-sm resize-none" placeholder="What happened in these photos?" /></div>
              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button onClick={handleSubmit} disabled={isSubmitting || newImages.length === 0} className="px-12 py-5 bg-[#072432] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 disabled:opacity-50 flex items-center gap-3">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post to Classroom Feed"}
                </button>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {filteredEntries.map(entry => {
                const isLiked = (entry.likes || []).includes(currentUser.id);
                return (
                    <div key={entry.id} onClick={() => { setViewingEntry(entry); setActiveImageIdx(0); }} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer text-left relative flex flex-col h-full">
                        <div className="relative aspect-video overflow-hidden bg-slate-50 shrink-0">
                            <img src={entry.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-6 right-6 flex flex-col gap-2">
                                <button onClick={(e) => toggleLike(entry.id, e)} className={`p-2.5 rounded-2xl backdrop-blur-md border border-white/20 transition-all ${isLiked ? 'bg-black text-white' : 'bg-black text-white hover:bg-slate-800'}`}>
                                    <Heart className="w-4 h-4 fill-current" />
                                </button>
                            </div>
                            <div className="absolute bottom-6 left-6 flex items-center gap-2">
                               <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest">{entry.images.length} {entry.images.length > 1 ? 'Photos' : 'Photo'}</span>
                            </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <h3 className="text-xl font-black text-[#072432] mb-2">{entry.title}</h3>
                            <p className="text-slate-500 text-sm font-medium line-clamp-3 flex-grow">{entry.description}</p>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase text-slate-300">
                                <span>{entry.authorName}</span>
                                <span>{entry.likes?.length || 0} Votes</span>
                            </div>
                        </div>
                    </div>
                );
            })}
      </div>
    </div>
  );
};

export default YearbookModule;
