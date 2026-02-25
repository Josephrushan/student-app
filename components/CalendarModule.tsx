
import React, { useState, useRef } from 'react';
import { User, UserRole, CalendarEvent } from '../types';
import { Calendar, Plus, X, Image as ImageIcon, Upload, Loader2, Trash2, MapPin, Clock, Camera, FileText, Download } from 'lucide-react';
import { saveDoc, uploadImage, removeDoc } from '../services/firebaseService';
import ResourceViewer from './ResourceViewer';

interface CalendarModuleProps {
  currentUser: User;
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

const CalendarModule: React.FC<CalendarModuleProps> = ({ currentUser, events, setEvents }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newAttachments, setNewAttachments] = useState<Array<{ url: string; fileName: string; type: string; file: File }>>([]);
  const [viewingAttachmentUrl, setViewingAttachmentUrl] = useState<string | null>(null);
  const [viewingAttachmentType, setViewingAttachmentType] = useState<string>('');
  const [viewingAttachmentName, setViewingAttachmentName] = useState<string>('');
  const posterInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const canEdit = currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL;

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewAttachments([...newAttachments, {
            url: event.target.result as string,
            fileName: file.name,
            type: file.type,
            file: file
          }]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getFileTypeFromName = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('.mp4') || lowerName.includes('.webm') || lowerName.includes('.ogg')) return 'mp4';
    if (lowerName.includes('.pdf')) return 'pdf';
    if (lowerName.includes('.docx') || lowerName.includes('.doc')) return 'docx';
    if (lowerName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (lowerName.includes('youtube.com') || lowerName.includes('youtu.be') || lowerName.includes('vimeo.com')) return 'youtube';
    return 'other';
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || isSubmitting) return;

    setIsSubmitting(true);
    const eventId = Date.now().toString();
    try {
      let imageUrl = '';
      if (newImage) {
        imageUrl = await uploadImage(`events/${eventId}/poster`, newImage);
      }

      const attachments = [];
      for (const attachment of newAttachments) {
        try {
          const url = await uploadImage(`events/${eventId}/${attachment.fileName}`, attachment.file);
          attachments.push({
            url,
            fileName: attachment.fileName,
            type: attachment.type,
            fileType: getFileTypeFromName(attachment.fileName) as 'mp4' | 'pdf' | 'docx' | 'image' | 'youtube' | 'other'
          });
        } catch (err) {
          console.error('Failed to upload attachment:', err);
        }
      }

      const event: CalendarEvent = {
        id: eventId,
        title: newTitle,
        description: newDesc,
        date: newDate,
        image: imageUrl,
        attachments: attachments.length > 0 ? attachments : undefined,
        schoolId: currentUser.schoolId || '',
        authorName: currentUser.name,
        timestamp: Date.now()
      };

      await saveDoc('events', eventId, event);
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save event", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setNewImage(null);
    setNewAttachments([]);
  };

  const removeAttachment = (index: number) => {
    setNewAttachments(newAttachments.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this?")) return;
    await removeDoc('events', id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upcoming Events</h2>
      </div>

      {canEdit && (
        <button onClick={() => setIsCreating(true)} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 mx-4">
          <Plus className="w-5 h-5" /> New Event
        </button>
      )}

      <p className="text-slate-600 text-sm font-medium mb-6 px-4">School Schedule Highlights</p>

      {isCreating && (
        <div className="bg-white rounded-[3rem] p-10 border-2 border-indigo-50 shadow-2xl animate-slide-up relative overflow-hidden text-left">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-navy"></div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Post New Event</h3>
            <button onClick={() => setIsCreating(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Event Title</label>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-navy rounded-2xl outline-none font-bold text-sm" placeholder="e.g. Inter-house Athletics" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Event Date</label>
                <input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-navy rounded-2xl outline-none font-bold text-sm" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Event Image (Poster/Photo)</label>
              <div onClick={() => posterInputRef.current?.click()} className="cursor-pointer h-48 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center hover:bg-indigo-50/50 transition-all overflow-hidden group">
                {newImage ? (
                  <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-slate-200 group-hover:text-indigo-300 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Tap to upload poster</span>
                  </>
                )}
              </div>
              <input type="file" ref={posterInputRef} onChange={handlePosterUpload} className="hidden" accept="image/*" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Event Description</label>
              <textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-navy rounded-2xl outline-none font-medium text-sm resize-none" placeholder="Provide event details..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Attachments (PDF, DOCX, Images, Videos)</label>
              <div onClick={() => attachmentInputRef.current?.click()} className="cursor-pointer p-6 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center hover:bg-indigo-50/50 transition-all group">
                <Upload className="w-8 h-8 text-slate-200 group-hover:text-indigo-300 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Click to add files</span>
              </div>
              <input type="file" ref={attachmentInputRef} onChange={handleAttachmentUpload} className="hidden" accept=".pdf,.docx,.doc,.mp4,.webm,.ogg,.jpg,.jpeg,.png,.gif,.webp,.svg" />
              
              {newAttachments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {newAttachments.map((attachment, idx) => (
                    <div key={idx} className="relative group">
                      <div className="bg-slate-100 rounded-xl p-3 flex flex-col items-center justify-center aspect-square border-2 border-slate-200">
                        <FileText className="w-6 h-6 text-slate-500 mb-1" />
                        <span className="text-[8px] font-bold text-slate-600 text-center line-clamp-2">{attachment.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isSubmitting} className="px-12 py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-4 h-4" /> Publish Event</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {events.length === 0 ? (
          <div className="py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-50 text-center">
            <Calendar className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No upcoming events scheduled.</p>
          </div>
        ) : (
          events.sort((a,b) => a.date.localeCompare(b.date)).map(event => (
            <div key={event.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col w-full p-4 md:p-6 overflow-hidden">
              {/* Date Badge */}
              <div className="mb-3">
                <span className="px-4 py-1.5 bg-black text-white rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest inline-block">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>

              {/* Title */}
              <div className="mb-3">
                <h3 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-slate-900 uppercase">{event.title}</h3>
              </div>

              {/* Thumbnail/Image Area */}
              {event.image && (
                <div className="w-full h-40 md:h-56 mb-4 bg-[#f1f5f9] rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-100">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}

              {/* Description Preview */}
              <div className="mb-4">
                <p className="text-sm md:text-base font-medium text-slate-600 line-clamp-3">{event.description}</p>
              </div>

              {/* Attachments */}
              {event.attachments && event.attachments.length > 0 && (
                <div className="mb-4 pt-4 border-t border-slate-50">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-3">Attachments</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {event.attachments.map((attachment, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setViewingAttachmentUrl(attachment.url);
                          setViewingAttachmentType(attachment.fileType);
                          setViewingAttachmentName(attachment.fileName);
                        }}
                        className="group/item relative aspect-square bg-slate-100 rounded-xl overflow-hidden hover:ring-2 ring-indigo-500 transition-all flex items-center justify-center"
                      >
                        {attachment.fileType === 'image' ? (
                          <img src={attachment.url} alt={attachment.fileName} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                        ) : (
                          <FileText className="w-6 h-6 text-slate-500" />
                        )}
                        <div className="absolute inset-0 bg-slate-900/0 group-hover/item:bg-slate-900/40 transition-all flex items-center justify-center">
                          <Download className="w-5 h-5 text-white opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">By {event.authorName}</span>
                {canEdit && (
                  <button onClick={(e) => handleDelete(event.id, e)} className="p-2.5 bg-black text-white rounded-full hover:bg-slate-800 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ResourceViewer
        isOpen={!!viewingAttachmentUrl}
        onClose={() => {
          setViewingAttachmentUrl(null);
          setViewingAttachmentType('');
          setViewingAttachmentName('');
        }}
        title={viewingAttachmentName}
        url={viewingAttachmentUrl || ''}
        type={viewingAttachmentType}
        fileName={viewingAttachmentName}
      />
    </div>
  );
};

export default CalendarModule;
